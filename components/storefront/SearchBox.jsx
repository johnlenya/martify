'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Loader2, Search, TrendingUp } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import { useI18n } from '@/components/providers/LocaleProvider';
import { formatMoney } from '@/lib/money';

const POPULAR = ['iPhone', 'Sneakers', 'Sofa', 'M-Pesa', 'Coffee', 'Skincare'];

export default function SearchBox({ compact = false }) {
  const router = useRouter();
  const { t } = useI18n();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState({ products: [], categories: [] });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const query = term.trim();
    if (query.length < 2) {
      setResults({ products: [], categories: [] });
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error('Search is unavailable.');
        const data = await response.json();
        setResults({
          products: Array.isArray(data.products) ? data.products : [],
          categories: Array.isArray(data.categories) ? data.categories : [],
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setResults({ products: [], categories: [] });
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [term]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const goToSearch = (value = term) => {
    const query = value.trim();
    if (!query) {
      inputRef.current?.focus();
      return;
    }
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const options = [
    ...results.categories.map((category) => ({
      type: 'category',
      key: `category-${category.slug}`,
      href: `/category/${category.slug}`,
      category,
    })),
    ...results.products.map((product) => ({
      type: 'product',
      key: `product-${product.slug}`,
      href: `/product/${product.slug}`,
      product,
    })),
  ];

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((current) => Math.min(options.length - 1, current + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((current) => Math.max(-1, current - 1));
    } else if (event.key === 'Enter') {
      if (open && active >= 0 && options[active]) {
        event.preventDefault();
        setOpen(false);
        router.push(options[active].href);
      }
    }
  };

  const showPanel = open && (term.trim().length >= 2 || term.length === 0);
  const hasResults = results.products.length > 0 || results.categories.length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          goToSearch();
        }}
        className={`flex items-center overflow-hidden rounded-full border border-line bg-white transition focus-within:border-ink/30 focus-within:shadow-[0_10px_30px_-24px_rgba(23,23,20,0.6)] ${
          compact ? 'h-9' : 'h-10 sm:h-11'
        }`}
      >
        <Search
          className="ml-3.5 h-4 w-4 shrink-0 text-muted"
          strokeWidth={1.8}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          type="search"
          placeholder={t('search.placeholder')}
          aria-label={t('search.placeholder')}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="martify-search-results"
          aria-autocomplete="list"
          className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-[12.5px] text-ink outline-none placeholder:text-muted/90 sm:text-[13px]"
        />
        <button
          type="submit"
          className="m-1 grid h-[calc(100%-8px)] shrink-0 place-items-center rounded-full bg-night px-3.5 text-white transition hover:bg-brand sm:px-4"
          aria-label={t('search.button')}
        >
          <Search className="h-4 w-4" strokeWidth={2} />
        </button>
      </form>

      {showPanel ? (
        <div
          id="martify-search-results"
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+8px)] z-[70] overflow-hidden rounded-2xl border border-line bg-[#fffdfa] shadow-[0_28px_60px_-24px_rgba(23,23,20,0.32)]"
        >
          {term.trim().length < 2 ? (
            <div className="p-4">
              <p className="eyebrow flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3" /> {t('search.trending')}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {POPULAR.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setTerm(item);
                      goToSearch(item);
                    }}
                    className="chip transition hover:border-brand/40 hover:bg-brand-soft hover:text-brand-dark"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : loading && !hasResults ? (
            <p className="flex items-center gap-2 px-4 py-5 text-[12px] text-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t('search.searching')}
            </p>
          ) : !hasResults ? (
            <p className="px-4 py-5 text-[12px] text-muted">{t('search.empty')}</p>
          ) : (
            <div className="max-h-[min(70vh,480px)] overflow-y-auto">
              {results.categories.length ? (
                <div className="border-b border-line/70 p-2">
                  <p className="eyebrow px-2 py-1.5">{t('search.categories')}</p>
                  {results.categories.map((category, index) => (
                    <Link
                      key={category.slug}
                      href={`/category/${category.slug}`}
                      role="option"
                      aria-selected={active === index}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-[12px] transition ${
                        active === index
                          ? 'bg-sand text-ink'
                          : 'text-ink-soft hover:bg-sand/70'
                      }`}
                    >
                      <span>{category.name}</span>
                      <ArrowUpRight className="h-3 w-3 text-muted" />
                    </Link>
                  ))}
                </div>
              ) : null}

              {results.products.length ? (
                <div className="p-2">
                  <p className="eyebrow px-2 py-1.5">{t('search.products')}</p>
                  {results.products.map((product, index) => {
                    const optionIndex = results.categories.length + index;
                    return (
                      <Link
                        key={product.slug}
                        href={`/product/${product.slug}`}
                        role="option"
                        aria-selected={active === optionIndex}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-2 py-2 transition ${
                          active === optionIndex
                            ? 'bg-sand'
                            : 'hover:bg-sand/70'
                        }`}
                      >
                        <SmartImage
                          src={product.image}
                          alt={product.title}
                          className="h-10 w-10 shrink-0 rounded-lg"
                          sizes="40px"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-semibold text-ink">
                            {product.title}
                          </span>
                          <span className="block truncate text-[10.5px] text-muted">
                            {product.sellerName}
                          </span>
                        </span>
                        <span className="price shrink-0 text-[11.5px] font-semibold text-ink">
                          {formatMoney(product.priceCents)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => goToSearch()}
                className="flex w-full items-center justify-center gap-1.5 border-t border-line/70 bg-cream/60 px-4 py-3 text-[11.5px] font-semibold text-ink transition hover:bg-sand"
              >
                {t('search.viewResults', { term: term.trim() })}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
