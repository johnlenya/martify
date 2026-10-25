import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  ChartNoAxesCombined,
  CircleDollarSign,
  Flag,
  LayoutGrid,
  ShieldCheck,
  Users,
} from 'lucide-react';
import PageIntro from '@/components/shop/PageIntro';
import { requireAdmin } from '@/lib/auth';
import { one } from '@/lib/db';
import { formatMoney } from '@/lib/money';

export const metadata = {
  title: 'Admin console',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const NEXT_STEPS = [
  {
    icon: BadgeCheck,
    title: 'Seller and product approvals',
    body: 'Review business details, approve storefronts and publish or reject new products.',
  },
  {
    icon: LayoutGrid,
    title: 'Merchandising controls',
    body: 'Manage categories, commissions, banners, flash sales and coupon campaigns.',
  },
  {
    icon: CircleDollarSign,
    title: 'Revenue and payouts',
    body: 'Track GMV, commissions, ad revenue and seller payout requests in one view.',
  },
  {
    icon: Flag,
    title: 'Disputes and returns',
    body: 'Resolve return decisions, refunds and buyer protection cases with a full audit trail.',
  },
];

export default async function AdminWorkspacePage() {
  await requireAdmin();
  const stats = await one(
    `SELECT
       (SELECT count(*)::int FROM sellers WHERE status = 'approved') AS approved_sellers,
       (SELECT count(*)::int FROM sellers WHERE status = 'pending') AS pending_sellers,
       (SELECT count(*)::int FROM products WHERE status = 'active') AS active_products,
       (SELECT count(*)::int FROM orders) AS orders,
       (SELECT coalesce(sum(total_cents), 0) FROM orders
         WHERE payment_status = 'paid') AS gmv_cents,
       (SELECT coalesce(sum(commission_cents), 0) FROM orders
         WHERE payment_status = 'paid') AS commission_cents`,
  );

  const cards = [
    {
      label: 'Approved sellers',
      value: stats?.approved_sellers ?? 0,
      hint: `${stats?.pending_sellers ?? 0} awaiting review`,
      icon: Users,
    },
    {
      label: 'Active products',
      value: stats?.active_products ?? 0,
      hint: 'Across all categories',
      icon: Boxes,
    },
    {
      label: 'Demo GMV',
      value: formatMoney(stats?.gmv_cents),
      hint: 'Paid orders only',
      icon: ChartNoAxesCombined,
    },
    {
      label: 'Commission',
      value: formatMoney(stats?.commission_cents),
      hint: 'Recorded on paid orders',
      icon: CircleDollarSign,
    },
  ];

  return (
    <div className="container-page py-5 sm:py-7">
      <div className="space-y-4">
        <PageIntro
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Admin console' }]}
          eyebrow="Marketplace operations"
          title="The whole marketplace, one desk."
          description="The customer marketplace is live. The full admin console is the next build — the seeded sellers, catalogue and orders below are the data it will run on."
          aside={
            <Link href="/" className="btn btn-dark w-full sm:w-auto">
              View the storefront
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-[1.15rem] border border-line/80 bg-[#fffdfa] p-3.5 sm:p-4"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-sand text-ink-soft">
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <p className="stat-value mt-3 text-[1.35rem] text-ink">{card.value}</p>
                <p className="mt-0.5 text-[10px] font-semibold text-ink-soft">{card.label}</p>
                <p className="mt-1 text-[9px] text-muted">{card.hint}</p>
              </div>
            );
          })}
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0 rounded-[1.3rem] border border-line/80 bg-[#fffdfa] p-5 sm:p-6">
            <p className="eyebrow">In the next build</p>
            <h2 className="mt-1.5 font-display text-[22px] font-bold tracking-[-0.04em]">
              Operational controls, end to end.
            </h2>
            <p className="mt-1.5 max-w-xl text-[11px] leading-relaxed text-muted">
              Approvals, merchandising, money movement and disputes will all be handled
              from this console. Every change will be reflected in the demo ledger.
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
              <Link href="/account" className="btn btn-outline btn-sm">
                Your customer account
              </Link>
            </div>
          </section>

          <aside className="min-w-0 space-y-3">
            <section className="rounded-[1.3rem] border border-night/10 bg-night p-5 text-white">
              <ShieldCheck className="h-5 w-5 text-[#ffb494]" strokeWidth={1.7} />
              <p className="eyebrow mt-3 text-[#ffb494]">Demo operations</p>
              <h2 className="mt-2 font-display text-[18px] font-bold tracking-[-0.03em]">
                Simulated, by design.
              </h2>
              <p className="mt-1.5 text-[10px] leading-relaxed text-white/55">
                Revenue, commissions and payouts shown here are recorded in the demo
                ledger. No real customer funds are held or moved.
              </p>
              <dl className="mt-4 space-y-2 border-t border-white/10 pt-3 text-[10px]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-white/45">Orders recorded</dt>
                  <dd className="font-semibold">{stats?.orders ?? 0}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-white/45">Pending sellers</dt>
                  <dd className="font-semibold">{stats?.pending_sellers ?? 0}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-[1.3rem] border border-line/80 bg-[#fffdfa] p-4">
              <p className="text-[11px] font-bold text-ink">Platform support</p>
              <p className="mt-1 text-[9.5px] leading-relaxed text-muted">
                For account or demo environment issues, contact the Martify team.
              </p>
              <Link
                href="/contact"
                className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-semibold text-brand-dark"
              >
                Contact support
                <ArrowRight className="h-3 w-3" />
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
