import 'server-only';
import { AFFILIATE_COMMISSION_BPS } from './commerce.js';
import { priceCart } from './checkout.js';
import { one, query, transaction } from './db/index.js';
import { newId, newOrderNumber, newToken } from './ids.js';

const PAYMENT_METHODS = ['mpesa', 'card', 'cod'];

export class OrderError extends Error {
  constructor(message, status = 400, extra = {}) {
    super(message);
    this.name = 'OrderError';
    this.status = status;
    this.extra = extra;
  }
}

export function isDemoPayments() {
  return process.env.PAYMENTS_MODE !== 'live';
}

export function normalizePaymentMethod(value) {
  return PAYMENT_METHODS.includes(value) ? value : 'mpesa';
}

function pickupAddress(recipient, phone, notes) {
  return {
    label: 'Pickup station',
    recipient,
    phone,
    county: 'Nairobi',
    town: 'Westlands',
    address_line: 'Martify Pickup — Westlands Square, Shop 4',
    instructions: notes || 'Bring your order number and a valid ID.',
  };
}

export function deliveryAddressFor({
  deliveryMethod,
  recipient,
  phone,
  county,
  town,
  addressLine,
  instructions,
  notes,
  label,
}) {
  if (deliveryMethod === 'pickup') {
    return pickupAddress(recipient, phone, notes);
  }
  return {
    label: String(label || (deliveryMethod === 'express' ? 'Express' : 'Home')).slice(0, 40),
    recipient,
    phone,
    county,
    town,
    address_line: addressLine,
    instructions: String(instructions || notes || '').slice(0, 300) || null,
  };
}

