import Link from 'next/link';
import { notFound } from 'next/navigation';
import CatalogView from '@/components/shop/CatalogView';
import PageIntro from '@/components/shop/PageIntro';
import CategoryIcon from '@/components/storefront/CategoryIcon';
import {
  getCategoryBySlug,
  getCategoryTree,
  listProducts,
} from '@/lib/catalog';
import {
  listingPriceCents,
  parseListingParams,
} from '@/lib/listing';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    return { title: 'Category not found' };
  }
  const parent = category.parent ? `${category.parent.name} · ` : '';
  return {
    title: `${parent}${category.name}`,
    description: `Shop ${category.name.toLowerCase()} from verified sellers across Kenya. Compare prices and pay with M-Pesa, card or cash on delivery on Martify.`,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const rawParams = await searchParams;
  const filters = parseListingParams(rawParams);
  const price = listingPriceCents(filters);

  const [data, tree] = await Promise.all([
    listProducts({
      categorySlug: slug,
      brands: filters.brands,
      locations: filters.locations,
      minPrice: price.minPrice,
      maxPrice: price.maxPrice,
      rating: filters.rating || null,
      sort: filters.sort,
      page: filters.page,
      perPage: 24,
    }),
    getCategoryTree(),
  ]);

  let parent = category.parent || null;
  let children = category.children || [];
  if (parent) {
    const parentNode = tree.find((node) => node.id === parent.id);
    children = parentNode?.children || [];
  }
  const basePath = `/category/${category.slug}`;
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    ...(parent
      ? [
          {
            label: parent.name,
            href: `/category/${parent.slug}`,
          },
        ]
      : []),
    { label: category.name },
  ];

  return (
    <div className="container-page py-5 sm:py-7">
      <PageIntro
        breadcrumbs={breadcrumbs}
        eyebrow={parent ? parent.name : 'Category'}
        title={category.name}
        description={`Shop ${category.name.toLowerCase()} from verified sellers across Kenya. Honest prices, buyer protection and delivery to your door.`}
        aside={
          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-line/70 bg-white/70 p-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand-dark">
              <CategoryIcon
                name={category.icon}
                className="h-5 w-5"
              />
            </span>
            <div>
              <p className="text-[8.5px] font-semibold uppercase tracking-[0.12em] text-muted">
                In this category
              </p>
              <p className="mt-0.5 text-[13px] font-bold text-ink">
                {data.total.toLocaleString()}{' '}
                {data.total === 1 ? 'product' : 'products'}
              </p>
            </div>
          </div>
        }
      >
        {children.length ? (
          <div className="flex flex-wrap gap-1.5">
            <Link
              href={`/category/${parent ? parent.slug : category.slug}`}
              className={`chip transition ${
                parent
                  ? 'hover:border-ink/30 hover:text-ink'
                  : 'border-night bg-night text-white'
              }`}
            >
              {parent ? `All ${parent.name}` : category.name}
            </Link>
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/category/${child.slug}`}
                className={`chip transition ${
                  child.slug === category.slug
                    ? 'border-night bg-night text-white'
                    : 'hover:border-ink/30 hover:text-ink'
                }`}
              >
                {child.name}
              </Link>
            ))}
          </div>
        ) : null}
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
          basePath={basePath}
          emptyTitle={`Nothing in ${category.name} matches those filters`}
          emptyDescription="Try widening your price range or clearing a filter."
          emptyActionLabel="Browse all categories"
          emptyActionHref="/categories"
        />
      </div>
    </div>
  );
}
