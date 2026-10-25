import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { one } from './db/index.js';

export const SESSION_COOKIE = 'martify_session';
const SESSION_DAYS = 7;

function secretKey() {
  const configured = process.env.AUTH_SECRET;
  if (!configured || configured.length < 24) {
    if (process.env.NODE_ENV !== 'production') {
      return new TextEncoder().encode(
        'martify-local-only-development-secret-do-not-use',
      );
    }
    throw new Error(
      'AUTH_SECRET must be set to a random string of at least 32 characters.',
    );
  }
  return new TextEncoder().encode(configured);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}

export async function createSessionToken(user) {
  return new SignJWT({
    role: user.role,
    name: user.name,
    email: user.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
}

export async function startSession(user) {
  const token = await createSessionToken(user);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions());
  return token;
}

export async function endSession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, '', {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
}

export const getCurrentUser = cache(async () => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  let payload;
  try {
    ({ payload } = await jwtVerify(token, secretKey()));
  } catch {
    return null;
  }

  if (!payload?.sub) return null;

  const row = await one(
    `SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.avatar_url,
            u.locale, u.referral_code, u.created_at,
            s.id AS seller_id, s.slug AS seller_slug, s.store_name,
            s.status AS seller_status, s.subscription_tier, s.verified AS seller_verified,
            s.featured AS seller_featured, s.balance_cents
     FROM users u
     LEFT JOIN sellers s ON s.user_id = u.id
     WHERE u.id = $1`,
    [payload.sub],
  );

  if (!row || row.status !== 'active') return null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    avatarUrl: row.avatar_url,
    locale: row.locale,
    referralCode: row.referral_code,
    createdAt: row.created_at,
    seller: row.seller_id
      ? {
          id: row.seller_id,
          slug: row.seller_slug,
          storeName: row.store_name,
          status: row.seller_status,
          tier: row.subscription_tier,
          verified: row.seller_verified,
          featured: row.seller_featured,
          balanceCents: Number(row.balance_cents || 0),
        }
      : null,
  };
});

export function hasRole(user, ...roles) {
  return Boolean(user && roles.includes(user.role));
}

export function safeNextPath(value, fallback = null) {
  if (
    typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('\\')
  ) {
    return value;
  }
  return fallback;
}

export function homePathFor(user) {
  if (!user) return '/';
  if (user.role === 'admin') return '/admin';
  if (user.role === 'seller') return user.seller ? '/seller' : '/sell/apply';
  return '/account';
}

export async function requireUser(nextPath = '/account') {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/admin');
  if (user.role !== 'admin') redirect('/');
  return user;
}

export async function requireSeller() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/seller');
  if (user.role !== 'seller' && user.role !== 'admin') redirect('/');
  if (!user.seller && user.role === 'seller') redirect('/sell/apply');
  return user;
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 11);
}

export async function verifyPassword(password, hash) {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}
