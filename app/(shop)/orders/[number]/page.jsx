import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Check,
  CreditCard,
  Headset,
  MapPin,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Truck,
} from 'lucide-react';
import DemoPaymentRetry from '@/components/orders/DemoPaymentRetry';
import OrderTimeline from '@/components/orders/OrderTimeline';
import PageIntro from '@/components/shop/PageIntro';
import SmartImage from '@/components/ui/SmartImage';
import { getCurrentUser } from '@/lib/auth';
import {
  DELIVERY_METHODS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from '@/lib/commerce';
import {
  canAccessOrder,
  getOrderByNumber,
  getOrderItems,
  getOrderPayment,
} from '@/lib/orders';
import { formatMoney } from '@/lib/money';

export const metadata = {
  title: 'Order details',
  robots: { index: false, follow: false },
};

const PAYMENT_METHODS = {
  mpesa: { label: 'M-Pesa', icon: Smartphone },
  card: { label: 'Card', icon: CreditCard },
  cod: { label: 'Cash on delivery', icon: Banknote },
};

function formatDate(value, withTime = false) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(new Date(value));
}

function SummaryRow({ label, value, tone = '', strong = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`text-[11px] ${strong ? 'font-semibold text-ink' : 'text-muted'}`}>
        {label}
      </span>
      <span
        className={`price ${strong ? 'text-[15px] font-extrabold text-ink' : 'text-[11.5px] font-semibold'} ${tone}`}
      >
        {value}
      </span>
    </div>
  );
}

