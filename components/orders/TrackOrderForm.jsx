'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  Check,
  Headset,
  Loader2,
  LockKeyhole,
  PackageSearch,
  Search,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import {
  ORDER_STATUS_LABELS,
  ORDER_STEPS,
  PAYMENT_STATUS_LABELS,
  orderStatusStepIndex,
} from '@/lib/commerce';
import { formatMoney } from '@/lib/money';

export default function TrackOrderForm() {
  const [form, setForm] = useState({ orderNumber: '', contact: '' });
  const [state, setState] = useState('idle');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    if (state === 'loading') return;
    if (!form.orderNumber.trim() || !form.contact.trim()) {
      setError('Enter your order number and the email or phone used at checkout.');
      return;
    }
    setState('loading');
    setError('');
    setOrder(null);
    try {
      const response = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: form.orderNumber.trim(),
          contact: form.contact.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'We could not find that order.');
      setOrder(data.order);
      setState('done');
    } catch (trackError) {
      setError(trackError.message);
      setState('idle');
    }
  };

  const currentIndex =
    order && order.status !== 'cancelled'
      ? orderStatusStepIndex(order.status)
      : -1;

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <form onSubmit={submit} className="card p-4 sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand-dark">
              <PackageSearch className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <div>
              <h2 className="font-display text-[18px] font-bold tracking-[-0.03em]">
                Find your order
              </h2>
              <p className="text-[10.5px] text-muted">
                Use the order number plus the email or phone on the order.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="track-number" className="mb-1.5 block text-[10.5px] font-semibold text-ink-soft">
                Order number
              </label>
              <input
                id="track-number"
                value={form.orderNumber}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    orderNumber: event.target.value.toUpperCase(),
                  }))
                }
                className="input font-mono uppercase tracking-[0.04em]"
                placeholder="MFT-100042"
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="track-contact" className="mb-1.5 block text-[10.5px] font-semibold text-ink-soft">
                Email or phone
              </label>
              <input
                id="track-contact"
                value={form.contact}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    contact: event.target.value,
                  }))
                }
                className="input"
                placeholder="you@example.com or 0712 345 678"
                autoComplete="email"
              />
            </div>
          </div>

          {error ? (
            <p className="mt-3 rounded-lg border border-[#e8c8bd] bg-[#fdf2ee] px-3 py-2 text-[10.5px] text-[#8a341c]">
              {error}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="inline-flex items-center gap-1.5 text-[9.5px] text-muted">
              <LockKeyhole className="h-3 w-3" />
              Only someone with your order details can see this.
            </p>
            <button
              type="submit"
              disabled={state === 'loading'}
              className="btn btn-primary min-w-[160px] justify-center"
            >
              {state === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Looking up order…
                </>
              ) : (
                <>
                  Track order
                  <Search className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {order ? (
          <section className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/[0.06] px-4 py-4 sm:px-5">
              <div>
                <p className="eyebrow">Order found</p>
                <h2 className="mt-1 font-mono text-[19px] font-bold tracking-[-0.02em]">
                  {order.number}
                </h2>
                <p className="mt-1 text-[10px] text-muted">
                  Placed{' '}
                  {new Intl.DateTimeFormat('en-KE', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  }).format(new Date(order.createdAt))}{' '}
                  · {formatMoney(order.totalCents)}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1.5 text-[9.5px] font-bold uppercase tracking-[0.08em] ${
                  order.status === 'cancelled'
                    ? 'bg-[#fbe7e1] text-[#8a341c]'
                    : order.status === 'delivered'
                      ? 'bg-leaf-soft text-leaf'
                      : 'bg-gold-soft text-[#6e4d11]'
                }`}
              >
                {ORDER_STATUS_LABELS[order.status] || order.status}
              </span>
            </div>

            <div className="px-4 py-4 sm:px-5">
              {order.status === 'cancelled' ? (
                <p className="rounded-xl bg-[#fdf2ee] px-3 py-2.5 text-[10.5px] text-[#8a341c]">
                  This order was cancelled. Contact support if you need help with
                  a demo refund.
                </p>
              ) : (
                <ol className="grid gap-3 sm:grid-cols-5">
                  {ORDER_STEPS.map((step, index) => {
                    const complete = index <= currentIndex;
                    const current = index === currentIndex;
                    return (
                      <li key={step.key} className="flex items-start gap-2 sm:flex-col">
                        <span
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[9px] font-bold ${
                            complete
                              ? 'border-leaf bg-leaf text-white'
                              : 'border-line bg-white text-muted'
                          }`}
                        >
                          {complete ? (
                            <Check className="h-3 w-3" strokeWidth={3} />
                          ) : (
                            index + 1
                          )}
                        </span>
                        <span className="sm:mt-1.5">
                          <span
                            className={`block text-[10.5px] font-semibold ${
                              complete ? 'text-ink' : 'text-muted'
                            }`}
                          >
                            {step.label}
                          </span>
                          {current ? (
                            <span className="mt-0.5 block text-[8.5px] font-semibold uppercase tracking-[0.06em] text-brand-dark sm:mt-1">
                              Current
                            </span>
                          ) : null}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink/[0.06] pt-4">
                <div className="flex items-center gap-2 text-[10px] text-muted">
                  <Truck className="h-3.5 w-3.5" strokeWidth={1.8} />
                  Payment:{' '}
                  <span className="font-semibold text-ink-soft">
                    {PAYMENT_STATUS_LABELS[order.paymentStatus] ||
                      order.paymentStatus}
                  </span>
                </div>
                <Link
                  href={`/orders/${order.number}?token=${order.accessToken}`}
                  className="btn btn-dark btn-sm"
                >
                  View full order
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </section>
        ) : null}
      </div>

      <aside className="space-y-3 lg:sticky lg:top-[150px]">
        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-leaf" strokeWidth={1.8} />
            <p className="text-[11px] font-semibold text-ink">How tracking works</p>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-muted">
            Orders move through five stages: Placed, Confirmed, Shipped, Out for
            delivery, and Delivered. Sellers update each stage from their
            dashboard.
          </p>
          <ol className="mt-3 space-y-1.5">
            {ORDER_STEPS.map((step) => (
              <li key={step.key} className="flex items-center gap-2 text-[10px] text-ink-soft">
                <span className="h-1 w-1 rounded-full bg-brand" />
                {step.label}
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-line/70 bg-white/55 p-4">
          <div className="flex items-center gap-2">
            <Headset className="h-4 w-4 text-ink-soft" strokeWidth={1.8} />
            <p className="text-[11px] font-semibold text-ink">Need help?</p>
          </div>
          <p className="mt-1 text-[9.5px] leading-relaxed text-muted">
            Lost your order number? Contact support with the email or phone you
            used and we can help you find it.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/contact" className="btn btn-outline btn-sm">
              Contact support
            </Link>
            <Link href="/help" className="btn btn-ghost btn-sm">
              Help centre
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
