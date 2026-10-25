import Link from 'next/link';
import { ArrowRight, Clock3, MapPin, ReceiptText } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import SmartImage from '@/components/ui/SmartImage';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/commerce';
import { formatDate } from '@/lib/format';
import { formatMoney } from '@/lib/money';

const TONES = {
  placed: 'warning',
  confirmed: 'brand',
  shipped: 'neutral',
  out_for_delivery: 'dark',
  delivered: 'success',
  cancelled: 'danger',
};

const DELIVERY_LABELS = {
  door: 'Door delivery',
  pickup: 'Pickup station',
  express: 'Express delivery',
};

export default function AccountOrderCard({ order, compact = false }) {
  const items = order.items || [];
  const count = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const previews = items.slice(0, compact ? 2 : 3);
  const extra = Math.max(0, items.length - previews.length);
  const pendingPayment =
    order.payment_status === 'pending' && order.status !== 'cancelled';
  const pendingMpesa =
    pendingPayment && (order.payment_method === 'mpesa' || order.payment_method === 'card');

  return (
    <article className="rounded-[1.2rem] border border-line/80 bg-[#fffdfa] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-[10px] font-semibold tracking-[0.06em] text-ink">
              {order.order_number}
            </p>
            <Badge tone={TONES[order.status] || 'neutral'}>
              {ORDER_STATUS_LABELS[order.status] || order.status}
            </Badge>
            {pendingPayment ? (
              <Badge tone="warning">
                {PAYMENT_STATUS_LABELS[order.payment_status]}
              </Badge>
            ) : null}
          </div>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[9.5px] text-muted">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3 w-3" />
              {formatDate(order.created_at)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {DELIVERY_LABELS[order.delivery_method] || 'Delivery'}
            </span>
            <span>{count} {count === 1 ? 'item' : 'items'}</span>
          </p>
        </div>
        <p className="price text-[14px] font-extrabold text-ink">
          {formatMoney(order.total_cents)}
        </p>
      </div>

      <div className="mt-3 flex items-center gap-2.5 border-t border-ink/[0.06] pt-3">
        <div className="flex -space-x-2">
          {previews.map((item, index) => (
            <SmartImage
              key={`${item.title}-${index}`}
              src={item.image_url}
              alt={item.title}
              className="h-11 w-10 shrink-0 rounded-lg border-2 border-[#fffdfa]"
              sizes="40px"
            />
          ))}
          {extra ? (
            <span className="grid h-11 w-10 place-items-center rounded-lg border-2 border-[#fffdfa] bg-sand text-[9px] font-bold text-ink-soft">
              +{extra}
            </span>
          ) : null}
        </div>
        <p className="min-w-0 flex-1 truncate text-[11px] text-ink-soft">
          {items[0]?.title || 'Order items'}
          {items.length > 1 ? ` and ${items.length - 1} more` : ''}
        </p>
        <Link
          href={`/orders/${order.order_number}`}
          className="btn btn-light btn-sm shrink-0"
        >
          {pendingMpesa ? 'Complete payment' : 'View order'}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {pendingPayment && order.payment_method === 'cod' ? (
        <p className="mt-2.5 flex items-center gap-1.5 text-[9.5px] text-muted">
          <ReceiptText className="h-3 w-3" />
          Pay the rider in cash when your order arrives.
        </p>
      ) : null}
    </article>
  );
}
