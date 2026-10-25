-- Martify marketplace schema (PostgreSQL / PGlite compatible)

CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text UNIQUE,
  password_hash text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  avatar_url text,
  locale text NOT NULL DEFAULT 'en' CHECK (locale IN ('en', 'sw')),
  referral_code text UNIQUE,
  referred_by text,
  provider text NOT NULL DEFAULT 'password' CHECK (provider IN ('password', 'google')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sellers (
  id text PRIMARY KEY,
  user_id text NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  store_name text NOT NULL,
  slug text NOT NULL UNIQUE,
  tagline text,
  description text,
  logo_url text,
  banner_url text,
  location text,
  county text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  verified boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  subscription_tier text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  subscription_expires_at timestamptz,
  commission_override_bps integer CHECK (commission_override_bps BETWEEN 0 AND 3000),
  balance_cents bigint NOT NULL DEFAULT 0,
  lifetime_sales_cents bigint NOT NULL DEFAULT 0,
  payout_method text CHECK (payout_method IN ('mpesa', 'bank')),
  payout_destination text,
  business_name text,
  registration_number text,
  tax_pin text,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  parent_id text REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon text,
  image_url text,
  commission_bps integer NOT NULL DEFAULT 1000 CHECK (commission_bps BETWEEN 0 AND 3000),
  sort integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  seller_id text NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  category_id text NOT NULL REFERENCES categories(id),
  brand text,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  base_price_cents integer NOT NULL CHECK (base_price_cents >= 0),
  compare_at_cents integer,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  rating numeric(3, 2) NOT NULL DEFAULT 0,
  rating_count integer NOT NULL DEFAULT 0,
  sold_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'active', 'rejected', 'archived')),
  sponsored_until timestamptz,
  featured boolean NOT NULL DEFAULT false,
  location text,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_variants (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  price_cents integer CHECK (price_cents >= 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku text,
  sort integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reviews (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id text REFERENCES users(id) ON DELETE SET NULL,
  order_id text,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS addresses (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label text,
  recipient text NOT NULL,
  phone text NOT NULL,
  county text NOT NULL,
  town text NOT NULL,
  address_line text NOT NULL,
  instructions text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coupons (
  id text PRIMARY KEY,
  code text NOT NULL UNIQUE,
  description text,
  type text NOT NULL CHECK (type IN ('percent', 'fixed', 'free_delivery')),
  value integer NOT NULL DEFAULT 0,
  min_spend_cents integer NOT NULL DEFAULT 0,
  max_discount_cents integer,
  usage_limit integer,
  used_count integer NOT NULL DEFAULT 0,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  seller_id text REFERENCES sellers(id) ON DELETE CASCADE,
  category_id text REFERENCES categories(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS flash_sales (
  id text PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS flash_sale_items (
  sale_id text NOT NULL REFERENCES flash_sales(id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  discount_bps integer NOT NULL DEFAULT 1500 CHECK (discount_bps BETWEEN 100 AND 7000),
  stock_limit integer,
  sold_count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (sale_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  order_number text NOT NULL UNIQUE,
  access_token text NOT NULL UNIQUE,
  user_id text REFERENCES users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  delivery_method text NOT NULL DEFAULT 'door' CHECK (delivery_method IN ('door', 'pickup', 'express')),
  shipping_address jsonb NOT NULL,
  county text,
  town text,
  notes text,
  coupon_code text,
  subtotal_cents integer NOT NULL,
  discount_cents integer NOT NULL DEFAULT 0,
  delivery_fee_cents integer NOT NULL DEFAULT 0,
  total_cents integer NOT NULL,
  commission_cents integer NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'mpesa' CHECK (payment_method IN ('mpesa', 'card', 'cod')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  status text NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled')),
  payment_ref text,
  paid_at timestamptz,
  affiliate_code text,
  affiliate_commission_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  seller_id text NOT NULL REFERENCES sellers(id),
  product_id text REFERENCES products(id) ON DELETE SET NULL,
  variant_id text,
  title text NOT NULL,
  variant_name text,
  image_url text,
  unit_price_cents integer NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  line_total_cents integer NOT NULL,
  commission_bps integer NOT NULL,
  commission_cents integer NOT NULL,
  seller_amount_cents integer NOT NULL,
  fulfillment_status text NOT NULL DEFAULT 'placed' CHECK (fulfillment_status IN ('placed', 'confirmed', 'shipped', 'delivered', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS payments (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider text NOT NULL,
  amount_cents integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reference text,
  checkout_request_id text,
  merchant_request_id text,
  phone text,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id text PRIMARY KEY,
  kind text NOT NULL,
  order_id text,
  seller_id text,
  user_id text,
  amount_cents bigint NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payouts (
  id text PRIMARY KEY,
  seller_id text NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL,
  method text NOT NULL CHECK (method IN ('mpesa', 'bank')),
  destination text NOT NULL,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'processing', 'paid', 'rejected')),
  reference text,
  note text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE TABLE IF NOT EXISTS returns (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id text NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  user_id text REFERENCES users(id) ON DELETE SET NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'rejected', 'refunded')),
  refund_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  type text NOT NULL DEFAULT 'info',
  href text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id text PRIMARY KEY,
  seller_id text NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  tier text NOT NULL CHECK (tier IN ('pro', 'premium')),
  price_cents integer NOT NULL,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promotions (
  id text PRIMARY KEY,
  seller_id text NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  product_id text REFERENCES products(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('sponsored', 'banner', 'verification', 'featured')),
  amount_cents integer NOT NULL,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'expired')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS banners (
  id text PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  eyebrow text,
  image_url text,
  href text,
  cta text,
  placement text NOT NULL DEFAULT 'hero' CHECK (placement IN ('hero', 'side', 'strip')),
  active boolean NOT NULL DEFAULT true,
  sort integer NOT NULL DEFAULT 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS affiliates (
  id text PRIMARY KEY,
  user_id text NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  clicks integer NOT NULL DEFAULT 0,
  signups integer NOT NULL DEFAULT 0,
  earnings_cents bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_sponsored ON products(sponsored_until);
CREATE INDEX IF NOT EXISTS idx_order_items_seller ON order_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_seller ON ledger_entries(seller_id);
CREATE INDEX IF NOT EXISTS idx_ledger_kind ON ledger_entries(kind);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_flash_items_product ON flash_sale_items(product_id);
