import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { safeNextPath } from '@/lib/auth';
import { newToken } from '@/lib/ids';

export const dynamic = 'force-dynamic';

const STATE_COOKIE = 'martify_oauth_state';
const NEXT_COOKIE = 'martify_oauth_next';

export async function GET(request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/login?error=google-not-configured', request.url),
    );
  }

  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get('next'), '/account');
  const state = newToken(24);
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    new URL('/api/auth/google/callback', request.url).toString();

  const store = await cookies();
  const options = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 600,
  };
  store.set(STATE_COOKIE, state, options);
  store.set(NEXT_COOKIE, next, options);

  const authorizeUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('scope', 'openid email profile');
  authorizeUrl.searchParams.set('state', state);
  authorizeUrl.searchParams.set('prompt', 'select_account');
  authorizeUrl.searchParams.set('access_type', 'online');

  return NextResponse.redirect(authorizeUrl);
}
