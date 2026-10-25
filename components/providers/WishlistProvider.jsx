'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useToast } from './ToastProvider';

const WishlistContext = createContext(null);
const GUEST_KEY = 'martify_wishlist_v1';
const EMPTY_IDS = [];

export function WishlistProvider({ initialIds = EMPTY_IDS, signedIn, children }) {
  const toast = useToast();
  const [ids, setIds] = useState(initialIds);
  const [pendingId, setPendingId] = useState(null);
  const [ready, setReady] = useState(Boolean(signedIn));
  const loadedFor = useRef(null);

  useEffect(() => {
    if (loadedFor.current === Boolean(signedIn)) return;
    loadedFor.current = Boolean(signedIn);

    if (signedIn) {
      setIds(initialIds);
      setReady(true);
      return;
    }
    try {
      const raw = window.localStorage.getItem(GUEST_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setIds(parsed);
      }
    } catch {
      // Ignore malformed local storage.
    }
    setReady(true);
  }, [signedIn, initialIds]);

  useEffect(() => {
    if (signedIn || !ready) return;
    window.localStorage.setItem(GUEST_KEY, JSON.stringify(ids));
  }, [ids, signedIn, ready]);

  const toggle = useCallback(
    async (productId, title = 'Item') => {
      if (!productId) return;
      const wasSaved = ids.includes(productId);
      setPendingId(productId);
      setIds((current) =>
        wasSaved
          ? current.filter((id) => id !== productId)
          : [...current, productId],
      );

      if (!signedIn) {
        toast.info(
          wasSaved
            ? 'Removed from your wishlist.'
            : 'Saved on this device. Sign in to sync it everywhere.',
          wasSaved ? 'Wishlist' : 'Saved',
        );
        setPendingId(null);
        return;
      }

      try {
        const response = await fetch('/api/wishlist', {
          method: wasSaved ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not update wishlist.');
        toast.success(
          wasSaved
            ? 'Removed from your wishlist.'
            : `${title} saved to your wishlist.`,
          wasSaved ? 'Wishlist' : 'Saved',
        );
      } catch (error) {
        setIds((current) =>
          wasSaved
            ? [...new Set([...current, productId])]
            : current.filter((id) => id !== productId),
        );
        toast.error(error.message);
      } finally {
        setPendingId(null);
      }
    },
    [ids, signedIn, toast],
  );

  const value = useMemo(
    () => ({
      ids,
      count: ids.length,
      ready,
      isSaved: (id) => ids.includes(id),
      toggle,
      pendingId,
    }),
    [ids, ready, toggle, pendingId],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
