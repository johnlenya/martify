import 'server-only';
import { getSettings } from './catalog.js';
import {
  commissionBpsFor,
  couponDiscountFor,
  flashPriceCents,
} from './commerce.js';
import { one, query } from './db/index.js';

const DELIVERY_METHODS = ['door', 'pickup', 'express'];
const MAX_LINES = 50;

export function normalizeCheckoutItems(rawItems) {
  if (!Array.isArray(rawItems) || !rawItems.length) return [];
  const merged = new Map();

  for (const raw of rawItems.slice(0, MAX_LINES)) {
    if (!raw || typeof raw !== 'object') continue;
    const productId = String(raw.productId || '').trim();
    if (!productId) continue;
    const variantId = raw.variantId ? String(raw.variantId).trim() : null;
    const quantity = Math.min(
      99,
      Math.max(1, Math.round(Number(raw.quantity) || 0)),
    );
    const key = `${productId}:${variantId ?? 'default'}`;
    const existing = merged.get(key);
    merged.set(key, {
      key,
      productId,
      variantId,
      quantity: Math.min(99, (existing?.quantity ?? 0) + quantity),
    });
  }

  return [...merged.values()];
}

function sqlPlaceholders(count) {
  return Array.from({ length: count }, (_, index) => `$${index + 1}`).join(
    ', ',
  );
}

export function deliveryFeeForMethod(method, subtotalCents, settings) {
  const safeMethod = DELIVERY_METHODS.includes(method) ? method : 'door';
  if (
    safeMethod === 'door' &&
    subtotalCents >= Number(settings.free_delivery_threshold_cents || 0)
  ) {
    return 0;
  }
  const key = `delivery_${safeMethod}_cents`;
  return Number(settings[key] || 0);
}

