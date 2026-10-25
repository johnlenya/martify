import { fail, ok, readJson } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import {
  canAccessOrder,
  getOrderByNumber,
  isDemoPayments,
  markOrderPaid,
  OrderError,
  publicOrderSummary,
} from '@/lib/orders';
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

  const limit = rateLimit(`demo-payment:${clientIp(request)}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!limit.ok) return rateLimitResponse(limit.retryAfter);

  const body = await readJson(request);
  const orderNumber = String(body?.orderNumber || '').trim();
  const token = String(body?.token || '').trim();
  if (!orderNumber) return fail('Choose an order to pay for.');

  if (!isDemoPayments()) {
    return fail('Demo payments are disabled on this deployment.', 409);
  }

  const order = await getOrderByNumber(orderNumber);
  if (!order) return fail('Order not found.', 404);
  const user = await getCurrentUser();
  if (!canAccessOrder(order, user, token)) {
    return fail('You do not have access to this order.', 403);
  }

  try {
    const result = await markOrderPaid({
      orderNumber,
      accessToken: token,
      user,
      provider: order.payment_method,
      raw: { simulated: true },
    });
    return ok({
      paid: true,
      alreadyPaid: result.alreadyPaid,
      demo: true,
      order: publicOrderSummary(result.order),
    });
  } catch (error) {
    if (error instanceof OrderError) return fail(error.message, error.status);
    throw error;
  }
}
