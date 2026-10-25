'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useTransition,
} from 'react';
import { useRouter } from 'next/navigation';
import { getDictionary, LOCALE_COOKIE, translate } from '@/lib/i18n';

const LocaleContext = createContext(null);

export function LocaleProvider({ locale, children }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const dictionary = useMemo(() => getDictionary(locale), [locale]);

  const t = useCallback(
    (key, vars) => translate(dictionary, key, vars),
    [dictionary],
  );

  const setLocale = useCallback(
    (nextLocale) => {
      if (nextLocale === locale) return;
      document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
      startTransition(() => {
        router.refresh();
      });
    },
    [locale, router],
  );

  const value = useMemo(
    () => ({ locale, dictionary, t, setLocale, switching: pending }),
    [locale, dictionary, t, setLocale, pending],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useI18n must be used within LocaleProvider');
  }
  return context;
}
