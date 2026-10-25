import 'server-only';
import { cache } from 'react';
import { one, query } from './db/index.js';
import {
  AFFILIATE_COMMISSION_BPS,
  BOOST_PACKAGES,
  PAID_SERVICES,
  SUBSCRIPTION_PLANS,
  flashPriceCents,
} from './commerce.js';
import { toIso } from './format.js';

export const PRODUCT_SELECT = `
  SELECT p.id, p.slug, p.title, p.brand, p.description, p.images,
         p.base_price_cents, p.compare_at_cents, p.stock, p.rating,
         p.rating_count, p.sold_count, p.status, p.sponsored_until,
         p.featured, p.location, p.tags, p.created_at,
         s.id AS seller_id, s.store_name, s.slug AS seller_slug,
         s.verified AS seller_verified, s.featured AS seller_featured,
         s.subscription_tier, s.county AS seller_county,
         c.id AS category_id, c.name AS category_name, c.slug AS category_slug,
         flash.sale_id AS flash_sale_id, flash.title AS flash_title,
         flash.ends_at AS flash_ends_at, flash.discount_bps AS flash_discount_bps,
         flash.stock_limit AS flash_stock_limit, flash.sold_count AS flash_sold_count
  FROM products p
  JOIN sellers s ON s.id = p.seller_id AND s.status = 'approved'
  JOIN categories c ON c.id = p.category_id
  LEFT JOIN LATERAL (
    SELECT fs.id AS sale_id, fs.title, fs.ends_at, fsi.discount_bps,
           fsi.stock_limit, fsi.sold_count
    FROM flash_sale_items fsi
    JOIN flash_sales fs ON fs.id = fsi.sale_id
    WHERE fsi.product_id = p.id
      AND fs.active = true
      AND fs.starts_at <= now()
      AND fs.ends_at > now()
    ORDER BY fs.ends_at ASC
    LIMIT 1
  ) flash ON true
`;

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseJson(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function mapProduct(row) {
  if (!row) return null;
  const images = parseJson(row.images, []).filter(Boolean);
  const basePrice = num(row.base_price_cents);
  const flashDiscount = num(row.flash_discount_bps);
  const priceCents = flashDiscount
    ? flashPriceCents(basePrice, flashDiscount)
    : basePrice;
  const compareAtCents = flashDiscount
    ? basePrice
    : num(row.compare_at_cents) || null;
  const sponsoredUntil = row.sponsored_until
    ? new Date(row.sponsored_until)
    : null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    brand: row.brand,
    description: row.description,
    images,
    image: images[0] || null,
    basePriceCents: basePrice,
    priceCents,
    compareAtCents,
    discountPercent:
      compareAtCents && compareAtCents > priceCents
        ? Math.round(((compareAtCents - priceCents) / compareAtCents) * 100)
        : 0,
    stock: num(row.stock),
    rating: Math.round(num(row.rating) * 10) / 10,
    ratingCount: num(row.rating_count),
    soldCount: num(row.sold_count),
    featured: Boolean(row.featured),
    sponsored: Boolean(sponsoredUntil && sponsoredUntil > new Date()),
    location: row.location,
    sellerCounty: row.seller_county,
    tags: parseJson(row.tags, []),
    createdAt: toIso(row.created_at),
    category: {
      id: row.category_id,
      name: row.category_name,
      slug: row.category_slug,
    },
    seller: {
      id: row.seller_id,
      name: row.store_name,
      slug: row.seller_slug,
      verified: Boolean(row.seller_verified),
      featured: Boolean(row.seller_featured),
      tier: row.subscription_tier,
    },
    flash: row.flash_sale_id
      ? {
          saleId: row.flash_sale_id,
          title: row.flash_title,
          endsAt: toIso(row.flash_ends_at),
          discountBps: flashDiscount,
          stockLimit: num(row.flash_stock_limit),
          soldCount: num(row.flash_sold_count),
        }
      : null,
  };
}

export function mapCategory(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon,
    parentId: row.parent_id,
    commissionBps: num(row.commission_bps),
    sort: num(row.sort),
    productCount: num(row.product_count),
    active: row.active !== false,
  };
}

