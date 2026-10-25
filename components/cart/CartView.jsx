'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Heart,
  Loader2,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import QuantityStepper from '@/components/ui/QuantityStepper';
import SmartImage from '@/components/ui/SmartImage';
import { useCart } from '@/components/providers/CartProvider';
import { useI18n } from '@/components/providers/LocaleProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { formatMoney } from '@/lib/money';

function Row({ label, value, tone = '' }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11.5px] text-muted">{label}</span>
      <span className={`price text-[11.5px] font-semibold ${tone || 'text-ink-soft'}`}>
        {value}
      </span>
    </div>
  );
}

function SavedItems({ items, t, onMove, onRemove }) {
  if (!items.length) return null;
  return (
    <section className="mt-5" aria-labelledby="saved-items-title">
      <h2
        id="saved-items-title"
        className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-soft"
      >
        {t('cart.saved')} · {items.length}
      </h2>
      <ul className="mt-2.5 space-y-2">
        {items.map((item) => (
          <li
            key={item.key}
            className="flex items-center gap-3 rounded-2xl border border-line/70 bg-[#fffdfa] p-2.5"
          >
            <SmartImage
              src={item.image}
              alt={item.title}
              className="h-12 w-12 shrink-0 rounded-lg"
              sizes="48px"
            />
            <div className="min-w-0 flex-1">
              <Link
                href={`/product/${item.slug}`}
                className="line-clamp-1 text-[11.5px] font-semibold text-ink transition hover:text-brand-dark"
              >
                {item.title}
              </Link>
              <p className="price mt-0.5 text-[10.5px] text-muted">
                {formatMoney(item.priceCents)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => onMove(item.key)}
                className="btn btn-outline btn-sm"
              >
                {t('cart.moveToCart')}
              </button>
              <button
                type="button"
                onClick={() => onRemove(item.key)}
                className="grid h-7 w-7 place-items-center rounded-full text-muted transition hover:bg-sand hover:text-ink"
                aria-label={`Remove ${item.title} from saved items`}
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.7} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CartSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="card overflow-hidden">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={`cart-skeleton-${index}`}
            className="flex gap-3 border-b border-ink/[0.06] p-4 last:border-0"
          >
            <div className="skeleton h-[92px] w-[82px] shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2 py-1">
              <div className="skeleton h-3 w-3/4" />
              <div className="skeleton h-2.5 w-1/3" />
              <div className="skeleton h-7 w-32" />
            </div>
          </div>
        ))}
      </div>
      <div className="skeleton h-[290px] rounded-[1.3rem]" />
    </div>
  );
}