export async function createOrder({ user = null, payload }) {
  const items = payload?.items;
  const deliveryMethod = ['door', 'pickup', 'express'].includes(
    payload?.deliveryMethod,
  )
    ? payload.deliveryMethod
    : 'door';
  const paymentMethod = normalizePaymentMethod(payload?.paymentMethod);

  const quote = await priceCart({
    items,
    couponCode: payload?.couponCode || '',
    deliveryMethod,
  });

  if (!quote.lines.length) {
    throw new OrderError('Your cart is empty or the items are no longer available.', 409, {
      issues: quote.issues,
    });
  }
  if (quote.issues.length) {
    throw new OrderError(
      'Some items in your cart need attention before you can check out.',
      409,
      { issues: quote.issues },
    );
  }
  if (quote.couponError) {
    throw new OrderError(quote.couponError, 422);
  }

  const customerName = String(payload?.name || '').trim();
  const email = String(payload?.email || '').trim().toLowerCase();
  const phone = String(payload?.phone || '').trim();
  const paymentPhone = String(payload?.paymentPhone || phone).trim();
  const address = deliveryAddressFor({
    deliveryMethod,
    recipient: customerName,
    phone,
    county: String(payload?.county || '').trim(),
    town: String(payload?.town || '').trim(),
    addressLine: String(payload?.addressLine || '').trim(),
    instructions: payload?.instructions,
    notes: payload?.notes,
    label: payload?.addressLabel,
  });

  if (deliveryMethod !== 'pickup') {
    if (!address.county || !address.town || !address.address_line) {
      throw new OrderError('Add your delivery county, town and address.', 422);
    }
  }

  const notes = String(payload?.notes || '').trim().slice(0, 500) || null;
  const orderId = newId();
  const orderNumber = newOrderNumber();
  const accessToken = newToken(24);
  const now = new Date();

  let affiliateCode = String(payload?.affiliateCode || '').trim() || null;
  if (affiliateCode) {
    const affiliate = await one(
      `SELECT code FROM affiliates WHERE code = $1`,
      [affiliateCode],
    );
    affiliateCode = affiliate?.code ?? null;
  }
  const affiliateCommissionCents = affiliateCode
    ? Math.round((quote.subtotalCents * AFFILIATE_COMMISSION_BPS) / 10000)
    : 0;

  const sellerIds = [...new Set(quote.lines.map((line) => line.sellerId))];

  await transaction(async (tx) => {
    for (const line of quote.lines) {
      const reserved = await tx.query(
        `UPDATE products
         SET stock = stock - $1, updated_at = now()
         WHERE id = $2 AND stock >= $1
         RETURNING stock`,
        [line.quantity, line.productId],
      );
      if (!reserved.length) {
        throw new OrderError(
          `${line.title} just sold out. Remove it from your cart and try again.`,
          409,
        );
      }

      if (line.variantId) {
        const variantReserved = await tx.query(
          `UPDATE product_variants
           SET stock = stock - $1
           WHERE id = $2 AND stock >= $1
           RETURNING stock`,
          [line.quantity, line.variantId],
        );
        if (!variantReserved.length) {
          throw new OrderError(
            `The selected option for ${line.title} just sold out.`,
            409,
          );
        }
      }
    }

    await tx.query(
      `INSERT INTO orders
        (id, order_number, access_token, user_id, customer_name, email, phone,
         delivery_method, shipping_address, county, town, notes, coupon_code,
         subtotal_cents, discount_cents, delivery_fee_cents, total_cents,
         commission_cents, payment_method, payment_status, status, payment_ref,
         paid_at, affiliate_code, affiliate_commission_cents, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,'pending','placed',NULL,NULL,$20,$21,$22,$22)`,
      [
        orderId,
        orderNumber,
        accessToken,
        user?.id ?? null,
        customerName,
        email,
        phone,
        deliveryMethod,
        JSON.stringify(address),
        address.county,
        address.town,
        notes,
        quote.coupon?.code ?? null,
        quote.subtotalCents,
        quote.discountCents,
        quote.deliveryFeeCents,
        quote.totalCents,
        quote.commissionCents,
        paymentMethod,
        affiliateCode,
        affiliateCommissionCents,
        now,
      ],
    );

    for (const line of quote.lines) {
      await tx.query(
        `INSERT INTO order_items
          (id, order_id, seller_id, product_id, variant_id, title, variant_name,
           image_url, unit_price_cents, quantity, line_total_cents, commission_bps,
           commission_cents, seller_amount_cents, fulfillment_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'placed')`,
        [
          newId(),
          orderId,
          line.sellerId,
          line.productId,
          line.variantId,
          line.title,
          line.variantName,
          line.image,
          line.unitPriceCents,
          line.quantity,
          line.lineTotalCents,
          line.commissionBps,
          line.commissionCents,
          line.sellerAmountCents,
        ],
      );
    }

    await tx.query(
      `INSERT INTO payments
        (id, order_id, provider, amount_cents, status, phone, raw, created_at)
       VALUES ($1,$2,$3,$4,'pending',$5,$6::jsonb,$7)`,
      [
        newId(),
        orderId,
        paymentMethod,
        quote.totalCents,
        paymentPhone,
        JSON.stringify({ mode: isDemoPayments() ? 'demo' : 'live', stage: 'created' }),
        now,
      ],
    );

    for (const sellerId of sellerIds) {
      const seller = await tx.query(
        `SELECT s.user_id, s.store_name FROM sellers s WHERE s.id = $1`,
        [sellerId],
      );
      if (seller[0]?.user_id) {
        await tx.query(
          `INSERT INTO notifications (id, user_id, title, body, type, href, created_at)
           VALUES ($1,$2,$3,$4,'order',$5,$6)`,
          [
            newId(),
            seller[0].user_id,
            'New order received',
            `Order ${orderNumber} is ready for packing.`,
            '/seller/orders',
            now,
          ],
        );
      }
    }

    if (user?.id) {
      await tx.query(
        `INSERT INTO notifications (id, user_id, title, body, type, href, created_at)
         VALUES ($1,$2,'Order placed',$3,'order',$4,$5)`,
        [
          newId(),
          user.id,
          `We have your order ${orderNumber}. We will update you as it moves.`,
          `/orders/${orderNumber}`,
          now,
        ],
      );
    }
  });

  return {
    order: {
      id: orderId,
      number: orderNumber,
      accessToken,
      paymentMethod,
      paymentStatus: 'pending',
      status: 'placed',
      totalCents: quote.totalCents,
      subtotalCents: quote.subtotalCents,
      discountCents: quote.discountCents,
      deliveryFeeCents: quote.deliveryFeeCents,
      deliveryMethod,
      email,
      phone,
    },
    coupon: quote.coupon,
    issues: quote.issues,
  };
}