export const getSettings = cache(async () => {
  const defaults = {
    delivery_door_cents: 20000,
    delivery_pickup_cents: 10000,
    delivery_express_cents: 35000,
    free_delivery_threshold_cents: 500000,
    affiliate_commission_bps: AFFILIATE_COMMISSION_BPS,
    subscription_pro_cents: SUBSCRIPTION_PLANS.pro.priceCents,
    subscription_premium_cents: SUBSCRIPTION_PLANS.premium.priceCents,
    boost_7d_cents: BOOST_PACKAGES[0].priceCents,
    boost_30d_cents: BOOST_PACKAGES[1].priceCents,
    verification_cents: PAID_SERVICES.verification.priceCents,
    featured_store_cents: PAID_SERVICES.featured.priceCents,
    support_email: 'hello@martify.co.ke',
    support_phone: '+254 700 000 000',
    announcement: 'Free door delivery on orders over KSh 5,000',
    demo_mode: true,
  };
  const row = await one(
    `SELECT value FROM platform_settings WHERE key = 'platform'`,
  );
  const stored = parseJson(row?.value, {});
  const merged = { ...defaults, ...stored };
  for (const key of Object.keys(defaults)) {
    if (typeof defaults[key] === 'number') {
      merged[key] = num(merged[key], defaults[key]);
    }
  }
  return merged;
});

export const getCategoryRows = cache(async () => {
  const rows = await query(
    `SELECT c.*,
       (SELECT count(*)::int FROM products p
        WHERE p.status = 'active'
          AND (p.category_id = c.id
               OR p.category_id IN (SELECT id FROM categories WHERE parent_id = c.id))
       ) AS product_count
     FROM categories c
     WHERE c.active = true
     ORDER BY c.sort ASC, c.name ASC`,
  );
  return rows.map(mapCategory);
});

export const getCategoryTree = cache(async () => {
  const rows = await getCategoryRows();
  const parents = rows.filter((row) => !row.parentId);
  return parents.map((parent) => ({
    ...parent,
    children: rows.filter((row) => row.parentId === parent.id),
  }));
});

export const getCategoryBySlug = cache(async (slug) => {
  const tree = await getCategoryTree();
  for (const parent of tree) {
    if (parent.slug === slug) return parent;
    const child = parent.children.find((item) => item.slug === slug);
    if (child) return { ...child, parent };
  }
  return null;
});

export function categoryIdsFor(category) {
  if (!category) return [];
  return [category.id, ...(category.children ?? []).map((child) => child.id)];
}

function activeProductWhere(excludeSoldOut = false) {
  return `p.status = 'active' AND s.status = 'approved'${
    excludeSoldOut ? ' AND p.stock > 0' : ''
  }`;
}

export async function fetchProductSection({
  where = '',
  order = 'p.sold_count DESC',
  limit = 10,
  params = [],
}) {
  const rows = await query(
    `${PRODUCT_SELECT}
     WHERE ${activeProductWhere(false)} ${where ? `AND ${where}` : ''}
     ORDER BY ${order}
     LIMIT $${params.length + 1}`,
    [...params, limit],
  );
  return rows.map(mapProduct);
}