export default async function OrderPage({ params, searchParams }) {
  const { number } = await params;
  const queryParams = await searchParams;
  const token =
    typeof queryParams?.token === 'string' ? queryParams.token : '';
  const justPlaced = queryParams?.placed === '1';

  const order = await getOrderByNumber(String(number || '').toUpperCase());
  if (!order) notFound();

  const user = await getCurrentUser();
  if (!canAccessOrder(order, user, token)) notFound();

  const [items, payment] = await Promise.all([
    getOrderItems(order.id),
    getOrderPayment(order.id),
  ]);

  let address = order.shipping_address;
  if (typeof address === 'string') {
    try {
      address = JSON.parse(address);
    } catch {
      address = {};
    }
  }
  address = address || {};

  const delivery = DELIVERY_METHODS[order.delivery_method] || DELIVERY_METHODS.door;
  const paymentMethod =
    PAYMENT_METHODS[order.payment_method] || PAYMENT_METHODS.mpesa;
  const PaymentIcon = paymentMethod.icon;
  const paid = order.payment_status === 'paid';
  const pendingDemo =
    order.payment_status === 'pending' &&
    (order.payment_method === 'mpesa' || order.payment_method === 'card');
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const orderUrl = `/orders/${order.order_number}${token ? `?token=${token}` : ''}`;

  return (
    <div className="container-page py-5 sm:py-7">
      <PageIntro
        breadcrumbs={[
          { label: 'Home', href: '/' },
          ...(user
            ? [
                { label: 'Account', href: '/account' },
                { label: 'Orders', href: '/account/orders' },
              ]
            : []),
          { label: order.order_number },
        ]}
        eyebrow={justPlaced ? 'Order received' : 'Order details'}
        title={
          justPlaced && paid
            ? 'Thank you — it is official.'
            : `Order ${order.order_number}`
        }
        description={
          paid
            ? 'Your demo payment is confirmed and the sellers have been notified. Watch this page for delivery updates.'
            : order.payment_status === 'pending' && order.payment_method === 'cod'
              ? 'Your order is in. Pay the rider in cash when it arrives — this build does not collect real cash.'
              : 'Your order is saved. Complete the demo payment below or check back for updates.'
        }
        aside={
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <span
              className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] ${
                order.status === 'cancelled'
                  ? 'bg-[#fbe7e1] text-[#8a341c]'
                  : order.status === 'delivered'
                    ? 'bg-leaf-soft text-leaf'
                    : paid
                      ? 'bg-leaf-soft text-leaf'
                      : 'bg-gold-soft text-[#6e4d11]'
              }`}
            >
              {paid ? <BadgeCheck className="h-3.5 w-3.5" /> : null}
              {ORDER_STATUS_LABELS[order.status] || order.status}
              {!paid ? ` · ${PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}` : ''}
            </span>
            <span className="text-center text-[9.5px] text-muted sm:text-right">
              Placed {formatDate(order.created_at, true)}
            </span>
          </div>
        }
      />

      <div className="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-3">
          {paid ? (
            <div className="flex items-start gap-3 rounded-2xl border border-leaf/20 bg-leaf-soft px-4 py-3.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-leaf">
                <Check className="h-4 w-4" strokeWidth={2.5} />
              </span>
              <div>
                <p className="text-[11.5px] font-bold text-leaf">
                  Payment confirmed — demo
                </p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-leaf/80">
                  {formatMoney(order.total_cents)} was simulated via{' '}
                  {paymentMethod.label}. No real money moved. Reference:{' '}
                  <span className="font-mono text-[9.5px]">{order.payment_ref}</span>
                </p>
              </div>
            </div>
          ) : null}

          {pendingDemo ? (
            <DemoPaymentRetry
              orderNumber={order.order_number}
              accessToken={token || order.access_token}
              amountCents={order.total_cents}
              method={order.payment_method}
            />
          ) : null}

          {!user ? (
            <p className="rounded-xl border border-line/70 bg-white/55 px-3.5 py-2.5 text-[10px] leading-relaxed text-muted">
              You are viewing this order as a guest. Keep this private link to
              return to it later. Sign in with the same email on your next order
              to see orders in your account.
            </p>
          ) : null}

          <OrderTimeline
            status={order.status}
            createdAt={order.created_at}
            paidAt={order.paid_at}
          />

          <section className="overflow-hidden rounded-[1.3rem] border border-line/80 bg-[#fffdfa]">
            <div className="flex items-center justify-between gap-3 border-b border-ink/[0.06] px-4 py-3.5 sm:px-5">
              <div>
                <p className="eyebrow">What you ordered</p>
                <h2 className="mt-1 font-display text-[16px] font-bold tracking-[-0.03em]">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </h2>
              </div>
              <Link
                href="/deals"
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-ink-soft transition hover:text-brand-dark"
              >
                Shop again
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <ul className="divide-y divide-ink/[0.06]">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 p-3.5 sm:p-4">
                  <SmartImage
                    src={item.image_url}
                    alt={item.title}
                    className="h-[74px] w-[66px] shrink-0 rounded-xl"
                    sizes="66px"
                  />
                  <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">
                        {item.store_name}
                      </p>
                      {item.product_slug ? (
                        <Link
                          href={`/product/${item.product_slug}`}
                          className="mt-1 line-clamp-2 text-[12px] font-semibold leading-snug text-ink transition hover:text-brand-dark"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <p className="mt-1 line-clamp-2 text-[12px] font-semibold leading-snug text-ink">
                          {item.title}
                        </p>
                      )}
                      {item.variant_name ? (
                        <p className="mt-1 text-[9.5px] text-muted">
                          Option: {item.variant_name}
                        </p>
                      ) : null}
                      <p className="mt-1 text-[9.5px] text-muted">
                        Qty {item.quantity} · {formatMoney(item.unit_price_cents)} each
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="price text-[12.5px] font-bold text-ink">
                        {formatMoney(item.line_total_cents)}
                      </p>
                      <p className="mt-1 text-[8.5px] uppercase tracking-[0.06em] text-muted">
                        {item.fulfillment_status.replaceAll('_', ' ')}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line/70 bg-white/55 px-4 py-3">
            <p className="inline-flex items-center gap-1.5 text-[10px] text-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-ink-soft/60" />
              Buyer protection covers items that arrive damaged or not as described.
            </p>
            <Link
              href="/returns"
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-ink-soft transition hover:text-brand-dark"
            >
              Returns policy
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-[150px]">
          <div className="card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-[16px] font-bold tracking-[-0.03em]">
                Order summary
              </h2>
              <ReceiptText className="h-4 w-4 text-ink-soft/50" strokeWidth={1.7} />
            </div>
            <div className="mt-4 space-y-2 border-b border-ink/[0.06] pb-3">
              <SummaryRow
                label="Subtotal"
                value={formatMoney(order.subtotal_cents)}
              />
              {order.discount_cents > 0 ? (
                <SummaryRow
                  label={`Coupon ${order.coupon_code || ''}`}
                  value={`− ${formatMoney(order.discount_cents)}`}
                  tone="text-leaf"
                />
              ) : null}
              <SummaryRow
                label="Delivery"
                value={
                  order.delivery_fee_cents === 0
                    ? 'Free'
                    : formatMoney(order.delivery_fee_cents)
                }
                tone={order.delivery_fee_cents === 0 ? 'text-leaf' : ''}
              />
            </div>
            <div className="mt-3">
              <SummaryRow
                label="Total"
                value={formatMoney(order.total_cents)}
                strong
              />
              <p className="mt-1 text-[9px] text-muted">
                {paid
                  ? 'Paid in demo mode — no real funds moved.'
                  : 'Demo order — no real funds will be collected.'}
              </p>
            </div>
            <div className="mt-4 rounded-xl bg-sand/60 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <PaymentIcon className="h-3.5 w-3.5 text-ink-soft" strokeWidth={1.8} />
                <p className="text-[10.5px] font-semibold text-ink">
                  {paymentMethod.label}
                </p>
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.06em] ${
                    paid
                      ? 'bg-leaf-soft text-leaf'
                      : 'bg-gold-soft text-[#6e4d11]'
                  }`}
                >
                  {PAYMENT_STATUS_LABELS[order.payment_status] ||
                    order.payment_status}
                </span>
              </div>
              {payment?.reference ? (
                <p className="mt-1.5 font-mono text-[9px] text-muted">
                  Ref: {payment.reference}
                </p>
              ) : null}
            </div>
          </div>

          <div className="card p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-brand" strokeWidth={1.8} />
              <h2 className="font-display text-[15px] font-bold tracking-[-0.03em]">
                {delivery.label}
              </h2>
            </div>
            <p className="mt-1.5 text-[10px] text-muted">
              {delivery.eta} · {formatMoney(order.delivery_fee_cents)} delivery
            </p>
            <div className="mt-3 flex items-start gap-2.5 border-t border-ink/[0.06] pt-3">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-soft/60" />
              <div className="text-[10.5px] leading-relaxed text-ink-soft">
                <p className="font-semibold text-ink">{address.recipient || order.customer_name}</p>
                <p>{address.address_line}</p>
                <p>
                  {[address.town, address.county].filter(Boolean).join(', ')}
                </p>
                <p className="mt-0.5 text-muted">{address.phone || order.phone}</p>
                {address.instructions ? (
                  <p className="mt-1.5 rounded-md bg-sand/60 px-2 py-1 text-[9.5px] text-muted">
                    {address.instructions}
                  </p>
                ) : null}
              </div>
            </div>
            {order.notes ? (
              <p className="mt-3 border-t border-ink/[0.06] pt-2.5 text-[9.5px] leading-relaxed text-muted">
                Order note: {order.notes}
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-line/70 bg-white/55 p-4">
            <div className="flex items-center gap-2">
              <Headset className="h-4 w-4 text-ink-soft" strokeWidth={1.8} />
              <p className="text-[11px] font-semibold text-ink">Need a hand?</p>
            </div>
            <p className="mt-1 text-[9.5px] leading-relaxed text-muted">
              Questions about this order? Our support team can help with
              delivery, returns or a demo refund.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/contact" className="btn btn-outline btn-sm">
                Contact support
              </Link>
              <Link href="/help" className="btn btn-ghost btn-sm">
                Visit help centre
              </Link>
            </div>
            <p className="mt-2 text-[8.5px] text-muted">
              Keep your order link: {orderUrl}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
