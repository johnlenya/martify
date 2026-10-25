import { NextResponse } from 'next/server';
import { searchSuggestions } from '@/lib/catalog';
import { clientIp, rateLimit } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = String(searchParams.get('q') || '').slice(0, 80);

  const limit = rateLimit(`suggest:${clientIp(request)}`, {
    limit: 120,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { products: [], categories: [] },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const data = await searchSuggestions(q);
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