export const listProducts = cache(async (options = {}) => {
  const {
    categorySlug = null,
    sellerSlug = null,
    q = '',
    brands = [],
    minPrice = null,
    maxPrice = null,
    rating = null,
    location = null,
    locations = [],
    sort = 'popular',
    page = 1,
    perPage = 24,
    ids = null,
    featured = null,
    onSale = false,
  } = options;

  const params = [];
  const add = (value) => {
    params.push(value);
    return `$${params.length}`;
  };

  const clauses = [activeProductWhere(false)];
  let category = null;

  if (categorySlug) {
    category = await getCategoryBySlug(categorySlug);
    if (!category) {
      return {
        products: [],
        total: 0,
        page: 1,
        pages: 0,
        brands: [],
        locations: [],
        category: null,
      };
    }
    const idsForCategory = categoryIdsFor(category);
    clauses.push(
      `p.category_id IN (${idsForCategory.map((id) => add(id)).join(', ')})`,
    );
  }

  if (sellerSlug) {
    clauses.push(`s.slug = ${add(sellerSlug)}`);
  }

  if (q) {
    const like = add(`%${q}%`);
    clauses.push(
      `(p.title ILIKE ${like} OR p.brand ILIKE ${like} OR s.store_name ILIKE ${like} OR c.name ILIKE ${like})`,
    );
  }

  if (Array.isArray(ids) && ids.length) {
    clauses.push(`p.id IN (${ids.map((id) => add(id)).join(', ')})`);
  }

  if (brands.length) {
    clauses.push(`p.brand IN (${brands.map((brand) => add(brand)).join(', ')})`);
  }

  if (minPrice !== null && Number.isFinite(Number(minPrice))) {
    clauses.push(`p.base_price_cents >= ${add(Number(minPrice))}`);
  }

  if (maxPrice !== null && Number.isFinite(Number(maxPrice))) {
    clauses.push(`p.base_price_cents <= ${add(Number(maxPrice))}`);
  }

  if (rating) {
    clauses.push(`p.rating >= ${add(Number(rating))}`);
  }

  if (location) {
    clauses.push(`s.county = ${add(location)}`);
  }

  if (locations.length) {
    clauses.push(
      `s.county IN (${locations.map((county) => add(county)).join(', ')})`,
    );
  }

  if (featured) {
    clauses.push('p.featured = true');
  }

  if (onSale) {
    clauses.push('p.compare_at_cents > p.base_price_cents');
  }

  const orderMap = {
    popular: `CASE WHEN p.sponsored_until > now() THEN 0 ELSE 1 END, p.sold_count DESC, p.rating DESC`,
    newest: 'p.created_at DESC',
    'price-asc': 'p.base_price_cents ASC',
    'price-desc': 'p.base_price_cents DESC',
    rating: 'p.rating DESC, p.rating_count DESC',
    discount: '(COALESCE(p.compare_at_cents, 0) - p.base_price_cents) DESC',
  };
  const orderBy = orderMap[sort] ?? orderMap.popular;
  const safePage = Math.max(1, Number(page) || 1);
  const safePerPage = Math.min(48, Math.max(1, Number(perPage) || 24));
  const offset = (safePage - 1) * safePerPage;

  const from = `FROM products p
    JOIN sellers s ON s.id = p.seller_id AND s.status = 'approved'
    JOIN categories c ON c.id = p.category_id`;

  const countRows = await query(
    `SELECT count(*)::int AS total ${from} WHERE ${clauses.join(' AND ')}`,
    params,
  );
  const total = num(countRows[0]?.total);

  const rows = await query(
    `${PRODUCT_SELECT} WHERE ${clauses.join(' AND ')}
     ORDER BY ${orderBy}
     LIMIT ${add(safePerPage)} OFFSET ${add(offset)}`,
    params,
  );

  const brandParams = [];
  const brandClauses = [activeProductWhere(false), 'p.brand IS NOT NULL'];
  if (category) {
    const idsForCategory = categoryIdsFor(category);
    brandClauses.push(
      `p.category_id IN (${idsForCategory
        .map((id) => {
          brandParams.push(id);
          return `$${brandParams.length}`;
        })
        .join(', ')})`,
    );
  }
  const brandRows = await query(
    `SELECT DISTINCT p.brand ${from} WHERE ${brandClauses.join(' AND ')} ORDER BY p.brand ASC`,
    brandParams,
  );

  const locationParams = [];
  const locationClauses = [activeProductWhere(false), 's.county IS NOT NULL'];
  if (category) {
    const idsForCategory = categoryIdsFor(category);
    locationClauses.push(
      `p.category_id IN (${idsForCategory
        .map((id) => {
          locationParams.push(id);
          return `$${locationParams.length}`;
        })
        .join(', ')})`,
    );
  }
  const locationRows = await query(
    `SELECT DISTINCT s.county ${from} WHERE ${locationClauses.join(' AND ')} ORDER BY s.county ASC`,
    locationParams,
  );

  return {
    products: rows.map(mapProduct),
    total,
    page: safePage,
    pages: Math.max(1, Math.ceil(total / safePerPage)),
    brands: brandRows.map((row) => row.brand),
    locations: locationRows.map((row) => row.county),
    category,
  };
});

