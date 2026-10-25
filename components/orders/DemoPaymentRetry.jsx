'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Smartphone } from 'lucide-react';
import { formatMoney } from '@/lib/money';

export default function DemoPaymentRetry({
  orderNumber,
  accessToken,
  amountCents,
  method,
}) {
  const router = useRouter();
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');

  const pay = async () => {
    setState('processing');
    setError('');
    try {
      const response = await fetch('/api/payments/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, token: accessToken }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Demo payment failed.');
      setState('paid');
      router.refresh();
    } catch (paymentError) {
      setState('error');
      setError(paymentError.message);
    }
  };

  return (
    <div className="rounded-[1.3rem] border border-gold/30 bg-gold-soft p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/70 text-[#6e4d11]">
          <Smartphone className="h-5 w-5" strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6e4d11]">
            Payment pending
          </p>
          <h2 className="mt-1 font-display text-[17px] font-bold tracking-[-0.03em] text-ink">
            Finish the demo payment
          </h2>
          <p className="mt-1 text-[10.5px] leading-relaxed text-[#6e4d11]/90">
            This order is reserved for you. Complete the simulated{' '}
            {method === 'mpesa' ? 'M-Pesa STK' : 'card'} payment for{' '}
            {formatMoney(amountCents)}. No real money moves.
          </p>
          {error ? (
            <p className="mt-2 rounded-lg bg-white/60 px-2.5 py-1.5 text-[10px] text-[#a23415]">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={pay}
            disabled={state === 'processing' || state === 'paid'}
            className="btn btn-dark btn-sm mt-3"
          >
            {state === 'processing' ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Confirming demo payment…
              </>
            ) : state === 'paid' ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Payment confirmed
              </>
            ) : (
              'Complete demo payment'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
