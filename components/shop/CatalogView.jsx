import { PackageSearch } from 'lucide-react';
import ProductCard from '@/components/storefront/ProductCard';
import ProductFilters from '@/components/shop/ProductFilters';
import ListingToolbar from '@/components/shop/ListingToolbar';
import Pagination from '@/components/shop/Pagination';
import EmptyState from '@/components/ui/EmptyState';

export default function CatalogView({
  products,
  total,
  page,
  pages,
  brands = [],
  locations = [],
  filters,
  basePath,
  emptyTitle = 'No products found',
  emptyDescription = 'Try removing a filter or searching for something else.',
  emptyActionLabel,
  emptyActionHref,
}) {
  const list = filters.view === 'list';

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[234px_minmax(0,1fr)]">
      <ProductFilters
        basePath={basePath}
        filters={filters}
        brands={brands}
        locations={locations}
      />

      <div className="min-w-0">
        <ListingToolbar
          basePath={basePath}
          filters={filters}
          count={total}
          brands={brands}
          locations={locations}
        />

        <div id="catalog-results" className="mt-4 scroll-mt-28">
          {products.length ? (
            <div
              className={
                list
                  ? 'flex flex-col gap-3'
                  : 'grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4'
              }
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  layout={list ? 'list' : 'grid'}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={PackageSearch}
              title={emptyTitle}
              description={emptyDescription}
              actionLabel={emptyActionLabel}
              actionHref={emptyActionHref}
            />
          )}
        </div>

        <Pagination
          basePath={basePath}
          filters={filters}
          page={page}
          pages={pages}
        />
      </div>
    </div>
  );
}
