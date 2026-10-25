import { TrendingUp } from 'lucide-react';
import CatalogView from '@/components/shop/CatalogView';
import PageIntro from '@/components/shop/PageIntro';
import { listProducts } from '@/lib/catalog';
import {
  listingPriceCents,
  parseListingParams,
} from '@/lib/listing';

export const metadata = {
  title: 'Best sellers',
  description:
    'The most-bought products on Martify this week — trusted by thousands of shoppers across Kenya.',
  alternates: { canonical: '/best-sellers' },
};

export default async function BestSellersPage({ searchParams }) {
  const rawParams = await searchParams;
  const filters = parseListingParams(rawParams);
  const price = listingPriceCents(filters);

  const data = await listProducts({
    brands: filters.brands,
    locations: filters.locations,
    minPrice: price.minPrice,
    maxPrice: price.maxPrice,
    rating: filters.rating || null,
    sort: filters.sort,
    page: filters.page,
    perPage: 24,
  });

  return (
    <div className="container-page py-5 sm:py-7">
      <PageIntro
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Best sellers' },
        ]}
        eyebrow="Most loved"
        title="What Kenya is buying right now."
        description="Ranked by real orders from real shoppers. The products people keep coming back for — tried, tested and delivered."
        aside={
          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-line/70 bg-white/70 p-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand-dark">
              <TrendingUp className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <div>
              <p className="text-[8.5px] font-semibold uppercase tracking-[0.12em] text-muted">
                Ranked by
              </p>
              <p className="mt-0.5 text-[13px] font-bold text-ink">
                Verified orders
              </p>
            </div>
          </div>
        }
      />

      <div className="mt-6">
        <CatalogView
          products={data.products}
          total={data.total}
          page={data.page}
          pages={data.pages}
          brands={data.brands}
          locations={data.locations}
          filters={filters}
          basePath="/best-sellers"
          emptyTitle="No best sellers match those filters"
          emptyDescription="Clear a filter to see Kenya’s most-bought products."
          emptyActionLabel="Browse all categories"
          emptyActionHref="/categories"
        />
      </div>
    </div>
  );
}
