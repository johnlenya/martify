'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/storefront/ProductCard';
import { useI18n } from '@/components/providers/LocaleProvider';

export default function ProductRail({
  id,
  eyebrow,
  title,
  subtitle,
  href,
  products = [],
  className = '',
}) {
  const { t } = useI18n();
  const scrollerRef = useRef(null);

  if (!products.length) return null;

  const scroll = (direction) => {
    const element = scrollerRef.current;
    if (!element) return;
    element.scrollBy({
      left: direction * element.clientWidth * 0.86,
      behavior: 'smooth',
    });
  };

  return (
    <section
      className={`container-page mt-10 sm:mt-12 ${className}`}
      aria-labelledby={id}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h2 id={id} className="section-heading mt-1.5">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1.5 max-w-[520px] text-[11.5px] leading-relaxed text-muted">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {href ? (
            <Link
              href={href}
              className="group hidden items-center gap-1 text-[10.5px] font-semibold text-ink-soft transition hover:text-brand-dark sm:inline-flex"
            >
              {t('home.viewAll')}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : null}
          <div className="hidden gap-1 sm:flex">
            <button
              type="button"
              onClick={() => scroll(-1)}
              className="grid h-8 w-8 place-items-center rounded-full border border-line bg-white text-ink-soft transition hover:border-ink/30 hover:text-ink"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              className="grid h-8 w-8 place-items-center rounded-full border border-line bg-white text-ink-soft transition hover:border-ink/30 hover:text-ink"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="no-scrollbar -mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[45%] max-w-[210px] shrink-0 snap-start sm:w-[calc((100%-2rem)/3)] sm:max-w-none lg:w-[calc((100%-4rem)/5)]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