export async function getProductDetail(slug) {
  const row = await one(
    `${PRODUCT_SELECT}
     WHERE p.slug = $1 AND p.status = 'active' AND s.status = 'approved'`,
    [slug],
  );
  if (!row) return null;
  const product = mapProduct(row);

  const [variants, reviewRows, distributionRows, relatedRows, sellerStats] =
    await Promise.all([
      query(
        `SELECT id, name, price_cents, stock, sku
         FROM product_variants WHERE product_id = $1 ORDER BY sort ASC, name ASC`,
        [product.id],
      ),
      query(
        `SELECT r.id, r.rating, r.title, r.body, r.images, r.created_at,
                u.name AS author_name, u.avatar_url AS author_avatar
         FROM reviews r
         LEFT JOIN users u ON u.id = r.user_id
         WHERE r.product_id = $1
         ORDER BY r.created_at DESC
         LIMIT 12`,
        [product.id],
      ),
      query(
        `SELECT rating, count(*)::int AS count
         FROM reviews WHERE product_id = $1 GROUP BY rating`,
        [product.id],
      ),
      query(
        `${PRODUCT_SELECT}
         WHERE p.status = 'active' AND s.status = 'approved' AND p.id <> $2
         ORDER BY
           CASE
             WHEN p.category_id = $1 THEN 0
             WHEN c.parent_id = $1
               OR c.parent_id = (SELECT parent_id FROM categories WHERE id = $1)
               OR c.id = (SELECT parent_id FROM categories WHERE id = $1) THEN 1
             ELSE 2
           END,
           p.sold_count DESC, p.rating DESC
         LIMIT 8`,
        [product.category.id, product.id],
      ),
      one(
        `SELECT
           (SELECT count(*)::int FROM products WHERE seller_id = $1 AND status = 'active') AS product_count,
           (SELECT COALESCE(AVG(r.rating), 0) FROM reviews r JOIN products p ON p.id = r.product_id WHERE p.seller_id = $1) AS avg_rating,
           (SELECT COALESCE(SUM(sold_count), 0)::int FROM products WHERE seller_id = $1) AS total_sold
         FROM sellers WHERE id = $1`,
        [product.seller.id],
      ),
    ]);

  const variantsMapped = variants.map((variant) => ({
    id: variant.id,
    name: variant.name,
    priceCents: variant.price_cents ? num(variant.price_cents) : null,
    stock: num(variant.stock),
    sku: variant.sku,
  }));

  const reviews = reviewRows.map((review) => ({
    id: review.id,
    rating: num(review.rating),
    title: review.title,
    body: review.body,
    images: parseJson(review.images, []),
    createdAt: toIso(review.created_at),
    author: review.author_name || 'Martify shopper',
    authorAvatar: review.author_avatar,
  }));

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const item of distributionRows) {
    distribution[num(item.rating)] = num(item.count);
  }

  const seller = {
    ...product.seller,
    productCount: num(sellerStats?.product_count),
    avgRating: Math.round(num(sellerStats?.avg_rating) * 10) / 10,
    totalSold: num(sellerStats?.total_sold),
    bannerUrl: null,
    description: null,
  };
  const sellerRow = await one(
    `SELECT description, banner_url, logo_url, tagline, location, county,
            verified, featured, subscription_tier, created_at
     FROM sellers WHERE id = $1`,
    [product.seller.id],
  );
  if (sellerRow) {
    seller.description = sellerRow.description;
    seller.bannerUrl = sellerRow.banner_url;
    seller.logoUrl = sellerRow.logo_url;
    seller.tagline = sellerRow.tagline;
    seller.location = sellerRow.location;
    seller.county = sellerRow.county;
    seller.verified = Boolean(sellerRow.verified);
    seller.featured = Boolean(sellerRow.featured);
    seller.tier = sellerRow.subscription_tier;
    seller.joinedAt = toIso(sellerRow.created_at);
  }

  return {
    product,
    variants: variantsMapped,
    reviews,
    distribution,
    related: relatedRows.map(mapProduct),
    seller,
  };
}

