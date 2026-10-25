import { fail, ok, readJson, validationFail } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { one, transaction } from '@/lib/db';
import {
  clientIp,
  originGuard,
  rateLimit,
  rateLimitResponse,
} from '@/lib/security';
import { addressInputSchema } from '@/lib/validation';

async function ownedAddress(id, userId) {
  return one(`SELECT * FROM addresses WHERE id = $1 AND user_id = $2`, [
    id,
    userId,
  ]);
}

export async function PATCH(request, { params }) {
  const blocked = originGuard(request);
  if (blocked) return blocked;

  const user = await getCurrentUser();
  if (!user) return fail('Sign in to manage your addresses.', 401);

  const limit = rateLimit(`addresses-edit:${user.id}:${clientIp(request)}`, {
    limit: 40,
    windowMs: 60_000,
  });
  if (!limit.ok) return rateLimitResponse(limit.retryAfter);

  const { id } = await params;
  const existing = await ownedAddress(id, user.id);
  if (!existing) return fail('That address could not be found.', 404);

  const parsed = addressInputSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationFail(parsed.error);
  const payload = parsed.data;
  const makeDefault = Boolean(payload.isDefault || existing.is_default);

  await transaction(async (tx) => {
    if (makeDefault) {
      await tx.query(
        `UPDATE addresses SET is_default = false WHERE user_id = $1`,
        [user.id],
      );
    }
    await tx.query(
      `UPDATE addresses
       SET label = $2, recipient = $3, phone = $4, county = $5, town = $6,
           address_line = $7, instructions = $8, is_default = $9
       WHERE id = $1 AND user_id = $10`,
      [
        id,
        payload.label || 'Home',
        payload.recipient,
        payload.phone,
        payload.county,
        payload.town,
        payload.addressLine,
        payload.instructions || null,
        makeDefault,
        user.id,
      ],
    );
  });

  const address = await ownedAddress(id, user.id);
  return ok({ address });
}

export async function DELETE(request, { params }) {
  const blocked = originGuard(request);
  if (blocked) return blocked;

  const user = await getCurrentUser();
  if (!user) return fail('Sign in to manage your addresses.', 401);

  const limit = rateLimit(`addresses-delete:${user.id}:${clientIp(request)}`, {
    limit: 20,
    windowMs: 60_000,
  });
  if (!limit.ok) return rateLimitResponse(limit.retryAfter);

  const { id } = await params;
  const existing = await ownedAddress(id, user.id);
  if (!existing) return fail('That address could not be found.', 404);

  await transaction(async (tx) => {
    await tx.query(`DELETE FROM addresses WHERE id = $1 AND user_id = $2`, [
      id,
      user.id,
    ]);
    if (existing.is_default) {
      const remaining = await tx.query(
        `SELECT id FROM addresses WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1`,
        [user.id],
      );
      if (remaining[0]) {
        await tx.query(
          `UPDATE addresses SET is_default = true WHERE id = $1`,
          [remaining[0].id],
        );
      }
    }
  });

  return ok({ deleted: true });
}
