import { fail, ok, readJson, validationFail } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { one, query, transaction } from '@/lib/db';
import { newId } from '@/lib/ids';
import {
  clientIp,
  originGuard,
  rateLimit,
  rateLimitResponse,
} from '@/lib/security';
import { addressInputSchema } from '@/lib/validation';

export async function POST(request) {
  const blocked = originGuard(request);
  if (blocked) return blocked;

  const user = await getCurrentUser();
  if (!user) return fail('Sign in to manage your addresses.', 401);

  const limit = rateLimit(`addresses:${user.id}:${clientIp(request)}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!limit.ok) return rateLimitResponse(limit.retryAfter);

  const parsed = addressInputSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationFail(parsed.error);
  const payload = parsed.data;

  const [{ count }] = await query(
    `SELECT count(*)::int AS count FROM addresses WHERE user_id = $1`,
    [user.id],
  );
  if (Number(count) >= 20) {
    return fail('You can save up to 20 delivery addresses.', 409);
  }

  const makeDefault = payload.isDefault || Number(count) === 0;
  const id = newId();

  await transaction(async (tx) => {
    if (makeDefault) {
      await tx.query(
        `UPDATE addresses SET is_default = false WHERE user_id = $1`,
        [user.id],
      );
    }
    await tx.query(
      `INSERT INTO addresses
        (id, user_id, label, recipient, phone, county, town, address_line,
         instructions, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        id,
        user.id,
        payload.label || 'Home',
        payload.recipient,
        payload.phone,
        payload.county,
        payload.town,
        payload.addressLine,
        payload.instructions || null,
        makeDefault,
      ],
    );
  });

  const address = await one(`SELECT * FROM addresses WHERE id = $1`, [id]);
  return ok({ address }, { status: 201 });
}
