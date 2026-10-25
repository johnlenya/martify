import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Boxes,
  Check,
  ChevronRight,
  CircleHelp,
  HandCoins,
  Megaphone,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Store,
  Wallet,
} from 'lucide-react';
import { query } from '@/lib/db';import { SUBSCRIPTION_PLANS } from '@/lib/commerce';
import { formatMoney } from '@/lib/money';

export const metadata = {
  title: 'Start selling',
  description:
    'Reach customers across Kenya with a Martify storefront, clear commissions and M-Pesa or bank payouts.',
};

function bpsLabel(bps) {
  return `${(Number(bps) / 100).toLocaleString('en-KE', {
    maximumFractionDigits: 2,
  })}%`;
}

export default async function SellPage() {
  const categories = await query(
    `SELECT name, commission_bps
     FROM categories
     WHERE active = true AND parent_id IS NULL
     ORDER BY sort ASC, name ASC
     LIMIT 8`,
  );

  return (
    <div className="container-page py-5 sm:py-7">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-night px-5 py-8 text-white sm:px-8 sm:py-11">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-brand/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-36 left-1/3 h-72 w-72 rounded-full bg-leaf/20 blur-3xl"
        />
        <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_400px]">
          <div>
            <p className="eyebrow text-[#ffb494]">Sell on Martify</p>
            <h1 className="mt-3 max-w-xl font-display text-[2.2rem] font-extrabold leading-[1.02] tracking-[-0.06em] sm:text-[3.2rem]">
              Your shop.
              <br />
              A much bigger doorstep.
            </h1>
            <p className="mt-4 max-w-lg text-[12px] leading-relaxed text-white/55 sm:text-[13px]">
              Bring your products to customers across Kenya without building your
              own storefront or payment stack. Keep your brand, control your stock
              and see exactly what every sale earns.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link href="/contact" className="btn btn-primary">
                Talk to the seller team
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#plans"
                className="btn btn-outline border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10"
              >
                Compare plans
              </Link>
            </div>
            <p className="mt-3 text-[9px] leading-relaxed text-white/30">
              Seller onboarding and payments are demonstrations in this build.
            </p>
          </div>

          <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[0.12em] text-white/35">Example seller payout</p>
                <p className="mt-1 font-display text-[22px] font-bold tracking-[-0.04em]">
                  KSh 24,500
                </p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#3aa86b]/20 text-[#8fd3a3]">
                <Wallet className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-[10px]">
              {[
                ['Order subtotal', 'KSh 28,000'],
                ['Platform commission (12.5%)', '− KSh 3,500'],
                ['Delivery collected separately', 'KSh 200'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3">
                  <span className="text-white/40">{label}</span>
                  <span className="font-semibold text-white/80">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-white/[0.06] px-3 py-2.5">
              <span className="text-[10px] text-white/50">Seller balance</span>
              <span className="price text-[12px] font-bold text-[#8fd3a3]">KSh 24,500</span>
            </div>
            <p className="mt-2.5 text-[8.5px] leading-relaxed text-white/30">
              Illustration only. Real payments, fees and payouts depend on the
              seller agreement and licensed providers.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Boxes,
            title: 'Your catalogue',
            copy: 'Products, images, variants, stock and pricing in one workspace.',
          },
          {
            icon: PackageCheck,
            title: 'Orders in order',
            copy: 'See new orders, pack them and move each one to delivery.',
          },
          {
            icon: HandCoins,
            title: 'Clear earnings',
            copy: 'Commission and every seller payable recorded in a visible ledger.',
          },
          {
            icon: Megaphone,
            title: 'Built-in reach',
            copy: 'Category pages, store profiles and optional sponsored placements.',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-[1.15rem] border border-line/80 bg-[#fffdfa] p-4"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand-dark">
                <Icon className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <h2 className="mt-3 text-[12px] font-bold text-ink">{item.title}</h2>
              <p className="mt-1 text-[9.5px] leading-relaxed text-muted">{item.copy}</p>
            </div>
          );
        })}
      </section>

      <section id="plans" className="mt-8 scroll-mt-28">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Plans</p>
            <h2 className="mt-1.5 font-display text-[25px] font-extrabold tracking-[-0.045em]">
              Start lean. Upgrade when it earns.
            </h2>
          </div>
          <p className="max-w-sm text-[10px] leading-relaxed text-muted">
            Every plan includes a storefront, order tools and the same payout
            methods. Higher tiers lower commission and add growth tools.
          </p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan], index) => (
            <article
              key={key}
              className={`relative flex flex-col rounded-[1.35rem] border p-5 ${
                key === 'pro'
                  ? 'border-brand bg-night text-white shadow-[0_28px_60px_-40px_rgba(23,23,20,0.8)]'
                  : 'border-line/80 bg-[#fffdfa]'
              }`}
            >
              {key === 'pro' ? (
                <span className="absolute -top-2.5 left-5 rounded-full bg-brand px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-white">
                  Most popular
                </span>
              ) : null}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={`text-[9px] font-bold uppercase tracking-[0.12em] ${key === 'pro' ? 'text-[#ffb494]' : 'text-muted'}`}>
                    {plan.tagline}
                  </p>
                  <h3 className={`mt-1 font-display text-[22px] font-extrabold tracking-[-0.04em] ${key === 'pro' ? 'text-white' : 'text-ink'}`}>
                    {plan.name}
                  </h3>
                </div>
                {index === 2 ? (
                  <BadgeCheck className={`h-5 w-5 ${key === 'pro' ? 'text-[#ffb494]' : 'text-brand'}`} />
                ) : null}
              </div>
              <p className={`mt-3 price text-[20px] font-extrabold ${key === 'pro' ? 'text-white' : 'text-ink'}`}>
                {formatMoney(plan.priceCents)}
                <span className={`text-[9px] font-medium ${key === 'pro' ? 'text-white/40' : 'text-muted'}`}>
                  {' '}/ month
                </span>
              </p>
              <p className={`mt-1 text-[9.5px] ${key === 'pro' ? 'text-white/40' : 'text-muted'}`}>
                {plan.commissionDiscountBps
                  ? `${(plan.commissionDiscountBps / 100).toFixed(0)}% lower category commission`
                  : 'Standard category commission'}
              </p>
              <ul className={`mt-4 flex-1 space-y-2 border-t pt-4 ${key === 'pro' ? 'border-white/10' : 'border-ink/[0.06]'}`}>
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-[10px] leading-relaxed">
                    <Check
                      className={`mt-0.5 h-3 w-3 shrink-0 ${key === 'pro' ? 'text-[#8fd3a3]' : 'text-leaf'}`}
                      strokeWidth={2.5}
                    />
                    <span className={key === 'pro' ? 'text-white/65' : 'text-ink-soft'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className={`btn mt-4 w-full ${key === 'pro' ? 'btn-primary' : 'btn-outline'}`}
              >
                Register interest
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-2 px-1 text-[9px] text-muted">
          Plan prices are demonstrations in KES. They are not currently charged.
        </p>
      </section>

      <div className="mt-8 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <section id="fees" className="scroll-mt-28 rounded-[1.35rem] border border-line/80 bg-[#fffdfa] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <HandCoins className="h-4 w-4 text-brand-dark" />
              <h2 className="font-display text-[19px] font-bold tracking-[-0.035em]">
                Fees, in the open
              </h2>
            </div>
            <p className="mt-1.5 max-w-lg text-[10.5px] leading-relaxed text-muted">
              Commission varies by category to reflect different margins and
              operating costs. Your plan can lower it. A floor applies so the
              marketplace can keep supporting every sale.
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border border-line/70">
              {categories.map((category, index) => (
                <div
                  key={category.name}
                  className={`flex items-center justify-between gap-3 px-4 py-2.5 ${
                    index ? 'border-t border-line/60' : ''
                  }`}
                >
                  <span className="text-[10.5px] font-medium text-ink-soft">
                    {category.name}
                  </span>
                  <span className="num text-[10px] font-semibold text-ink">
                    {bpsLabel(category.commission_bps)}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2.5 text-[9px] leading-relaxed text-muted">
              Indicative category rates from the marketplace configuration.
              Commission is charged on the item subtotal when payment is
              confirmed, not on delivery fees.
            </p>
          </section>

          <section id="payouts" className="scroll-mt-28 rounded-[1.35rem] border border-line/80 bg-[#fffdfa] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-leaf" />
              <h2 className="font-display text-[19px] font-bold tracking-[-0.035em]">
                Getting paid
              </h2>
            </div>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Order paid',
                  copy: 'The platform records the sale, commission and seller payable.',
                },
                {
                  step: '02',
                  title: 'Balance grows',
                  copy: 'Your available balance is derived from the seller ledger.',
                },
                {
                  step: '03',
                  title: 'Withdraw',
                  copy: 'Request a payout to M-Pesa or a Kenyan bank account.',
                },
              ].map((item) => (
                <div key={item.step} className="rounded-xl bg-sand/50 p-3.5">
                  <p className="num text-[9px] font-semibold text-brand-dark">{item.step}</p>
                  <p className="mt-1.5 text-[11px] font-bold text-ink">{item.title}</p>
                  <p className="mt-1 text-[9px] leading-relaxed text-muted">{item.copy}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2.5 rounded-xl border border-brand/20 bg-brand-soft/45 px-3.5 py-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-dark" />
              <p className="text-[9.5px] leading-relaxed text-ink-soft">
                <strong className="font-semibold">Demo payout ledger.</strong>{' '}
                Seller balances and withdrawals in this build are simulated. No
                real customer funds are held and no payouts are sent.
              </p>
            </div>
          </section>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-[92px]">
          <section className="rounded-[1.35rem] border border-night/10 bg-night p-5 text-white">
            <Store className="h-5 w-5 text-[#ffb494]" />
            <h2 className="mt-3 font-display text-[19px] font-bold tracking-[-0.04em]">
              What every store gets
            </h2>
            <ul className="mt-3 space-y-2 text-[10px]">
              {[
                'A public store page with your brand and location',
                'Product management with variants and stock',
                'Order queue with fulfilment statuses',
                'Sales and payout analytics',
                'Review of your business before going live',
                'Paid placement options when you are ready',
              ].map((item) => (
                <li key={item} className="flex gap-2 text-white/60">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-[#8fd3a3]" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/contact" className="btn btn-primary mt-4 w-full">
              <MessageCircle className="h-3.5 w-3.5" />
              Speak to the team
            </Link>
          </section>

          <section className="rounded-[1.35rem] border border-line/80 bg-white/60 p-4">
            <div className="flex items-center gap-2">
              <CircleHelp className="h-4 w-4 text-ink-soft" />
              <h2 className="text-[11.5px] font-bold">Common questions</h2>
            </div>
            <div className="mt-1 divide-y divide-ink/[0.06]">
              {[
                {
                  q: 'Do I need a registered company?',
                  a: 'Business verification is intended for onboarding. A production process would check registration and tax details where required.',
                },
                {
                  q: 'When is commission charged?',
                  a: 'On the item subtotal of a paid order. Delivery fees and other pass-through amounts are excluded.',
                },
                {
                  q: 'Can I sell in more than one category?',
                  a: 'Yes. Category commission applies per product, so different lines can carry different rates.',
                },
              ].map((faq) => (
                <details key={faq.q} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-2.5 text-[10px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    {faq.q}
                    <ChevronRight className="h-3 w-3 shrink-0 text-muted transition group-open:rotate-90" />
                  </summary>
                  <p className="pb-2.5 text-[9px] leading-relaxed text-muted">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          <div className="rounded-[1.35rem] border border-brand/20 bg-brand-soft/55 p-4">
            <BarChart3 className="h-4 w-4 text-brand-dark" />
            <p className="mt-2 text-[10.5px] font-bold">Built for better decisions</p>
            <p className="mt-1 text-[9px] leading-relaxed text-ink-soft">
              Seller analytics cover revenue, orders, best products and payout
              history so you can see what is working before you spend on growth.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
