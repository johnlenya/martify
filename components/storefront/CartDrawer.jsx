'use client';

import Link from 'next/link';
import { ArrowRight, Heart, ShoppingBag, Trash2, Truck } from 'lucide-react';
import Drawer from '@/components/ui/Drawer';
import QuantityStepper from '@/components/ui/QuantityStepper';
import SmartImage from '@/components/ui/SmartImage';
import { useCart } from '@/components/providers/CartProvider';
import { useI18n } from '@/components/providers/LocaleProvider';
import { formatMoney } from '@/lib/money';

export default function CartDrawer({ freeDeliveryThresholdCents = 500000 }) {
  const cart = useCart();
  const { t } = useI18n();
  const remaining = Math.max(0, freeDeliveryThresholdCents - cart.subtotalCents);
  const progress = Math.min(
    100,
    Math.round((cart.subtotalCents / freeDeliveryThresholdCents) * 100),
  );
  const freeDelivery = remaining === 0;

  return (
    <Drawer
      open={cart.drawerOpen}
      onClose={() => cart.setDrawerOpen(false)}
      eyebrow={`${cart.count} ${cart.count === 1 ? 'item' : 'items'}`}
      title={t('cart.title')}
      footer={
        cart.items.length ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-medium text-ink-soft">
                {t('cart.subtotal')}
              </span>
              <span className="price text-[18px] font-bold text-ink">
                {formatMoney(cart.subtotalCents)}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={() => cart.setDrawerOpen(false)}
              className="btn btn-primary w-full justify-between px-5"
            >
              {t('cart.checkout')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => cart.setDrawerOpen(false)}
                className="text-[11.5px] font-medium text-ink-soft transition hover:text-ink"
              >
                {t('cart.continue')}
              </button>
              <span className="text-[10px] text-muted">{t('cart.paymentNote')}</span>
            </div>
          </div>
        ) : null
      }
    >
      {!cart.items.length ? (
        <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-sand">
            <ShoppingBag className="h-6 w-6 text-ink-soft" strokeWidth={1.5} />
          </span>
          <h3 className="mt-5 font-display text-[19px] font-bold tracking-[-0.03em]">
            {t('cart.empty')}
          </h3>
          <p className="mt-1.5 max-w-[240px] text-[12.5px] leading-relaxed text-muted">
            {t('cart.emptyHint')}
          </p>
          <Link
            href="/deals"
            onClick={() => cart.setDrawerOpen(false)}
            className="btn btn-dark mt-6"
          >
            {t('cart.continue')}
          </Link>
        </div>
      ) : (
        <div>
          <div className="border-b border-ink/[0.06] px-5 py-4">
            <div className="flex items-center gap-2 text-[11px] font-medium text-ink-soft">
              <Truck className="h-3.5 w-3.5 text-brand" strokeWidth={1.8} />
              {freeDelivery
                ? t('cart.freeDeliveryEarned')
                : t('cart.freeDeliveryHint', { amount: formatMoney(remaining) })}
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-sand">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  freeDelivery ? 'bg-leaf' : 'bg-brand'
                }`}
                style={{ width: `${Math.max(4, progress)}%` }}
              />
            </div>
          </div>

          <ul className="divide-y divide-ink/[0.06] px-5">
            {cart.items.map((item) => (
              <li key={item.key} className="flex gap-3 py-4">
                <Link
                  href={`/product/${item.slug}`}
                  onClick={() => cart.setDrawerOpen(false)}
                  className="shrink-0"
                >
                  <SmartImage
                    src={item.image}
                    alt={item.title}
                    className="h-[80px] w-[68px] rounded-xl"
                    sizes="68px"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={() => cart.setDrawerOpen(false)}
                      className="line-clamp-2 text-[12.5px] font-semibold leading-snug text-ink transition hover:text-brand-dark"
                    >
                      {item.title}
                    </Link>
                    <button
                      type="button"
                      onClick={() => cart.removeItem(item.key)}
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted transition hover:bg-sand hover:text-ink"
                      aria-label={`${t('cart.remove')}: ${item.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.7} />
                    </button>
                  </div>
                  {item.variantName ? (
                    <p className="mt-0.5 text-[10.5px] text-muted">{item.variantName}</p>
                  ) : (
                    <p className="mt-0.5 text-[10.5px] text-muted">{item.sellerName}</p>
                  )}
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(quantity) => cart.setQuantity(item.key, quantity)}
                      max={item.stock}
                      size="sm"
                    />
                    <span className="price text-[13px] font-bold text-ink">
                      {formatMoney(item.priceCents * item.quantity)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => cart.saveForLater(item.key)}
                    className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-medium text-muted transition hover:text-brand-dark"
                  >
                    <Heart className="h-3 w-3" strokeWidth={1.8} />
                    {t('cart.save')}
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {cart.savedItems.length ? (
            <div className="mx-5 mb-5 rounded-2xl bg-cream p-3">
              <p className="eyebrow">
                {t('cart.saved')} · {cart.savedItems.length}
              </p>
              <ul className="mt-2 space-y-2">
                {cart.savedItems.map((item) => (
                  <li key={item.key} className="flex items-center gap-2.5">
                    <SmartImage
                      src={item.image}
                      alt={item.title}
                      className="h-9 w-9 shrink-0 rounded-lg"
                      sizes="36px"
                    />
                    <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-ink-soft">
                      {item.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => cart.moveToCart(item.key)}
                      className="shrink-0 text-[10.5px] font-semibold text-brand-dark hover:underline"
                    >
                      {t('cart.moveToCart')}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </Drawer>
  );
}
