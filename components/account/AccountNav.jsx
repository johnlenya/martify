'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Heart,
  LayoutDashboard,
  LifeBuoy,
  MapPin,
  Package,
  RotateCcw,
  Share2,
  ShieldCheck,
  Store,
  Bell,
} from 'lucide-react';
import { useI18n } from '@/components/providers/LocaleProvider';

export default function AccountNav({
  user,
  unread = 0,
  mobile = false,
}) {
  const pathname = usePathname();
  const { t } = useI18n();

  const links = [
    { href: '/account', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/account/orders', label: t('account.orders'), icon: Package },
    { href: '/wishlist', label: t('wishlist'), icon: Heart },
    { href: '/account/addresses', label: t('account.addresses'), icon: MapPin },
    { href: '/account/returns', label: t('account.returns'), icon: RotateCcw },
    {
      href: '/account/notifications',
      label: t('account.notifications'),
      icon: Bell,
      badge: unread,
    },
    { href: '/account/affiliate', label: 'Affiliate', icon: Share2 },
  ];

  const workspace = [];
  if (user?.seller) {
    workspace.push({
      href: '/seller',
      label: t('account.seller'),
      icon: Store,
    });
  }
  if (user?.role === 'admin') {
    workspace.push({
      href: '/admin',
      label: t('account.admin'),
      icon: ShieldCheck,
    });
  }

  const isActive = (item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  if (mobile) {
    return (
      <nav
        aria-label="Account sections"
        className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:hidden"
      >
        {[...links, ...workspace].map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-[10.5px] font-semibold transition ${
                active
                  ? 'border-night bg-night text-white'
                  : 'border-line bg-white/80 text-ink-soft hover:border-ink/25'
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
              {item.label}
              {item.badge ? (
                <span
                  className={`grid h-4 min-w-4 place-items-center rounded-full px-1 text-[8.5px] font-bold ${
                    active ? 'bg-brand text-white' : 'bg-brand-soft text-brand-dark'
                  }`}
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav aria-label="Account sections" className="flex flex-col gap-0.5">
      {links.map((item) => {
        const Icon = item.icon;
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`side-link ${active ? 'side-link-active' : ''}`}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
            <span className="flex-1">{item.label}</span>
            {item.badge ? (
              <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[8.5px] font-bold text-white">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}

      {workspace.length ? (
        <>
          <p className="mt-4 px-3 text-[8.5px] font-semibold uppercase tracking-[0.14em] text-white/25">
            Workspace
          </p>
          {workspace.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="side-link mt-0.5">
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </>
      ) : null}

      <div className="mt-4 border-t border-white/10 pt-3">
        <Link href="/help" className="side-link">
          <LifeBuoy className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          Help centre
        </Link>
      </div>
    </nav>
  );
}
