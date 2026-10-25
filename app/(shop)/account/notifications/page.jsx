import Link from 'next/link';
import { Radar } from 'lucide-react';
import NotificationsList from '@/components/account/NotificationsList';
import PageIntro from '@/components/shop/PageIntro';
import { getCurrentUser } from '@/lib/auth';
import { listNotifications } from '@/lib/account';

export const metadata = {
  title: 'Notifications',
  robots: { index: false, follow: false },
};

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  const notifications = await listNotifications(user.id);

  return (
    <div className="space-y-4">
      <PageIntro
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Account', href: '/account' },
          { label: 'Notifications' },
        ]}
        eyebrow="Your updates"
        title="What is moving."
        description="Order milestones, payment confirmations and return decisions — without the noise."
        aside={
          <Link href="/track" className="btn btn-outline w-full bg-white/60 sm:w-auto">
            <Radar className="h-4 w-4" />
            Track an order
          </Link>
        }
      />
      <NotificationsList notifications={notifications} />
    </div>
  );
}