export async function getOrderByNumber(orderNumber) {
  return one(`SELECT * FROM orders WHERE order_number = $1`, [orderNumber]);
}

export async function getOrderItems(orderId) {
  return query(
    `SELECT oi.*, p.slug AS product_slug, s.store_name, s.slug AS seller_slug
     FROM order_items oi
     JOIN sellers s ON s.id = oi.seller_id
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1
     ORDER BY oi.title ASC`,
    [orderId],
  );
}

export async function getOrderPayment(orderId) {
  return one(
    `SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [orderId],
  );
}

export function canAccessOrder(order, user, token) {
  if (!order) return false;
  if (token && order.access_token === token) return true;
  return Boolean(user && order.user_id && order.user_id === user.id);
}

export async function markOrderPaid({
  orderNumber,
  accessToken,
  user = null,
  provider = null,
  reference,
  raw = {},
}) {
  const order = await getOrderByNumber(orderNumber);
  if (!order) throw new OrderError('Order not found.', 404);
  if (!canAccessOrder(order, user, accessToken)) {
    throw new OrderError('You do not have access to this order.', 403);
  }
  if (!isDemoPayments()) {
    throw new OrderError(
      'Demo payments are disabled. Use the configured payment provider.',
      409,
    );
  }
  if (order.payment_method === 'cod') {
    throw new OrderError('Cash on delivery orders are paid on delivery.', 400);
  }
  if (order.payment_status === 'paid') {
    return { order, alreadyPaid: true };
  }
  if (order.payment_status !== 'pending') {
    throw new OrderError('This order can no longer be paid.', 409);
  }

  const items = await getOrderItems(order.id);
  const paidAt = new Date();
  const paymentReference =
    reference ||
    `DEMO-${String(provider || order.payment_method).toUpperCase()}-${orderNumber.slice(-6)}`;

  let claimed = false;
  await transaction(async (tx) => {
    const updated = await tx.query(
      `UPDATE orders
       SET payment_status = 'paid', paid_at = $2, payment_ref = $3, updated_at = $2
       WHERE id = $1 AND payment_status = 'pending'
       RETURNING id`,
      [order.id, paidAt, paymentReference],
    );
    if (!updated.length) return;
    claimed = true;

    await tx.query(
      `UPDATE payments
       SET status = 'success', reference = $2, raw = $3::jsonb, paid_at = $4
       WHERE order_id = $1 AND status = 'pending'`,
      [
        order.id,
        paymentReference,
        JSON.stringify({ ...raw, provider: provider || order.payment_method, mode: 'demo' }),
        paidAt,
      ],
    );

    const entries = [
      ['sale', order.subtotal_cents, `Sale — ${orderNumber}`],
      ['delivery_fee', order.delivery_fee_cents, `Delivery fee — ${orderNumber}`],
    ];
    if (order.discount_cents > 0) {
      entries.push([
        'discount',
        -order.discount_cents,
        `Coupon ${order.coupon_code || ''} — ${orderNumber}`,
      ]);
    }
    entries.push([
      'commission',
      order.commission_cents,
      `Platform commission — ${orderNumber}`,
    ]);
    if (order.affiliate_commission_cents > 0) {
      entries.push([
        'affiliate_commission',
        -order.affiliate_commission_cents,
        `Affiliate ${order.affiliate_code} — ${orderNumber}`,
      ]);
    }
    for (const [kind, amount, description] of entries) {
      await tx.query(
        `INSERT INTO ledger_entries (id, kind, order_id, amount_cents, description, created_at)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [newId(), kind, order.id, amount, description, paidAt],
      );
    }

    for (const item of items) {
      await tx.query(
        `INSERT INTO ledger_entries
          (id, kind, order_id, seller_id, amount_cents, description, created_at)
         VALUES ($1,'seller_payable',$2,$3,$4,$5,$6)`,
        [
          newId(),
          order.id,
          item.seller_id,
          item.seller_amount_cents,
          `Seller earning — ${orderNumber}`,
          paidAt,
        ],
      );
      await tx.query(
        `UPDATE sellers
         SET balance_cents = balance_cents + $1,
             lifetime_sales_cents = lifetime_sales_cents + $1
         WHERE id = $2`,
        [item.seller_amount_cents, item.seller_id],
      );
      if (item.product_id) {
        await tx.query(
          `UPDATE products SET sold_count = sold_count + $1 WHERE id = $2`,
          [item.quantity, item.product_id],
        );
      }
    }

    if (order.coupon_code) {
      await tx.query(
        `UPDATE coupons SET used_count = used_count + 1
         WHERE upper(code) = upper($1)`,
        [order.coupon_code],
      );
    }

    if (order.affiliate_code && order.affiliate_commission_cents > 0) {
      await tx.query(
        `UPDATE affiliates SET earnings_cents = earnings_cents + $1 WHERE code = $2`,
        [order.affiliate_commission_cents, order.affiliate_code],
      );
    }

    if (order.user_id) {
      await tx.query(
        `INSERT INTO notifications (id, user_id, title, body, type, href, created_at)
         VALUES ($1,$2,'Payment received',$3,'order',$4,$5)`,
        [
          newId(),
          order.user_id,
          `We received your payment for ${orderNumber}.`,
          `/orders/${orderNumber}`,
          paidAt,
        ],
      );
    }
  });

  const refreshed = await getOrderByNumber(orderNumber);
  return { order: refreshed, alreadyPaid: !claimed };
}

