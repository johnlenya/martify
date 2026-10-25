import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import CategoryIcon from '@/components/storefront/CategoryIcon';

export default function CategoryStrip({ categories = [], title = 'Shop by category' }) {
  if (!categories.length) return null;

  return (
    <section className="container-page mt-3">
      <div className="card px-3 py-4 sm:px-5 sm:py-5">
        <div className="flex items-center justify-between gap-3 px-1">
          <h2 className="text-[11.5px] font-bold tracking-[-0.01em] text-ink">
            {title}
          </h2>
          <Link
            href="/categories"
            className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-muted transition hover:text-brand-dark"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="no-scrollbar mt-3 grid grid-flow-col auto-cols-[82px] gap-1 overflow-x-auto sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-9 sm:gap-0">
          {categories.slice(0, 9).map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group flex flex-col items-center gap-2 rounded-xl px-1 py-2 text-center transition hover:bg-cream"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-sand text-ink-soft transition duration-300 group-hover:-translate-y-0.5 group-hover:bg-brand-soft group-hover:text-brand-dark">
                <CategoryIcon name={category.icon} className="h-[18px] w-[18px]" />
              </span>
              <span className="line-clamp-2 text-[10px] font-semibold leading-[1.25] text-ink-soft transition group-hover:text-ink">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
