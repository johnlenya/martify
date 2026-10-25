import 'server-only';
import { NextResponse } from 'next/server';

const store = (globalThis.__martifyRateBuckets ??= new Map());

export function rateLimit(key, { limit = 10, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return {
    ok: true,
    remaining: limit - bucket.count,
    retryAfter: 0,
  };
}

export function clientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'local';
}

export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    const host = request.headers.get('host');
    if (!host) return false;
    return originHost === host;
  } catch {
    return false;
  }
}

export function originGuard(request) {
  if (sameOrigin(request)) return null;
  return NextResponse.json(
    { error: 'This request was blocked for security reasons.' },
    { status: 403 },
  );
}

export function rateLimitResponse(retryAfter) {
  return NextResponse.json(
    { error: 'Too many attempts. Please try again shortly.' },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfter || 60) },
    },
  );
}
