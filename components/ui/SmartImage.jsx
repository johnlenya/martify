'use client';

import { useState } from 'react';

function hueFor(text) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) % 360;
  }
  return hash;
}

export default function SmartImage({
  src,
  alt = '',
  className = '',
  imageClassName = '',
  loading = 'lazy',
  sizes,
  priority = false,
}) {
  const [failed, setFailed] = useState(false);
  const positioned = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className);
  const wrapperClass = `${positioned ? '' : 'relative'} overflow-hidden ${className}`.trim();

  if (!src || failed) {
    const hue = hueFor(alt || 'martify');
    const initial = (alt || 'M').trim().charAt(0).toUpperCase();
    return (
      <div
        className={`${wrapperClass} flex items-center justify-center`}
        style={{
          background: `linear-gradient(135deg, hsl(${hue} 30% 88%) 0%, hsl(${(hue + 34) % 360} 28% 74%) 100%)`,
        }}
        aria-label={alt}
        role="img"
      >
        <span
          aria-hidden="true"
          className="font-display text-[2.2rem] font-extrabold text-white/55"
        >
          {initial}
        </span>
        <span className="absolute bottom-2 right-2 h-1.5 w-6 rounded-full bg-white/35" />
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : loading}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        sizes={sizes}
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover ${imageClassName}`}
      />
    </div>
  );
}
