import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  ChevronRight,
  Compass,
  Heart,
  MapPin,
  Package,
  Share2,
  Sparkles,
  Wallet,
} from 'lucide-react';
import AccountOrderCard from '@/components/account/AccountOrderCard';
import PageIntro from '@/components/shop/PageIntro';
import { getCurrentUser } from '@/lib/auth';
import {
  getAccountStats,
  getAffiliateForUser,
  listNotifications,
} from '@/lib/account';
import { listOrdersForUser } from '@/lib/orders';
import { formatMoney } from '@/lib/money';
import { timeAgo } from '@/lib/format';

export const metadata = {
  title: 'Your account',
  robots: { index: false, follow: false },
};

function Stat({ icon: Icon, label, value, hint, href }) {
  const content = (
    <>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-sand text-ink-soft">
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <div className="mt-3">
        <p className="stat-value text-[1.4rem] text-ink">{value}</p>
        <p className="mt-0.5 text-[10px] font-semibold text-ink-soft">{label}</p>
        {hint ? <p className="mt-1 text-[9px] text-muted">{hint}</p> : null}
      </div>
    </>
  );
  return href ? (
    <Link
      href={href}
      className="rounded-[1.15rem] border border-line/80 bg-[#fffdfa] p-3.5 transition hover:-translate-y-0.5 hover:border-ink/20 sm:p-4"
    >
      {content}
    </Link>
  ) : (
    <div className="rounded-[1.15rem] border border-line/80 bg-[#fffdfa] p-3.5 sm:p-4">
      {content}
    </div>
  );
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  const [stats, orders, notifications, affiliate] = await Promise.all([
    getAccountStats(user.id),
    listOrdersForUser(user.id),
    listNotifications(user.id, { limit: 3 }),
    getAffiliateForUser(user.id),
  ]);
  const recentOrders = orders.slice(0, 3);
  const firstName = user.name.split(' ')[0];

  return (
    <div className="space-y-4">
      <PageIntro
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Account' }]}
        eyebrow="Your account"
        title={`Karibu, ${firstName}.`}
        description="Orders, saved addresses and little updates from across Martify — all in one calm place."
        aside={
          <Link href="/deals" className="btn btn-dark w-full sm:w-auto">
            <Compass className="h-4 w-4" />
            Continue shopping
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <Stat
          icon={Package}
          label="Orders"
          value={stats.orders}
          hint={`${stats.active_orders} in progress`}
          href="/account/orders"
        />
        <Stat
          icon={Wallet}
          label="Paid to date"
          value={formatMoney(stats.spent_cents)}
          hint="Simulated demo payments"
        />
        <Stat
          icon={Heart}
          label="Wishlist"
          value={stats.wishlist}
          hint="Saved finds"
          href="/wishlist"
        />
        <Stat
          icon={MapPin}
          label="Addresses"
          value={stats.addresses}
          hint="Delivery spots"
          href="/account/addresses"
        />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0">
          <div className="mb-2.5 flex items-end justify-between gap-3 px-0.5">
            <div>
              <p className="eyebrow">The latest</p>
              <h2 className="mt-1 font-display text-[18px] font-bold tracking-[-0.035em]">
                Recent orders
              </h2>
            </div>
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-ink-soft transition hover:text-brand-dark"
            >
              See all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentOrders.length ? (
            <div className="space-y-2.5">
              {recentOrders.map((order) => (
                <AccountOrderCard key={order.id} order={order} compact />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.2rem] border border-dashed border-line bg-white/45 px-5 py-10 text-center">
              <Package className="mx-auto h-6 w-6 text-muted" strokeWidth={1.5} />
              <p className="mt-3 text-[13px] font-semibold">No orders yet</p>
              <p className="mx-auto mt-1 max-w-xs text-[11px] leading-relaxed text-muted">
                When you place your first order, its journey will show up here.
              </p>
              <Link href="/deals" className="btn btn-primary btn-sm mt-4">
                Browse today&apos;s deals
              </Link>
            </div>
          )}
        </section>

        <aside className="min-w-0 space-y-3">
          <section className="rounded-[1.2rem] border border-line/80 bg-[#fffdfa] p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-ink-soft" strokeWidth={1.8} />
                <h2 className="text-[12.5px] font-bold">Notifications</h2>
              </div>
              {stats.unread_notifications ? (
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[8.5px] font-bold text-brand-dark">
                  {stats.unread_notifications} new
                </span>
              ) : null}
            </div>
            {notifications.length ? (
              <ul className="mt-2 divide-y divide-ink/[0.06]">
                {notifications.map((note) => (
                  <li key={note.id} className="py-2.5 first:pt-1 last:pb-1">
                    <Link href={note.href || '/account/notifications'} className="group block">
                      <div className="flex items-start gap-2">
                        {!note.read ? (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                        ) : null}
                        <div className="min-w-0">
                          <p className={`text-[11px] leading-snug ${note.read ? 'font-medium text-ink-soft' : 'font-bold text-ink'}`}>
                            {note.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-[9.5px] leading-relaxed text-muted">
                            {note.body}
                          </p>
                          <p className="mt-1 text-[8.5px] uppercase tracking-[0.06em] text-muted/70">
                            {timeAgo(note.created_at)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[10.5px] leading-relaxed text-muted">
                Nothing new right now. Order updates will land here.
              </p>
            )}
            <Link
              href="/account/notifications"
              className="mt-3 flex items-center justify-between border-t border-ink/[0.06] pt-3 text-[10px] font-semibold text-ink-soft transition hover:text-brand-dark"
            >
              Open notifications
              <ChevronRight className="h-3 w-3" />
            </Link>
          </section>

          <section className="relative overflow-hidden rounded-[1.2rem] border border-night/10 bg-night p-4 text-white">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-brand/30 blur-2xl"
            />
            <div className="relative">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-[#ffb494]" strokeWidth={1.8} />
                <p className="eyebrow text-[#ffb494]">Earn with Martify</p>
              </div>
              <h2 className="mt-2 font-display text-[16px] font-bold tracking-[-0.03em]">
                {affiliate ? 'Your referral link is live.' : 'Share Martify, earn 2%.'}
              </h2>
              <p className="mt-1.5 text-[10px] leading-relaxed text-white/55">
                {affiliate
                  ? `${formatMoney(affiliate.earnings_cents)} earned from ${affiliate.signups} referred ${affiliate.signups === 1 ? 'signup' : 'signups'}.`
                  : 'Invite friends to shop and earn a slice of every completed order.'}
              </p>
              <Link
                href="/account/affiliate"
                className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-white"
              >
                {affiliate ? 'View affiliate dashboard' : 'Become an affiliate'}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </section>

          <section className="rounded-[1.2rem] border border-line/80 bg-[#fffdfa] p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-dark" strokeWidth={1.8} />
              <h2 className="text-[12.5px] font-bold">Quick links</h2>
            </div>
            <div className="mt-2.5 grid gap-1">
              {[
                { href: '/track', label: 'Track an order' },
                { href: '/account/returns', label: 'Start a return' },
                { href: '/account/addresses', label: 'Manage addresses' },
                { href: '/help', label: 'Get help' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-lg px-2 py-2 text-[10.5px] font-medium text-ink-soft transition hover:bg-sand/60 hover:text-ink"
                >
                  {item.label}
                  <ChevronRight className="h-3 w-3 text-muted" />
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
