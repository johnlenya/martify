'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  ImageOff,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import SmartImage from '@/components/ui/SmartImage';

export default function ProductGallery({
  images = [],
  title,
  discountPercent = 0,
  flash = false,
}) {
  const list = images.length ? images : [null];
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const [lightbox, setLightbox] = useState(false);

  const safeIndex = Math.min(active, list.length - 1);
  const current = list[safeIndex];

  const step = (direction) => {
    setFailed(false);
    setActive((index) => (index + direction + list.length) % list.length);
  };

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  const select = (index) => {
    setFailed(false);
    setActive(index);
  };

  const main = current && !failed ? (
    <img
      src={current}
      alt={title}
      loading="eager"
      fetchPriority="high"
      decoding="async"
      onError={() => setFailed(true)}
      onMouseMove={handleMove}
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
      style={{ transformOrigin: origin }}
      className={`h-full w-full object-cover transition-transform duration-500 ${
        zoomed ? 'scale-[1.9] cursor-zoom-in' : 'scale-100'
      }`}
    />
  ) : (
    <SmartImage src={null} alt={title} className="h-full w-full" />
  );

  return (
    <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5 sm:w-[70px] sm:shrink-0 sm:flex-col sm:overflow-visible">
        {list.map((src, index) => (
          <button
            key={`${src || 'fallback'}-${index}`}
            type="button"
            onClick={() => select(index)}
            aria-label={`View image ${index + 1} of ${list.length}`}
            aria-current={index === safeIndex}
            className={`relative h-[62px] w-[62px] shrink-0 overflow-hidden rounded-xl border bg-white transition ${
              index === safeIndex
                ? 'border-brand shadow-[0_8px_18px_-12px_rgba(237,90,34,0.75)]'
                : 'border-line/80 hover:border-ink/25'
            }`}
          >
            {src ? (
              <img
                src={src}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="grid h-full w-full place-items-center bg-sand text-muted">
                <ImageOff className="h-4 w-4" />
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="relative flex-1">
        <div className="relative aspect-square w-full overflow-hidden rounded-[1.6rem] border border-line/80 bg-sand">
          {main}

          <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
            {discountPercent > 0 ? (
              <span className="rounded-full bg-brand px-2.5 py-1 text-[10.5px] font-bold leading-none text-white shadow-[0_8px_20px_-10px_rgba(237,90,34,0.9)]">
                −{discountPercent}%
              </span>
            ) : null}
            {flash ? (
              <span className="rounded-full bg-night/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-white backdrop-blur">
                Flash sale
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-white/85 text-ink shadow-sm backdrop-blur transition hover:bg-white"
            aria-label="Open full-size image"
          >
            <Expand className="h-4 w-4" strokeWidth={1.8} />
          </button>

          {list.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                className="absolute left-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-white/85 text-ink shadow-sm backdrop-blur transition hover:bg-white"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                className="absolute right-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-white/85 text-ink shadow-sm backdrop-blur transition hover:bg-white"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </>
          ) : null}

          <span className="absolute bottom-3 right-3 z-10 rounded-full bg-night/70 px-2 py-1 font-mono text-[9px] font-medium text-white/90 backdrop-blur">
            {safeIndex + 1} / {list.length}
          </span>
        </div>

        <p className="mt-2 hidden text-center text-[9.5px] text-muted sm:block">
          Hover to zoom · Tap the expand icon for a closer look
        </p>
      </div>

      <Modal
        open={lightbox}
        onClose={() => setLightbox(false)}
        title={title}
        description={`Image ${safeIndex + 1} of ${list.length}`}
        size="xl"
      >
        <div className="relative">
          {current && !failed ? (
            <img
              src={current}
              alt={title}
              className="mx-auto max-h-[66vh] w-full rounded-2xl bg-sand object-contain"
            />
          ) : (
            <SmartImage
              src={null}
              alt={title}
              className="mx-auto aspect-square max-h-[66vh] w-full rounded-2xl"
            />
          )}

          {list.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-white/90 text-ink shadow-sm backdrop-blur transition hover:bg-white"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-white/90 text-ink shadow-sm backdrop-blur transition hover:bg-white"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </>
          ) : null}
        </div>

        {list.length > 1 ? (
          <div className="mt-3 flex items-center justify-center gap-2">
            {list.map((src, index) => (
              <button
                key={`lightbox-${src || 'fallback'}-${index}`}
                type="button"
                onClick={() => select(index)}
                aria-label={`Show image ${index + 1}`}
                aria-current={index === safeIndex}
                className={`h-12 w-12 overflow-hidden rounded-lg border-2 bg-sand transition ${
                  index === safeIndex ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                {src ? (
                  <img src={src} alt="" className="h-full w-full object-cover" />
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
