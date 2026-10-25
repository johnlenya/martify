import PageIntro from '@/components/shop/PageIntro';
import TrackOrderForm from '@/components/orders/TrackOrderForm';

export const metadata = {
  title: 'Track your order',
  description:
    'Follow your Martify order from placed to delivered using your order number and contact details.',
  robots: { index: true, follow: true },
};

export default function TrackPage() {
  return (
    <div className="container-page py-5 sm:py-7">
      <PageIntro
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Track order' },
        ]}
        eyebrow="Delivery updates"
        title="Where is my order?"
        description="Enter the order number from your confirmation and the email or phone used at checkout. We will show you exactly where your parcel is."
      />
      <div className="mt-5">
        <TrackOrderForm />
      </div>
    </div>
  );
}
