'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Store,
  Truck,
} from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import { useI18n } from '@/components/providers/LocaleProvider';

const FALLBACK_SLIDES = [
  {
    id: 'fallback',
    eyebrow: 'WELCOME TO MARTIFY',
    title: 'Kenya’s marketplace, made simple.',
    subtitle:
      'Verified sellers, fair prices and a checkout that works the way you do.',
    href: '/deals',
    cta: 'Shop today’s deals',
    imageUrl: null,
  },
];

function SideCard({ banner, index }) {
  const hasImage = Boolean(banner.imageUrl);
  const isDark = index === 1;
  const Icon = index === 1 ? Store : Truck;

  return (
    <Link
      href={banner.href || '/deals'}
      className={`group relative flex min-h-[160px] flex-col justify-between overflow-hidden rounded-[1.4rem] border p-5 transition hover:-translate-y-0.5 hover:shadow-card lg:min-h-0 ${
        isDark
          ? 'border-white/10 bg-night text-white'
          : 'border-brand/10 bg-brand-soft text-ink'
      }`}
    >
      {hasImage ? (
        <>
          <SmartImage
            src={banner.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full opacity-70 transition duration-700 group-hover:scale-[1.03]"
            imageClassName="object-cover"
            sizes="(max-width: 1024px) 50vw, 360px"
          />
          <span className="absolute inset-0 bg-gradient-to-r from-night/85 via-night/55 to-night/10" />
        </>
      ) : (
        <>
          <Icon
            className={`absolute -bottom-8 -right-6 h-36 w-36 ${
              isDark ? 'text-white/[0.045]' : 'text-brand/[0.07]'
            }`}
            strokeWidth={1}
            aria-hidden="true"
          />
          <span
            className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${
              isDark ? 'bg-white/[0.04]' : 'bg-white/50'
            }`}
            aria-hidden="true"
          />
        </>
      )}

      <div className="relative z-10">
        <p
          className={`eyebrow ${hasImage ? 'text-white/55' : isDark ? 'text-white/40' : 'text-brand-dark/65'}`}
        >
          {banner.eyebrow}
        </p>
        <h2
          className={`mt-2 max-w-[240px] font-display text-[clamp(1.15rem,2vw,1.55rem)] font-bold leading-[1.08] tracking-[-0.04em] ${
            hasImage ? 'text-white' : isDark ? 'text-white' : 'text-ink'
          }`}
        >
          {banner.title}
        </h2>
        {banner.subtitle ? (
          <p
            className={`mt-2 max-w-[260px] text-[11px] leading-relaxed ${
              hasImage ? 'text-white/65' : isDark ? 'text-white/55' : 'text-ink-soft/80'
            }`}
          >
            {banner.subtitle}
          </p>
        ) : null}
      </div>

      <span
        className={`relative z-10 mt-4 inline-flex items-center gap-1 text-[10.5px] font-semibold ${
          hasImage ? 'text-white' : isDark ? 'text-brand' : 'text-brand-dark'
        }`}
      >
        {banner.cta || 'Discover more'}
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export default function HeroCarousel({ banners = [], sideBanners = [] }) {
  const { t } = useI18n();
  const slides = banners.length ? banners : FALLBACK_SLIDES;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  const move = (direction) => {
    setIndex((current) => {
      const next = current + direction;
      return (next + slides.length) % slides.length;
    });
  };

  return (
    <section className="container-page pt-3 sm:pt-5" aria-label="Featured offers">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.72fr)_minmax(0,1fr)]">
        <div
          className="relative min-h-[430px] overflow-hidden rounded-[1.6rem] bg-night sm:min-h-[470px] lg:min-h-[520px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          {slides.map((slide, slideIndex) => {
            const active = slideIndex === index;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  active ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'
                }`}
                aria-hidden={!active}
              >
                {slide.imageUrl ? (
                  <SmartImage
                    src={slide.imageUrl}
                    alt=""
                    priority={slideIndex === 0}
                    className="absolute inset-0 h-full w-full"
                    imageClassName="object-cover"
                    sizes="(max-width: 1024px) 100vw, 900px"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(120% 120% at 85% 15%, #3a3a30 0%, #23241e 45%, #171815 100%)',
                    }}
                  >
                    <span className="absolute -right-20 top-10 h-80 w-80 rounded-full border border-white/[0.06]" />
                    <span className="absolute -right-6 top-32 h-56 w-56 rounded-full border border-brand/20" />
                    <span className="absolute right-16 top-48 h-4 w-4 rounded-full bg-brand/70" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-r from-night via-night/85 to-night/15" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-night/80 to-transparent" />

                <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white sm:p-9 lg:p-11">
                  <div className="max-w-[500px]">
                    <p className="flex items-center gap-2 font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-white/55">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                      {slide.eyebrow}
                    </p>
                    <h2 className="mt-4 max-w-[13ch] font-display text-[clamp(2.1rem,5.2vw,3.6rem)] font-extrabold leading-[0.98] tracking-[-0.055em] text-white">
                      {slide.title}
                    </h2>
                    <p className="mt-4 max-w-[400px] text-[12.5px] leading-relaxed text-white/65 sm:text-[13.5px]">
                      {slide.subtitle}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-2">
                      <Link
                        href={slide.href || '/deals'}
                        className="btn btn-primary btn-lg group"
                      >
                        {slide.cta || t('home.shopNow')}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                      <Link
                        href="/stores"
                        className="btn btn-lg border-white/20 bg-white/[0.07] text-white backdrop-blur transition hover:bg-white/15"
                      >
                        {t('nav.stores')}
                      </Link>
                    </div>
                    <p className="mt-6 hidden items-center gap-1.5 text-[10px] text-white/45 sm:flex">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#7ed9a6]" />
                      Verified sellers · Easy returns · Countrywide delivery
                    </p>
                  </div>

                  <div className="flex items-end justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                      {slides.map((dot, dotIndex) => (
                        <button
                          key={dot.id}
                          type="button"
                          onClick={() => setIndex(dotIndex)}
                          aria-label={`Go to slide ${dotIndex + 1}`}
                          aria-current={dotIndex === index}
                          className={`h-1 rounded-full transition-all duration-300 ${
                            dotIndex === index
                              ? 'w-7 bg-brand'
                              : 'w-2.5 bg-white/30 hover:bg-white/55'
                          }`}
                        />
                      ))}
                      <span className="ml-1.5 font-mono text-[9px] tracking-[0.1em] text-white/40">
                        {String(index + 1).padStart(2, '0')} /{' '}
                        {String(slides.length).padStart(2, '0')}
                      </span>
                    </div>

                    {slides.length > 1 ? (
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => move(-1)}
                          className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-white/80 backdrop-blur transition hover:bg-white/15 hover:text-white"
                          aria-label="Previous slide"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => move(1)}
                          className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-white/80 backdrop-blur transition hover:bg-white/15 hover:text-white"
                          aria-label="Next slide"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {sideBanners.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2">
            {sideBanners.slice(0, 2).map((banner, bannerIndex) => (
              <SideCard
                key={banner.id}
                banner={banner}
                index={bannerIndex}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
