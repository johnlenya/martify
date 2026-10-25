import Link from 'next/link';
import { ArrowRight, CheckCircle2, Store } from 'lucide-react';

const BENEFITS = [
  'No listing fees — pay only when you sell',
  'Commission from 8% per category, lower on Pro and Premium',
  'Payouts straight to M-Pesa or your bank account',
  'Sponsored placements, flash sales and buyer reach built in',
];

const STATS = [
  { value: '8–15%', label: 'category commission' },
  { value: 'Free', label: 'to open your shop' },
  { value: 'M-Pesa', label: 'seller payouts' },
  { value: '48 hr', label: 'typical approval' },
];

export default function SellerCta() {
  return (
    <section className="container-page mt-12" aria-labelledby="seller-cta-title">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-night px-5 py-8 text-white sm:px-9 sm:py-10 lg:px-12">
        <span
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand/[0.12] blur-3xl"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -bottom-24 right-8 h-64 w-64 rounded-full border border-white/[0.06]"
          aria-hidden="true"
        />

        <div className="relative grid items-center gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
          <div>
            <p className="eyebrow flex items-center gap-1.5 text-white/40">
              <Store className="h-3.5 w-3.5 text-brand" />
              SELL ON MARTIFY
            </p>
            <h2
              id="seller-cta-title"
              className="mt-3 max-w-[18ch] font-display text-[clamp(1.7rem,3.4vw,2.6rem)] font-extrabold leading-[1.02] tracking-[-0.05em] text-white"
            >
              Your next customer is already here.
            </h2>
            <p className="mt-3 max-w-[480px] text-[12px] leading-relaxed text-white/55 sm:text-[12.5px]">
              Bring your shop to Martify and reach shoppers across all 47 counties.
              We handle the storefront, checkout and discovery — you focus on
              selling.
            </p>

            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {BENEFITS.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-2 text-[10.5px] leading-relaxed text-white/65"
                >
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7ed9a6]" />
                  {benefit}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/sell" className="btn btn-primary">
                Start selling
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/sell#plans"
                className="btn border-white/20 bg-white/[0.06] text-white transition hover:bg-white/15"
              >
                Compare seller plans
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-4"
              >
                <p className="font-display text-[clamp(1.15rem,2.2vw,1.6rem)] font-extrabold tracking-[-0.045em] text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.1em] text-white/35">
                  {stat.label}
                </p>
              </div>
            ))}
            <p className="col-span-2 px-1 text-[8.5px] leading-relaxed text-white/25">
              Commission rates vary by category and seller plan. See seller terms
              for full details.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
