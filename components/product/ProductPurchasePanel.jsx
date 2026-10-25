'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BadgeCheck,
  Clock3,
  Heart,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Zap,
} from 'lucide-react';
import QuantityStepper from '@/components/ui/QuantityStepper';
import RatingStars from '@/components/ui/RatingStars';
import { useCart } from '@/components/providers/CartProvider';
import { useI18n } from '@/components/providers/LocaleProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { formatMoney } from '@/lib/money';

function formatCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');
}

export default function ProductPurchasePanel({
  product,
  variants = [],
  settings,
  deliveryEstimate,
}) {
  const router = useRouter();
  const cart = useCart();
  const wishlist = useWishlist();
  const toast = useToast();
  const { t } = useI18n();
  const [variantId, setVariantId] = useState(() => {
    const available = variants.find((variant) => variant.stock > 0);
    return (available ?? variants[0])?.id ?? null;
  });
  const [quantity, setQuantity] = useState(1);
  const [countdown, setCountdown] = useState(null);
  const [pulse, setPulse] = useState(false);

  const selected = useMemo(
    () => variants.find((variant) => variant.id === variantId) ?? null,
    [variants, variantId],
  );
  const priceCents = selected?.priceCents ?? product.priceCents;
  const stock = variants.length ? selected?.stock ?? 0 : product.stock;
  const outOfStock = stock <= 0;
  const saved = wishlist.isSaved(product.id);
  const totalCents = priceCents * quantity;
  const threshold = settings?.free_delivery_threshold_cents ?? 500000;
  const freeDelivery = totalCents >= threshold;
  const remaining = Math.max(0, threshold - totalCents);

  const flash = product.flash;
  const flashClaimed =
    flash?.stockLimit > 0
      ? Math.min(100, Math.round((flash.soldCount / flash.stockLimit) * 100))
      : null;

  useEffect(() => {
    setQuantity((current) => Math.min(current, Math.max(1, stock)));
  }, [stock]);

  useEffect(() => {
    if (!product.flash?.endsAt) return undefined;
    const tick = () => {
      const remainingMs =
        new Date(product.flash.endsAt).getTime() - Date.now();
      setCountdown(Math.max(0, remainingMs));
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [product.flash?.endsAt]);

  const handleAdd = () => {
    cart.addItem(product, { quantity, variant: selected });
  };

  const handleBuyNow = () => {
    const added = cart.addItem(product, {
      quantity,
      variant: selected,
      open: false,
    });
    if (added) router.push('/checkout');
  };

  const handleSave = () => {
    setPulse(true);
    window.setTimeout(() => setPulse(false), 420);
    wishlist.toggle(product.id, product.title);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success('Product link copied to your clipboard.', 'Share');
    } catch (error) {
      if (error?.name !== 'AbortError') {
        toast.error('Could not share this product right now.');
      }
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9.5px] font-semibold uppercase tracking-[0.12em]">
        <span className="text-brand-dark">{product.brand || product.category.name}</span>
        <span className="text-muted/50">/</span>
        <span className="text-muted">{product.category.name}</span>
        {product.sponsored ? (
          <span className="ml-1 rounded-full bg-sand px-2 py-0.5 text-[8px] tracking-[0.08em] text-muted">
            Sponsored
          </span>
        ) : null}
      </div>

      <h1 className="mt-2 text-[1.65rem] font-extrabold leading-[1.12] tracking-[-0.045em] text-ink sm:text-[2rem] lg:text-[2.15rem]">
        {product.title}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <RatingStars value={product.rating} count={product.ratingCount} size={13} />
        <span className="h-3 w-px bg-line" aria-hidden="true" />
        <span className="text-[10.5px] text-muted">
          {product.soldCount.toLocaleString()} {t('product.sold')}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-semibold ${
            outOfStock
              ? 'bg-[#FDECEA] text-[#A3301D]'
              : 'bg-leaf-soft text-leaf'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${outOfStock ? 'bg-[#A3301D]' : 'bg-leaf'}`}
          />
          {outOfStock ? t('product.outOfStock') : t('product.inStock')}
        </span>
      </div>

      <div className="mt-4 rounded-[1.45rem] border border-line/80 bg-[#fffdfa] p-4 shadow-[0_20px_45px_-40px_rgba(23,23,20,0.55)] sm:p-5">
        <div className="flex flex-wrap items-end gap-x-3 gap-y-1.5">
          <p className="price text-[1.9rem] font-extrabold leading-none text-ink sm:text-[2.1rem]">
            {formatMoney(priceCents)}
          </p>
          {product.compareAtCents ? (
            <p className="price pb-0.5 text-[12px] text-muted line-through">
              {formatMoney(product.compareAtCents)}
            </p>
          ) : null}
          {product.discountPercent > 0 ? (
            <span className="mb-0.5 inline-flex items-center rounded-full bg-brand-soft px-2 py-1 text-[9.5px] font-bold text-brand-dark">
              Save {product.discountPercent}%
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-[10.5px] text-muted">
          Inclusive of all taxes · Secure checkout on Martify
        </p>

        <div className="mt-2.5 flex items-center gap-1.5 text-[10.5px] font-medium">
          <Truck className="h-3.5 w-3.5 text-brand" strokeWidth={1.8} />
          {freeDelivery ? (
            <span className="text-leaf">{t('product.freeDelivery')}</span>
          ) : (
            <span className="text-muted">
              Add{' '}
              <strong className="font-semibold text-ink-soft">
                {formatMoney(remaining)}
              </strong>{' '}
              for free door delivery
            </span>
          )}
        </div>

        {flash ? (
          <div className="mt-3 overflow-hidden rounded-xl border border-brand/15 bg-brand-soft/70">
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-brand-dark">
                <Clock3 className="h-3.5 w-3.5" strokeWidth={2} />
                {flash.title || 'Flash sale'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-brand-dark/70">
                  Ends in
                </span>
                <span className="num rounded-md bg-white px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-brand-dark">
                  {countdown === null ? '--:--:--' : formatCountdown(countdown)}
                </span>
              </span>
            </div>
            {flashClaimed !== null ? (
              <div className="px-3 pb-2.5">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/80">
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-500"
                    style={{ width: `${Math.max(4, flashClaimed)}%` }}
                  />
                </div>
                <p className="mt-1 text-[9px] text-brand-dark/70">
                  {flash.soldCount} of {flash.stockLimit} claimed at this price
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {variants.length ? (
          <div className="mt-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-ink">
                {t('product.chooseVariant')}
              </p>
              <p className="text-[10.5px] text-muted">{selected?.name}</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {variants.map((variant) => {
                const isSelected = variant.id === variantId;
                const soldOut = variant.stock <= 0;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setVariantId(variant.id)}
                    disabled={soldOut}
                    aria-pressed={isSelected}
                    className={`group relative rounded-xl border px-3 py-2 text-left text-[11px] font-semibold transition ${
                      isSelected
                        ? 'border-ink bg-ink text-white'
                        : 'border-line bg-white text-ink-soft hover:border-ink/35'
                    } ${soldOut ? 'cursor-not-allowed opacity-45' : ''}`}
                  >
                    {variant.name}
                    {soldOut ? (
                      <span className="ml-1.5 text-[8.5px] font-medium uppercase tracking-[0.04em] text-muted">
                        Sold out
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            {selected?.sku ? (
              <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                SKU {selected.sku}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold text-ink">Quantity</p>
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              max={Math.max(1, stock)}
              label="Quantity"
            />
          </div>
          <p className="pt-4 text-[10.5px] text-muted">
            {outOfStock
              ? t('product.outOfStock')
              : stock <= 5
                ? t('product.lowStock', { n: stock })
                : 'Ready to ship'}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            className="btn btn-outline h-11 px-3"
          >
            <ShoppingCart className="h-4 w-4" strokeWidth={1.9} />
            {t('product.addToCart')}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={outOfStock}
            className="btn btn-primary h-11 px-3"
          >
            <Zap className="h-4 w-4" strokeWidth={2} />
            {t('product.buyNow')}
          </button>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleSave}
            aria-pressed={saved}
            className={`inline-flex items-center gap-1.5 text-[10.5px] font-medium transition ${
              saved ? 'text-brand-dark' : 'text-muted hover:text-ink'
            }`}
          >
            <Heart
              className={`h-3.5 w-3.5 ${saved ? 'fill-brand text-brand' : ''} ${pulse ? 'heart-pop' : ''}`}
              strokeWidth={1.9}
            />
            {saved ? 'Saved to wishlist' : 'Save for later'}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-[10.5px] font-medium text-muted transition hover:text-ink"
          >
            <Share2 className="h-3.5 w-3.5" strokeWidth={1.9} />
            Share
          </button>
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-ink/[0.06] pt-3 text-[9.5px] font-medium text-muted">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-leaf" strokeWidth={1.9} />
            Buyer protection
          </span>
          <span className="inline-flex items-center gap-1">
            <RotateCcw className="h-3.5 w-3.5 text-ink-soft/55" strokeWidth={1.8} />
            14-day returns
          </span>
          {product.seller.verified ? (
            <span className="inline-flex items-center gap-1">
              <BadgeCheck className="h-3.5 w-3.5 text-leaf" strokeWidth={1.9} />
              Verified seller
            </span>
          ) : null}
        </div>

        <p className="mt-2.5 text-[10px] text-muted">
          Order today and get it by{' '}
          <strong className="font-semibold text-ink-soft">{deliveryEstimate}</strong>{' '}
          with door delivery.
        </p>
      </div>
    </div>
  );
}
