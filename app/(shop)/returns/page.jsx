import Link from 'next/link';
import { Clock3, PackageCheck, RotateCcw } from 'lucide-react';
import PageIntro from '@/components/shop/PageIntro';
import PolicyDocument from '@/components/content/PolicyDocument';

export const metadata = {
  title: 'Returns & refunds',
  description:
    'How returns and refunds work on Martify, including the demonstration limitations.',
};

const sections = [
  {
    id: 'window',
    title: '1. Return window',
    paragraphs: [
      'For a production launch, Martify intends to offer a 7-calendar-day return window for most items, counted from delivery. The exact rule would be shown on the order and in this policy when the live marketplace opens.',
      'This demonstration accepts a return request for any delivered and paid item in the demo account. It does not yet calculate a delivery date or enforce a time window.',
    ],
  },
  {
    id: 'eligible',
    title: '2. What can be returned',
    paragraphs: [
      'An item should be in the condition it arrived, with any included accessories and packaging where reasonable. The reason should be honest and specific so the seller and support team can review it.',
    ],
    bullets: [
      'Not as described: wrong colour, size, model or missing parts.',
      'Damaged in transit: visible breakage, leakage or packaging damage.',
      'Wrong item delivered: something different from what was ordered.',
      'Faulty on arrival: the item does not work as intended.',
      'Change of mind: where the item is unused, resalable and not excluded.',
    ],
  },
  {
    id: 'exclusions',
    title: '3. Exclusions and special items',
    paragraphs: [
      'For a live marketplace, certain products need additional safeguards. This demo does not yet enforce every exclusion below; they describe the intended policy.',
    ],
    bullets: [
      'Opened personal care, cosmetics, underwear and hygiene products cannot be returned for change of mind.',
      'Perishable groceries are reviewed case by case, and opened food may not be returnable.',
      'Custom-made, personalised or clearly marked final-sale items are excluded unless faulty.',
      'Digital cards or vouchers cannot be returned once the code is revealed.',
    ],
  },
  {
    id: 'start',
    title: '4. Starting a return',
    paragraphs: [
      'Sign in, open Account → Returns, and choose a delivered item. Select a reason and describe what happened. The request is recorded against the order and appears in your returns list.',
      'For guest orders, contact support with the order number and the email or phone used at checkout. You can find the order number on your order confirmation page.',
    ],
  },
  {
    id: 'review',
    title: '5. Review and collection',
    paragraphs: [
      'A return is reviewed by Martify and the seller. In this demo, no courier is booked and no item is physically collected. A live process would arrange collection or drop-off and require proof of condition.',
      'If the request is approved in production, you would receive instructions on where and when to hand over the item. Rejected requests would include a reason and an option to contact support.',
    ],
  },
  {
    id: 'refunds',
    title: '6. Refunds',
    paragraphs: [
      'No real refund is issued in this demonstration. Status and refund amounts are examples, and any payment references are simulated.',
      'In production, refunds would go back to the original payment method through the licensed payment provider after an approved return. Where cash on delivery was used, refund arrangements would be explained in the approval message. Delivery fees are generally non-refundable unless the issue was caused by the seller or Martify.',
    ],
  },
  {
    id: 'damaged',
    title: '7. Damaged or wrong items',
    paragraphs: [
      'If a parcel arrives damaged or contains the wrong item, keep the packaging and take clear photos before using anything. Start the return and add the key details in the description. Contact support immediately if the item is unsafe or valuable.',
      'You never need to share your card number, mobile-money PIN or password to resolve an order issue.',
    ],
  },
  {
    id: 'contact',
    title: '8. Help with a return',
    paragraphs: [
      'Use Account → Returns to see the status of a request. For extra help, contact support with your order number and a description of the issue. The help centre also covers common delivery and payment questions.',
    ],
  },
];

export default function ReturnsPolicyPage() {
  return (
    <div className="container-page py-5 sm:py-7">
      <PageIntro
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Returns & refunds' }]}
        eyebrow="Returns & refunds"
        title="A fair way back."
        description="Clear reasons, a visible review status and a refund path that returns to where you paid. Here is how it is meant to work — and what this demo can actually do."
        aside={
          <Link href="/account/returns" className="btn btn-primary w-full sm:w-auto">
            <RotateCcw className="h-4 w-4" />
            Go to my returns
          </Link>
        }
      >
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            {
              icon: Clock3,
              title: 'Start quickly',
              copy: 'Pick a delivered item and tell us what went wrong.',
            },
            {
              icon: PackageCheck,
              title: 'Visible review',
              copy: 'Follow every status from request to decision.',
            },
            {
              icon: RotateCcw,
              title: 'Refund to source',
              copy: 'Simulated here; original method in production.',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-start gap-2.5 rounded-xl border border-line/70 bg-white/65 p-3"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-dark">
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-[10.5px] font-bold text-ink">{item.title}</p>
                  <p className="mt-0.5 text-[9px] leading-relaxed text-muted">{item.copy}</p>
                </div>
              </div>
            );
          })}
        </div>
      </PageIntro>
      <PolicyDocument updated="25 October 2026" sections={sections}>
        <div className="rounded-xl border border-brand/20 bg-brand-soft/50 px-4 py-3.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-brand-dark">
            Demonstration note
          </p>
          <p className="mt-1.5 text-[10px] leading-relaxed text-ink-soft">
            This returns flow is a product demonstration. No courier is booked, no
            refund is paid and no real item is collected. Payment and refund
            references are simulated. A live returns process must use licensed
            payment providers and comply with applicable consumer law.
          </p>
        </div>
      </PolicyDocument>
    </div>
  );
}