export async function trackOrder({ orderNumber, contact }) {
  const identifier = String(contact || '').trim();
  const digits = identifier.replace(/[^\d+]/g, '');
  const normalizedContact = digits.startsWith('0')
    ? `+254${digits.slice(1)}`
    : digits.startsWith('254')
      ? `+${digits}`
      : digits.startsWith('+')
        ? digits
        : null;

  return one(
    `SELECT *
     FROM orders
     WHERE order_number = $1
       AND (lower(email) = lower($2) OR ($3::text IS NOT NULL AND phone = $3))`,
    [orderNumber, identifier, normalizedContact],
  );
}

export async function listOrdersForUser(userId) {
  const orders = await query(
    `SELECT id, order_number, access_token, status, payment_status, payment_method,
            total_cents, created_at, delivery_method
     FROM orders
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 100`,
    [userId],
  );
  if (!orders.length) return [];

  const items = await query(
    `SELECT oi.order_id, oi.title, oi.image_url, oi.quantity, oi.product_id,
            p.slug AS product_slug
     FROM order_items oi
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id IN (${orders.map((_, index) => `$${index + 1}`).join(', ')})`,
    orders.map((order) => order.id),
  );
  const itemsByOrder = new Map();
  for (const item of items) {
    if (!itemsByOrder.has(item.order_id)) itemsByOrder.set(item.order_id, []);
    itemsByOrder.get(item.order_id).push(item);
  }
  return orders.map((order) => ({
    ...order,
    items: itemsByOrder.get(order.id) || [],
  }));
}

export function publicOrderSummary(order) {
  return {
    number: order.order_number,
    status: order.status,
    paymentStatus: order.payment_status,
    paymentMethod: order.payment_method,
    totalCents: order.total_cents,
    createdAt: order.created_at,
    deliveryMethod: order.delivery_method,
    accessToken: order.access_token,
  };
}
