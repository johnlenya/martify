import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, MapPin } from 'lucide-react';
import RatingStars from '@/components/ui/RatingStars';
import SmartImage from '@/components/ui/SmartImage';

const GRADIENTS = [
  'linear-gradient(135deg, #f0e5d5 0%, #dcc8ac 100%)',
  'linear-gradient(135deg, #e8ebdf 0%, #c4cfb3 100%)',
  'linear-gradient(135deg, #f4e3d8 0%, #e7b99f 100%)',
  'linear-gradient(135deg, #e7e5ee 0%, #cbc5da 100%)',
];

export default function StoreShowcase({ stores = [], title, subtitle }) {
  if (!stores.length) return null;

  return (
    <section className="container-page mt-12" aria-labelledby="featured-stores-title">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Seller spotlight</p>
          <h2 id="featured-stores-title" className="section-heading mt-1.5">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1.5 max-w-[520px] text-[11.5px] leading-relaxed text-muted">
              {subtitle}
            </p>
          ) : null}
        </div>
        <Link
          href="/stores"
          className="group hidden shrink-0 items-center gap-1 text-[10.5px] font-semibold text-ink-soft transition hover:text-brand-dark sm:inline-flex"
        >
          All stores
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stores.map((store, index) => (
          <Link
            key={store.id}
            href={`/stores/${store.slug}`}
            className="group card overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:shadow-card"
          >
            <div className="relative h-[88px] overflow-hidden bg-sand">
              {store.bannerUrl ? (
                <SmartImage
                  src={store.bannerUrl}
                  alt=""
                  className="h-full w-full transition duration-700 group-hover:scale-[1.04]"
                  imageClassName="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                />
              ) : (
                <div
                  className="h-full w-full"
                  style={{
                    background: GRADIENTS[index % GRADIENTS.length],
                  }}
                />
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-night/25 to-transparent" />
              {store.featured ? (
                <span className="absolute right-2.5 top-2.5 rounded-full bg-white/85 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-ink/65 backdrop-blur">
                  Featured
                </span>
              ) : null}
              <span className="absolute -bottom-5 left-3.5 grid h-11 w-11 place-items-center overflow-hidden rounded-xl border-2 border-[#fffdfa] bg-white shadow-sm">
                {store.logoUrl ? (
                  <SmartImage
                    src={store.logoUrl}
                    alt={store.storeName}
                    className="h-full w-full"
                    sizes="44px"
                  />
                ) : (
                  <span className="font-display text-[15px] font-extrabold text-brand-dark">
                    {store.storeName.charAt(0)}
                  </span>
                )}
              </span>
            </div>

            <div className="px-3.5 pb-3.5 pt-6.5">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-[12.5px] font-bold tracking-[-0.02em] text-ink transition group-hover:text-brand-dark">
                  {store.storeName}
                </h3>
                {store.verified ? (
                  <BadgeCheck
                    className="h-3.5 w-3.5 shrink-0 fill-leaf text-white"
                    strokeWidth={2}
                    aria-label="Verified seller"
                  />
                ) : null}
              </div>
              <p className="mt-0.5 line-clamp-1 text-[10px] text-muted">
                {store.tagline || 'Independent seller on Martify'}
              </p>

              <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line/60 pt-2.5">
                <RatingStars
                  value={store.avgRating}
                  count={null}
                  size={9}
                  label={false}
                />
                <span className="flex items-center gap-1 text-[9px] text-muted">
                  <MapPin className="h-2.5 w-2.5" />
                  {store.location?.split(',')[0] || 'Kenya'}
                </span>
              </div>
              <p className="mt-1.5 text-[9px] text-muted">
                {store.productCount} products ·{' '}
                <span className="capitalize">{store.tier}</span> seller
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
