'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  Info,
  Loader2,
  Package,
  RotateCcw,
  Tag,
  Wallet,
} from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';
import { timeAgo } from '@/lib/format';

const ICONS = {
  order: Package,
  promo: Tag,
  payout: Wallet,
  return: RotateCcw,
  info: Info,
};

export default function NotificationsList({ notifications = [] }) {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState(notifications);
  const [view, setView] = useState('all');
  const [busy, setBusy] = useState(false);

  const unread = items.filter((item) => !item.read).length;
  const visible = view === 'unread' ? items.filter((item) => !item.read) : items;

  const markRead = async (payload) => {
    const response = await fetch('/api/account/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Could not update notifications.');
  };

  const markAll = async () => {
    if (!unread || busy) return;
    setBusy(true);
    const previous = items;
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    try {
      await markRead({ all: true });
      toast.success('All caught up.');
      router.refresh();
    } catch (error) {
      setItems(previous);
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const markOne = async (id) => {
    const current = items.find((item) => item.id === id);
    if (!current || current.read) return;
    setItems((list) =>
      list.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
    try {
      await markRead({ id });
      router.refresh();
    } catch {
      setItems((list) =>
        list.map((item) => (item.id === id ? { ...item, read: false } : item)),
      );
    }
  };

  return (
    <section className="overflow-hidden rounded-[1.3rem] border border-line/80 bg-[#fffdfa]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/[0.06] px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-1.5">
          {[
            { key: 'all', label: `All ${items.length}` },
            { key: 'unread', label: `Unread ${unread}` },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setView(item.key)}
              className={`rounded-full px-2.5 py-1.5 text-[10px] font-semibold transition ${
                view === item.key
                  ? 'bg-night text-white'
                  : 'text-ink-soft hover:bg-sand'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={markAll}
          disabled={!unread || busy}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold text-ink-soft transition hover:text-brand-dark disabled:opacity-40"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCheck className="h-3.5 w-3.5" />
          )}
          Mark all read
        </button>
      </div>

      {visible.length ? (
        <ul className="divide-y divide-ink/[0.06]">
          {visible.map((note) => {
            const Icon = ICONS[note.type] || Bell;
            const body = (
              <>
                <span
                  className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                    note.read ? 'bg-sand text-ink/45' : 'bg-brand-soft text-brand-dark'
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-[11.5px] leading-snug ${
                        note.read ? 'font-medium text-ink-soft' : 'font-bold text-ink'
                      }`}
                    >
                      {note.title}
                    </p>
                    {!note.read ? (
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    ) : null}
                  </div>
                  {note.body ? (
                    <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
                      {note.body}
                    </p>
                  ) : null}
                  <p className="mt-1.5 text-[8.5px] uppercase tracking-[0.08em] text-muted/65">
                    {timeAgo(note.created_at)}
                  </p>
                </div>
              </>
            );

            return (
              <li
                key={note.id}
                className={`flex gap-3 px-4 py-3.5 transition sm:px-5 ${
                  note.read ? 'bg-transparent' : 'bg-brand-soft/25'
                }`}
              >
                {note.href ? (
                  <Link
                    href={note.href}
                    onClick={() => markOne(note.id)}
                    className="flex min-w-0 flex-1 gap-3"
                  >
                    {body}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => markOne(note.id)}
                    className="flex min-w-0 flex-1 gap-3 text-left"
                  >
                    {body}
                  </button>
                )}
                {!note.read && note.href ? (
                  <button
                    type="button"
                    onClick={() => markOne(note.id)}
                    aria-label="Mark as read"
                    className="self-center rounded-full p-1.5 text-muted transition hover:bg-sand hover:text-ink"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="px-6 py-14 text-center">
          <Bell className="mx-auto h-6 w-6 text-muted" strokeWidth={1.5} />
          <p className="mt-3 text-[13px] font-semibold">
            {view === 'unread' ? 'You are all caught up' : 'Nothing here yet'}
          </p>
          <p className="mx-auto mt-1 max-w-xs text-[10.5px] leading-relaxed text-muted">
            {view === 'unread'
              ? 'New order, payment and return updates will appear here.'
              : 'Order and account updates will land here as they happen.'}
          </p>
        </div>
      )}
    </section>
  );
}
