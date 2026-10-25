import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Search } from 'lucide-react';
import PageIntro from '@/components/shop/PageIntro';
import CategoryIcon from '@/components/storefront/CategoryIcon';
import { getCategoryTree } from '@/lib/catalog';

export const metadata = {
  title: 'All categories',
  description:
    'Browse every department on Martify — phones, electronics, fashion, home, beauty, groceries, sports, baby and appliances.',
  alternates: { canonical: '/categories' },
};

export default async function CategoriesPage() {
  const tree = await getCategoryTree();
  const childCount = tree.reduce(
    (sum, parent) => sum + parent.children.length,
    0,
  );

  return (
    <div className="container-page py-5 sm:py-7">
      <PageIntro
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Categories' }]}
        eyebrow="Marketplace departments"
        title="Every aisle. One place."
        description="From your next phone to this week’s groceries — explore every department on Martify, all sold by verified Kenyan businesses."
        aside={
          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-line/70 bg-white/70 p-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand-dark">
              <CategoryIcon name="shopping-basket" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[8.5px] font-semibold uppercase tracking-[0.12em] text-muted">
                To explore
              </p>
              <p className="mt-0.5 text-[13px] font-bold text-ink">
                {tree.length} departments · {childCount} aisles
              </p>
            </div>
          </div>
        }
        children={
          <form action="/search" method="get" role="search" className="relative max-w-md">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <input
              type="search"
              name="q"
              placeholder="Search within all categories"
              aria-label="Search within all categories"
              className="input h-10 rounded-full pl-10 pr-24 text-[12px]"
            />
            <button
              type="submit"
              className="btn btn-primary absolute right-1.5 top-1/2 h-7 -translate-y-1/2 px-3.5 text-[10.5px]"
            >
              Search
            </button>
          </form>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tree.map((category) => (
          <article
            key={category.id}
            className="group flex flex-col rounded-3xl border border-line/70 bg-white/70 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-line hover:bg-white hover:shadow-card sm:p-5"
          >
            <Link
              href={`/category/${category.slug}`}
              className="flex items-start gap-3"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sand text-ink-soft transition duration-300 group-hover:bg-brand-soft group-hover:text-brand-dark">
                <CategoryIcon
                  name={category.icon}
                  className="h-5 w-5"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-[15px] font-bold tracking-[-0.03em] text-ink">
                    {category.name}
                  </span>
                  <ArrowUpRight
                    className="h-3.5 w-3.5 text-muted opacity-0 transition group-hover:opacity-100"
                    strokeWidth={1.9}
                  />
                </span>
                <span className="mt-0.5 block text-[10px] text-muted">
                  {category.productCount.toLocaleString()}{' '}
                  {category.productCount === 1 ? 'product' : 'products'}
                </span>
              </span>
            </Link>

            {category.children.length ? (
              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-line/60 pt-3.5">
                {category.children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/category/${child.slug}`}
                    className="rounded-full border border-line/70 bg-cream/70 px-2.5 py-1 text-[9.5px] font-medium text-ink-soft transition hover:border-brand/40 hover:bg-brand-soft hover:text-brand-dark"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-3xl bg-night p-6 text-white sm:flex-row sm:items-center sm:p-7">
        <div>
          <p className="eyebrow text-white/40">Still looking?</p>
          <h2 className="mt-1.5 text-[20px] font-bold tracking-[-0.04em]">
            Search the whole marketplace.
          </h2>
          <p className="mt-1 max-w-md text-[11.5px] leading-relaxed text-white/50">
            Thousands of products from verified sellers, all in one search.
          </p>
        </div>
        <Link
          href="/search"
          className="btn btn-primary shrink-0"
        >
          Start searching
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
