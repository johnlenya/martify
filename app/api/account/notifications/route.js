import { z } from 'zod';
import { fail, ok, readJson, validationFail } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import {
  clientIp,
  originGuard,
  rateLimit,
  rateLimitResponse,
} from '@/lib/security';

const schema = z.object({
  id: z.string().trim().min(1).max(80).optional(),
  all: z.boolean().optional().default(false),
});

export async function PATCH(request) {
  const blocked = originGuard(request);
  if (blocked) return blocked;

  const user = await getCurrentUser();
  if (!user) return fail('Sign in to update notifications.', 401);

  const limit = rateLimit(`notifications:${user.id}:${clientIp(request)}`, {
    limit: 60,
    windowMs: 60_000,
  });
  if (!limit.ok) return rateLimitResponse(limit.retryAfter);

  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return validationFail(parsed.error);
  const { id, all } = parsed.data;

  if (all) {
    await query(
      `UPDATE notifications SET read = true
       WHERE user_id = $1 AND read = false`,
      [user.id],
    );
    return ok({ updated: 'all' });
  }

  if (!id) return fail('Choose a notification to mark as read.', 422);
  await query(
    `UPDATE notifications SET read = true
     WHERE id = $1 AND user_id = $2`,
    [id, user.id],
  );
  return ok({ updated: id });
}
