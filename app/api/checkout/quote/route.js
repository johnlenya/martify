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

  const limit = rateLimit(`checkout-quote:${clientIp(request)}`, {
    limit: 90,
    windowMs: 60_000,
  });
  if (!limit.ok) return rateLimitResponse(limit.retryAfter);

  const body = await readJson(request);
  const quote = await priceCart({
    items: body?.items,
    couponCode: body?.couponCode || '',
    deliveryMethod: body?.deliveryMethod || 'door',
  });

  if (!quote.lines.length) {
    return fail('Add items to your cart before checking out.', 400, {
      issues: quote.issues,
    });
  }

  return ok({
    lines: quote.lines.map((line) => ({
      key: line.key,
      productId: line.productId,
      variantId: line.variantId,
      title: line.title,
      variantName: line.variantName,
      image: line.image,
      quantity: line.quantity,
      availableStock: line.availableStock,
      unitPriceCents: line.unitPriceCents,
      lineTotalCents: line.lineTotalCents,
      sellerName: line.sellerName,
    })),
    subtotalCents: quote.subtotalCents,
    discountCents: quote.discountCents,
    deliveryFeeCents: quote.deliveryFeeCents,
    totalCents: quote.totalCents,
    coupon: quote.coupon,
    couponError: quote.couponError,
    issues: quote.issues,
    deliveryMethod: quote.deliveryMethod,
  });
}
