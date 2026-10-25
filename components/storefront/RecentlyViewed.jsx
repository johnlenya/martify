'use client';

import { useEffect, useState } from 'react';
import ProductRail from '@/components/storefront/ProductRail';
import { useI18n } from '@/components/providers/LocaleProvider';
import { useRecentlyViewed } from '@/components/providers/RecentlyViewedProvider';

export default function RecentlyViewed() {
  const { ids, ready } = useRecentlyViewed();
  const { t } = useI18n();
  const [products, setProducts] = useState([]);
  const key = ids.join(',');

  useEffect(() => {
    if (!ready || !key) {
      setProducts([]);
      return undefined;
    }
    const controller = new AbortController();
    fetch(`/api/products/recent?ids=${encodeURIComponent(key)}`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : { products: [] }))
      .then((data) => {
        if (Array.isArray(data.products)) setProducts(data.products);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setProducts([]);
      });
    return () => controller.abort();
  }, [ready, key]);

  if (!products.length) return null;

  return (
    <ProductRail
      id="recently-viewed-title"
      eyebrow="Picked up where you left off"
      title={t('home.recentlyViewed')}
      products={products}
      className="mt-12"
    />
  );
}
