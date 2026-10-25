import Link from 'next/link';
import {
  ArrowRight,
  CreditCard,
  MessageCircle,
  PackageCheck,
  RotateCcw,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
} from 'lucide-react';
import PageIntro from '@/components/shop/PageIntro';

export const metadata = {
  title: 'Help centre',
  description:
    'Answers about orders, delivery, payments, returns and selling on Martify.',
};

const QUICK_LINKS = [
  {
    href: '/track',
    icon: Truck,
    title: 'Track an order',
    copy: 'See where a parcel is right now.',
  },
  {
    href: '/returns',
    icon: RotateCcw,
    title: 'Returns & refunds',
    copy: 'Understand the process and window.',
  },
  {
    href: '/account',
    icon: UserRound,
    title: 'Your account',
    copy: 'Orders, addresses and notifications.',
  },
  {
    href: '/contact',
    icon: MessageCircle,
    title: 'Talk to us',
    copy: 'Reach a human when you need one.',
  },
];

const GROUPS = [
  {
    title: 'Orders & delivery',
    icon: ShoppingBag,
    faqs: [
      {
        question: 'How do I know my order went through?',
        answer:
          'After checkout you will land on a private order page with your order number. If you were signed in, the order also appears under Account → Orders. Keep the link if you checked out as a guest.',
      },
      {
        question: 'How long will delivery take?',
        answer:
          'Door delivery usually takes 2–4 working days, pickup 1–2 working days, and Nairobi express orders within 24 hours. Timelines start after the seller confirms the order.',
      },
      {
        question: 'Can I change my delivery address after ordering?',
        answer:
          'Contact support as soon as possible with your order number. Once an order is handed to the rider, the address can no longer be changed. You can edit saved addresses for future orders at any time.',
      },
      {
        question: 'How do I track my order?',
        answer:
          'Use Track order with your order number and the email or phone number used at checkout. You can also open the order from your account to see every step.',
      },
    ],
  },
  {
    title: 'Payments',
    icon: CreditCard,
    faqs: [
      {
        question: 'Which payment methods can I use?',
        answer:
          'Martify is designed for M-Pesa, cards and cash on delivery. In this demonstration build, M-Pesa and card checkouts are clearly labelled simulations. Cash on delivery is also a demo and no cash is collected.',
      },
      {
        question: 'Does Martify store my card details?',
        answer:
          'No. This build never asks for card numbers, CVV codes or bank credentials. A production launch would use a licensed payment provider and hosted payment fields.',
      },
      {
        question: 'My payment says pending. What next?',
        answer:
          'Open the order from Account → Orders and use the demo payment button if one is offered. Demo payments do not move real money and can be completed directly on the order page.',
      },
    ],
  },
  {
    title: 'Returns & refunds',
    icon: PackageCheck,
    faqs: [
      {
        question: 'When can I return an item?',
        answer:
          'This demo allows return requests for delivered, paid items under Account → Returns. A production policy would define a specific window, exclusions for hygiene products and a collection process.',
      },
      {
        question: 'How long do refunds take?',
        answer:
          'Return requests are first reviewed. Demo refunds are simulated and labelled as such. Real refunds should always be returned through the original licensed payment provider.',
      },
      {
        question: 'What if the wrong item arrived?',
        answer:
          'Start a return and write what you expected versus what arrived. Include your order number if you contact support so the team can trace the right seller.',
      },
    ],
  },
  {
    title: 'Selling on Martify',
    icon: Store,
    faqs: [
      {
        question: 'How do I become a seller?',
        answer:
          'Visit Sell on Martify to compare plans and fees. Seller onboarding with business verification is being prepared in this build; the public seller pages explain the intended process and pricing.',
      },
      {
        question: 'How do seller payouts work?',
        answer:
          'Martify records each paid order in a seller ledger, deducts commission and makes the remaining balance available for payout to M-Pesa or a bank account. The ledger and payout screens are part of the seller workspace.',
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="container-page py-5 sm:py-7">
      <PageIntro
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Help centre' }]}
        eyebrow="How can we help?"
        title="Answers, without the runaround."
        description="Start with the common questions below, or reach a real person if you would rather talk it through."
        aside={
          <Link href="/contact" className="btn btn-primary w-full sm:w-auto">
            <MessageCircle className="h-4 w-4" />
            Contact support
          </Link>
        }
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-2.5 rounded-xl border border-line/70 bg-white/65 px-3 py-2.5 transition hover:border-ink/20 hover:bg-white"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sand text-ink-soft">
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10.5px] font-bold text-ink">{item.title}</p>
                  <p className="mt-0.5 truncate text-[9px] text-muted">{item.copy}</p>
                </div>
                <ArrowRight className="ml-auto h-3 w-3 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" />
              </Link>
            );
          })}
        </div>
      </PageIntro>

      <div className="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          {GROUPS.map((group) => {
            const Icon = group.icon;
            return (
              <section
                key={group.title}
                className="overflow-hidden rounded-[1.3rem] border border-line/80 bg-[#fffdfa]"
              >
                <div className="flex items-center gap-2.5 border-b border-ink/[0.06] px-4 py-3.5 sm:px-5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-soft text-brand-dark">
                    <Icon className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  <h2 className="font-display text-[15px] font-bold tracking-[-0.03em]">
                    {group.title}
                  </h2>
                </div>
                <div className="divide-y divide-ink/[0.06]">
                  {group.faqs.map((faq) => (
                    <details key={faq.question} className="group px-4 sm:px-5">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3.5 text-[11.5px] font-semibold text-ink transition hover:text-brand-dark [&::-webkit-details-marker]:hidden">
                        {faq.question}
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-line text-[13px] font-normal text-muted transition group-open:rotate-45 group-open:border-brand group-open:text-brand-dark">
                          +
                        </span>
                      </summary>
                      <p className="pb-4 pr-8 text-[10.5px] leading-relaxed text-muted">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <aside className="space-y-3 lg:sticky lg:top-[92px]">
          <section className="relative overflow-hidden rounded-[1.3rem] border border-night/10 bg-night p-5 text-white">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-brand/25 blur-2xl"
            />
            <div className="relative">
              <p className="eyebrow text-[#ffb494]">Still stuck?</p>
              <h2 className="mt-1.5 font-display text-[17px] font-bold tracking-[-0.035em]">
                A person, not a loop.
              </h2>
              <p className="mt-1.5 text-[10px] leading-relaxed text-white/50">
                Share your order number and what happened. Support is available
                Monday to Saturday, 8am–6pm EAT.
              </p>
              <Link href="/contact" className="btn btn-primary btn-sm mt-4 w-full">
                Contact support
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>
          <section className="rounded-[1.3rem] border border-line/80 bg-white/60 p-4">
            <h2 className="text-[11.5px] font-bold">Useful reading</h2>
            <div className="mt-2 grid gap-1">
              {[
                { href: '/returns', label: 'Returns & refunds policy' },
                { href: '/terms', label: 'Terms of service' },
                { href: '/privacy', label: 'Privacy policy' },
                { href: '/about', label: 'About Martify' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-lg px-2 py-2 text-[10px] font-medium text-ink-soft transition hover:bg-sand/60 hover:text-ink"
                >
                  {item.label}
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
