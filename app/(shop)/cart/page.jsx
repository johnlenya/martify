import CartView from '@/components/cart/CartView';
import { getSettings } from '@/lib/catalog';

export const metadata = {
  title: 'Cart',
  description: 'Review the items in your Martify cart and check out securely.',
  robots: { index: false, follow: true },
};

export default async function CartPage() {
  const settings = await getSettings();

  return (
    <div className="container-page py-5 sm:py-7">
      <CartView
        freeDeliveryThresholdCents={settings.free_delivery_threshold_cents}
      />
    </div>
  );
}
