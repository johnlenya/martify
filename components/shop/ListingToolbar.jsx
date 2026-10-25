'use client';

import { useRouter } from 'next/navigation';
import { LayoutGrid, List, X } from 'lucide-react';
import ProductFilters from '@/components/shop/ProductFilters';
import {
  LISTING_SORTS,
  activeFilterCount,
  listingHref,
} from '@/lib/listing';
import { formatMoney } from '@/lib/money';

export default function ListingToolbar({
  basePath,
  filters,
  count,
  brands = [],
  locations = [],
}) {
  const router = useRouter();
  const update = (patch) =>
    router.push(listingHref(basePath, { ...filters, ...patch }));

  const chips = [];
  for (const brand of filters.brands) {
    chips.push({
      key: `brand-${brand}`,
      label: brand,
      remove: () =>
        update({
          brands: filters.brands.filter((item) => item !== brand),
          page: 1,
        }),
    });
  }
  for (const location of filters.locations) {
    chips.push({
      key: `location-${location}`,
      label: location,
      remove: () =>
        update({
          locations: filters.locations.filter((item) => item !== location),
          page: 1,
        }),
    });
  }
  if (filters.min || filters.max) {
    let label = 'Any price';
    if (filters.min && filters.max) {
      label = `${formatMoney(Number(filters.min) * 100)} – ${formatMoney(Number(filters.max) * 100)}`;
    } else if (filters.min) {
      label = `From ${formatMoney(Number(filters.min) * 100)}`;
    } else {
      label = `Under ${formatMoney(Number(filters.max) * 100)}`;
    }
    chips.push({
      key: 'price',
      label,
      remove: () => update({ min: '', max: '', page: 1 }),
    });
  }
  if (filters.rating) {
    chips.push({
      key: 'rating',
      label: `${filters.rating}★ & up`,
      remove: () => update({ rating: '', page: 1 }),
    });
  }

  const filterCount = activeFilterCount(filters);

  return (
    <div className="rounded-2xl border border-line/70 bg-white/70 p-2.5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-2">
        <ProductFilters
          mobile
          basePath={basePath}
          filters={filters}
          brands={brands}
          locations={locations}
        />

        <p className="px-1 text-[11px] text-muted">
          <span className="font-semibold text-ink">{count.toLocaleString()}</span>{' '}
          {count === 1 ? 'product' : 'products'}
        </p>

        <div className="ms-auto flex items-center gap-2">
          <label htmlFor="listing-sort" className="sr-only">
            Sort products
          </label>
          <select
            id="listing-sort"
            value={filters.sort}
            onChange={(event) =>
              update({ sort: event.target.value, page: 1 })
            }
            className="select h-9 w-[164px] py-1.5 text-[11px]"
          >
            {LISTING_SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="flex items-center rounded-full border border-line bg-white p-0.5">
            <button
              type="button"
              onClick={() => update({ view: 'grid' })}
              aria-label="Grid view"
              aria-pressed={filters.view === 'grid'}
              className={`grid h-8 w-8 place-items-center rounded-full transition ${
                filters.view === 'grid'
                  ? 'bg-night text-white'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.9} />
            </button>
            <button
              type="button"
              onClick={() => update({ view: 'list' })}
              aria-label="List view"
              aria-pressed={filters.view === 'list'}
              className={`grid h-8 w-8 place-items-center rounded-full transition ${
                filters.view === 'list'
                  ? 'bg-night text-white'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <List className="h-3.5 w-3.5" strokeWidth={1.9} />
            </button>
          </div>
        </div>
      </div>

      {chips.length ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-line/60 px-1 pt-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.remove}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-2 py-1 text-[9.5px] font-medium text-ink-soft transition hover:border-brand/40 hover:text-brand-dark"
            >
              {chip.label}
              <X className="h-2.5 w-2.5" strokeWidth={2.2} />
            </button>
          ))}
          {filterCount > 1 ? (
            <button
              type="button"
              onClick={() =>
                update({
                  brands: [],
                  locations: [],
                  min: '',
                  max: '',
                  rating: '',
                  page: 1,
                })
              }
              className="ms-1 text-[9.5px] font-semibold text-brand-dark underline-offset-2 transition hover:underline"
            >
              Clear all
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
