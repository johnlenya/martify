'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CircleHelp,
  Loader2,
  PackageOpen,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import SmartImage from '@/components/ui/SmartImage';
import { useToast } from '@/components/providers/ToastProvider';
import { RETURN_REASONS, RETURN_STATUS_LABELS } from '@/lib/commerce';
import { formatDate } from '@/lib/format';
import { formatMoney } from '@/lib/money';

const TONES = {
  requested: 'warning',
  approved: 'brand',
  rejected: 'danger',
  refunded: 'success',
};

export default function ReturnsManager({ returns = [], eligibleItems = [] }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [itemId, setItemId] = useState('');
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const selected = eligibleItems.find((item) => item.id === itemId);

  const start = () => {
    setItemId(eligibleItems[0]?.id || '');
    setReason(RETURN_REASONS[0]);
    setDetails('');
    setError('');
    setOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!itemId) {
      setError('Choose the item you want to return.');
      return;
    }
    if (details.trim().length < 10) {
      setError('Tell us a little more about the issue.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/account/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderItemId: itemId, reason, details }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not start this return.');
      setOpen(false);
      toast.success('Return requested. We will review it shortly.', 'Request received');
      router.refresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10.5px] leading-relaxed text-muted">
          {eligibleItems.length
            ? `${eligibleItems.length} delivered ${eligibleItems.length === 1 ? 'item is' : 'items are'} eligible for a return in this demo.`
            : 'No delivered items are eligible for a new return right now.'}
        </p>
        <button
          type="button"
          onClick={start}
          disabled={!eligibleItems.length}
          className="btn btn-primary btn-sm"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Start a return
        </button>
      </div>

      {returns.length ? (
        <div className="mt-3 space-y-2.5">
          {returns.map((record) => (
            <article
              key={record.id}
              className="rounded-[1.2rem] border border-line/80 bg-[#fffdfa] p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[9.5px] font-semibold tracking-[0.05em] text-ink">
                      {record.order_number}
                    </span>
                    <Badge tone={TONES[record.status] || 'neutral'}>
                      {RETURN_STATUS_LABELS[record.status] || record.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[9px] text-muted">
                    Requested {formatDate(record.created_at)}
                  </p>
                </div>
                {record.refund_cents > 0 ? (
                  <p className="price text-[12px] font-bold text-leaf">
                    {formatMoney(record.refund_cents)} refund
                  </p>
                ) : null}
              </div>

              <div className="mt-3 flex gap-3 border-t border-ink/[0.06] pt-3">
                <SmartImage
                  src={record.image_url}
                  alt={record.title}
                  className="h-14 w-[52px] shrink-0 rounded-lg"
                  sizes="52px"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-muted">
                    {record.store_name}
                  </p>
                  {record.product_slug ? (
                    <Link
                      href={`/product/${record.product_slug}`}
                      className="mt-0.5 line-clamp-1 text-[11.5px] font-semibold text-ink transition hover:text-brand-dark"
                    >
                      {record.title}
                    </Link>
                  ) : (
                    <p className="mt-0.5 line-clamp-1 text-[11.5px] font-semibold text-ink">
                      {record.title}
                    </p>
                  )}
                  <p className="mt-0.5 text-[9.5px] text-muted">
                    Qty {record.quantity} · {record.reason}
                  </p>
                  {record.details ? (
                    <p className="mt-1.5 line-clamp-2 rounded-lg bg-sand/50 px-2 py-1.5 text-[9.5px] leading-relaxed text-ink-soft">
                      “{record.details}”
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between gap-2 text-[9.5px]">
                <p className="text-muted">
                  {record.status === 'requested'
                    ? 'Our team is reviewing your request.'
                    : record.status === 'approved'
                      ? 'Approved — we will arrange collection.'
                      : record.status === 'refunded'
                        ? 'Refund simulated to your original payment method.'
                        : 'This request was not approved. Contact support if you need help.'}
                </p>
                <Link
                  href={`/orders/${record.order_number}`}
                  className="inline-flex shrink-0 items-center gap-1 font-semibold text-ink-soft transition hover:text-brand-dark"
                >
                  Order
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-[1.2rem] border border-dashed border-line bg-white/50 px-6 py-14 text-center">
          <PackageOpen className="mx-auto h-6 w-6 text-muted" strokeWidth={1.5} />
          <p className="mt-3 text-[13px] font-semibold">No returns on file</p>
          <p className="mx-auto mt-1 max-w-sm text-[10.5px] leading-relaxed text-muted">
            If something is not right, start a return from a delivered order and
            our team will take it from there.
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        <div className="flex gap-3 rounded-2xl border border-line/70 bg-white/50 p-4">
          <ShieldCheck className="h-4 w-4 shrink-0 text-leaf" strokeWidth={1.8} />
          <div>
            <p className="text-[10.5px] font-bold text-ink-soft">Buyer protection</p>
            <p className="mt-1 text-[9.5px] leading-relaxed text-muted">
              Requests are reviewed by Martify and the seller. Demo refunds are
              simulated and clearly labelled — no real funds are moved.
            </p>
          </div>
        </div>
        <div className="flex gap-3 rounded-2xl border border-line/70 bg-white/50 p-4">
          <CircleHelp className="h-4 w-4 shrink-0 text-brand-dark" strokeWidth={1.8} />
          <div>
            <p className="text-[10.5px] font-bold text-ink-soft">Need more help?</p>
            <p className="mt-1 text-[9.5px] leading-relaxed text-muted">
              Read the returns policy or contact support with your order number
              and we will respond within one working day.
            </p>
            <div className="mt-1.5 flex gap-3">
              <Link href="/returns" className="text-[9.5px] font-semibold text-brand-dark">
                Returns policy
              </Link>
              <Link href="/contact" className="text-[9.5px] font-semibold text-brand-dark">
                Contact support
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => !saving && setOpen(false)}
        title="Start a return"
        description="Choose the delivered item and tell us what went wrong."
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={saving}
              className="btn btn-ghost btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="return-form"
              disabled={saving}
              className="btn btn-primary btn-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Sending…
                </>
              ) : (
                'Send return request'
              )}
            </button>
          </div>
        }
      >
        <form id="return-form" onSubmit={submit} className="space-y-3.5">
          <label className="field">
            <span className="label">Delivered item</span>
            <select
              className="select"
              value={itemId}
              onChange={(event) => setItemId(event.target.value)}
              required
            >
              {eligibleItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.order_number} — {item.title} (Qty {item.quantity})
                </option>
              ))}
            </select>
          </label>

          {selected ? (
            <div className="flex gap-3 rounded-xl border border-line/70 bg-white/60 p-3">
              <SmartImage
                src={selected.image_url}
                alt={selected.title}
                className="h-14 w-[52px] shrink-0 rounded-lg"
                sizes="52px"
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-[11px] font-semibold text-ink">
                  {selected.title}
                </p>
                <p className="mt-0.5 text-[9.5px] text-muted">{selected.store_name}</p>
                <p className="mt-1 text-[10px] font-semibold text-ink-soft">
                  Paid {formatMoney(selected.line_total_cents)} · placed{' '}
                  {formatDate(selected.created_at)}
                </p>
              </div>
            </div>
          ) : null}

          <label className="field">
            <span className="label">Reason</span>
            <select
              className="select"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            >
              {RETURN_REASONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="label">What happened?</span>
            <textarea
              className="textarea min-h-[100px]"
              value={details}
              onChange={(event) => {
                setDetails(event.target.value);
                setError('');
              }}
              maxLength={500}
              placeholder="Describe the issue, including anything the seller should know."
              required
            />
            <span className="flex justify-between text-[9px] text-muted">
              <span>At least 10 characters.</span>
              <span>{details.length}/500</span>
            </span>
          </label>

          {error ? (
            <p className="rounded-xl border border-[#e8c8bd] bg-[#fdf2ee] px-3 py-2.5 text-[10.5px] text-[#8a341c]">
              {error}
            </p>
          ) : null}

          <p className="rounded-xl bg-sand/60 px-3 py-2.5 text-[9.5px] leading-relaxed text-muted">
            This creates a demo return request. No courier is booked and no real
            refund is issued in this build.
          </p>
        </form>
      </Modal>
    </>
  );
}
