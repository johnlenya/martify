import { fail, ok, readJson } from '@/lib/api';
import { publicOrderSummary, trackOrder } from '@/lib/orders';
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

  const limit = rateLimit(`track:${clientIp(request)}`, {
    limit: 20,
    windowMs: 60_000,
  });
  if (!limit.ok) return rateLimitResponse(limit.retryAfter);

  const body = await readJson(request);
  const orderNumber = String(body?.orderNumber || '').trim().toUpperCase();
  const contact = String(body?.contact || '').trim();
  if (!orderNumber || !contact) {
    return fail('Enter your order number and the email or phone used at checkout.');
  }

  const order = await trackOrder({ orderNumber, contact });
  if (!order) {
    return fail(
      'We could not find an order with those details. Check the order number and contact.',
      404,
    );
  }

  return ok({ order: publicOrderSummary(order) });
}
