import HeaderClient from './HeaderClient';
import { getCurrentUser } from '@/lib/auth';
import { getCategoryTree, getSettings } from '@/lib/catalog';

export default async function SiteHeader() {
  const [categories, settings, currentUser] = await Promise.all([
    getCategoryTree(),
    getSettings(),
    getCurrentUser(),
  ]);

  const user = currentUser
    ? {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        avatarUrl: currentUser.avatarUrl,
        role: currentUser.role,
        seller: currentUser.seller
          ? {
              slug: currentUser.seller.slug,
              storeName: currentUser.seller.storeName,
            }
          : null,
      }
    : null;

  return (
    <HeaderClient
      categories={categories}
      user={user}
      announcement={settings.announcement}
      freeDeliveryThresholdCents={settings.free_delivery_threshold_cents}
    />
  );
}
