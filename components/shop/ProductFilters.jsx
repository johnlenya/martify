'use client';

import { useEffect, useId, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, SlidersHorizontal, Star } from 'lucide-react';
import Drawer from '@/components/ui/Drawer';
import {
  activeFilterCount,
  listingHref,
} from '@/lib/listing';

function draftFrom(filters) {
  return {
    brands: [...filters.brands],
    locations: [...filters.locations],
    min: filters.min,
    max: filters.max,
    rating: filters.rating,
  };
}

function filtersSignature(filters) {
  return JSON.stringify({
    brands: filters.brands,
    locations: filters.locations,
    min: filters.min,
    max: filters.max,
    rating: filters.rating,
  });
}

function CheckRow({ checked, onChange, children }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-[11.5px] text-ink-soft transition hover:text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-line accent-[#ed5a22]"
      />
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </label>
  );
}

function FiltersForm({
  formId,
  basePath,
  filters,
  brands,
  locations,
  hideSubmit = false,
  onApplied,
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState(() => draftFrom(filters));
  const count = activeFilterCount(draft);

  useEffect(() => {
    setDraft(draftFrom(filters));
    // Reset drafts only when the applied filters actually change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersSignature(filters)]);

  function toggle(field, value) {
    setDraft((current) => ({
      ...current,
      [field]: current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : [...current[field], value],
    }));
  }

  function apply(event) {
    event.preventDefault();
    const next = {
      ...filters,
      ...draft,
      page: 1,
    };
    startTransition(() => {
      router.push(listingHref(basePath, next));
    });
    onApplied?.();
  }

  function clearAll() {
    const next = {
      ...filters,
      brands: [],
      locations: [],
      min: '',
      max: '',
      rating: '',
      page: 1,
    };
    setDraft(draftFrom(next));
    startTransition(() => {
      router.push(listingHref(basePath, next));
    });
    onApplied?.();
  }

  return (
    <form id={formId} onSubmit={apply} className="flex flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line/70 pb-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink">
          Filters
        </p>
        {count > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-[10px] font-semibold text-brand-dark transition hover:text-brand"
          >
            Clear all ({count})
          </button>
        ) : null}
      </div>

      <fieldset className="border-b border-line/70 py-4">
        <legend className="text-[10.5px] font-semibold text-ink">
          Price range
        </legend>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-[9px] font-medium uppercase tracking-[0.08em] text-muted">
              Min (KSh)
            </span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="50"
              value={draft.min}
              onChange={(event) =>
                setDraft((current) => ({ ...current, min: event.target.value }))
              }
              placeholder="0"
              className="input px-2.5 py-2 text-[11px]"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[9px] font-medium uppercase tracking-[0.08em] text-muted">
              Max (KSh)
            </span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="50"
              value={draft.max}
              onChange={(event) =>
                setDraft((current) => ({ ...current, max: event.target.value }))
              }
              placeholder="Any"
              className="input px-2.5 py-2 text-[11px]"
            />
          </label>
        </div>
      </fieldset>

      {brands.length ? (
        <fieldset className="border-b border-line/70 py-4">
          <legend className="text-[10.5px] font-semibold text-ink">Brand</legend>
          <div className="mt-1.5 max-h-48 space-y-0.5 overflow-y-auto pr-1">
            {brands.map((brand) => (
              <CheckRow
                key={brand}
                checked={draft.brands.includes(brand)}
                onChange={() => toggle('brands', brand)}
              >
                {brand}
              </CheckRow>
            ))}
          </div>
        </fieldset>
      ) : null}

      <fieldset className="border-b border-line/70 py-4">
        <legend className="text-[10.5px] font-semibold text-ink">
          Customer rating
        </legend>
        <div className="mt-2 space-y-1">
          {[
            { value: '', label: 'Any rating' },
            { value: 4, label: '4 stars & up' },
            { value: 3, label: '3 stars & up' },
            { value: 2, label: '2 stars & up' },
          ].map((option) => (
            <label
              key={String(option.value)}
              className="flex cursor-pointer items-center gap-2.5 py-1 text-[11.5px] text-ink-soft transition hover:text-ink"
            >
              <input
                type="radio"
                name={`rating-${formId}`}
                checked={String(draft.rating) === String(option.value)}
                onChange={() =>
                  setDraft((current) => ({
                    ...current,
                    rating: option.value,
                  }))
                }
                className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-[#ed5a22]"
              />
              <span className="flex items-center gap-1">
                {option.value ? (
                  <Star
                    className="h-3 w-3 fill-gold text-gold"
                    strokeWidth={0}
                  />
                ) : null}
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {locations.length ? (
        <fieldset className="py-4">
          <legend className="text-[10.5px] font-semibold text-ink">
            Seller county
          </legend>
          <div className="mt-1.5 max-h-44 space-y-0.5 overflow-y-auto pr-1">
            {locations.map((location) => (
              <CheckRow
                key={location}
                checked={draft.locations.includes(location)}
                onChange={() => toggle('locations', location)}
              >
                {location}
              </CheckRow>
            ))}
          </div>
        </fieldset>
      ) : null}

      {!hideSubmit ? (
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary mt-1 w-full"
        >
          {pending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Applying…
            </>
          ) : (
            'Apply filters'
          )}
        </button>
      ) : null}
    </form>
  );
}

function MobileFilters(props) {
  const [open, setOpen] = useState(false);
  const formId = useId();
  const count = activeFilterCount(props.filters);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-outline btn-sm lg:hidden"
        aria-haspopup="dialog"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.8} />
        Filters
        {count > 0 ? (
          <span className="grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">
            {count}
          </span>
        ) : null}
      </button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side="left"
        title="Filters"
        eyebrow="Refine results"
        width="max-w-sm"
        footer={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn btn-outline flex-1"
            >
              Close
            </button>
            <button
              type="submit"
              form={formId}
              className="btn btn-primary flex-1"
            >
              Show results
            </button>
          </div>
        }
      >
        <div className="p-5">
          <FiltersForm
            formId={formId}
            {...props}
            hideSubmit
            onApplied={() => setOpen(false)}
          />
        </div>
      </Drawer>
    </>
  );
}

export default function ProductFilters({ mobile = false, ...props }) {
  if (mobile) return <MobileFilters {...props} />;

  const formId = useId();
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-28 rounded-2xl border border-line/70 bg-[#fffdfa] p-4 shadow-[0_24px_60px_-58px_rgba(23,23,20,0.45)]">
        <FiltersForm formId={formId} {...props} />
      </div>
    </aside>
  );
}
