import { z } from 'zod';
import { fail, ok } from '@/lib/api';
import { query } from '@/lib/db';
import {
  clientIp,
  originGuard,
  rateLimit,
  rateLimitResponse,
} from '@/lib/security';

const schema = z.object({
  code: z.string().trim().toUpperCase().min(3).max(40),
});

export async function POST(request) {
  const blocked = originGuard(request);
  if (blocked) return blocked;

  const limit = rateLimit(`affiliate-click:${clientIp(request)}`, {
    limit: 60,
    windowMs: 60_000,
  });
  if (!limit.ok) return rateLimitResponse(limit.retryAfter);

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail('That referral code is not valid.', 422);
  }

  await query(
    `UPDATE affiliates SET clicks = clicks + 1 WHERE upper(code) = $1`,
    [parsed.data.code],
  );

  return ok({ tracked: true });
}