export async function listStores() {
  const rows = await query(
    `SELECT s.id, s.slug, s.store_name, s.tagline, s.description,
            s.banner_url, s.logo_url, s.location, s.county, s.verified,
            s.featured, s.subscription_tier, s.created_at,
            (SELECT count(*)::int FROM products p
             WHERE p.seller_id = s.id AND p.status = 'active') AS product_count,
            (SELECT COALESCE(AVG(p.rating), 0) FROM products p
             WHERE p.seller_id = s.id AND p.status = 'active') AS avg_rating,
            (SELECT COALESCE(SUM(p.sold_count), 0)::int FROM products p
             WHERE p.seller_id = s.id AND p.status = 'active') AS total_sold
     FROM sellers s
     WHERE s.status = 'approved'
     ORDER BY s.featured DESC, product_count DESC, s.created_at ASC`,
  );
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    storeName: row.store_name,
    tagline: row.tagline,
    description: row.description,
    bannerUrl: row.banner_url,
    logoUrl: row.logo_url,
    location: row.location,
    county: row.county,
    verified: Boolean(row.verified),
    featured: Boolean(row.featured),
    tier: row.subscription_tier,
    createdAt: toIso(row.created_at),
    productCount: num(row.product_count),
    avgRating: Math.round(num(row.avg_rating) * 10) / 10,
    totalSold: num(row.total_sold),
  }));
}

export async function getSellerStore(slug) {  const row = await one(
    `SELECT s.*,
       (SELECT count(*)::int FROM products p WHERE p.seller_id = s.id AND p.status = 'active') AS product_count,
       (SELECT COALESCE(AVG(p.rating), 0) FROM products p WHERE p.seller_id = s.id AND p.status = 'active') AS avg_rating,
       (SELECT COALESCE(SUM(p.sold_count), 0)::int FROM products p WHERE p.seller_id = s.id) AS total_sold
     FROM sellers s
     WHERE s.slug = $1 AND s.status = 'approved'`,
    [slug],
  );
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    storeName: row.store_name,
    tagline: row.tagline,
    description: row.description,
    logoUrl: row.logo_url,
    bannerUrl: row.banner_url,
    location: row.location,
    county: row.county,
    verified: Boolean(row.verified),
    featured: Boolean(row.featured),
    tier: row.subscription_tier,
    createdAt: toIso(row.created_at),
    productCount: num(row.product_count),
    avgRating: Math.round(num(row.avg_rating) * 10) / 10,
    totalSold: num(row.total_sold),
  };
}

