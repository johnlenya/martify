'use client';

import Link from 'next/link';
import { Heart, MapPin, Plus } from 'lucide-react';
import { useState } from 'react';
import SmartImage from '@/components/ui/SmartImage';
import RatingStars from '@/components/ui/RatingStars';
import { useCart } from '@/components/providers/CartProvider';
import { useI18n } from '@/components/providers/LocaleProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { formatMoney } from '@/lib/money';

export default function ProductCard({ product, layout = 'grid' }) {
  const cart = useCart();
  const wishlist = useWishlist();
  const { t } = useI18n();
  const [pulse, setPulse] = useState(false);
  const saved = wishlist.isSaved(product.id);
  const outOfStock = product.stock <= 0;

  const handleSave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setPulse(true);
    window.setTimeout(() => setPulse(false), 420);
    wishlist.toggle(product.id, product.title);
  };

  const handleAdd = (event) => {
    event.preventDefault();
    event.stopPropagation();
    cart.addItem(product);
  };

  const heart = (
    <button
      type="button"
      onClick={handleSave}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      aria-pressed={saved}
      className={`grid h-8 w-8 place-items-center rounded-full border shadow-sm backdrop-blur transition ${
        saved
          ? 'border-brand/20 bg-brand-soft text-brand'
          : 'border-white/70 bg-white/85 text-ink/55 hover:border-brand/30 hover:text-brand'
      }`}
    >
      <Heart
        className={`h-4 w-4 ${saved ? 'fill-brand' : ''} ${pulse ? 'heart-pop' : ''}`}
        strokeWidth={1.9}
      />
    </button>
  );

  const badges = (
    <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
      {product.discountPercent > 0 ? (
        <span className="rounded-full bg-brand px-2 py-1 text-[10px] font-bold leading-none text-white shadow-[0_6px_14px_-8px_rgba(237,90,34,0.9)]">
          −{product.discountPercent}%
        </span>
      ) : null}
      {product.flash ? (
        <span className="rounded-full bg-night/90 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.09em] text-white">
          Flash
        </span>
      ) : null}
      {product.sponsored ? (
        <span className="rounded-full bg-white/85 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-ink/55 backdrop-blur">
          {t('home.sponsored')}
        </span>
      ) : null}
    </div>
  );

  if (layout === 'list') {
    return (
      <article className="group relative flex gap-3 overflow-hidden rounded-2xl border border-line/70 bg-[#fffdfa] p-2.5 transition hover:border-line hover:shadow-card sm:gap-4 sm:p-3">
        <Link
          href={`/product/${product.slug}`}
          className="relative block w-[124px] shrink-0 overflow-hidden rounded-xl bg-sand sm:w-[176px]"
          aria-label={product.title}
        >
          <SmartImage
            src={product.image}
            alt={product.title}
            className="aspect-square w-full"
            imageClassName="transition duration-700 group-hover:scale-[1.035]"
            sizes="180px"
          />
          {badges}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {product.brand || product.category.name}
                </p>
                <Link href={`/product/${product.slug}`}>
                  <h3 className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug tracking-[-0.015em] text-ink sm:text-[14.5px]">
                    {product.title}
                  </h3>
                </Link>
              </div>
              <div className="hidden sm:block">{heart}</div>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <RatingStars
                value={product.rating}
                count={product.ratingCount}
                size={10}
              />
              <span className="hidden text-[10px] text-muted sm:inline">
                · {product.soldCount} {t('product.sold')}
              </span>
            </div>
            <p className="mt-1.5 hidden items-center gap-1 text-[10.5px] text-muted sm:flex">
              <MapPin className="h-3 w-3" strokeWidth={1.7} />
              {product.seller.name} · {product.location || product.sellerCounty}
            </p>
          </div>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div>
              <p className="price text-[17px] font-bold text-ink sm:text-[19px]">
                {formatMoney(product.priceCents)}
              </p>
              {product.compareAtCents ? (
                <p className="price text-[10.5px] text-muted line-through">
                  {formatMoney(product.compareAtCents)}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <div className="sm:hidden">{heart}</div>
              <button
                type="button"
                onClick={handleAdd}
                disabled={outOfStock}
                className="btn btn-primary btn-sm px-3"
                aria-label={`${t('product.addToCart')}: ${product.title}`}
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span className="hidden sm:inline">
                  {outOfStock ? t('product.outOfStock') : t('product.addToCart')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line/70 bg-[#fffdfa] transition duration-300 hover:-translate-y-0.5 hover:border-line hover:shadow-card">
      <Link
        href={`/product/${product.slug}`}
        className="relative block overflow-hidden bg-sand"
        aria-label={product.title}
      >
        <SmartImage
          src={product.image}
          alt={product.title}
          className="aspect-[4/5] w-full sm:aspect-square"
          imageClassName="transition duration-700 ease-out group-hover:scale-[1.035]"
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 240px"
        />
        {badges}
        <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/12 to-transparent opacity-0 transition group-hover:opacity-100" />
      </Link>

      <div className="absolute right-2.5 top-2.5 z-10">{heart}</div>

      <div className="flex flex-1 flex-col p-3.5 pt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[9.5px] font-semibold uppercase tracking-[0.13em] text-muted">
            {product.brand || product.category.name}
          </p>
          {product.seller.verified ? (
            <span className="text-[8.5px] font-semibold uppercase tracking-[0.08em] text-leaf">
              ✓ Verified
            </span>
          ) : null}
        </div>

        <Link href={`/product/${product.slug}`} className="mt-1">
          <h3 className="line-clamp-2 min-h-[2.3em] text-[12.5px] font-semibold leading-[1.35] tracking-[-0.015em] text-ink transition group-hover:text-brand-dark sm:text-[13.5px]">
            {product.title}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-center gap-1.5">
          <RatingStars
            value={product.rating}
            count={product.ratingCount}
            size={10}
          />
        </div>

        <p className="mt-1.5 hidden items-center gap-1 truncate text-[10px] text-muted sm:flex">
          <MapPin className="h-2.5 w-2.5" strokeWidth={1.8} />
          {product.location?.split(',')[0] || product.seller.name}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="min-w-0">
            <p className="price truncate text-[16px] font-bold leading-none text-ink sm:text-[17px]">
              {formatMoney(product.priceCents)}
            </p>
            {product.compareAtCents ? (
              <p className="price mt-1 text-[10px] text-muted line-through">
                {formatMoney(product.compareAtCents)}
              </p>
            ) : (
              <p className="mt-1 text-[9.5px] text-muted">
                {outOfStock
                  ? t('product.outOfStock')
                  : product.stock <= 5
                    ? t('product.lowStock', { n: product.stock })
                    : t('product.inStock')}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line bg-white text-ink transition hover:border-brand hover:bg-brand hover:text-white disabled:opacity-40"
            aria-label={`${t('product.addToCart')}: ${product.title}`}
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </article>
  );
}
