import CheckoutView from '@/components/checkout/CheckoutView';
import PageIntro from '@/components/shop/PageIntro';
import { getCurrentUser } from '@/lib/auth';
import { getSettings } from '@/lib/catalog';
import { query } from '@/lib/db';

export const metadata = {
  title: 'Checkout',
  description:
    'Complete your Martify order with delivery, M-Pesa, card or cash on delivery.',
  robots: { index: false, follow: true },
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  const settings = await getSettings();
  const addresses = user
    ? await query(
        `SELECT id, label, recipient, phone, county, town, address_line,
                instructions, is_default
         FROM addresses
         WHERE user_id = $1
         ORDER BY is_default DESC, created_at DESC
         LIMIT 20`,
        [user.id],
      )
    : [];

  return (
    <div className="container-page py-5 sm:py-7">
      <PageIntro
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Cart', href: '/cart' },
          { label: 'Checkout' },
        ]}
        eyebrow="Secure demo checkout"
        title="Almost yours."
        description="Confirm delivery, review your totals and choose how you would like to pay. Payments are simulated in this build — no real money moves."
      />
      <div className="mt-5">
        <CheckoutView
          user={
            user
              ? {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  phone: user.phone,
                }
              : null
          }
          addresses={addresses}
          settings={{
            delivery_door_cents: settings.delivery_door_cents,
            delivery_pickup_cents: settings.delivery_pickup_cents,
            delivery_express_cents: settings.delivery_express_cents,
            free_delivery_threshold_cents:
              settings.free_delivery_threshold_cents,
            support_email: settings.support_email,
            support_phone: settings.support_phone,
          }}
        />
      </div>
    </div>
  );
}
