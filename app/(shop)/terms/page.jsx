import PageIntro from '@/components/shop/PageIntro';
import PolicyDocument from '@/components/content/PolicyDocument';

export const metadata = {
  title: 'Terms of service',
  description:
    'The terms for using Martify, a demonstration marketplace for Kenya.',
};

const sections = [
  {
    id: 'demo',
    title: '1. A demonstration marketplace',
    paragraphs: [
      'Martify is a software demonstration of a multi-vendor marketplace for Kenya. It is not currently operating as a live commercial marketplace. Orders, payments, balances, commissions and payouts shown in this environment are simulated for product demonstration.',
      'Nothing in this demo creates a real obligation to buy, sell, deliver, pay or refund. Do not use this build to send real money or to treat any balance shown as funds held on your behalf.',
    ],
  },
  {
    id: 'using',
    title: '2. Using Martify',
    paragraphs: [
      'You may browse the catalogue and use the customer, seller and admin features to evaluate the product. You must not use Martify to break the law, interfere with the service, attempt to access another person’s account, scrape personal data or test payment systems with real credentials.',
    ],
    bullets: [
      'Provide accurate information when creating an account or placing an order.',
      'Keep your password private and tell us if you believe your account is compromised.',
      'Do not upload unlawful, misleading or harmful product content.',
    ],
  },
  {
    id: 'accounts',
    title: '3. Accounts and access',
    paragraphs: [
      'A customer account lets you save addresses, view orders and manage returns. Seller and administrator areas are restricted to the relevant roles. You are responsible for activity carried out through your account.',
      'We may suspend or remove accounts that abuse the demo, attempt unauthorised access, or misuse other people’s information.',
    ],
  },
  {
    id: 'marketplace',
    title: '4. The marketplace model',
    paragraphs: [
      'Martify is designed as a venue where independent sellers list products. Sellers are responsible for product accuracy, legality, stock, pricing, and fulfilment. Martify intends to review sellers and listings, facilitate payments and support disputes, but does not manufacture the products.',
      'In a production deployment, the contract of sale would be between the customer and the seller, with Martify providing marketplace and payment facilitation services under published rules.',
    ],
  },
  {
    id: 'orders',
    title: '5. Orders and pricing',
    paragraphs: [
      'Prices are shown in Kenyan shillings (KES). The price on the product page when you place an order is the price used, subject to stock availability, coupon validation and delivery selection. Stock is reserved during checkout.',
      'An order confirmation in this demo demonstrates the order flow; it is not a legal acceptance of a real purchase. In production, sellers would be able to accept, pack, ship and update orders within defined service levels.',
    ],
  },
  {
    id: 'payments',
    title: '6. Payments and simulated balances',
    paragraphs: [
      'M-Pesa and card options in this build are simulations. No STK push is sent, no card details are collected and no real charge is made. Cash on delivery is also simulated and no cash is collected.',
      'The platform records a ledger for demonstration: sales, delivery fees, discounts, commission, affiliate commission and seller payables. These ledger values are not real funds and must not be presented as money held by Martify.',
      'Any production launch using M-Pesa or card payments would rely on appropriately licensed providers. Card details should be captured by the provider’s hosted fields or SDK, never stored by Martify. A live environment must not use this demo’s simulated payment confirmation as evidence of payment.',
    ],
  },
  {
    id: 'delivery',
    title: '7. Delivery',
    paragraphs: [
      'Delivery options and fees demonstrate a countrywide marketplace flow. Door delivery, pickup and Nairobi express are samples. Estimated timelines begin after a seller confirms an order and vary by location.',
      'In this demo, no rider or courier is booked. A production service would publish delivery coverage, failed-delivery handling and proof-of-delivery rules.',
    ],
  },
  {
    id: 'returns',
    title: '8. Returns and refunds',
    paragraphs: [
      'The account area demonstrates return requests for delivered, paid items. Status labels such as “Under review”, “Approved” and “Refunded” are examples. No real refund is issued in this demo.',
      'Read the returns policy for more detail. In production, refunds should be sent back through the original licensed payment provider and criteria such as hygiene exclusions and return windows would apply.',
    ],
  },
  {
    id: 'sellers',
    title: '9. Seller terms and fees',
    paragraphs: [
      'Seller plans and commission figures on the seller pages illustrate the intended commercial model. Commission is configurable by category, with subscription plans able to reduce the percentage, subject to a minimum floor.',
      'A seller ledger is recorded for demonstration. Simulated balances, payouts and sponsored placements do not move real funds. Production seller onboarding would require business verification, tax details, a signed seller agreement and compliant payout checks.',
    ],
  },
  {
    id: 'content',
    title: '10. Content and intellectual property',
    paragraphs: [
      'Martify branding, interface and code are protected by applicable intellectual property laws. Product photos and descriptions belong to their respective owners. Sellers must have the rights to the content they upload.',
      'Product photography in this demonstration may be sourced from third-party stock services for illustrative purposes.',
    ],
  },
  {
    id: 'liability',
    title: '11. Availability and liability',
    paragraphs: [
      'The demo is provided as-is, without warranties that it will be uninterrupted or error-free. To the extent permitted by law, Martify is not liable for loss arising from reliance on simulated data, orders, payments or balances.',
      'Nothing in these terms limits rights that cannot lawfully be limited under Kenyan consumer protection law in a live commercial service.',
    ],
  },
  {
    id: 'changes',
    title: '12. Changes and contact',
    paragraphs: [
      'These terms may be updated as the demonstration evolves. Material changes would be announced on this page with a new update date.',
      'For questions about these terms, use the contact page or email support@martify.co.ke. This is a demo address configured for the demonstration.',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="container-page py-5 sm:py-7">
      <PageIntro
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Terms of service' }]}
        eyebrow="The rules"
        title="Clear terms. Honest demo."
        description="What this build is, how orders and balances work, and the boundaries that keep the demonstration safe. Written to be read, not skimmed past."
      />
      <PolicyDocument updated="25 October 2026" sections={sections} />
    </div>
  );
}
