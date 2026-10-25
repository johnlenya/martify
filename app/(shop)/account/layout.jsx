import Link from 'next/link';
import { ArrowUpRight, LogOut, ShoppingBag } from 'lucide-react';
import AccountNav from '@/components/account/AccountNav';
import SmartImage from '@/components/ui/SmartImage';
import { requireUser } from '@/lib/auth';
import { unreadNotificationCount } from '@/lib/account';

export const dynamic = 'force-dynamic';

export default async function AccountLayout({ children }) {
  const user = await requireUser('/account');
  const unread = await unreadNotificationCount(user.id);

  const avatar = user.avatarUrl ? (
    <SmartImage
      src={user.avatarUrl}
      alt={user.name}
      className="h-11 w-11 shrink-0 rounded-full"
      sizes="44px"
    />
  ) : (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand font-display text-[16px] font-bold text-white">
      {user.name.trim().charAt(0).toUpperCase()}
    </span>
  );

  return (
    <div className="container-page py-5 sm:py-7">
      <div className="grid items-start gap-4 lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-6">
        <aside className="hidden lg:sticky lg:top-[92px] lg:block">
          <section className="rounded-[1.4rem] border border-line/80 bg-night p-4 text-white shadow-[0_30px_60px_-45px_rgba(23,23,20,0.8)] sm:p-5">
            <div className="flex items-center gap-3">
              {avatar}
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[14px] font-bold tracking-[-0.02em]">
                  {user.name}
                </p>
                <p className="truncate text-[10px] text-white/45">{user.email}</p>
              </div>
              <Link
                href="/"
                aria-label="Continue shopping"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 text-white/60 transition hover:border-white/40 hover:text-white"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-4 border-t border-white/10 pt-3">
              <AccountNav user={user} unread={unread} />
            </div>

            <form action="/api/auth/logout" method="post" className="mt-4 border-t border-white/10 pt-3">
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[11px] font-semibold text-white/45 transition hover:bg-white/5 hover:text-white"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.8} />
                Sign out
              </button>
            </form>
          </section>

          <Link
            href="/help"
            className="mt-3 hidden items-center justify-between gap-2 rounded-2xl border border-line/70 bg-white/55 px-4 py-3 text-[10.5px] font-semibold text-ink-soft transition hover:border-ink/20 hover:text-ink lg:flex"
          >
            Need a hand?
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 lg:hidden">
            <div className="flex items-center gap-3 rounded-2xl border border-line/80 bg-night px-3.5 py-3 text-white">
              {avatar}
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[13px] font-bold tracking-[-0.02em]">
                  {user.name}
                </p>
                <p className="truncate text-[9.5px] text-white/45">{user.email}</p>
              </div>
              <Link
                href="/"
                aria-label="Continue shopping"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 text-white/60 transition hover:border-white/40 hover:text-white"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
              </Link>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  aria-label="Sign out"
                  className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-white/60 transition hover:border-white/40 hover:text-white"
                >
                  <LogOut className="h-3.5 w-3.5" strokeWidth={1.8} />
                </button>
              </form>
            </div>
            <div className="mt-3">
              <AccountNav user={user} unread={unread} mobile />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
