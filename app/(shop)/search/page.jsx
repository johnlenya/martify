import Link from 'next/link';
import { ArrowRight, Search, TrendingUp } from 'lucide-react';
import CatalogView from '@/components/shop/CatalogView';
import PageIntro from '@/components/shop/PageIntro';
import CategoryIcon from '@/components/storefront/CategoryIcon';
import ProductRail from '@/components/storefront/ProductRail';
import {
  fetchProductSection,
  getCategoryTree,
  listProducts,
} from '@/lib/catalog';
import {
  listingPriceCents,
  parseListingParams,
} from '@/lib/listing';

export const metadata = {
  title: 'Search',
  description:
    'Search thousands of products from verified Kenyan sellers on Martify.',
  robots: { index: false, follow: true },
};

const TRENDING = [
  'Wireless earbuds',
  'Sneakers',
  'Skincare',
  'Blenders',
  'Laptop bags',
  'Smart TV',
];

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const filters = parseListingParams(params);
  const price = listingPriceCents(filters);

  if (!filters.q) {
    const [categories, popular] = await Promise.all([
      getCategoryTree(),
      fetchProductSection({
        order: 'p.sold_count DESC, p.rating DESC',
        limit: 10,
      }),
    ]);

    return (
      <div className="container-page py-5 sm:py-7">
        <PageIntro
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Search' }]}
          eyebrow="Find anything"
          title="What are you looking for today?"
          description="Search across thousands of finds from verified Kenyan sellers — electronics, fashion, home, beauty and more."
        >
          <form
            action="/search"
            method="get"
            role="search"
            className="relative max-w-xl"
          >
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <input
              type="search"
              name="q"
              placeholder="Search products, brands and stores"
              aria-label="Search Martify"
              className="input h-12 rounded-full pl-11 pr-28 text-[13px]"
            />
            <button
              type="submit"
              className="btn btn-primary absolute right-1.5 top-1/2 h-9 -translate-y-1/2 px-4"
            >
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-muted">
              <TrendingUp className="h-3 w-3" strokeWidth={1.8} />
              Trending
            </span>
            {TRENDING.map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="chip transition hover:border-brand/40 hover:text-brand-dark"
              >
                {term}
              </Link>
            ))}
          </div>
        </PageIntro>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-3">
            <h2 className="section-heading">Browse by category</h2>
            <Link
              href="/categories"
              className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-ink-soft transition hover:text-brand-dark"
            >
              All categories <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group flex items-center gap-3 rounded-2xl border border-line/70 bg-white/60 p-3 transition hover:border-line hover:bg-white hover:shadow-card"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sand text-ink-soft transition group-hover:bg-brand-soft group-hover:text-brand-dark">
                  <CategoryIcon
                    name={category.icon}
                    className="h-[18px] w-[18px]"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[11.5px] font-semibold text-ink">
                    {category.name}
                  </span>
                  <span className="mt-0.5 block text-[9.5px] text-muted">
                    {category.productCount} products
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <ProductRail
          id="search-popular"
          eyebrow="Popular now"
          title="What Kenya is buying"
          href="/best-sellers"
          products={popular}
          className="!px-0 sm:!px-0"
        />
      </div>
    );
  }

  const data = await listProducts({
    q: filters.q,
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
          { label: 'Search', href: '/search' },
          { label: `“${filters.q}”` },
        ]}
        eyebrow="Search results"
        title={`Results for “${filters.q}”`}
        description={`${data.total.toLocaleString()} ${
          data.total === 1 ? 'product matches' : 'products match'
        } your search. Refine with filters or try another phrase.`}
      >
        <form
          action="/search"
          method="get"
          role="search"
          className="relative max-w-xl"
        >
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            strokeWidth={1.8}
            aria-hidden="true"
          />
          <input
            type="search"
            name="q"
            defaultValue={filters.q}
            placeholder="Search products, brands and stores"
            aria-label="Search Martify"
            className="input h-11 rounded-full pl-11 pr-28 text-[12.5px]"
          />
          <button
            type="submit"
            className="btn btn-primary absolute right-1.5 top-1/2 h-8 -translate-y-1/2 px-4 text-[11px]"
          >
            Search
          </button>
        </form>
      </PageIntro>

      <div className="mt-6">
        <CatalogView
          products={data.products}
          total={data.total}
          page={data.page}
          pages={data.pages}
          brands={data.brands}
          locations={data.locations}
          filters={filters}
          basePath="/search"
          emptyTitle={`No matches for “${filters.q}”`}
          emptyDescription="Try a different spelling, a broader phrase, or remove a filter."
          emptyActionLabel="Browse all categories"
          emptyActionHref="/categories"
        />
      </div>
    </div>
  );
}