export async function priceCart({
  items,
  couponCode = '',
  deliveryMethod = 'door',
  settings: providedSettings = null,
}) {
  const normalized = normalizeCheckoutItems(items);
  const settings = providedSettings ?? (await getSettings());
  const safeMethod = DELIVERY_METHODS.includes(deliveryMethod)
    ? deliveryMethod
    : 'door';
  const issues = [];

  if (!normalized.length) {
    return {
      lines: [],
      subtotalCents: 0,
      discountCents: 0,
      deliveryFeeCents: 0,
      totalCents: 0,
      commissionCents: 0,
      coupon: null,
      couponError: null,
      issues,
      deliveryMethod: safeMethod,
      settings,
    };
  }

  const productIds = normalized.map((item) => item.productId);
  const productRows = await query(
    `SELECT p.id, p.slug, p.title, p.images, p.base_price_cents,
            p.compare_at_cents, p.stock, p.status, p.category_id,
            c.name AS category_name, c.slug AS category_slug,
            c.parent_id AS category_parent_id, c.commission_bps,
            s.id AS seller_id, s.store_name, s.slug AS seller_slug,
            s.status AS seller_status, s.subscription_tier,
            s.commission_override_bps,
            flash.discount_bps AS flash_discount_bps
     FROM products p
     JOIN sellers s ON s.id = p.seller_id
     JOIN categories c ON c.id = p.category_id
     LEFT JOIN LATERAL (
       SELECT fsi.discount_bps
       FROM flash_sale_items fsi
       JOIN flash_sales fs ON fs.id = fsi.sale_id
       WHERE fsi.product_id = p.id
         AND fs.active = true
         AND fs.starts_at <= now()
         AND fs.ends_at > now()
       ORDER BY fs.ends_at ASC
       LIMIT 1
     ) flash ON true
     WHERE p.id IN (${sqlPlaceholders(productIds.length)})`,
    productIds,
  );
  const productById = new Map(productRows.map((row) => [row.id, row]));

  const variantRows = await query(
    `SELECT id, product_id, name, price_cents, stock
     FROM product_variants
     WHERE product_id IN (${sqlPlaceholders(productIds.length)})`,
    productIds,
  );
  const variantById = new Map(variantRows.map((row) => [row.id, row]));

  const lines = [];
  for (const item of normalized) {
    const product = productById.get(item.productId);
    if (!product || product.status !== 'active' || product.seller_status !== 'approved') {
      issues.push({
        key: item.key,
        message: 'This item is no longer available.',
      });
      continue;
    }

    const variant = item.variantId ? variantById.get(item.variantId) : null;
    if (item.variantId && (!variant || variant.product_id !== product.id)) {
      issues.push({
        key: item.key,
        message: 'The selected option is no longer available.',
      });
      continue;
    }

    const availableStock = variant
      ? Number(variant.stock || 0)
      : Number(product.stock || 0);
    if (availableStock <= 0) {
      issues.push({
        key: item.key,
        message: `${product.title} is out of stock.`,
      });
      continue;
    }
    if (item.quantity > availableStock) {
      issues.push({
        key: item.key,
        message: `Only ${availableStock} left of ${product.title}.`,
      });
    }

    const basePrice = variant?.price_cents
      ? Number(variant.price_cents)
      : Number(product.base_price_cents || 0);
    const unitPriceCents =
      variant?.price_cents || !product.flash_discount_bps
        ? basePrice
        : flashPriceCents(basePrice, product.flash_discount_bps);
    const lineTotalCents = unitPriceCents * item.quantity;
    const commissionBps = commissionBpsFor({
      categoryBps: Number(product.commission_bps || 1000),
      tier: product.subscription_tier,
      overrideBps: product.commission_override_bps,
    });

    lines.push({
      key: item.key,
      productId: product.id,
      variantId: variant?.id ?? null,
      sellerId: product.seller_id,
      sellerName: product.store_name,
      sellerSlug: product.seller_slug,
      title: product.title,
      slug: product.slug,
      image: (Array.isArray(product.images) ? product.images : [])[0] || null,
      variantName: variant?.name ?? null,
      categoryId: product.category_id,
      categoryParentId: product.category_parent_id,
      quantity: item.quantity,
      availableStock,
      unitPriceCents,
      compareAtCents: product.compare_at_cents
        ? Number(product.compare_at_cents)
        : null,
      lineTotalCents,
      commissionBps,
      commissionCents: Math.round((lineTotalCents * commissionBps) / 10000),
      sellerAmountCents:
        lineTotalCents -
        Math.round((lineTotalCents * commissionBps) / 10000),
    });
  }

  const subtotalCents = lines.reduce(
    (sum, line) => sum + line.lineTotalCents,
    0,
  );

  let coupon = null;
  let couponError = null;
  let discountCents = 0;
  let couponFreeDelivery = false;
  const code = String(couponCode || '').trim();

  if (code) {
    const row = await one(
      `SELECT * FROM coupons WHERE upper(code) = upper($1) AND active = true`,
      [code],
    );
    const now = Date.now();
    const startsAt = row?.starts_at ? new Date(row.starts_at).getTime() : null;
    const endsAt = row?.ends_at ? new Date(row.ends_at).getTime() : null;
    const usageReached =
      row?.usage_limit !== null &&
      row?.usage_limit !== undefined &&
      Number(row.used_count) >= Number(row.usage_limit);

    if (!row || usageReached || (startsAt && startsAt > now) || (endsAt && endsAt < now)) {
      couponError = 'That code is not valid or has expired.';
    } else {
      const eligibleLines = lines.filter((line) => {
        if (row.seller_id && line.sellerId !== row.seller_id) return false;
        if (
          row.category_id &&
          line.categoryId !== row.category_id &&
          line.categoryParentId !== row.category_id
        ) {
          return false;
        }
        return true;
      });
      const eligibleSubtotal = eligibleLines.reduce(
        (sum, line) => sum + line.lineTotalCents,
        0,
      );

      if (!eligibleLines.length) {
        couponError = 'This code does not apply to the items in your cart.';
      } else {
        const result = couponDiscountFor(
          {
            type: row.type,
            value: row.value,
            min_spend_cents: row.min_spend_cents,
            max_discount_cents: row.max_discount_cents,
          },
          eligibleSubtotal,
          0,
        );
        if (result.error) {
          couponError = result.error;
        } else {
          discountCents = result.discountCents;
          couponFreeDelivery = result.freeDelivery;
          coupon = {
            code: row.code,
            description: row.description,
            type: row.type,
            discountCents,
            freeDelivery: couponFreeDelivery,
            minSpendCents: Number(row.min_spend_cents || 0),
          };
        }
      }
    }
  }

  let deliveryFeeCents = deliveryFeeForMethod(
    safeMethod,
    subtotalCents,
    settings,
  );
  if (couponFreeDelivery) deliveryFeeCents = 0;

  const totalCents = Math.max(
    0,
    subtotalCents - discountCents + deliveryFeeCents,
  );
  const commissionCents = lines.reduce(
    (sum, line) => sum + line.commissionCents,
    0,
  );

  return {
    lines,
    subtotalCents,
    discountCents,
    deliveryFeeCents,
    totalCents,
    commissionCents,
    coupon,
    couponError,
    issues,
    deliveryMethod: safeMethod,
    settings,
  };
}
