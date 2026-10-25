import { z } from 'zod';
import { fail, ok, readJson, validationFail } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { one, query } from '@/lib/db';
import { newId } from '@/lib/ids';
import {
  clientIp,
  originGuard,
  rateLimit,
  rateLimitResponse,
} from '@/lib/security';
import { RETURN_REASONS } from '@/lib/commerce';

const schema = z.object({
  orderItemId: z.string().trim().min(1).max(80),
  reason: z.string().trim().refine((value) => RETURN_REASONS.includes(value), {
    message: 'Choose a reason for the return.',
  }),
  details: z
    .string()
    .trim()
    .min(10, 'Tell us a little more about the issue.')
    .max(500, 'Keep your note under 500 characters.'),
});

export async function POST(request) {
  const blocked = originGuard(request);
  if (blocked) return blocked;

  const user = await getCurrentUser();
  if (!user) return fail('Sign in to request a return.', 401);

  const limit = rateLimit(`returns:${user.id}:${clientIp(request)}`, {
    limit: 8,
    windowMs: 60 * 60_000,
  });
  if (!limit.ok) return rateLimitResponse(limit.retryAfter);

  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return validationFail(parsed.error);
  const { orderItemId, reason, details } = parsed.data;

  const item = await one(
    `SELECT oi.id, oi.order_id, oi.title, oi.line_total_cents,
            o.user_id, o.order_number, o.status, o.payment_status
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE oi.id = $1`,
    [orderItemId],
  );
  if (!item || item.user_id !== user.id) {
    return fail('That order item could not be found.', 404);
  }
  if (item.status !== 'delivered' || item.payment_status !== 'paid') {
    return fail('Only delivered, paid orders can be returned.', 409);
  }

  const existing = await one(
    `SELECT id FROM returns
     WHERE order_item_id = $1 AND status <> 'rejected'
     LIMIT 1`,
    [orderItemId],
  );
  if (existing) {
    return fail('A return for this item is already being handled.', 409);
  }

  const id = newId();
  const now = new Date();
  await query(
    `INSERT INTO returns
      (id, order_id, order_item_id, user_id, reason, details, status,
       refund_cents, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,'requested',0,$7,$7)`,
    [id, item.order_id, orderItemId, user.id, reason, details, now],
  );

  await query(
    `INSERT INTO notifications (id, user_id, title, body, type, href, created_at)
     VALUES ($1,$2,'Return request received',$3,'return',$4,$5)`,
    [
      newId(),
      user.id,
      `We are reviewing your return for ${item.title} on order ${item.order_number}.`,
      '/account/returns',
      now,
    ],
  );

  return ok(
    {
      return: {
        id,
        orderNumber: item.order_number,
        title: item.title,
        status: 'requested',
      },
    },
    { status: 201 },
  );
}
