import { BadgePercent, Truck } from 'lucide-react';
import CatalogView from '@/components/shop/CatalogView';
import PageIntro from '@/components/shop/PageIntro';
import { getSettings, listProducts } from '@/lib/catalog';
import { formatMoney } from '@/lib/money';
import {
  listingPriceCents,
  parseListingParams,
} from '@/lib/listing';

export const metadata = {
  title: 'Deals',
  description:
    'The biggest discounts on Martify — verified sellers, limited-time offers and everyday low prices across Kenya.',
  alternates: { canonical: '/deals' },
};

export default async function DealsPage({ searchParams }) {
  const rawParams = await searchParams;
  const filters = parseListingParams(rawParams, { defaultSort: 'discount' });
  const price = listingPriceCents(filters);

  const [data, settings] = await Promise.all([
    listProducts({
      brands: filters.brands,
      locations: filters.locations,
      minPrice: price.minPrice,
      maxPrice: price.maxPrice,
      rating: filters.rating || null,
      sort: filters.sort,
      page: filters.page,
      perPage: 24,
      onSale: true,
    }),
    getSettings(),
  ]);

  const maxDiscount = data.products.reduce(
    (best, product) => Math.max(best, product.discountPercent || 0),
    0,
  );

  return (
    <div className="container-page py-5 sm:py-7">
      <PageIntro
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Deals' }]}
        eyebrow="Martify deals"
        title="Deals worth clearing your cart for."
        description="Genuine markdowns from verified sellers across Kenya. When they are gone, they are gone — no fake countdowns, no inflated “was” prices."
        tone="dark"
        children={
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] text-white/60">
              <BadgePercent className="h-3 w-3 text-[#ffb494]" strokeWidth={1.9} />
              <strong className="font-semibold text-white">{data.total}</strong>{' '}
              products on sale
            </span>
            {maxDiscount ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] text-white/60">
                Up to{' '}
                <strong className="font-semibold text-white">
                  {maxDiscount}% off
                </strong>{' '}
                this week
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] text-white/60">
              <Truck className="h-3 w-3 text-[#8fe3b0]" strokeWidth={1.9} />
              Free door delivery over{' '}
              {formatMoney(settings.free_delivery_threshold_cents)}
            </span>
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
          basePath="/deals"
          emptyTitle="No deals match those filters"
          emptyDescription="Try removing a filter, or check back tomorrow for fresh markdowns."
          emptyActionLabel="Browse all products"
          emptyActionHref="/categories"
        />
      </div>
    </div>
  );
}
