'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, HeartOff, RefreshCw } from 'lucide-react';
import ProductCard from '@/components/storefront/ProductCard';
import { useWishlist } from '@/components/providers/WishlistProvider';

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line/70 bg-[#fffdfa]">
      <div className="skeleton aspect-[4/5] w-full rounded-none" />
      <div className="space-y-2 p-3">
        <div className="skeleton h-2 w-1/3" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-2/3" />
        <div className="skeleton h-4 w-1/2" />
      </div>
    </div>
  );
}

export default function WishlistView() {
  const wishlist = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const key = wishlist.ids.join(',');
  const count = wishlist.ids.length;

  useEffect(() => {
    if (!wishlist.ready) return undefined;
    if (!key) {
      setProducts([]);
      setLoading(false);
      setError('');
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError('');

    fetch(`/api/products/lookup?ids=${encodeURIComponent(key)}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error('Could not load your saved items.');
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data.products)) setProducts(data.products);
      })
      .catch((fetchError) => {
        if (fetchError.name !== 'AbortError') setError(fetchError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [wishlist.ready, key, attempt]);

  const availableCount = useMemo(() => products.length, [products]);

  if (!wishlist.ready || (loading && !products.length)) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={`wishlist-skeleton-${index}`} />
        ))}
      </div>
    );
  }

  if (!count) {
    return (
      <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sand text-ink/40">
          <HeartOff className="h-6 w-6" strokeWidth={1.6} />
        </span>
        <h2 className="mt-5 font-display text-[21px] font-bold tracking-[-0.035em]">
          Nothing saved yet
        </h2>
        <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed text-muted">
          Tap the heart on any product to keep it here. Your wishlist follows you
          across devices once you sign in.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Link href="/deals" className="btn btn-primary">
            Browse today&apos;s deals
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link href="/categories" className="btn btn-outline">
            Explore categories
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FDECEA] text-[#A3301D]">
          <RefreshCw className="h-5 w-5" />
        </span>
        <h2 className="mt-4 font-display text-[19px] font-bold tracking-[-0.03em]">
          We could not load your wishlist
        </h2>
        <p className="mt-1.5 text-[12px] text-muted">{error}</p>
        <button
          type="button"
          onClick={() => setAttempt((value) => value + 1)}
          className="btn btn-primary mt-5"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-muted">
          <strong className="font-semibold text-ink">{availableCount}</strong>{' '}
          {availableCount === 1 ? 'item' : 'items'} available
          {availableCount < count
            ? ` · ${count - availableCount} no longer listed`
            : ''}
        </p>
        <Link
          href="/deals"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-soft transition hover:text-brand-dark"
        >
          Find more to love
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