export default function CartView({ freeDeliveryThresholdCents = 500000 }) {
  const cart = useCart();
  const toast = useToast();
  const { t } = useI18n();
  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [couponError, setCouponError] = useState('');

  const discountCents = cart.coupon?.discountCents || 0;
  const estimatedTotal = Math.max(0, cart.subtotalCents - discountCents);
  const remaining = Math.max(0, freeDeliveryThresholdCents - cart.subtotalCents);
  const freeDelivery =
    remaining === 0 || Boolean(cart.coupon?.freeDelivery);
  const progress = freeDeliveryThresholdCents
    ? Math.min(100, Math.round((cart.subtotalCents / freeDeliveryThresholdCents) * 100))
    : 100;

  useEffect(() => {
    if (
      cart.coupon?.minSpendCents &&
      cart.subtotalCents < cart.coupon.minSpendCents
    ) {
      cart.removeCoupon();
      setCouponError(
        'Your cart no longer meets the minimum spend for that coupon.',
      );
    }
  }, [cart.subtotalCents, cart.coupon, cart.removeCoupon]);

  const applyCode = async (event) => {
    event.preventDefault();
    const code = couponCode.trim();
    if (!code) {
      setCouponError('Enter a coupon code first.');
      return;
    }
    setApplying(true);
    setCouponError('');
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          items: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'That code could not be applied.');
      cart.applyCoupon({
        ...data.coupon,
        discountCents: data.discountCents,
        freeDelivery: data.freeDelivery,
      });
      setCouponCode('');
      toast.success(
        data.discountCents > 0
          ? `You saved ${formatMoney(data.discountCents)} with ${data.coupon.code}.`
          : `${data.coupon.code} applied — your delivery is on us.`,
        'Coupon applied',
      );
    } catch (error) {
      setCouponError(error.message);
    } finally {
      setApplying(false);
    }
  };

  if (!cart.hydrated) {
    return (
      <div>
        <div className="skeleton h-8 w-56" />
        <div className="mt-5">
          <CartSkeleton />
        </div>
      </div>
    );
  }

  if (!cart.items.length) {
    return (
      <div>
        <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-sand">
            <ShoppingBag className="h-6 w-6 text-ink-soft" strokeWidth={1.5} />
          </span>
          <h1 className="mt-5 font-display text-[23px] font-bold tracking-[-0.04em]">
            {t('cart.empty')}
          </h1>
          <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed text-muted">
            {t('cart.emptyHint')}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/deals" className="btn btn-primary">
              Shop today&apos;s deals
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/categories" className="btn btn-outline">
              Browse categories
            </Link>
          </div>
        </div>
        <SavedItems
          items={cart.savedItems}
          t={t}
          onMove={cart.moveToCart}
          onRemove={cart.removeSaved}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Shopping bag</p>
          <h1 className="mt-1.5 font-display text-[1.7rem] font-extrabold tracking-[-0.045em] sm:text-[2rem]">
            Your cart
            <span className="ml-2 align-middle font-sans text-[13px] font-medium tracking-normal text-muted">
              {cart.count} {cart.count === 1 ? 'item' : 'items'}
            </span>
          </h1>
          <p className="mt-1.5 text-[11.5px] text-muted">
            Prices are held while items stay in your cart. Stock is confirmed
            again at checkout.
          </p>
        </div>
        <Link
          href="/categories"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-soft transition hover:text-brand-dark"
        >
          {t('cart.continue')}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="overflow-hidden rounded-[1.3rem] border border-line/80 bg-[#fffdfa]">
            <ul className="divide-y divide-ink/[0.06]">
              {cart.items.map((item) => (
                <li key={item.key} className="flex gap-3 p-3.5 sm:gap-4 sm:p-4">
                  <Link href={`/product/${item.slug}`} className="shrink-0">
                    <SmartImage
                      src={item.image}
                      alt={item.title}
                      className="h-[92px] w-[82px] rounded-xl sm:h-[110px] sm:w-[100px]"
                      sizes="100px"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
                          {item.sellerName || 'Martify seller'}
                        </p>
                        <Link
                          href={`/product/${item.slug}`}
                          className="mt-1 line-clamp-2 text-[12.5px] font-semibold leading-snug text-ink transition hover:text-brand-dark sm:text-[13.5px]"
                        >
                          {item.title}
                        </Link>
                        {item.variantName ? (
                          <p className="mt-1 text-[10px] text-muted">
                            Option: {item.variantName}
                          </p>
                        ) : null}
                        <p className="price mt-1 text-[11px] text-muted">
                          {formatMoney(item.priceCents)} each
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => cart.removeItem(item.key)}
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted transition hover:bg-sand hover:text-ink"
                        aria-label={`${t('cart.remove')}: ${item.title}`}
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={1.8} />
                      </button>
                    </div>

                    <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(quantity) => cart.setQuantity(item.key, quantity)}
                          max={Math.max(1, item.stock)}
                          size="sm"
                        />
                        <button
                          type="button"
                          onClick={() => cart.saveForLater(item.key)}
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-muted transition hover:text-ink"
                        >
                          <Heart className="h-3 w-3" strokeWidth={1.8} />
                          Save
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="price text-[15px] font-bold text-ink">
                          {formatMoney(item.priceCents * item.quantity)}
                        </p>
                        {item.quantity > 1 ? (
                          <p className="text-[9px] text-muted">
                            {item.quantity} × {formatMoney(item.priceCents)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3 rounded-2xl border border-line/70 bg-white/60 p-3.5">
            <div className="flex items-center gap-2 text-[10.5px] font-medium text-ink-soft">
              <Truck className="h-3.5 w-3.5 text-brand" strokeWidth={1.8} />
              {freeDelivery
                ? t('cart.freeDeliveryEarned')
                : t('cart.freeDeliveryHint', { amount: formatMoney(remaining) })}
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  freeDelivery ? 'bg-leaf' : 'bg-brand'
                }`}
                style={{ width: `${Math.max(4, progress)}%` }}
              />
            </div>
          </div>

          <SavedItems
            items={cart.savedItems}
            t={t}
            onMove={cart.moveToCart}
            onRemove={cart.removeSaved}
          />
        </div>

        <aside className="lg:sticky lg:top-[150px]">
          <div className="card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-[16px] font-bold tracking-[-0.03em]">
                Order summary
              </h2>
              <span className="text-[9.5px] text-muted">
                {cart.count} {cart.count === 1 ? 'item' : 'items'}
              </span>
            </div>

            <div className="mt-3.5">
              {cart.coupon ? (
                <div className="rounded-xl border border-leaf/20 bg-leaf-soft px-3 py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <Tag className="mt-0.5 h-3.5 w-3.5 text-leaf" strokeWidth={1.9} />
                      <div>
                        <p className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-leaf">
                          {cart.coupon.code}
                        </p>
                        <p className="mt-0.5 text-[9.5px] leading-relaxed text-leaf/80">
                          {cart.coupon.description ||
                            (cart.coupon.freeDelivery
                              ? 'Free delivery applied.'
                              : 'Coupon applied.')}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        cart.removeCoupon();
                        setCouponError('');
                      }}
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-leaf/70 transition hover:bg-white/60 hover:text-leaf"
                      aria-label="Remove coupon"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={applyCode} className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="relative">
                      <Tag
                        className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
                        strokeWidth={1.8}
                      />
                      <input
                        value={couponCode}
                        onChange={(event) =>
                          setCouponCode(event.target.value.toUpperCase())
                        }
                        placeholder="Coupon code"
                        maxLength={40}
                        aria-label="Coupon code"
                        className="input py-2.5 pl-9 text-[11.5px] uppercase tracking-[0.04em]"
                      />
                    </div>
                    {couponError ? (
                      <p className="mt-1 text-[9.5px] text-[#a23415]">{couponError}</p>
                    ) : (
                      <p className="mt-1 text-[9px] text-muted">
                        Try WELCOME10 or FREEDEL
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={applying}
                    className="btn btn-dark btn-sm h-[38px] shrink-0 px-3.5"
                  >
                    {applying ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className="mt-4 space-y-2 border-t border-ink/[0.06] pt-3.5">
              <Row label={t('cart.subtotal')} value={formatMoney(cart.subtotalCents)} />
              {discountCents > 0 ? (
                <Row
                  label="Coupon discount"
                  value={`− ${formatMoney(discountCents)}`}
                  tone="text-leaf"
                />
              ) : null}
              {cart.coupon?.freeDelivery ? (
                <Row
                  label="Delivery promo"
                  value="Free"
                  tone="text-leaf"
                />
              ) : null}
              <Row
                label="Delivery"
                value={freeDelivery ? 'Free door delivery' : 'From KSh 100'}
              />
            </div>

            <div className="mt-3 flex items-end justify-between gap-2 border-t border-ink/[0.06] pt-3">
              <div>
                <p className="text-[11.5px] font-semibold text-ink">Estimated total</p>
                <p className="mt-0.5 text-[9px] text-muted">
                  Delivery confirmed at checkout
                </p>
              </div>
              <p className="price text-[20px] font-extrabold text-ink">
                {formatMoney(estimatedTotal)}
              </p>
            </div>

            <Link
              href="/checkout"
              className="btn btn-primary mt-4 flex w-full justify-between px-4"
            >
              {t('cart.checkout')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-2 text-center text-[9px] text-muted">
              Guest checkout available · {t('cart.paymentNote')}
            </p>

            <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-ink/[0.06] pt-3">
              {[
                { icon: ShieldCheck, label: 'Buyer protection' },
                { icon: RotateCcw, label: '14-day returns' },
                { icon: BadgeCheck, label: 'Verified sellers' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1 text-center">
                  <item.icon className="h-3.5 w-3.5 text-ink-soft/55" strokeWidth={1.7} />
                  <span className="text-[8px] font-medium leading-tight text-muted">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-center gap-2 text-[9px] text-muted">
            <LockKeyhole className="h-3 w-3" strokeWidth={1.8} />
            Secure checkout · M-Pesa, card or cash on delivery
          </div>
        </aside>
      </div>
    </div>
  );
}
