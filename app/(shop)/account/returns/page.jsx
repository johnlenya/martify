import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import ReturnsManager from '@/components/account/ReturnsManager';
import PageIntro from '@/components/shop/PageIntro';
import { getCurrentUser } from '@/lib/auth';
import { listReturnableItems, listUserReturns } from '@/lib/account';

export const metadata = {
  title: 'Returns',
  robots: { index: false, follow: false },
};

export default async function ReturnsPage() {
  const user = await getCurrentUser();
  const [returns, eligibleItems] = await Promise.all([
    listUserReturns(user.id),
    listReturnableItems(user.id),
  ]);

  return (
    <div className="space-y-4">
      <PageIntro
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Account', href: '/account' },
          { label: 'Returns' },
        ]}
        eyebrow="Buyer protection"
        title="If it is not right, we will help."
        description="Start a return on a delivered order, then follow the decision here. Demo refunds are simulated and clearly marked."
        aside={
          <Link href="/returns" className="btn btn-outline w-full bg-white/60 sm:w-auto">
            <ShieldCheck className="h-4 w-4" />
            Read the policy
          </Link>
        }
      />
      <ReturnsManager returns={returns} eligibleItems={eligibleItems} />
    </div>
  );
}
