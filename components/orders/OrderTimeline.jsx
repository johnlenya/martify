import { Check, Circle } from 'lucide-react';
import { ORDER_STEPS, orderStatusStepIndex } from '@/lib/commerce';

export default function OrderTimeline({ status, createdAt, paidAt }) {
  const cancelled = status === 'cancelled';
  const currentIndex = cancelled ? -1 : orderStatusStepIndex(status);
  const placedDate = createdAt
    ? new Intl.DateTimeFormat('en-KE', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(createdAt))
    : null;
  const paidDate = paidAt
    ? new Intl.DateTimeFormat('en-KE', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(paidAt))
    : null;

  return (
    <section className="rounded-[1.3rem] border border-line/80 bg-[#fffdfa] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="eyebrow">Progress</p>
          <h2 className="mt-1 font-display text-[16px] font-bold tracking-[-0.03em]">
            {cancelled ? 'This order was cancelled' : 'Where your order is'}
          </h2>
        </div>
        {paidDate ? (
          <span className="rounded-full bg-leaf-soft px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-leaf">
            Paid {paidDate}
          </span>
        ) : null}
      </div>

      {cancelled ? (
        <p className="mt-3 text-[11px] leading-relaxed text-muted">
          Any reserved stock has been released. If a demo payment was taken, a
          simulated refund would appear here.
        </p>
      ) : (
        <ol className="mt-4 space-y-0">
          {ORDER_STEPS.map((step, index) => {
            const complete = index <= currentIndex;
            const current = index === currentIndex;
            return (
              <li key={step.key} className="relative flex gap-3 pb-4 last:pb-0">
                {index < ORDER_STEPS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className={`absolute left-[11px] top-6 h-[calc(100%-12px)] w-px ${
                      index < currentIndex ? 'bg-leaf' : 'bg-line'
                    }`}
                  />
                ) : null}
                <span
                  className={`relative z-10 mt-0.5 grid h-[23px] w-[23px] shrink-0 place-items-center rounded-full border ${
                    complete
                      ? 'border-leaf bg-leaf text-white'
                      : current
                        ? 'border-brand bg-brand-soft text-brand-dark'
                        : 'border-line bg-white text-muted'
                  }`}
                >
                  {complete ? (
                    <Check className="h-3 w-3" strokeWidth={3} />
                  ) : (
                    <Circle className="h-2 w-2" fill="currentColor" />
                  )}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <p
                      className={`text-[11.5px] font-semibold ${
                        complete ? 'text-ink' : 'text-ink-soft'
                      }`}
                    >
                      {step.label}
                    </p>
                    {current ? (
                      <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-brand-dark">
                        Current
                      </span>
                    ) : index === 0 && placedDate ? (
                      <span className="text-[9px] text-muted">{placedDate}</span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-muted">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
