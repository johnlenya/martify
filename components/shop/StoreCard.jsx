import Link from 'next/link';
import { ArrowUpRight, MapPin, Package, Star } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';

export default function StoreCard({ store, featured = false }) {
  const initials = store.storeName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      className={`group overflow-hidden rounded-3xl border border-line/70 bg-white/70 transition duration-300 hover:-translate-y-0.5 hover:border-line hover:shadow-card ${
        featured ? 'md:col-span-2' : ''
      }`}
    >
      <Link
        href={`/stores/${store.slug}`}
        className="block"
        aria-label={`Visit ${store.storeName}`}
      >
        <div
          className={`relative bg-night ${
            featured ? 'aspect-[2.3/1] md:aspect-[3.1/1]' : 'aspect-[1.85/1]'
          }`}
        >
          <SmartImage
            src={store.bannerUrl}
            alt={`${store.storeName} storefront`}
            className="absolute inset-0 h-full w-full"
            imageClassName="object-cover opacity-80 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-90"
            sizes={featured ? '(max-width: 768px) 100vw, 900px' : '(max-width: 768px) 100vw, 450px'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/35 to-night/5" />

          <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
            {store.featured ? (
              <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[8.5px] font-semibold uppercase tracking-[0.09em] text-white/80 backdrop-blur">
                Featured store
              </span>
            ) : (
              <span />
            )}
            <span className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-white/10 text-white/70 backdrop-blur transition group-hover:bg-white group-hover:text-ink">
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.9} />
            </span>
          </div>

          <div className="absolute inset-x-4 bottom-4 flex items-end gap-3">
            {store.logoUrl ? (
              <SmartImage
                src={store.logoUrl}
                alt=""
                className="h-12 w-12 shrink-0 rounded-2xl border border-white/20"
                sizes="48px"
              />
            ) : (
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/15 bg-brand/90 font-display text-[14px] font-extrabold tracking-[-0.04em] text-white">
                {initials}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="flex flex-wrap items-center gap-1.5 text-[17px] font-bold leading-tight tracking-[-0.035em] text-white">
                {store.storeName}
                {store.verified ? (
                  <span className="rounded-full bg-leaf/90 px-1.5 py-0.5 text-[7.5px] font-bold uppercase tracking-[0.06em] text-white">
                    Verified
                  </span>
                ) : (
                  <span className="rounded-full border border-white/20 px-1.5 py-0.5 text-[7.5px] font-semibold uppercase tracking-[0.06em] text-white/60">
                    New
                  </span>
                )}
              </h2>
              <p className="mt-0.5 truncate text-[10.5px] text-white/55">
                {store.tagline}
              </p>
            </div>
          </div>
        </div>
      </Link>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-[10px] text-muted">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3 w-3" strokeWidth={1.8} />
          {store.location || store.county || 'Kenya'}
        </span>
        <span className="inline-flex items-center gap-1">
          <Package className="h-3 w-3" strokeWidth={1.8} />
          {store.productCount} products
        </span>
        {store.avgRating > 0 ? (
          <span className="inline-flex items-center gap-1">
            <Star
              className="h-3 w-3 fill-gold text-gold"
              strokeWidth={0}
            />
            {store.avgRating.toFixed(1)}
          </span>
        ) : null}
        <Link
          href={`/stores/${store.slug}`}
          className="ms-auto inline-flex items-center gap-1 text-[10px] font-semibold text-ink-soft transition hover:text-brand-dark"
        >
          Visit store
          <ArrowUpRight className="h-3 w-3" strokeWidth={1.9} />
        </Link>
      </div>
    </article>
  );
}
