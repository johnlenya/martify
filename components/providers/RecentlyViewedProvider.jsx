'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const RecentlyViewedContext = createContext(null);
const KEY = 'martify_recent_v1';
const LIMIT = 14;

export function RecentlyViewedProvider({ children }) {
  const [ids, setIds] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setIds(parsed.filter(Boolean).slice(0, LIMIT));
    } catch {
      setIds([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids, ready]);

  const track = useCallback((productId) => {
    if (!productId) return;
    setIds((current) => [
      productId,
      ...current.filter((id) => id !== productId),
    ].slice(0, LIMIT));
  }, []);

  const clear = useCallback(() => setIds([]), []);

  const value = useMemo(
    () => ({ ids, ready, track, clear }),
    [ids, ready, track, clear],
  );

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider');
  }
  return context;
}
