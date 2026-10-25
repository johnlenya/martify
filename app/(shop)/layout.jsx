import SiteFooter from '@/components/storefront/SiteFooter';
import SiteHeader from '@/components/storefront/SiteHeader';

export const dynamic = 'force-dynamic';

export default function ShopLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-night focus:px-4 focus:py-2 focus:text-[12px] focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
