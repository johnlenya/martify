'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Heart,
  HelpCircle,
  LayoutGrid,
  LogOut,
  MapPin,
  Menu,
  Package,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  User,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import SmartImage from '@/components/ui/SmartImage';
import CategoryIcon from '@/components/storefront/CategoryIcon';
import SearchBox from '@/components/storefront/SearchBox';
import CartDrawer from '@/components/storefront/CartDrawer';
import Drawer from '@/components/ui/Drawer';
import { useCart } from '@/components/providers/CartProvider';
import { useI18n } from '@/components/providers/LocaleProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { locales } from '@/lib/i18n';

function Avatar({ user, size = 'h-8 w-8' }) {
  if (user?.avatarUrl) {
    return (
      <SmartImage
        src={user.avatarUrl}
        alt={user.name}
        className={`${size} rounded-full`}
        sizes="32px"
      />
    );
  }
  return (
    <span
      className={`${size} grid shrink-0 place-items-center rounded-full bg-sand font-display text-[12px] font-bold text-ink`}
    >
      {(user?.name || 'M').trim().charAt(0).toUpperCase()}
    </span>
  );
}

function LanguageSwitch({ compact = false }) {
  const { locale, setLocale, switching, t } = useI18n();
  return (
    <div
      className="flex items-center gap-1"
      title={t('nav.switchLanguage')}
      aria-label={t('nav.language')}
    >
      {locales.map((item, index) => (
        <span key={item.code} className="flex items-center gap-1">
          {index > 0 ? <span className="text-white/25">/</span> : null}
          <button
            type="button"
            onClick={() => setLocale(item.code)}
            disabled={switching}
            className={`text-[9.5px] font-semibold uppercase tracking-[0.08em] transition ${
              locale === item.code
                ? 'text-white'
                : 'text-white/45 hover:text-white/80'
            } ${compact ? 'px-0.5' : ''}`}
            aria-pressed={locale === item.code}
            aria-label={`Switch to ${item.label}`}
          >
            {item.short}
          </button>
        </span>
      ))}
    </div>
  );
}

