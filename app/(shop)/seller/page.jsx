import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Megaphone,
  PackageCheck,
  Store,
  Wallet,
} from 'lucide-react';
import PageIntro from '@/components/shop/PageIntro';
import { requireSeller } from '@/lib/auth';
import { one } from '@/lib/db';
import { formatMoney } from '@/lib/money';

export const metadata = {
  title: 'Seller workspace',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const NEXT_STEPS = [
  {
    icon: Boxes,
    title: 'Catalogue management',
    body: 'Add products, upload images, set variants, stock and prices without leaving the workspace.',
  },
  {
    icon: PackageCheck,
    title: 'Order fulfilment',
    body: 'Accept new orders, print packing slips and move each parcel through delivery.',
  },
  {
    icon: Wallet,
    title: 'Payouts and ledger',
    body: 'See what is available, what is pending and request a withdrawal to M-Pesa or bank.',
  },
  {
    icon: Megaphone,
    title: 'Sponsored placement',
    body: 'Promote a product in search and category pages with a clear daily budget.',
  },
];

export default async function SellerWorkspacePage() {
  const user = await requireSeller();
  if (!user.seller) redirect(user.role === 'admin' ? '/admin' : '/sell');

  const counts = await one(
    `SELECT
       (SELECT count(*)::int FROM products
         WHERE seller_id = $1 AND status = 'active') AS active_products,
       (SELECT count(DISTINCT order_id)::int FROM order_items
         WHERE seller_id = $1) AS orders`,
    [user.seller.id],
  );

  const stats = [
    {
      label: 'Active products',
      value: counts?.active_products ?? 0,
      hint: 'Live in the marketplace',
      icon: Store,
    },
    {
      label: 'Orders received',
      value: counts?.orders ?? 0,
      hint: 'Across all time',
      icon: PackageCheck,
    },
    {
      label: 'Seller balance',
      value: formatMoney(user.seller.balanceCents),
      hint: 'Derived from the demo ledger',
      icon: Wallet,
    },
    {
      label: 'Current plan',
      value: user.seller.tier.charAt(0).toUpperCase() + user.seller.tier.slice(1),
      hint: 'Commission discount applied',
      icon: BarChart3,
    },
  ];

  return (
    <div className="container-page py-5 sm:py-7">
      <div className="space-y-4">
        <PageIntro
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Seller workspace' }]}
          eyebrow="Seller workspace"
          title={`Karibu, ${user.name.split(' ')[0]}.`}
          description={`${user.seller.storeName} is connected. The full seller workspace is the next build — your catalogue, orders and payout ledger are already seeded and ready for it.`}
          aside={
            <Link href="/" className="btn btn-dark w-full sm:w-auto">
              Browse the marketplace
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-[1.15rem] border border-line/80 bg-[#fffdfa] p-3.5 sm:p-4"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-sand text-ink-soft">
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <p className="stat-value mt-3 text-[1.35rem] text-ink">{stat.value}</p>
                <p className="mt-0.5 text-[10px] font-semibold text-ink-soft">{stat.label}</p>
                <p className="mt-1 text-[9px] text-muted">{stat.hint}</p>
              </div>
            );
          })}
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0 rounded-[1.3rem] border border-line/80 bg-[#fffdfa] p-5 sm:p-6">
            <p className="eyebrow">In the next build</p>
            <h2 className="mt-1.5 font-display text-[22px] font-bold tracking-[-0.04em]">
              The tools behind your storefront.
            </h2>
            <p className="mt-1.5 max-w-xl text-[11px] leading-relaxed text-muted">
              The customer marketplace is live now. These seller tools are being
              connected to the same orders, products and ledger data you can see above.
            </p>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {NEXT_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="rounded-2xl border border-line/70 bg-white/60 p-4">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-soft text-brand-dark">
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </span>
                    <p className="mt-2.5 text-[11.5px] font-bold text-ink">{step.title}</p>
                    <p className="mt-1 text-[9.5px] leading-relaxed text-muted">{step.body}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/sell" className="btn btn-primary btn-sm">
                Seller plans and fees
              </Link>
              <Link href="/contact" className="btn btn-outline btn-sm">
                Talk to the seller team
              </Link>
            </div>
          </section>

          <aside className="min-w-0 space-y-3">
            <section className="rounded-[1.3rem] border border-night/10 bg-night p-5 text-white">
              <p className="eyebrow text-[#ffb494]">Your store</p>
              <h2 className="mt-2 font-display text-[18px] font-bold tracking-[-0.03em]">
                {user.seller.storeName}
              </h2>
              <p className="mt-1 text-[10px] text-white/50">@{user.seller.slug}</p>
              <dl className="mt-4 space-y-2 border-t border-white/10 pt-3 text-[10px]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-white/45">Account status</dt>
                  <dd className="font-semibold capitalize">{user.seller.status}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-white/45">Verified</dt>
                  <dd className="font-semibold">{user.seller.verified ? 'Yes' : 'Pending'}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-white/45">Subscription</dt>
                  <dd className="font-semibold capitalize">{user.seller.tier}</dd>
                </div>
              </dl>
              <Link
                href={`/stores/${user.seller.slug}`}
                className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold text-white"
              >
                View your public storefront
                <ArrowRight className="h-3 w-3" />
              </Link>
            </section>

            <section className="rounded-[1.3rem] border border-line/80 bg-[#fffdfa] p-4">
              <p className="text-[11px] font-bold text-ink">Need a hand?</p>
              <p className="mt-1 text-[9.5px] leading-relaxed text-muted">
                Seller support is available Monday to Saturday, 8am–6pm EAT.
              </p>
              <Link
                href="/contact"
                className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-semibold text-brand-dark"
              >
                Contact seller support
                <ArrowRight className="h-3 w-3" />
              </Link>
            </section>

            <p className="rounded-xl bg-sand/60 px-3 py-2.5 text-[9px] leading-relaxed text-muted">
              Demo workspace. Products, orders and balances are simulated and no real
              customer funds are held.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
