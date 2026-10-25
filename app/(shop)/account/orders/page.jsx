import Link from 'next/link';
import { PackageSearch, Radar } from 'lucide-react';
import AccountOrderCard from '@/components/account/AccountOrderCard';
import PageIntro from '@/components/shop/PageIntro';
import { getCurrentUser } from '@/lib/auth';
import { listOrdersForUser } from '@/lib/orders';

export const metadata = {
  title: 'My orders',
  robots: { index: false, follow: false },
};

const FILTERS = [
  { key: 'all', label: 'All orders' },
  { key: 'progress', label: 'In progress' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default async function AccountOrdersPage({ searchParams }) {
  const params = await searchParams;
  const active = FILTERS.some((item) => item.key === params?.status)
    ? params.status
    : 'all';
  const user = await getCurrentUser();
  const orders = await listOrdersForUser(user.id);

  const counts = {
    all: orders.length,
    progress: orders.filter(
      (order) => !['delivered', 'cancelled'].includes(order.status),
    ).length,
    delivered: orders.filter((order) => order.status === 'delivered').length,
    cancelled: orders.filter((order) => order.status === 'cancelled').length,
  };

  const filtered = orders.filter((order) => {
    if (active === 'progress') {
      return !['delivered', 'cancelled'].includes(order.status);
    }
    if (active === 'delivered') return order.status === 'delivered';
    if (active === 'cancelled') return order.status === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-4">
      <PageIntro
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Account', href: '/account' },
          { label: 'Orders' },
        ]}
        eyebrow="Order history"
        title="Every parcel, accounted for."
        description="Follow a delivery, complete a pending demo payment, or revisit something you loved. Orders are kept here for your records."
        aside={
          <Link href="/track" className="btn btn-outline w-full bg-white/60 sm:w-auto">
            <Radar className="h-4 w-4" />
            Track by order number
          </Link>
        }
      />

      <div
        role="tablist"
        aria-label="Filter orders"
        className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1"
      >
        {FILTERS.map((filter) => {
          const current = active === filter.key;
          return (
            <Link
              key={filter.key}
              href={filter.key === 'all' ? '/account/orders' : `/account/orders?status=${filter.key}`}
              role="tab"
              aria-selected={current}
              scroll={false}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10.5px] font-semibold transition ${
                current
                  ? 'border-night bg-night text-white'
                  : 'border-line bg-white/70 text-ink-soft hover:border-ink/25'
              }`}
            >
              {filter.label}
              <span
                className={`text-[9px] ${current ? 'text-white/55' : 'text-muted'}`}
              >
                {counts[filter.key]}
              </span>
            </Link>
          );
        })}
      </div>

      {filtered.length ? (
        <div className="space-y-2.5">
          {filtered.map((order) => (
            <AccountOrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.3rem] border border-dashed border-line bg-white/50 px-6 py-14 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sand text-ink/40">
            <PackageSearch className="h-5 w-5" strokeWidth={1.6} />
          </span>
          <h2 className="mt-4 font-display text-[18px] font-bold tracking-[-0.03em]">
            {active === 'all' ? 'No orders yet' : 'Nothing in this view'}
          </h2>
          <p className="mx-auto mt-1.5 max-w-sm text-[11.5px] leading-relaxed text-muted">
            {active === 'all'
              ? 'Your first Martify order will appear here — with live progress from checkout to your door.'
              : 'Try another filter, or head back to the marketplace for something new.'}
          </p>
          <Link href={active === 'all' ? '/deals' : '/account/orders'} className="btn btn-primary btn-sm mt-5">
            {active === 'all' ? 'Explore deals' : 'View all orders'}
          </Link>
        </div>
      )}
    </div>
  );
}
