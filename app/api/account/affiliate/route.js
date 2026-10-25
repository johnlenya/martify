import { fail, ok } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { one } from '@/lib/db';
import { newAffiliateCode, newId } from '@/lib/ids';
import { originGuard } from '@/lib/security';

export async function POST(request) {
  const blocked = originGuard(request);
  if (blocked) return blocked;

  const user = await getCurrentUser();
  if (!user) return fail('Sign in to join the affiliate programme.', 401);

  const existing = await one(`SELECT * FROM affiliates WHERE user_id = $1`, [
    user.id,
  ]);
  if (existing) return ok({ affiliate: existing, created: false });

  const code = user.referralCode || newAffiliateCode(user.name);
  const taken = await one(
    `SELECT id FROM affiliates WHERE upper(code) = upper($1)`,
    [code],
  );
  if (taken) {
    return fail(
      'That referral code is already in use. Contact support to activate your account.',
      409,
    );
  }

  const id = newId();
  await query(
    `INSERT INTO affiliates (id, user_id, code, created_at)
     VALUES ($1,$2,$3,now())`,
    [id, user.id, code],
  );
  const affiliate = await one(`SELECT * FROM affiliates WHERE id = $1`, [id]);

  return ok({ affiliate, created: true }, { status: 201 });
}
