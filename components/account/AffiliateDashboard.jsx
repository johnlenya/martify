'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  Check,
  Copy,
  Loader2,
  MousePointerClick,
  Share2,
  Sparkles,
  UserPlus,
  Wallet,
} from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';
import { formatMoney } from '@/lib/money';

function Stat({ icon: Icon, label, value, note }) {
  return (
    <div className="rounded-[1.1rem] border border-line/80 bg-[#fffdfa] p-4">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-sand text-ink-soft">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
      </span>
      <p className="stat-value mt-2.5 text-[1.35rem]">{value}</p>
      <p className="mt-0.5 text-[10px] font-semibold text-ink-soft">{label}</p>
      {note ? <p className="mt-0.5 text-[9px] text-muted">{note}</p> : null}
    </div>
  );
}

export default function AffiliateDashboard({
  affiliate: initialAffiliate,
  referredCount = 0,
}) {
  const router = useRouter();
  const toast = useToast();
  const [affiliate, setAffiliate] = useState(initialAffiliate);
  const [joining, setJoining] = useState(false);
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const link = affiliate
    ? `${origin || 'https://martify.co.ke'}/?ref=${encodeURIComponent(affiliate.code)}`
    : '';

  const copy = async (value, key) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      toast.success('Copied to clipboard.');
      window.setTimeout(() => setCopied(''), 2200);
    } catch {
      toast.error('Could not copy. Select the text and copy it manually.');
    }
  };

  const share = async () => {
    if (!affiliate) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Shop on Martify',
          text: 'Kenyan finds, verified sellers and M-Pesa checkout. Use my link:',
          url: link,
        });
      } catch {
        // A cancelled share sheet is not an error.
      }
      return;
    }
    copy(link, 'link');
  };

  const join = async () => {
    setJoining(true);
    try {
      const response = await fetch('/api/account/affiliate', { method: 'POST' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not join right now.');
      setAffiliate(data.affiliate);
      toast.success('You are in. Your referral link is ready.');
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setJoining(false);
    }
  };

  if (!affiliate) {
    return (
      <section className="relative overflow-hidden rounded-[1.4rem] border border-night/10 bg-night p-6 text-white sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-leaf/20 blur-3xl"
        />
        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#ffb494]">
            <Sparkles className="h-3 w-3" />
            Affiliate programme
          </span>
          <h2 className="mt-4 font-display text-[24px] font-extrabold leading-[1.05] tracking-[-0.05em] sm:text-[30px]">
            Your circle already shops. Earn when they do.
          </h2>
          <p className="mt-2.5 max-w-md text-[11.5px] leading-relaxed text-white/55">
            Share your personal link. When someone joins Martify through it and
            completes an order, you earn 2% of the item value as an affiliate
            commission.
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {[
              { icon: Share2, title: 'Share', copy: 'Send your link to friends.' },
              { icon: UserPlus, title: 'They join', copy: 'Signup is tracked for 30 days.' },
              { icon: Wallet, title: 'You earn', copy: '2% of completed orders.' },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <Icon className="h-4 w-4 text-[#ffb494]" strokeWidth={1.8} />
                  <p className="mt-2 text-[10.5px] font-bold">{step.title}</p>
                  <p className="mt-0.5 text-[9px] leading-relaxed text-white/45">{step.copy}</p>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={join}
            disabled={joining}
            className="btn btn-primary mt-5 w-full sm:w-auto"
          >
            {joining ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUpRight className="h-4 w-4" />
            )}
            {joining ? 'Activating…' : 'Activate my affiliate account'}
          </button>
          <p className="mt-2.5 text-[9px] leading-relaxed text-white/35">
            Demo build: commissions are simulated ledger movements. No real
            affiliate payouts are made.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-[1.4rem] border border-night/10 bg-night p-5 text-white sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand/25 blur-3xl"
        />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="eyebrow text-[#ffb494]">Your referral link</p>
              <h2 className="mt-1 font-display text-[20px] font-bold tracking-[-0.035em]">
                {formatMoney(affiliate.earnings_cents)} earned so far
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[9px] font-semibold text-white/65">
              <Check className="h-3 w-3 text-[#8fd3a3]" />
              Active · 2% commission
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <div className="flex min-w-0 flex-1 items-center rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5">
              <span className="truncate font-mono text-[10px] text-white/60">{link}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => copy(link, 'link')}
                className="btn btn-outline btn-sm flex-1 border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10 sm:flex-none"
              >
                {copied === 'link' ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied === 'link' ? 'Copied' : 'Copy link'}
              </button>
              <button
                type="button"
                onClick={share}
                className="btn btn-primary btn-sm flex-1 sm:flex-none"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-[9.5px] text-white/40">
            <span>Code</span>
            <button
              type="button"
              onClick={() => copy(affiliate.code, 'code')}
              className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-0.5 font-mono text-[9.5px] text-white/70 transition hover:border-white/25"
            >
              {affiliate.code}
              {copied === 'code' ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Stat
          icon={MousePointerClick}
          label="Link clicks"
          value={affiliate.clicks}
          note="All time"
        />
        <Stat
          icon={UserPlus}
          label="Signups"
          value={affiliate.signups}
          note={`${referredCount} in your network`}
        />
        <Stat
          icon={Wallet}
          label="Earnings"
          value={formatMoney(affiliate.earnings_cents)}
          note="Simulated"
        />
        <Stat
          icon={Sparkles}
          label="Your rate"
          value="2%"
          note="Of item value"
        />
      </div>

      <section className="rounded-[1.2rem] border border-line/80 bg-[#fffdfa] p-5">
        <h2 className="font-display text-[15px] font-bold tracking-[-0.03em]">
          How it works
        </h2>
        <ol className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            'Share your unique link or referral code.',
            'A shopper follows it and creates a Martify account.',
            'When their order is paid, 2% is recorded as your commission.',
          ].map((copy, index) => (
            <li key={copy} className="flex gap-2.5">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-night text-[9px] font-bold text-white">
                {index + 1}
              </span>
              <p className="text-[10px] leading-relaxed text-muted">{copy}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 rounded-xl bg-sand/55 px-3.5 py-2.5 text-[9.5px] leading-relaxed text-muted">
          Commissions are recorded in the demo ledger for reporting only. This
          build does not hold or pay out real affiliate funds.
        </p>
      </section>
    </div>
  );
}
