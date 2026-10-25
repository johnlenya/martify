import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import AffiliateDashboard from '@/components/account/AffiliateDashboard';
import PageIntro from '@/components/shop/PageIntro';
import { getCurrentUser } from '@/lib/auth';
import { getAffiliateForUser, getReferredCount } from '@/lib/account';

export const metadata = {
  title: 'Affiliate',
  robots: { index: false, follow: false },
};

export default async function AffiliatePage() {
  const user = await getCurrentUser();
  const affiliate = await getAffiliateForUser(user.id);
  const referredCount = affiliate ? await getReferredCount(user.id) : 0;

  return (
    <div className="space-y-4">
      <PageIntro
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Account', href: '/account' },
          { label: 'Affiliate' },
        ]}
        eyebrow="Share & earn"
        title="Good finds travel fast."
        description="Recommend Martify to your people and earn 2% of the item value when their orders are paid. Simple, tracked and transparent."
        aside={
          <Link href="/affiliate" className="btn btn-outline w-full bg-white/60 sm:w-auto">
            <BookOpen className="h-4 w-4" />
            Programme details
          </Link>
        }
      />
      <AffiliateDashboard affiliate={affiliate} referredCount={referredCount} />
    </div>
  );
}
