import { fail, ok, readJson } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { one, query } from '@/lib/db';
import { originGuard, rateLimit, clientIp, rateLimitResponse } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail('Sign in to view your wishlist.', 401);
  const rows = await query(
    `SELECT product_id FROM wishlist_items WHERE user_id = $1 ORDER BY created_at DESC`,
    [user.id],
  );
  return ok({ ids: rows.map((row) => row.product_id) });
}

export async function POST(request) {
  const blocked = originGuard(request);
  if (blocked) return blocked;

  const limit = rateLimit(`wishlist:${clientIp(request)}`, {
    limit: 90,
    windowMs: 60_000,
  });
  if (!limit.ok) return rateLimitResponse(limit.retryAfter);

  const user = await getCurrentUser();
  if (!user) return fail('Sign in to save items to your wishlist.', 401);

  const body = await readJson(request);
  const productId = String(body?.productId || '').trim();
  if (!productId) return fail('Choose a product to save.');

  const product = await one(
    `SELECT id FROM products WHERE id = $1 AND status = 'active'`,
    [productId],
  );
  if (!product) return fail('That product is no longer available.', 404);

  await query(
    `INSERT INTO wishlist_items (user_id, product_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, product_id) DO NOTHING`,
    [user.id, productId],
  );

  return ok({ saved: true });
}

export async function DELETE(request) {
  const blocked = originGuard(request);
  if (blocked) return blocked;

  const user = await getCurrentUser();
  if (!user) return fail('Sign in to update your wishlist.', 401);

  const body = await readJson(request);
  const productId = String(body?.productId || '').trim();
  if (!productId) return fail('Choose a product to remove.');

  await query(
    `DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2`,
    [user.id, productId],
  );

  return ok({ saved: false });
}
