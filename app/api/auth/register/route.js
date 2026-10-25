import { cookies } from 'next/headers';
import { z } from 'zod';
import { fail, ok, readJson, validationFail } from '@/lib/api';
import { hashPassword, startSession } from '@/lib/auth';
import { one, query } from '@/lib/db';
import { newAffiliateCode, newId } from '@/lib/ids';
import {
  clientIp,
  originGuard,
  rateLimit,
  rateLimitResponse,
} from '@/lib/security';
import {
  emailSchema,
  nameSchema,
  normalizePhone,
  passwordSchema,
} from '@/lib/validation';

const schema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: z.string().trim().max(20).optional().nullable(),
  acceptTerms: z.boolean().refine((value) => value === true, {
    message: 'Please accept the terms of service to continue.',
  }),
});

export async function POST(request) {
  const blocked = originGuard(request);
  if (blocked) return blocked;

  const limit = rateLimit(`register:${clientIp(request)}`, {
    limit: 6,
    windowMs: 60 * 60_000,
  });
  if (!limit.ok) return rateLimitResponse(limit.retryAfter);

  const body = await readJson(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return validationFail(parsed.error);

  const { name, email, password, acceptTerms } = parsed.data;
  if (!acceptTerms) {
    return fail('Please accept the terms of service to continue.', 422);
  }

  let phone = null;
  if (parsed.data.phone) {
    phone = normalizePhone(parsed.data.phone);
    if (!phone) return fail('Enter a valid Kenyan phone number.', 422);
  }

  const existing = await one(
    `SELECT id FROM users WHERE email = $1 OR ($2::text IS NOT NULL AND phone = $2)`,
    [email, phone],
  );
  if (existing) {
    return fail(
      'An account already uses that email or phone number. Try signing in.',
      409,
    );
  }

  const store = await cookies();
  const referralCode = store.get('martify_ref')?.value || null;
  let referredBy = null;
  if (referralCode) {
    const affiliate = await one(
      `SELECT code FROM affiliates WHERE code = $1`,
      [referralCode],
    );
    if (affiliate) referredBy = affiliate.code;
  }

  const id = newId();
  const passwordHash = await hashPassword(password);

  try {
    await query(
      `INSERT INTO users
        (id, name, email, phone, password_hash, role, locale, referral_code, referred_by)
       VALUES ($1, $2, $3, $4, $5, 'customer', 'en', $6, $7)`,
      [
        id,
        name,
        email,
        phone,
        passwordHash,
        newAffiliateCode(name),
        referredBy,
      ],
    );
  } catch (error) {
    if (error?.code === '23505') {
      return fail('An account already uses that email or phone number.', 409);
    }
    throw error;
  }

  if (referredBy) {
    await query(
      `UPDATE affiliates SET signups = signups + 1 WHERE code = $1`,
      [referredBy],
    );
  }

  await startSession({
    id,
    name,
    email,
    role: 'customer',
  });

  return ok(
    {
      redirect: '/account',
      user: { name, email, role: 'customer' },
    },
    { status: 201 },
  );
}