export default function HeaderClient({
  categories = [],
  user = null,
  announcement = '',
  freeDeliveryThresholdCents = 500000,
}) {
  const pathname = usePathname();
  const { t } = useI18n();
  const cart = useCart();
  const wishlist = useWishlist();
  const [megaOpen, setMegaOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    setMegaOpen(false);
    setAccountOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!megaOpen && !accountOpen) return undefined;
    const onPointerDown = (event) => {
      if (!headerRef.current?.contains(event.target)) {
        setMegaOpen(false);
        setAccountOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMegaOpen(false);
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [megaOpen, accountOpen]);

  const closeAll = () => {
    setMegaOpen(false);
    setAccountOpen(false);
  };

  const cartCount = cart.hydrated ? cart.count : 0;
  const wishlistCount = wishlist.count;

  const accountLinks = user
    ? [
        { href: '/account', label: t('account'), icon: User },
        { href: '/account/orders', label: t('account.orders'), icon: Package },
        { href: '/wishlist', label: t('wishlist'), icon: Heart },
        { href: '/account/addresses', label: t('account.addresses'), icon: MapPin },
        { href: '/account/returns', label: t('account.returns'), icon: Truck },
        { href: '/account/notifications', label: t('account.notifications'), icon: HelpCircle },
      ]
    : [];

  if (user?.seller) {
    accountLinks.push({
      href: '/seller',
      label: t('account.seller'),
      icon: Store,
    });
  }
  if (user?.role === 'admin') {
    accountLinks.push({
      href: '/admin',
      label: t('account.admin'),
      icon: ShieldCheck,
    });
  }

  return (
    <header ref={headerRef} className="sticky top-0 z-50">
      <div className="bg-night text-white">
        <div className="container-page flex h-8 items-center justify-between gap-4">
          <p className="flex min-w-0 items-center gap-2 text-[10px] font-medium tracking-[0.01em] text-white/75">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            <span className="truncate">{announcement}</span>
          </p>
          <nav className="flex shrink-0 items-center gap-3.5 text-[10px] font-medium">
            <Link
              href="/help"
              className="hidden text-white/60 transition hover:text-white sm:inline"
            >
              {t('nav.help')}
            </Link>
            <Link
              href="/track"
              className="hidden text-white/60 transition hover:text-white sm:inline"
            >
              {t('nav.track')}
            </Link>
            <Link
              href="/sell"
              className="hidden text-white/60 transition hover:text-white md:inline"
            >
              {t('nav.sell')}
            </Link>
            <LanguageSwitch />
          </nav>
        </div>
      </div>

      <div className="border-b border-line/80 bg-cream/95 backdrop-blur-xl supports-[backdrop-filter]:bg-cream/85">
        <div className="container-page">
          <div className="flex h-[60px] items-center gap-2.5 sm:gap-3 lg:h-[74px] lg:gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink transition hover:bg-sand lg:hidden"
              aria-label={t('nav.openMenu')}
            >
              <Menu className="h-5 w-5" strokeWidth={1.8} />
            </button>

            <Logo />

            <button
              type="button"
              onClick={() => {
                setAccountOpen(false);
                setMegaOpen((open) => !open);
              }}
              aria-expanded={megaOpen}
              aria-controls="martify-mega-menu"
              className="btn btn-dark hidden h-10 shrink-0 rounded-full px-4 lg:inline-flex"
            >
              <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2} />
              {t('nav.all')}
              <ChevronDown
                className={`h-3 w-3 transition-transform ${megaOpen ? 'rotate-180' : ''}`}
                strokeWidth={2}
              />
            </button>

            <div className="hidden min-w-0 flex-1 justify-center md:flex">
              <div className="w-full max-w-[680px]">
                <SearchBox />
              </div>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
              <Link
                href="/wishlist"
                className="relative hidden h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-sand sm:grid"
                aria-label={`${t('wishlist')}${wishlistCount ? ` (${wishlistCount})` : ''}`}
              >
                <Heart className="h-[19px] w-[19px]" strokeWidth={1.7} />
                {wishlistCount ? (
                  <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[8.5px] font-bold text-white">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                ) : null}
              </Link>

              <div className="relative hidden sm:block">
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMegaOpen(false);
                      setAccountOpen((open) => !open);
                    }}
                    className="flex h-10 items-center gap-2 rounded-full px-2 transition hover:bg-sand"
                    aria-expanded={accountOpen}
                    aria-controls="martify-account-menu"
                  >
                    <Avatar user={user} />
                    <span className="hidden max-w-[90px] truncate text-[11.5px] font-semibold text-ink xl:block">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown
                      className={`hidden h-3 w-3 text-muted transition-transform xl:block ${accountOpen ? 'rotate-180' : ''}`}
                      strokeWidth={2}
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMegaOpen(false);
                      setAccountOpen((open) => !open);
                    }}
                    className="flex h-10 items-center gap-2 rounded-full px-2.5 text-[11.5px] font-semibold text-ink transition hover:bg-sand"
                    aria-expanded={accountOpen}
                    aria-controls="martify-account-menu"
                  >
                    <User className="h-[18px] w-[18px]" strokeWidth={1.8} />
                    <span className="hidden xl:inline">{t('account')}</span>
                    <ChevronDown
                      className={`hidden h-3 w-3 text-muted transition-transform xl:block ${accountOpen ? 'rotate-180' : ''}`}
                      strokeWidth={2}
                    />
                  </button>
                )}

                {accountOpen ? (
                  <div
                    id="martify-account-menu"
                    className="absolute right-0 top-[calc(100%+10px)] z-[60] w-[270px] overflow-hidden rounded-2xl border border-line bg-[#fffdfa] shadow-[0_28px_60px_-26px_rgba(23,23,20,0.35)]"
                  >
                    {user ? (
                      <>
                        <div className="flex items-center gap-3 border-b border-line/70 px-4 py-3.5">
                          <Avatar user={user} size="h-10 w-10" />
                          <div className="min-w-0">
                            <p className="truncate text-[12.5px] font-semibold text-ink">
                              {user.name}
                            </p>
                            <p className="truncate text-[10.5px] text-muted">{user.email}</p>
                          </div>
                        </div>
                        <div className="p-1.5">
                          {accountLinks.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-medium text-ink-soft transition hover:bg-sand hover:text-ink"
                            >
                              <item.icon className="h-4 w-4 text-muted" strokeWidth={1.7} />
                              {item.label}
                            </Link>
                          ))}
                        </div>
                        <form action="/api/auth/logout" method="post" className="border-t border-line/70 p-1.5">
                          <button
                            type="submit"
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[12px] font-medium text-ink-soft transition hover:bg-sand hover:text-ink"
                          >
                            <LogOut className="h-4 w-4 text-muted" strokeWidth={1.7} />
                            {t('signOut')}
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="p-4">
                        <p className="eyebrow">{t('account')}</p>
                        <h3 className="mt-1.5 font-display text-[17px] font-bold tracking-[-0.03em]">
                          {t('signInPrompt')}
                        </h3>
                        <div className="mt-3 grid gap-2">
                          <Link
                            href="/login"
                            onClick={closeAll}
                            className="btn btn-primary w-full"
                          >
                            {t('signIn')}
                          </Link>
                          <Link
                            href="/register"
                            onClick={closeAll}
                            className="btn btn-outline w-full"
                          >
                            {t('signUp')}
                          </Link>
                        </div>
                        <div className="mt-3 space-y-1 border-t border-line/70 pt-3">
                          <Link
                            href="/track"
                            className="flex items-center gap-2 rounded-lg px-2 py-2 text-[11.5px] text-ink-soft transition hover:bg-sand hover:text-ink"
                          >
                            <Truck className="h-3.5 w-3.5 text-muted" />
                            {t('nav.track')}
                          </Link>
                          <Link
                            href="/help"
                            className="flex items-center gap-2 rounded-lg px-2 py-2 text-[11.5px] text-ink-soft transition hover:bg-sand hover:text-ink"
                          >
                            <HelpCircle className="h-3.5 w-3.5 text-muted" />
                            {t('nav.help')}
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => cart.setDrawerOpen(true)}
                className="relative flex h-10 items-center gap-2 rounded-full px-2 text-ink transition hover:bg-sand sm:px-2.5"
                aria-label={`${t('cart')}${cartCount ? ` (${cartCount})` : ''}`}
              >
                <ShoppingCart className="h-[19px] w-[19px]" strokeWidth={1.75} />
                <span className="hidden text-[11.5px] font-semibold lg:inline">
                  {t('cart')}
                </span>
                {cartCount ? (
                  <span className="absolute left-7 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[8.5px] font-bold text-white sm:static sm:ml-0.5 sm:bg-brand sm:text-[9.5px]">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          <div className="pb-3 md:hidden">
            <SearchBox compact />
          </div>
        </div>

        {megaOpen ? (
          <div
            id="martify-mega-menu"
            className="absolute inset-x-0 top-full hidden border-t border-line bg-[#fffdfa] shadow-[0_30px_60px_-30px_rgba(23,23,20,0.35)] lg:block"
          >
            <div className="container-page grid gap-8 py-6 lg:grid-cols-[230px_1fr]">
              <aside className="border-r border-line/80 pr-6">
                <p className="eyebrow">{t('nav.browseCategories')}</p>
                <div className="mt-3 space-y-0.5">
                  <Link
                    href="/deals"
                    onClick={closeAll}
                    className="flex items-center justify-between rounded-xl px-2.5 py-2 text-[12.5px] font-semibold text-ink transition hover:bg-sand"
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-brand" strokeWidth={1.8} />
                      {t('nav.deals')}
                    </span>
                    <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-brand">
                      Hot
                    </span>
                  </Link>
                  <Link
                    href="/new"
                    onClick={closeAll}
                    className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-[12.5px] font-medium text-ink-soft transition hover:bg-sand hover:text-ink"
                  >
                    <Package className="h-4 w-4 text-muted" strokeWidth={1.8} />
                    {t('nav.new')}
                  </Link>
                  <Link
                    href="/stores"
                    onClick={closeAll}
                    className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-[12.5px] font-medium text-ink-soft transition hover:bg-sand hover:text-ink"
                  >
                    <Store className="h-4 w-4 text-muted" strokeWidth={1.8} />
                    {t('nav.stores')}
                  </Link>
                  <Link
                    href="/track"
                    onClick={closeAll}
                    className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-[12.5px] font-medium text-ink-soft transition hover:bg-sand hover:text-ink"
                  >
                    <Truck className="h-4 w-4 text-muted" strokeWidth={1.8} />
                    {t('nav.track')}
                  </Link>
                </div>

                <div className="mt-5 rounded-2xl bg-night p-4 text-white">
                  <p className="eyebrow text-white/45">Martify sellers</p>
                  <p className="mt-1.5 font-display text-[14px] font-bold leading-snug">
                    Your shop belongs here.
                  </p>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-white/60">
                    Reach thousands of shoppers across Kenya.
                  </p>
                  <Link
                    href="/sell"
                    onClick={closeAll}
                    className="mt-3 inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand"
                  >
                    {t('nav.sell')} →
                  </Link>
                </div>
              </aside>

              <nav className="grid grid-cols-2 gap-x-6 gap-y-6 xl:grid-cols-4">
                {categories.map((category) => (
                  <div key={category.id}>
                    <Link
                      href={`/category/${category.slug}`}
                      onClick={closeAll}
                      className="group flex items-center gap-2 text-[12.5px] font-bold text-ink transition hover:text-brand-dark"
                    >
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-sand text-ink transition group-hover:bg-brand-soft group-hover:text-brand-dark">
                        <CategoryIcon name={category.icon} className="h-3.5 w-3.5" />
                      </span>
                      {category.name}
                    </Link>
                    <ul className="mt-2 space-y-1 pl-9">
                      {category.children.slice(0, 5).map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/category/${child.slug}`}
                            onClick={closeAll}
                            className="text-[11px] text-muted transition hover:text-brand-dark"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>
            <div className="border-t border-line/70">
              <div className="container-page flex h-10 items-center justify-between text-[10.5px] text-muted">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-leaf" /> Verified sellers and
                  protected payments
                </span>
                <Link
                  href="/categories"
                  onClick={closeAll}
                  className="font-semibold text-ink transition hover:text-brand-dark"
                >
                  {t('nav.viewAllCategories')} →
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        side="left"
        width="max-w-[350px]"
        eyebrow="Martify"
        title={t('nav.browseCategories')}
      >
        <div className="p-4">
          {user ? (
            <div className="flex items-center gap-3 rounded-2xl bg-sand/70 p-3">
              <Avatar user={user} size="h-10 w-10" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted">{t('account.signedInAs')}</p>
                <p className="truncate text-[12.5px] font-semibold text-ink">{user.name}</p>
              </div>
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="ml-auto shrink-0 text-[10.5px] font-semibold text-brand-dark"
              >
                {t('account')}
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl bg-night p-4 text-white">
              <p className="font-display text-[16px] font-bold tracking-[-0.03em]">
                {t('signInPrompt')}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-white/60">
                Track orders, save your wishlist and check out faster.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-primary btn-sm w-full"
                >
                  {t('signIn')}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-sm w-full border-white/20 bg-white/10 text-white hover:bg-white/15"
                >
                  {t('signUp')}
                </Link>
              </div>
            </div>
          )}

          <div className="mt-5">
            <p className="eyebrow px-1">{t('nav.browseCategories')}</p>
            <ul className="mt-2 space-y-0.5">
              {categories.map((category) => (
                <li key={category.id} className="border-b border-ink/[0.05] py-1.5 last:border-0">
                  <Link
                    href={`/category/${category.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-1 py-1.5 text-[12.5px] font-semibold text-ink"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-sand text-ink">
                      <CategoryIcon name={category.icon} className="h-3.5 w-3.5" />
                    </span>
                    {category.name}
                  </Link>
                  <div className="ml-10 flex flex-wrap gap-x-3 gap-y-1 pb-1.5">
                    {category.children.slice(0, 4).map((child) => (
                      <Link
                        key={child.id}
                        href={`/category/${child.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="text-[10.5px] text-muted"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 rounded-2xl border border-line bg-cream/60 p-1.5">
            {[
              { href: '/deals', label: t('nav.deals'), icon: ShoppingBag },
              { href: '/new', label: t('nav.new'), icon: Package },
              { href: '/stores', label: t('nav.stores'), icon: Store },
              { href: '/track', label: t('nav.track'), icon: Truck },
              { href: '/sell', label: t('nav.sell'), icon: Store },
              { href: '/help', label: t('nav.help'), icon: HelpCircle },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-medium text-ink-soft transition hover:bg-white hover:text-ink"
              >
                <item.icon className="h-4 w-4 text-muted" strokeWidth={1.7} />
                {item.label}
              </Link>
            ))}
          </div>

          {user ? (
            <div className="mt-3 grid gap-1.5">
              <Link
                href="/account/orders"
                onClick={() => setMobileOpen(false)}
                className="btn btn-outline w-full"
              >
                {t('account.orders')}
              </Link>
              {user.seller ? (
                <Link
                  href="/seller"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-outline w-full"
                >
                  {t('account.seller')}
                </Link>
              ) : null}
              <form action="/api/auth/logout" method="post">
                <button type="submit" className="btn btn-ghost w-full text-muted">
                  {t('signOut')}
                </button>
              </form>
            </div>
          ) : null}

          <div className="mt-5 flex items-center justify-between border-t border-line/70 pt-4">
            <span className="text-[10.5px] text-muted">{t('nav.language')}</span>
            <div className="rounded-full bg-night px-2.5 py-1.5">
              <LanguageSwitch compact />
            </div>
          </div>
        </div>
      </Drawer>

      <CartDrawer freeDeliveryThresholdCents={freeDeliveryThresholdCents} />
    </header>
  );
}
