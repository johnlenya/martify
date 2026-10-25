import { NextResponse } from 'next/server';
import { listProducts } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const idsParam = new URL(request.url).searchParams.get('ids') || '';
  const ids = idsParam
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 60);

  if (!ids.length) return NextResponse.json({ products: [] });

  const data = await listProducts({ ids, perPage: 60 });
  const byId = new Map(data.products.map((product) => [product.id, product]));
  const products = ids.map((id) => byId.get(id)).filter(Boolean);

  return NextResponse.json(
    { products },
    { headers: { 'Cache-Control': 'private, max-age=30' } },
  );
}
