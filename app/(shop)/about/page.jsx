import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  HandCoins,
  HeartHandshake,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Store,
  Truck,
} from 'lucide-react';
import PageIntro from '@/components/shop/PageIntro';
import { one } from '@/lib/db';

export const metadata = {
  title: 'Our story',
  description:
    'Why Martify is building a more human marketplace for Kenyan buyers and sellers.',
};

export default async function AboutPage() {
  const stats = await one(
    `SELECT
       (SELECT count(*) FROM sellers WHERE status = 'approved')::int AS sellers,
       (SELECT count(*) FROM products WHERE status = 'active')::int AS products,
       (SELECT count(*) FROM categories WHERE active = true)::int AS categories,
       (SELECT count(*) FROM orders)::int AS orders`,
  );

  return (
    <div className="container-page py-5 sm:py-7">
      <PageIntro
        tone="dark"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Our story' }]}
        eyebrow="Built in Nairobi"
        title="Kenya already had the goods. It needed a better shelf."
        description="Martify is a multi-vendor marketplace concept for the way Kenya actually shops — close to local sellers, clear on delivery, and comfortable with M-Pesa."
        aside={
          <Link href="/stores" className="btn btn-primary w-full sm:w-auto">
            Meet the sellers
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { value: stats.sellers, label: 'Approved sellers' },
            { value: stats.products, label: 'Live products' },
            { value: stats.categories, label: 'Categories' },
            { value: stats.orders, label: 'Orders in the demo' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3"
            >
              <p className="stat-value text-[1.3rem] text-white">{stat.value}</p>
              <p className="mt-0.5 text-[9px] uppercase tracking-[0.08em] text-white/40">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </PageIntro>

      <div className="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <section className="rounded-[1.35rem] border border-line/80 bg-[#fffdfa] p-5 sm:p-7">
            <p className="eyebrow">Our story</p>
            <h2 className="mt-2 max-w-xl font-display text-[24px] font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-[29px]">
              A marketplace that respects both sides of the counter.
            </h2>
            <div className="mt-4 space-y-3 text-[11.5px] leading-[1.8] text-ink-soft">
              <p>
                Kenya’s best shops are not all on one street. A furniture workshop
                in Gikomba, a beauty counter in Kilimani, a grocery stall in Kisumu
                and a phone specialist on Moi Avenue can all serve the same customer
                — but discovery, trust and delivery often stop them from reaching
                beyond their neighbourhood.
              </p>
              <p>
                Martify is designed to close that distance without flattening what
                makes local sellers worth buying from. Stores keep their identity,
                tell their own story, and earn a clear ledger of every sale. Buyers
                get one consistent place to discover, compare, pay and track orders.
              </p>
              <p>
                This build is a demonstration: real interactions across a realistic
                catalogue, but simulated payment and payout flows. It shows how the
                complete marketplace could work before a licensed, production-ready
                launch.
              </p>
            </div>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {[
                {
                  icon: Store,
                  title: 'Local sellers first',
                  copy: 'Verified Kenyan stores, visible locations and honest product listings.',
                },
                {
                  icon: HandCoins,
                  title: 'Fair economics',
                  copy: 'Published category commission, tiered plans and a transparent seller ledger.',
                },
                {
                  icon: Truck,
                  title: 'Delivery that fits',
                  copy: 'Door, pickup or express, with fees shown before you commit.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Protected at the edges',
                  copy: 'Secure sessions, private order links, returns and buyer support.',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-line/70 bg-white/55 p-3.5"
                  >
                    <Icon className="h-4 w-4 text-brand-dark" strokeWidth={1.8} />
                    <p className="mt-2 text-[11px] font-bold text-ink">{item.title}</p>
                    <p className="mt-1 text-[9.5px] leading-relaxed text-muted">{item.copy}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-[1.35rem] border border-line/80 bg-[#fffdfa] p-5 sm:p-7">
            <p className="eyebrow">The model</p>
            <h2 className="mt-2 font-display text-[20px] font-bold tracking-[-0.04em]">
              One platform, three points of view.
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                {
                  icon: PackageCheck,
                  title: 'Customers',
                  copy: 'A broad catalogue, trustworthy product detail and one account for orders, returns and support.',
                },
                {
                  icon: BadgeCheck,
                  title: 'Sellers',
                  copy: 'A complete storefront, order tools, business analytics and commission that rewards growing stores.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Martify',
                  copy: 'Review, facilitation, disputes and carefully labelled seller services such as sponsored placement.',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title}>
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-sand text-ink-soft">
                      <Icon className="h-4 w-4" strokeWidth={1.8} />
                    </span>
                    <h3 className="mt-2 text-[11.5px] font-bold">{item.title}</h3>
                    <p className="mt-1 text-[9.5px] leading-relaxed text-muted">{item.copy}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-[92px]">
          <section className="relative overflow-hidden rounded-[1.35rem] border border-night/10 bg-night p-5 text-white">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-16 h-36 w-36 rounded-full bg-leaf/25 blur-2xl"
            />
            <div className="relative">
              <MapPin className="h-5 w-5 text-[#ffb494]" />
              <h2 className="mt-3 font-display text-[19px] font-bold tracking-[-0.04em]">
                Made in Nairobi, for Kenya.
              </h2>
              <p className="mt-2 text-[10px] leading-relaxed text-white/50">
                The catalogue spans counties and categories, with prices in KES,
                M-Pesa-ready checkout and delivery options that start at the
                neighbourhood level.
              </p>
              <Link href="/contact" className="btn btn-light btn-sm mt-4 w-full">
                Talk to the team
              </Link>
            </div>
          </section>

          <section className="rounded-[1.35rem] border border-line/80 bg-white/60 p-4">
            <HeartHandshake className="h-4 w-4 text-brand-dark" />
            <h2 className="mt-2 text-[11.5px] font-bold">A demo, clearly labelled</h2>
            <p className="mt-1.5 text-[9.5px] leading-relaxed text-muted">
              Martify demonstrates a complete marketplace without moving real
              money. Payments, balances, refunds and payouts are simulations.
              Sellers are seeded demo stores.
            </p>
            <Link
              href="/terms"
              className="mt-2.5 inline-flex items-center gap-1 text-[9.5px] font-semibold text-brand-dark"
            >
              Read the terms
              <ArrowRight className="h-3 w-3" />
            </Link>
          </section>

          <section className="rounded-[1.35rem] border border-line/80 bg-white/60 p-4">
            <p className="eyebrow">Explore</p>
            <div className="mt-2 grid gap-1">
              {[
                { href: '/stores', label: 'Meet the sellers' },
                { href: '/sell', label: 'Sell on Martify' },
                { href: '/help', label: 'Help centre' },
                { href: '/privacy', label: 'Privacy policy' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between rounded-lg px-2 py-2 text-[10px] font-medium text-ink-soft transition hover:bg-sand/60 hover:text-ink"
                >
                  {link.label}
                  <ArrowRight className="h-3 w-3 text-muted" />
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
