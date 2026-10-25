import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { listingHref } from '@/lib/listing';

function pageItems(current, pages) {
  if (pages <= 7) {
    return Array.from({ length: pages }, (_, index) => index + 1);
  }
  const values = new Set([1, pages, current - 1, current, current + 1]);
  if (current <= 4) {
    values.add(2);
    values.add(3);
    values.add(4);
    values.add(5);
  }
  if (current >= pages - 3) {
    values.add(pages - 1);
    values.add(pages - 2);
    values.add(pages - 3);
    values.add(pages - 4);
  }
  const sorted = [...values]
    .filter((value) => value >= 1 && value <= pages)
    .sort((a, b) => a - b);
  const items = [];
  let previous = 0;
  for (const value of sorted) {
    if (previous && value - previous > 1) items.push(`gap-${value}`);
    items.push(value);
    previous = value;
  }
  return items;
}

export default function Pagination({ basePath, filters, page, pages }) {
  if (!pages || pages <= 1) return null;

  const href = (target) =>
    `${listingHref(basePath, { ...filters, page: target })}#catalog-results`;

  return (
    <nav
      aria-label="Product pagination"
      className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
    >
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          className="inline-flex h-9 items-center gap-1 rounded-full border border-line bg-white px-3 text-[11px] font-semibold text-ink-soft transition hover:border-ink hover:text-ink"
          rel="prev"
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Prev
        </Link>
      ) : null}

      {pageItems(page, pages).map((item) =>
        typeof item === 'string' ? (
          <span
            key={item}
            className="grid h-9 w-7 place-items-center text-[11px] text-muted"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <Link
            key={item}
            href={href(item)}
            aria-current={item === page ? 'page' : undefined}
            className={`grid h-9 min-w-9 place-items-center rounded-full px-2 text-[11px] font-semibold transition ${
              item === page
                ? 'bg-night text-white'
                : 'border border-line bg-white text-ink-soft hover:border-ink hover:text-ink'
            }`}
          >
            {item}
          </Link>
        ),
      )}

      {page < pages ? (
        <Link
          href={href(page + 1)}
          className="inline-flex h-9 items-center gap-1 rounded-full border border-line bg-white px-3 text-[11px] font-semibold text-ink-soft transition hover:border-ink hover:text-ink"
          rel="next"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      ) : null}

      <p className="ms-2 text-[10.5px] text-muted">
        Page {page} of {pages}
      </p>
    </nav>
  );
}
