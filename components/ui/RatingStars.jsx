import { Star } from 'lucide-react';
import { formatRating } from '@/lib/money';

export default function RatingStars({
  value = 0,
  count = null,
  size = 11,
  showValue = true,
  label = true,
}) {
  const rounded = Math.round(Number(value || 0));
  return (
    <span
      className="inline-flex items-center gap-1.5"
      aria-label={
        label
          ? `Rated ${formatRating(value)} out of 5${count !== null ? ` from ${count} ratings` : ''}`
          : undefined
      }
    >
      <span className="flex items-center gap-[1px]">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            style={{ width: size, height: size }}
            className={
              star <= rounded
                ? 'fill-[#E7A93E] text-[#E7A93E]'
                : 'fill-transparent text-[#D9D1C4]'
            }
            strokeWidth={1.6}
          />
        ))}
      </span>
      {showValue ? (
        <span className="text-[11px] font-semibold text-ink-soft">
          {formatRating(value)}
        </span>
      ) : null}
      {count !== null ? (
        <span className="text-[10.5px] text-muted">({count})</span>
      ) : null}
    </span>
  );
}
