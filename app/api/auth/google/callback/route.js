import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { safeNextPath, startSession } from '@/lib/auth';
import { one, query } from '@/lib/db';
import { newAffiliateCode, newId } from '@/lib/ids';

export const dynamic = 'force-dynamic';

const STATE_COOKIE = 'martify_oauth_state';
const NEXT_COOKIE = 'martify_oauth_next';

function failure(request) {
  return NextResponse.redirect(
    new URL('/login?error=google-signin', request.url),
  );
}

export async function GET(request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return failure(request);

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state) return failure(request);

  const store = await cookies();
  const expectedState = store.get(STATE_COOKIE)?.value;
  const next = safeNextPath(store.get(NEXT_COOKIE)?.value, '/account');

  store.delete(STATE_COOKIE);
  store.delete(NEXT_COOKIE);

  if (!expectedState || expectedState !== state) return failure(request);

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    new URL('/api/auth/google/callback', request.url).toString();

  let profile;
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
      cache: 'no-store',
    });
    if (!tokenResponse.ok) return failure(request);
    const tokens = await tokenResponse.json();

    const profileResponse = await fetch(
      'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
        cache: 'no-store',
      },
    );
    if (!profileResponse.ok) return failure(request);
    profile = await profileResponse.json();
  } catch {
    return failure(request);
  }

  const email = String(profile.email || '').toLowerCase();
  if (!email || profile.email_verified !== true) return failure(request);

  let user = await one(
    `SELECT id, name, email, role, status FROM users WHERE email = $1`,
    [email],
  );

  if (user && user.status !== 'active') return failure(request);

  if (!user) {
    const id = newId();
    const name = String(profile.name || profile.given_name || 'Martify shopper');
    const referralCode = store.get('martify_ref')?.value || null;
    let referredBy = null;
    if (referralCode) {
      const affiliate = await one(
        `SELECT code FROM affiliates WHERE code = $1`,
        [referralCode],
      );
      if (affiliate) referredBy = affiliate.code;
    }

    await query(
      `INSERT INTO users
        (id, name, email, password_hash, role, locale, avatar_url,
         referral_code, referred_by, provider)
       VALUES ($1, $2, $3, NULL, 'customer', 'en', $4, $5, $6, 'google')`,
      [
        id,
        name,
        email,
        profile.picture || null,
        newAffiliateCode(name),
        referredBy,
      ],
    );
    if (referredBy) {
      await query(
        `UPDATE affiliates SET signups = signups + 1 WHERE code = $1`,
        [referredBy],
      );
    }
    user = { id, name, email, role: 'customer', status: 'active' };
  }

  await startSession(user);
  return NextResponse.redirect(new URL(next, request.url));
}
