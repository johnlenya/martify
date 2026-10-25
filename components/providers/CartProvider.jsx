'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useToast } from './ToastProvider';

const CartContext = createContext(null);
const CART_KEY = 'martify_cart_v1';
const SAVED_KEY = 'martify_saved_v1';
const COUPON_KEY = 'martify_coupon_v1';

function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function itemKey(productId, variantId) {
  return `${productId}:${variantId ?? 'default'}`;
}

export function CartProvider({ children }) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setItems(readStorage(CART_KEY, []));
    setSavedItems(readStorage(SAVED_KEY, []));
    setCoupon(readStorage(COUPON_KEY, null));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(savedItems));
  }, [savedItems, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (coupon) {
      window.localStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
    } else {
      window.localStorage.removeItem(COUPON_KEY);
    }
  }, [coupon, hydrated]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === CART_KEY) setItems(readStorage(CART_KEY, []));
      if (event.key === SAVED_KEY) setSavedItems(readStorage(SAVED_KEY, []));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addItem = useCallback(
    (product, { quantity = 1, variant = null, open = true } = {}) => {
      const key = itemKey(product.id, variant?.id);
      const stock = Number(variant?.stock ?? product.stock ?? 0);
      if (stock <= 0) {
        toast.error('That item is out of stock right now.');
        return false;
      }
      const priceCents = Number(variant?.priceCents ?? product.priceCents ?? 0);
      setItems((current) => {
        const existing = current.find((item) => item.key === key);
        if (existing) {
          return current.map((item) =>
            item.key === key
              ? {
                  ...item,
                  quantity: Math.min(stock, item.quantity + quantity),
                  stock,
                  priceCents,
                }
              : item,
          );
        }
        return [
          ...current,
          {
            key,
            productId: product.id,
            slug: product.slug,
            title: product.title,
            image: product.image,
            sellerName: product.seller?.name ?? '',
            priceCents,
            compareAtCents: product.compareAtCents ?? null,
            quantity: Math.min(stock, quantity),
            stock,
            variantId: variant?.id ?? null,
            variantName: variant?.name ?? null,
          },
        ];
      });
      toast.success(`${product.title} added to your cart.`, 'Added to cart');
      if (open) setDrawerOpen(true);
      return true;
    },
    [toast],
  );

  const removeItem = useCallback((key) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  const setQuantity = useCallback((key, quantity) => {
    setItems((current) =>
      current.map((item) => {
        if (item.key !== key) return item;
        const next = Math.max(1, Math.min(item.stock, Math.round(quantity)));
        return { ...item, quantity: next };
      }),
    );
  }, []);

  const saveForLater = useCallback(
    (key) => {
      const item = items.find((entry) => entry.key === key);
      if (!item) return;
      setSavedItems((saved) =>
        saved.some((entry) => entry.key === key) ? saved : [...saved, item],
      );
      setItems((current) => current.filter((entry) => entry.key !== key));
      toast.info('Moved to saved for later.');
    },
    [items, toast],
  );

  const moveToCart = useCallback(
    (key) => {
      const item = savedItems.find((entry) => entry.key === key);
      if (!item) return;
      setItems((cart) =>
        cart.some((entry) => entry.key === key) ? cart : [...cart, item],
      );
      setSavedItems((current) =>
        current.filter((entry) => entry.key !== key),
      );
      toast.success('Moved back to your cart.');
    },
    [savedItems, toast],
  );

  const removeSaved = useCallback((key) => {
    setSavedItems((current) => current.filter((item) => item.key !== key));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
  }, []);

  const applyCoupon = useCallback((nextCoupon) => {
    setCoupon(nextCoupon);
  }, []);

  const removeCoupon = useCallback(() => setCoupon(null), []);

  const subtotalCents = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.priceCents * item.quantity,
        0,
      ),
    [items],
  );

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      savedItems,
      coupon,
      subtotalCents,
      count,
      hydrated,
      drawerOpen,
      setDrawerOpen,
      addItem,
      removeItem,
      setQuantity,
      saveForLater,
      moveToCart,
      removeSaved,
      clearCart,
      applyCoupon,
      removeCoupon,
    }),
    [
      items,
      savedItems,
      coupon,
      subtotalCents,
      count,
      hydrated,
      drawerOpen,
      addItem,
      removeItem,
      setQuantity,
      saveForLater,
      moveToCart,
      removeSaved,
      clearCart,
      applyCoupon,
      removeCoupon,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
