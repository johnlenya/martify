import PageIntro from '@/components/shop/PageIntro';
import WishlistView from '@/components/wishlist/WishlistView';

export const metadata = {
  title: 'Wishlist',
  description:
    'Your saved finds on Martify. Keep an eye on prices and come back when you are ready.',
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return (
    <div className="container-page py-5 sm:py-7">
      <PageIntro
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Wishlist' }]}
        eyebrow="Saved for later"
        title="Your shortlist, kept close."
        description="Everything you have hearted on Martify. Prices and stock update automatically — hearts sync when you sign in."
      />
      <div className="mt-5">
        <WishlistView />
      </div>
    </div>
  );
}
