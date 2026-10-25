'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Flame } from 'lucide-react';
import ProductCard from '@/components/storefront/ProductCard';
import { useI18n } from '@/components/providers/LocaleProvider';

function pad(value) {
  return String(value).padStart(2, '0');
}

function Countdown({ endsAt, endedLabel }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    const target = new Date(endsAt).getTime();
    const update = () => setRemaining(Math.max(0, target - Date.now()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [endsAt]);

  if (remaining === null) {
    return (
      <div className="flex items-center gap-1" aria-hidden="true">
        {['--', '--', '--'].map((value, index) => (
          <span
            key={index}
            className="grid min-w-[36px] place-items-center rounded-lg bg-white/[0.08] px-2 py-1.5 font-mono text-[13px] font-semibold text-white/50"
          >
            {value}
          </span>
        ))}
      </div>
    );
  }

  if (remaining <= 0) {
    return (
      <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10.5px] font-semibold text-white/60">
        {endedLabel}
      </span>
    );
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [
    ...(days ? [{ value: days, label: 'days' }] : []),
    { value: hours, label: 'hrs' },
    { value: minutes, label: 'min' },
    { value: seconds, label: 'sec' },
  ];

  return (
    <div
      className="flex items-center gap-1"
      role="timer"
      aria-label="Time left in this flash sale"
    >
      {parts.map((part, index) => (
        <span key={part.label} className="flex items-center gap-1">
          {index > 0 ? (
            <span className="pb-3 font-mono text-[12px] text-white/25">:</span>
          ) : null}
          <span className="flex min-w-[38px] flex-col items-center rounded-lg bg-white/[0.07] px-2 py-1.5 ring-1 ring-inset ring-white/[0.06]">
            <span className="font-mono text-[14px] font-semibold leading-none tabular-nums text-white">
              {pad(part.value)}
            </span>
            <span className="mt-1 text-[7px] font-medium uppercase tracking-[0.12em] text-white/40">
              {part.label}
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}

export default function FlashDeals({ sale, products = [] }) {
  const { t } = useI18n();
  if (!products.length) return null;

  return (
    <section className="container-page mt-8 sm:mt-10" aria-labelledby="flash-deals-title">
      <div className="relative overflow-hidden rounded-[1.6rem] bg-night px-4 py-5 text-white sm:px-6 sm:py-6">
        <span
          className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-brand/15 blur-3xl"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -bottom-36 left-1/3 h-64 w-64 rounded-full bg-brand/[0.08] blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-brand">
              <Flame className="h-3 w-3 fill-brand/20" strokeWidth={2} />
              {t('home.flash')}
            </p>
            <h2
              id="flash-deals-title"
              className="mt-1.5 font-display text-[clamp(1.35rem,2.5vw,1.9rem)] font-bold tracking-[-0.045em] text-white"
            >
              The clock is ticking.
            </h2>
            <p className="mt-1 max-w-[420px] text-[10.5px] leading-relaxed text-white/45">
              {sale?.subtitle ||
                'Deep cuts on customer favourites. Limited stock, gone when the timer ends.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="mb-1.5 font-mono text-[8px] uppercase tracking-[0.14em] text-white/35">
                {t('home.endsIn')}
              </p>
              <Countdown endsAt={sale?.endsAt} endedLabel="Sale ended" />
            </div>
            <Link
              href="/deals"
              className="hidden items-center gap-1 rounded-full border border-white/15 px-3 py-2 text-[10.5px] font-semibold text-white/75 transition hover:bg-white/10 hover:text-white sm:inline-flex"
            >
              {t('home.viewAll')}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="no-scrollbar relative mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
          {products.map((product) => {
            const flash = product.flash;
            const claimed =
              flash && flash.stockLimit
                ? Math.min(
                    100,
                    Math.round((flash.soldCount / flash.stockLimit) * 100),
                  )
                : null;
            return (
              <div
                key={product.id}
                className="w-[168px] shrink-0 snap-start sm:w-[188px] lg:w-[202px]"
              >
                <ProductCard product={product} />
                {claimed !== null ? (
                  <div className="mt-2 px-1">
                    <div className="h-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${Math.max(8, claimed)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[8.5px] text-white/35">
                      {flash.soldCount} of {flash.stockLimit} claimed
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}

          <Link
            href="/deals"
            className="flex w-[120px] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 text-white/55 transition hover:border-white/30 hover:text-white sm:hidden"
          >
            <ArrowRight className="h-4 w-4" />
            <span className="text-[10px] font-semibold">{t('home.viewAll')}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
