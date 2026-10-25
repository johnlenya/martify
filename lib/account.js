import 'server-only';
import { one, query } from './db/index.js';

export async function getAccountStats(userId) {
  const stats = await one(
    `SELECT
       (SELECT count(*) FROM orders WHERE user_id = $1)::int AS orders,
       (SELECT count(*) FROM orders
        WHERE user_id = $1 AND status NOT IN ('delivered', 'cancelled'))::int AS active_orders,
       (SELECT coalesce(sum(total_cents), 0) FROM orders
        WHERE user_id = $1 AND payment_status = 'paid')::int AS spent_cents,
       (SELECT count(*) FROM wishlist_items WHERE user_id = $1)::int AS wishlist,
       (SELECT count(*) FROM addresses WHERE user_id = $1)::int AS addresses,
       (SELECT count(*) FROM returns WHERE user_id = $1)::int AS returns,
       (SELECT count(*) FROM notifications
        WHERE user_id = $1 AND read = false)::int AS unread_notifications`,
    [userId],
  );

  return stats;
}

export async function listAddresses(userId) {
  return query(
    `SELECT *
     FROM addresses
     WHERE user_id = $1
     ORDER BY is_default DESC, created_at ASC`,
    [userId],
  );
}

export async function listNotifications(userId, { limit = 100 } = {}) {
  return query(
    `SELECT *
     FROM notifications
     WHERE user_id = $1
     ORDER BY read ASC, created_at DESC
     LIMIT $2`,
    [userId, limit],
  );
}

export async function unreadNotificationCount(userId) {
  const row = await one(
    `SELECT count(*)::int AS count
     FROM notifications
     WHERE user_id = $1 AND read = false`,
    [userId],
  );
  return Number(row?.count || 0);
}

export async function listUserReturns(userId) {
  return query(
    `SELECT r.*, o.order_number, o.status AS order_status,
            oi.title, oi.image_url, oi.quantity, oi.line_total_cents,
            s.store_name, p.slug AS product_slug
     FROM returns r
     JOIN orders o ON o.id = r.order_id
     JOIN order_items oi ON oi.id = r.order_item_id
     JOIN sellers s ON s.id = oi.seller_id
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC`,
    [userId],
  );
}

export async function listReturnableItems(userId) {
  return query(
    `SELECT oi.id, oi.title, oi.image_url, oi.quantity, oi.unit_price_cents,
            oi.line_total_cents, oi.order_id, o.order_number, o.created_at,
            s.store_name, p.slug AS product_slug
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     JOIN sellers s ON s.id = oi.seller_id
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE o.user_id = $1
       AND o.status = 'delivered'
       AND o.payment_status = 'paid'
       AND NOT EXISTS (
         SELECT 1 FROM returns r
         WHERE r.order_item_id = oi.id AND r.status <> 'rejected'
       )
     ORDER BY o.created_at DESC
     LIMIT 30`,
    [userId],
  );
}

export async function getAffiliateForUser(userId) {
  return one(`SELECT * FROM affiliates WHERE user_id = $1`, [userId]);
}

export async function getReferredCount(userId) {
  const row = await one(
    `SELECT count(*)::int AS count
     FROM users u
     JOIN affiliates a ON a.code = u.referred_by
     WHERE a.user_id = $1`,
    [userId],
  );
  return Number(row?.count || 0);
}
