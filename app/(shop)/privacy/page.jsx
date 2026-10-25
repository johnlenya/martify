import PageIntro from '@/components/shop/PageIntro';
import PolicyDocument from '@/components/content/PolicyDocument';

export const metadata = {
  title: 'Privacy policy',
  description:
    'How Martify handles account, order and address data in this demonstration marketplace.',
};

const sections = [
  {
    id: 'overview',
    title: '1. Overview',
    paragraphs: [
      'This policy explains the personal data handled by the Martify demonstration, why it is used and the choices available to you. Martify is currently a demo environment, not a live commercial marketplace.',
      'We collect only what is needed to make the customer, seller and admin flows work in the demo. Account and order data lives in the configured database for this environment.',
    ],
  },
  {
    id: 'collect',
    title: '2. Data we collect',
    bullets: [
      'Account details: your name, email address, optional phone number, hashed password and preferred language.',
      'Delivery details: recipient name, phone, county, town, address line and delivery instructions.',
      'Order details: products, quantities, prices, discounts, delivery method, status updates and demo payment references.',
      'Marketplace activity: wishlist items, recently viewed product identifiers, referral attribution and notifications.',
      'Seller details, if you are approved as a seller: store profile, business verification fields, product listings, payouts and ledger entries.',
      'Technical data needed to operate the demo, such as session cookies and basic request logs.',
    ],
    paragraphs: [
      'We do not ask for card numbers, CVV codes, mobile-money PINs or bank passwords in this build.',
    ],
  },
  {
    id: 'use',
    title: '3. How we use it',
    bullets: [
      'Create and secure your account and keep you signed in.',
      'Show products, prices, stock, delivery estimates and seller information.',
      'Create orders, reserve stock, demonstrate payment confirmation and show order progress.',
      'Save delivery addresses and pre-fill checkout when you choose to use them.',
      'Record seller commission, affiliate attribution and a demonstration ledger.',
      'Respond to support requests and detect abuse or unauthorised access.',
    ],
  },
  {
    id: 'cookies',
    title: '4. Cookies and local storage',
    paragraphs: [
      'Martify uses an httpOnly session cookie to securely identify your signed-in session. It is not available to browser JavaScript.',
      'Guest cart, wishlist, recently viewed products and your language choice may be stored in your browser’s local storage. A referral cookie may be set for 30 days when you open a link with an affiliate code.',
      'Clearing your browser storage signs out guest state and removes referral attribution. Signed-in data remains in your account until you delete it.',
    ],
  },
  {
    id: 'payments',
    title: '5. Payments',
    paragraphs: [
      'Demo payment screens simulate an M-Pesa or card request. They deliberately collect no card details and call no real payment provider.',
      'A production version would use licensed providers such as M-Pesa through a participating payment service and hosted card checkout. Those providers process payment credentials under their own privacy terms. Martify should store only the payment status, amount and provider reference needed for orders and support.',
    ],
  },
  {
    id: 'sharing',
    title: '6. Who can see your data',
    paragraphs: [
      'Sellers receive the order and delivery details needed to pack and fulfil their part of an order. Other customers cannot see your account or order information.',
      'Administrators can access marketplace data for support, fraud prevention, seller review and dispute handling. Service providers used by the deployment may process data on our instructions, subject to their own safeguards.',
      'We do not sell personal data. We may disclose information if required by law or to protect the safety and rights of users.',
    ],
  },
  {
    id: 'retention',
    title: '7. How long we keep it',
    paragraphs: [
      'Demonstration data is kept for as long as needed to operate and test the environment. Resetting the demo database removes orders, listings and test accounts and restores seed data.',
      'In production, account, order, payout and tax records should be retained according to Kenyan legal and accounting requirements, and then securely deleted.',
    ],
  },
  {
    id: 'security',
    title: '8. Security',
    bullets: [
      'Passwords are hashed with bcrypt rather than stored in plain text.',
      'Sessions use signed, httpOnly cookies and expire after seven days.',
      'State-changing APIs check the request origin and apply rate limits.',
      'Checkout reprices every cart on the server and reserves stock before creating an order.',
      'Access to order pages is limited to the signed-in owner or the private access token for guest orders.',
    ],
    paragraphs: [
      'No system is completely secure. Use a unique password, do not share your session or order links, and avoid sending sensitive information in screenshots or support messages.',
    ],
  },
  {
    id: 'rights',
    title: '9. Your choices and rights',
    paragraphs: [
      'You can update saved addresses, mark notifications as read, manage your wishlist and review orders from your account. You may contact support to ask for a copy or deletion of demo data tied to your account.',
      'A production service would provide formal processes for access, correction, deletion and objection requests in line with applicable data protection law.',
    ],
  },
  {
    id: 'children',
    title: '10. Children',
    paragraphs: [
      'Martify is not intended for children to use unsupervised. Accounts are designed for people who can enter into marketplace transactions under Kenyan law.',
    ],
  },
  {
    id: 'contact',
    title: '11. Changes and contact',
    paragraphs: [
      'We may update this policy as the demonstration changes. The date at the top shows the latest revision.',
      'Questions about privacy can be sent to support@martify.co.ke or through the contact page. The address is configured for the demonstration.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="container-page py-5 sm:py-7">
      <PageIntro
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Privacy policy' }]}
        eyebrow="Your data"
        title="What we hold, and why."
        description="A plainly written account of the data used by this Martify demonstration — including the data we deliberately do not collect."
      />
      <PolicyDocument updated="25 October 2026" sections={sections} />
    </div>
  );
}
