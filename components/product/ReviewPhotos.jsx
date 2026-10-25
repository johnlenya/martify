'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';

export default function ReviewPhotos({ images = [], alt = 'Review photo' }) {
  const [active, setActive] = useState(null);

  if (!images.length) return null;

  return (
    <>
      <div className="mt-3 flex flex-wrap gap-2">
        {images.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => setActive(index)}
            className="group relative h-16 w-16 overflow-hidden rounded-xl border border-line/80 bg-sand transition hover:border-ink/30"
            aria-label={`Open review photo ${index + 1}`}
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      <Modal
        open={active !== null}
        onClose={() => setActive(null)}
        title="Customer photo"
        description="Shared by a Martify shopper"
        size="lg"
      >
        {active !== null ? (
          <img
            src={images[active]}
            alt={alt}
            className="mx-auto max-h-[66vh] w-full rounded-2xl bg-sand object-contain"
          />
        ) : null}
        {images.length > 1 ? (
          <div className="mt-3 flex justify-center gap-2">
            {images.map((src, index) => (
              <button
                key={`thumb-${src}-${index}`}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show review photo ${index + 1}`}
                aria-current={index === active}
                className={`h-12 w-12 overflow-hidden rounded-lg border-2 transition ${
                  index === active
                    ? 'border-brand'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </Modal>
    </>
  );
}
