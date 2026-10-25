import CategoryStrip from '@/components/storefront/CategoryStrip';
import FlashDeals from '@/components/home/FlashDeals';
import HeroCarousel from '@/components/home/HeroCarousel';
import ProductRail from '@/components/storefront/ProductRail';
import RecentlyViewed from '@/components/storefront/RecentlyViewed';
import SellerCta from '@/components/home/SellerCta';
import StoreShowcase from '@/components/home/StoreShowcase';
import TrustStrip from '@/components/home/TrustStrip';
import { getHomeData } from '@/lib/catalog';
import { getDictionary } from '@/lib/i18n';
import { getLocale } from '@/lib/i18n-server';

export default async function HomePage() {
  const [data, locale] = await Promise.all([getHomeData(), getLocale()]);
  const dict = getDictionary(locale);

  return (
    <>
      <h1 className="sr-only">
        Martify — shop electronics, fashion, home and groceries from verified
        Kenyan sellers
      </h1>

      <HeroCarousel
        banners={data.heroBanners}
        sideBanners={data.sideBanners}
      />

      <CategoryStrip
        categories={data.categories}
        title={dict['home.shopByCategory']}
      />

      <TrustStrip />

      <FlashDeals sale={data.flashSale} products={data.flashProducts} />

      <ProductRail
        id="top-deals-title"
        eyebrow="The shortlist"
        title={dict['home.topDeals']}
        subtitle="The steepest markdowns across the marketplace, refreshed daily."
        href="/deals"
        products={data.topDeals}
      />

      <SellerCta />

      <ProductRail
        id="new-arrivals-title"
        eyebrow="Just landed"
        title={dict['home.newArrivals']}
        subtitle="Fresh drops from verified sellers — be first to browse."
        href="/new"
        products={data.newArrivals}
      />

      <ProductRail
        id="best-sellers-title"
        eyebrow="Kenya’s favourites"
        title={dict['home.bestSellers']}
        subtitle="What shoppers across the country keep coming back for."
        href="/best-sellers"
        products={data.bestSellers}
      />

      <ProductRail
        id="sponsored-title"
        eyebrow="Partner placements"
        title={dict['home.sponsored']}
        subtitle="Promoted listings from Martify sellers. Sponsored products are always labelled."
        products={data.sponsored}
      />

      <StoreShowcase
        stores={data.stores}
        title={dict['home.featuredStores']}
        subtitle="Independent Kenyan businesses with standout finds and service."
      />

      <RecentlyViewed />
    </>
  );
}