export const getHomeData = cache(async () => {
  const [
    categories,
    settings,
    heroBanners,
    sideBanners,
    flashSale,
    topDeals,
    newArrivals,
    bestSellers,
    sponsored,
    stores,
  ] = await Promise.all([
    getCategoryTree(),
    getSettings(),
    query(
      `SELECT * FROM banners
       WHERE placement = 'hero' AND active = true
         AND (starts_at IS NULL OR starts_at <= now())
         AND (ends_at IS NULL OR ends_at >= now())
       ORDER BY sort ASC`,
    ),
    query(
      `SELECT * FROM banners
       WHERE placement = 'side' AND active = true
         AND (starts_at IS NULL OR starts_at <= now())
         AND (ends_at IS NULL OR ends_at >= now())
       ORDER BY sort ASC`,
    ),
    one(
      `SELECT * FROM flash_sales
       WHERE active = true AND starts_at <= now() AND ends_at > now()
       ORDER BY ends_at ASC LIMIT 1`,
    ),
    fetchProductSection({
      where: 'p.compare_at_cents > p.base_price_cents',
      order: '(COALESCE(p.compare_at_cents, 0) - p.base_price_cents) DESC',
      limit: 10,
    }),
    fetchProductSection({
      order: 'p.created_at DESC',
      limit: 10,
    }),
    fetchProductSection({
      order: 'p.sold_count DESC, p.rating DESC',
      limit: 10,
    }),
    fetchProductSection({
      where: 'p.sponsored_until > now()',
      order: 'p.sponsored_until DESC',
      limit: 6,
    }),
    query(
      `SELECT s.id, s.slug, s.store_name, s.tagline, s.banner_url, s.logo_url,
              s.location, s.verified, s.featured, s.subscription_tier,
              (SELECT count(*)::int FROM products p
               WHERE p.seller_id = s.id AND p.status = 'active') AS product_count,
              (SELECT COALESCE(AVG(p.rating), 0) FROM products p
               WHERE p.seller_id = s.id AND p.status = 'active') AS avg_rating
       FROM sellers s
       WHERE s.status = 'approved'
       ORDER BY s.featured DESC, product_count DESC
       LIMIT 4`,
    ),
  ]);

  let flashProducts = [];
  if (flashSale) {
    const rows = await query(
      `${PRODUCT_SELECT}
       WHERE p.status = 'active' AND s.status = 'approved'
         AND EXISTS (
           SELECT 1 FROM flash_sale_items fsi
           WHERE fsi.sale_id = $1 AND fsi.product_id = p.id
         )
       ORDER BY p.sold_count DESC
       LIMIT 10`,
      [flashSale.id],
    );
    flashProducts = rows.map(mapProduct);
  }

  return {
    categories,
    settings,
    heroBanners: heroBanners.map((banner) => ({
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      eyebrow: banner.eyebrow,
      imageUrl: banner.image_url,
      href: banner.href,
      cta: banner.cta,
      placement: banner.placement,
    })),
    sideBanners: sideBanners.map((banner) => ({
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      eyebrow: banner.eyebrow,
      imageUrl: banner.image_url,
      href: banner.href,
      cta: banner.cta,
      placement: banner.placement,
    })),
    flashSale: flashSale
      ? {
          id: flashSale.id,
          title: flashSale.title,
          subtitle: flashSale.subtitle,
          endsAt: toIso(flashSale.ends_at),
        }
      : null,
    flashProducts,
    topDeals,
    newArrivals,
    bestSellers,
    sponsored,
    stores: stores.map((store) => ({
      id: store.id,
      slug: store.slug,
      storeName: store.store_name,
      tagline: store.tagline,
      bannerUrl: store.banner_url,
      logoUrl: store.logo_url,
      location: store.location,
      verified: Boolean(store.verified),
      featured: Boolean(store.featured),
      tier: store.subscription_tier,
      productCount: num(store.product_count),
      avgRating: Math.round(num(store.avg_rating) * 10) / 10,
    })),
  };
});

export async function searchSuggestions(term) {
  const q = String(term || '').trim();
  if (q.length < 2) return { products: [], categories: [] };
  const like = `%${q}%`;
  const [products, categories] = await Promise.all([
    query(
      `SELECT p.slug, p.title, p.images, p.base_price_cents, s.store_name
       FROM products p JOIN sellers s ON s.id = p.seller_id
       WHERE p.status = 'active' AND s.status = 'approved'
         AND (p.title ILIKE $1 OR p.brand ILIKE $1)
       ORDER BY p.sold_count DESC LIMIT 5`,
      [like],
    ),
    query(
      `SELECT name, slug FROM categories
       WHERE active = true AND name ILIKE $1
       ORDER BY sort ASC LIMIT 4`,
      [like],
    ),
  ]);
  return {
    products: products.map((product) => ({
      slug: product.slug,
      title: product.title,
      image: parseJson(product.images, [])[0] || null,
      priceCents: num(product.base_price_cents),
      sellerName: product.store_name,
    })),
    categories: categories.map((category) => ({
      name: category.name,
      slug: category.slug,
    })),
  };
}

export function deliveryOptions(settings) {
  return {
    door: {
      label: 'Door delivery',
      short: 'To your door',
      feeCents: num(settings.delivery_door_cents, 20000),
      eta: '2–4 working days',
    },
    pickup: {
      label: 'Pickup station',
      short: 'Collect nearby',
      feeCents: num(settings.delivery_pickup_cents, 10000),
      eta: '1–2 working days',
    },
    express: {
      label: 'Express delivery',
      short: 'Nairobi same-day',
      feeCents: num(settings.delivery_express_cents, 35000),
      eta: 'Within 24 hours',
    },
  };
}
