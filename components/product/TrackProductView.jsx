'use client';

import { useEffect } from 'react';
import { useRecentlyViewed } from '@/components/providers/RecentlyViewedProvider';

export default function TrackProductView({ productId }) {
  const { track, ready } = useRecentlyViewed();

  useEffect(() => {
    if (!ready || !productId) return;
    track(productId);
  }, [ready, productId, track]);

  return null;
}
