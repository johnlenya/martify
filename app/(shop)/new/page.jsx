import { Sparkles } from 'lucide-react';
import CatalogView from '@/components/shop/CatalogView';
import PageIntro from '@/components/shop/PageIntro';
import { listProducts } from '@/lib/catalog';
import {
  listingPriceCents,
  parseListingParams,
} from '@/lib/listing';

export const metadata = {
  title: 'New arrivals',
  description:
    'The latest products to land on Martify from verified Kenyan sellers — shop new electronics, fashion, home and beauty finds.',
  alternates: { canonical: '/new' },
};

export default async function NewArrivalsPage({ searchParams }) {
  const rawParams = await searchParams;
  const filters = parseListingParams(rawParams, { defaultSort: 'newest' });
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
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'New in' }]}
        eyebrow="Just landed"
        title="New arrivals, straight from the source."
        description="Fresh stock from verified sellers across Kenya. Be the first to get your hands on it before it trends."
        aside={
          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-line/70 bg-white/70 p-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-leaf-soft text-leaf">
              <Sparkles className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <div>
              <p className="text-[8.5px] font-semibold uppercase tracking-[0.12em] text-muted">
                Updated
              </p>
              <p className="mt-0.5 text-[13px] font-bold text-ink">
                Every day
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
          basePath="/new"
          emptyTitle="No new arrivals match those filters"
          emptyDescription="Clear a filter to see the latest stock across Martify."
          emptyActionLabel="Browse all categories"
          emptyActionHref="/categories"
        />
      </div>
    </div>
  );
}
