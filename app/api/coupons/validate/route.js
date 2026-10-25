import { fail, ok, readJson } from '@/lib/api';
import { priceCart } from '@/lib/checkout';
import {
  clientIp,
  originGuard,
  rateLimit,
  rateLimitResponse,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const blocked = originGuard(request);
  if (blocked) return blocked;

  const limit = rateLimit(`coupon:${clientIp(request)}`, {
    limit: 40,
    windowMs: 60_000,
  });
  if (!limit.ok) return rateLimitResponse(limit.retryAfter);

  const body = await readJson(request);
  const code = String(body?.code || '').trim();
  if (!code) return fail('Enter a coupon code.');
  if (code.length > 40) return fail('Enter a valid coupon code.');

  const quote = await priceCart({
    items: body?.items,
    couponCode: code,
    deliveryMethod: body?.deliveryMethod || 'door',
  });

  if (!quote.lines.length) {
    return fail('Add items to your cart before applying a coupon.');
  }
  if (quote.couponError) {
    return fail(quote.couponError, 422);
  }

  return ok({
    coupon: quote.coupon,
    discountCents: quote.discountCents,
    freeDelivery: Boolean(quote.coupon?.freeDelivery),
    subtotalCents: quote.subtotalCents,
    deliveryFeeCents: quote.deliveryFeeCents,
    totalCents: quote.totalCents,
    issues: quote.issues,
  });
}
