export const PLATFORM_NAME = 'Martify';
export const CURRENCY = 'KES';
export const COMMISSION_FLOOR_BPS = 500;
export const AFFILIATE_COMMISSION_BPS = 200;

export const TIER_COMMISSION_DISCOUNT = {
  free: 0,
  pro: 100,
  premium: 200,
};

export const FREE_DELIVERY_THRESHOLD_CENTS = 500000;

export const DELIVERY_METHODS = {
  door: {
    feeCents: 20000,
    label: 'Door delivery',
    short: 'To your door',
    eta: '2–4 working days',
  },
  pickup: {
    feeCents: 10000,
    label: 'Pickup station',
    short: 'Collect nearby',
    eta: '1–2 working days',
  },
  express: {
    feeCents: 35000,
    label: 'Express delivery',
    short: 'Nairobi same-day',
    eta: 'Within 24 hours',
  },
};

export const ORDER_STEPS = [
  { key: 'placed', label: 'Placed', description: 'We received your order' },
  {
    key: 'confirmed',
    label: 'Confirmed',
    description: 'The seller is packing it',
  },
  { key: 'shipped', label: 'Shipped', description: 'On the way to you' },
  {
    key: 'out_for_delivery',
    label: 'Out for delivery',
    description: 'Rider is almost there',
  },
  { key: 'delivered', label: 'Delivered', description: 'Enjoy your order' },
];

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    priceCents: 0,
    tagline: 'Start selling',
    commissionDiscountBps: 0,
    features: [
      'Up to 20 active products',
      'Standard category commission',
      'M-Pesa and card payouts',
      'Basic sales analytics',
    ],
  },
  pro: {
    name: 'Pro',
    priceCents: 250000,
    tagline: 'Grow faster',
    commissionDiscountBps: 100,
    features: [
      'Unlimited products',
      '1% lower commission',
      'Sponsored listing credits',
      'Advanced analytics and payout priority',
    ],
  },
  premium: {
    name: 'Premium',
    priceCents: 600000,
    tagline: 'Own your category',
    commissionDiscountBps: 200,
    features: [
      'Everything in Pro',
      '2% lower commission',
      'Homepage consideration',
      'Dedicated merchant support',
    ],
  },
};

export const BOOST_PACKAGES = [
  { days: 7, priceCents: 50000, label: '7-day boost' },
  { days: 30, priceCents: 150000, label: '30-day boost' },
];

export const PAID_SERVICES = {
  verification: {
    priceCents: 500000,
    label: 'Verified store badge',
  },
  featured: {
    priceCents: 1000000,
    label: 'Featured store',
  },
  banner: {
    priceCents: 2000000,
    label: 'Homepage banner',
  },
};

export const COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu',
  'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho',
  'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale',
  'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit',
  'Meru', 'Migori', 'Mombasa', "Murang'a", 'Nairobi', 'Nakuru', 'Nandi',
  'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya',
  'Taita-Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans Nzoia', 'Turkana',
  'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot',
];

export const PRODUCT_STATUS_LABELS = {
  draft: 'Draft',
  pending: 'Awaiting review',
  active: 'Live',
  rejected: 'Rejected',
  archived: 'Archived',
};

export const ORDER_STATUS_LABELS = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const PAYMENT_STATUS_LABELS = {
  pending: 'Payment pending',
  paid: 'Paid',
  failed: 'Payment failed',
  refunded: 'Refunded',
};

export const PAYOUT_STATUS_LABELS = {
  requested: 'Requested',
  processing: 'Processing',
  paid: 'Paid',
  rejected: 'Rejected',
};

export const RETURN_REASONS = [
  'Item is not as described',
  'Item arrived damaged',
  'Wrong item delivered',
  'Item is faulty',
  'Changed my mind',
  'Other',
];

export const RETURN_STATUS_LABELS = {
  requested: 'Under review',
  approved: 'Approved',
  rejected: 'Not approved',
  refunded: 'Refunded',
};


export function flashPriceCents(basePriceCents, discountBps = 0) {
  const base = Number(basePriceCents) || 0;
  const bps = Number(discountBps) || 0;
  if (!bps) return base;
  return Math.round(
    Math.round(((base * (10000 - bps)) / 10000) / 100) * 100,
  );
}

export function commissionBpsFor({
  categoryBps = 1000,
  tier = 'free',
  overrideBps = null,
} = {}) {
  if (overrideBps !== null && overrideBps !== undefined) {
    return Math.min(3000, Math.max(0, Number(overrideBps)));
  }
  const discount = TIER_COMMISSION_DISCOUNT[tier] ?? 0;
  return Math.max(
    COMMISSION_FLOOR_BPS,
    Number(categoryBps) - discount,
  );
}

export function deliveryFeeFor(
  method = 'door',
  subtotalCents = 0,
  freeDelivery = false,
) {
  const definition = DELIVERY_METHODS[method] ?? DELIVERY_METHODS.door;
  if (freeDelivery) return 0;
  if (
    method === 'door' &&
    subtotalCents >= FREE_DELIVERY_THRESHOLD_CENTS
  ) {
    return 0;
  }
  return definition.feeCents;
}

export function couponDiscountFor(coupon, subtotalCents, deliveryFeeCents) {
  if (!coupon) {
    return { discountCents: 0, freeDelivery: false, error: null };
  }
  if (subtotalCents < (coupon.min_spend_cents || 0)) {
    return {
      discountCents: 0,
      freeDelivery: false,
      error: `This code needs a minimum spend of KSh ${(
        (coupon.min_spend_cents || 0) / 100
      ).toLocaleString('en-KE')}.`,
    };
  }

  if (coupon.type === 'free_delivery') {
    return {
      discountCents: 0,
      freeDelivery: true,
      error: null,
    };
  }

  if (coupon.type === 'fixed') {
    return {
      discountCents: Math.min(Number(coupon.value), subtotalCents),
      freeDelivery: false,
      error: null,
    };
  }

  let discount = Math.round(
    (subtotalCents * Number(coupon.value)) / 10000,
  );
  if (coupon.max_discount_cents) {
    discount = Math.min(discount, Number(coupon.max_discount_cents));
  }
  if (deliveryFeeCents < 0) discount = Math.max(0, discount);
  return {
    discountCents: Math.min(discount, subtotalCents),
    freeDelivery: false,
    error: null,
  };
}

export function orderStatusStepIndex(status) {
  return ORDER_STEPS.findIndex((step) => step.key === status);
}
