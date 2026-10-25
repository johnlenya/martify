import { RotateCcw, ShieldCheck, Smartphone, Truck } from 'lucide-react';

const ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Verified sellers',
    detail: 'Every store is reviewed',
  },
  {
    icon: Smartphone,
    title: 'Secure M-Pesa',
    detail: 'Pay in seconds',
  },
  {
    icon: Truck,
    title: 'Countrywide delivery',
    detail: 'Door, pickup or express',
  },
  {
    icon: RotateCcw,
    title: 'Easy returns',
    detail: '7-day return window',
  },
];

export default function TrustStrip() {
  return (
    <section className="container-page mt-3" aria-label="Why shop with Martify">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
        {ITEMS.map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-2.5 bg-[#fffdfa] px-3.5 py-3.5 sm:px-4"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream text-brand-dark">
              <item.icon className="h-4 w-4" strokeWidth={1.7} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10.5px] font-semibold text-ink">
                {item.title}
              </p>
              <p className="truncate text-[9.5px] text-muted">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
