import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CircleHelp,
  Link2,
  Share2,
  Sparkles,
  UserPlus,
  Wallet,
} from 'lucide-react';
import PageIntro from '@/components/shop/PageIntro';
import { AFFILIATE_COMMISSION_BPS } from '@/lib/commerce';
import { formatMoney } from '@/lib/money';

export const metadata = {
  title: 'Affiliate programme',
  description:
    'Share Martify with your network and earn 2% of item value when their orders are paid.',
};

const EXAMPLES = [300000, 500000, 1000000];

export default function PublicAffiliatePage() {
  const rate = AFFILIATE_COMMISSION_BPS / 100;

  return (
    <div className="container-page py-5 sm:py-7">
      <PageIntro
        tone="dark"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Affiliate programme' }]}
        eyebrow={`Earn ${rate}% per paid order`}
        title="Good taste should pay."
        description="Share the finds you already love. When your people shop through your link, you earn a commission on what they buy."
        aside={
          <Link href="/account/affiliate" className="btn btn-primary w-full sm:w-auto">
            Get my referral link
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <section className="rounded-[1.3rem] border border-line/80 bg-[#fffdfa] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-dark" />
              <h2 className="font-display text-[18px] font-bold tracking-[-0.035em]">
                Simple by design
              </h2>
            </div>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
              {[
                {
                  icon: Link2,
                  title: 'Get your link',
                  copy: 'Activate your affiliate account and copy your unique referral link.',
                },
                {
                  icon: Share2,
                  title: 'Share it',
                  copy: 'Send it to friends, your group chat or your audience.',
                },
                {
                  icon: Wallet,
                  title: `Earn ${rate}%`,
                  copy: 'When their order is paid, commission is recorded in your dashboard.',
                },
              ].map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="rounded-xl border border-line/70 bg-white/60 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-soft text-brand-dark">
                        <Icon className="h-4 w-4" strokeWidth={1.8} />
                      </span>
                      <span className="num text-[10px] font-semibold text-muted/60">
                        0{index + 1}
                      </span>
                    </div>
                    <p className="mt-2.5 text-[11.5px] font-bold text-ink">{step.title}</p>
                    <p className="mt-1 text-[9.5px] leading-relaxed text-muted">{step.copy}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-[1.3rem] border border-line/80 bg-[#fffdfa] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-leaf" />
              <h2 className="font-display text-[18px] font-bold tracking-[-0.035em]">
                What {rate}% looks like
              </h2>
            </div>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">
              Commission is based on the item subtotal of a completed, paid order,
              excluding delivery and any affiliate payout deductions.
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border border-line/70">
              {EXAMPLES.map((subtotal, index) => (
                <div
                  key={subtotal}
                  className={`flex items-center justify-between gap-3 px-4 py-3 ${
                    index ? 'border-t border-line/60' : ''
                  }`}
                >
                  <span className="text-[10.5px] text-muted">
                    Order subtotal of {formatMoney(subtotal)}
                  </span>
                  <span className="price text-[12px] font-extrabold text-leaf">
                    {formatMoney(Math.round((subtotal * AFFILIATE_COMMISSION_BPS) / 10000))}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[9px] leading-relaxed text-muted">
              Illustration only. Actual earnings depend on eligible orders, returns
              and the final programme terms.
            </p>
          </section>

          <section className="rounded-[1.3rem] border border-line/80 bg-[#fffdfa] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <CircleHelp className="h-4 w-4 text-ink-soft" />
              <h2 className="font-display text-[18px] font-bold tracking-[-0.035em]">
                Fair questions
              </h2>
            </div>
            <div className="mt-2 divide-y divide-ink/[0.06]">
              {[
                {
                  q: 'Who can join?',
                  a: 'Any signed-in Martify customer can activate an affiliate account from their dashboard. Seller accounts can also refer customers.',
                },
                {
                  q: 'How long does the referral last?',
                  a: 'The referral cookie lasts 30 days. If a shopper clears cookies or uses another device, the link may no longer be attributed.',
                },
                {
                  q: 'When is commission confirmed?',
                  a: 'Commission is recorded when an eligible order is paid. Returns, cancellations or suspected abuse can reduce or reverse it.',
                },
                {
                  q: 'Does this demo pay real money?',
                  a: 'No. Affiliate earnings in this build are simulated ledger values for demonstration. No real funds are held or paid out.',
                },
              ].map((faq) => (
                <details key={faq.q} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-[11px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    {faq.q}
                    <span className="text-muted transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="pb-3.5 pr-6 text-[10px] leading-relaxed text-muted">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-[92px]">
          <section className="relative overflow-hidden rounded-[1.35rem] border border-night/10 bg-night p-5 text-white">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full bg-brand/30 blur-2xl"
            />
            <div className="relative">
              <BadgeCheck className="h-5 w-5 text-[#ffb494]" />
              <h2 className="mt-3 font-display text-[20px] font-bold leading-tight tracking-[-0.04em]">
                Start with the link you already have.
              </h2>
              <p className="mt-2 text-[10px] leading-relaxed text-white/50">
                Activate your affiliate dashboard to reveal your code, share link,
                clicks and simulated earnings.
              </p>
              <Link href="/account/affiliate" className="btn btn-primary mt-4 w-full">
                Go to my dashboard
              </Link>
              <p className="mt-3 text-[8.5px] leading-relaxed text-white/30">
                Sign-in required. Demo values only — no real affiliate funds are held.
              </p>
            </div>
          </section>

          <section className="rounded-[1.3rem] border border-line/80 bg-white/60 p-4">
            <UserPlus className="h-4 w-4 text-ink-soft" />
            <h2 className="mt-2 text-[11.5px] font-bold">Programme details</h2>
            <ul className="mt-2 space-y-1.5 text-[9.5px] leading-relaxed text-muted">
              <li>• {rate}% of eligible item subtotal</li>
              <li>• 30-day referral window</li>
              <li>• Transparent click and signup tracking</li>
              <li>• No cost to join</li>
              <li>• Demo payouts only in this build</li>
            </ul>
            <Link
              href="/terms"
              className="mt-3 inline-flex items-center gap-1 text-[9.5px] font-semibold text-brand-dark"
            >
              Terms apply
              <ArrowRight className="h-3 w-3" />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
