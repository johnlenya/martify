import Link from 'next/link';
import { Compass } from 'lucide-react';
import AddressBook from '@/components/account/AddressBook';
import PageIntro from '@/components/shop/PageIntro';
import { getCurrentUser } from '@/lib/auth';
import { listAddresses } from '@/lib/account';

export const metadata = {
  title: 'Addresses',
  robots: { index: false, follow: false },
};

export default async function AddressesPage() {
  const user = await getCurrentUser();
  const addresses = await listAddresses(user.id);

  return (
    <div className="space-y-4">
      <PageIntro
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Account', href: '/account' },
          { label: 'Addresses' },
        ]}
        eyebrow="Delivery details"
        title="Places we can find you."
        description="Save the spots where parcels should land. Choose a default so checkout takes seconds."
        aside={
          <Link href="/deals" className="btn btn-outline w-full bg-white/60 sm:w-auto">
            <Compass className="h-4 w-4" />
            Keep shopping
          </Link>
        }
      />
      <AddressBook addresses={addresses} userName={user.name} />
    </div>
  );
}
