'use client';

import { Minus, Plus } from 'lucide-react';

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  label = 'Quantity',
}) {
  const sizeClass =
    size === 'sm'
      ? 'h-7 w-7'
      : size === 'lg'
        ? 'h-10 w-10'
        : 'h-8 w-8';

  return (
    <div
      className="inline-flex items-center rounded-full border border-line bg-white p-0.5"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`grid ${sizeClass} place-items-center rounded-full text-ink-soft transition hover:bg-sand disabled:opacity-30`}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      <span
        className={`min-w-7 text-center text-[12px] font-semibold tabular-nums text-ink`}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`grid ${sizeClass} place-items-center rounded-full text-ink-soft transition hover:bg-sand disabled:opacity-30`}
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}
