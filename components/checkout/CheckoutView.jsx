'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Check,
  CreditCard,
  Loader2,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Smartphone,
  Store,
  Tag,
  Truck,
  X,
} from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { COUNTIES, DELIVERY_METHODS } from '@/lib/commerce';
import { formatMoney } from '@/lib/money';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isValidPhone(value) {
  const digits = String(value || '').replace(/[^\d]/g, '');
  return (
    /^254[17]\d{8}$/.test(digits) ||
    /^0[17]\d{8}$/.test(digits) ||
    /^[17]\d{8}$/.test(digits)
  );
}

function maskPhone(value) {
  const digits = String(value || '').replace(/[^\d]/g, '');
  if (digits.length < 4) return 'your phone';
  return `•••• ${digits.slice(-3)}`;
}

function Row({ label, value, tone = '' }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11.5px] text-muted">{label}</span>
      <span className={`price text-[11.5px] font-semibold ${tone || 'text-ink-soft'}`}>
        {value}
      </span>
    </div>
  );
}

function StepBadge({ children }) {
  return (
    <span className="grid h-6 w-6 place-items-center rounded-full bg-night text-[10px] font-bold text-white">
      {children}
    </span>
  );
}

function PaymentOverlay({ payment, method, onViewOrder, onRetry }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!payment.open) return undefined;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [payment.open]);

  if (!mounted || !payment.open || !payment.order) return null;

  const mpesa = method === 'mpesa';
  const steps = [
    {
      key: 'sending',
      label: mpesa
        ? `Sending a simulated STK request to ${maskPhone(payment.phone)}`
        : 'Starting the demo card checkout',
    },
    {
      key: 'awaiting',
      label: mpesa ? 'Waiting for demo approval' : 'Authorising the demo card',
    },
    { key: 'verifying', label: 'Confirming your order' },
    { key: 'paid', label: 'Payment confirmed' },
  ];
  const stageIndex = steps.findIndex((step) => step.key === payment.stage);
  const failed = payment.stage === 'error';

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-night/60 p-0 backdrop-blur-[3px] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Simulated payment in progress"
    >
      <div className="animate-fade-up w-full rounded-t-[26px] border border-line bg-[#fffdfa] p-5 shadow-[0_40px_90px_-30px_rgba(23,23,20,0.6)] sm:max-w-md sm:rounded-[24px] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-brand-dark">
            <LockKeyhole className="h-3 w-3" />
            Demo payment
          </span>
          <span className="price text-[12px] font-bold">{formatMoney(payment.order.totalCents)}</span>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-night text-white">
            {failed ? (
              <AlertCircle className="h-5 w-5 text-[#ffb494]" />
            ) : payment.stage === 'paid' ? (
              <Check className="h-5 w-5 text-[#8fd3a3]" />
            ) : (
              <Smartphone className="h-5 w-5 text-[#ffb494]" />
            )}
            {!failed && payment.stage !== 'paid' ? (
              <span className="absolute inset-0 animate-ping rounded-2xl border border-white/30" />
            ) : null}
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-[19px] font-bold tracking-[-0.035em]">
              {failed
                ? 'Payment not completed'
                : payment.stage === 'paid'
                  ? 'Payment confirmed'
                  : mpesa
                    ? 'M-Pesa demo checkout'
                    : 'Card demo checkout'}
            </h2>
            <p className="mt-0.5 text-[11px] text-muted">
              Order {payment.order.number}
            </p>
          </div>
        </div>

        {failed ? (
          <div className="mt-4 rounded-xl border border-[#e8c8bd] bg-[#fdf2ee] px-3.5 py-3 text-[11.5px] leading-relaxed text-[#8a341c]">
            {payment.error}
            <p className="mt-1 text-[10px] text-[#8a341c]/80">
              Your order is saved. You can retry the demo payment or view the order.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={onRetry} className="btn btn-dark btn-sm">
                Retry demo payment
              </button>
              <button type="button" onClick={onViewOrder} className="btn btn-outline btn-sm">
                View order
              </button>
            </div>
          </div>
        ) : (
          <ol className="mt-5 space-y-3">
            {steps.map((step, index) => {
              const complete = payment.stage === 'paid' ? index <= 3 : index < stageIndex;
              const active = index === stageIndex && payment.stage !== 'paid';
              return (
                <li key={step.key} className="flex items-center gap-2.5">
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] ${
                      complete
                        ? 'border-leaf bg-leaf text-white'
                        : active
                          ? 'border-brand bg-brand-soft text-brand-dark'
                          : 'border-line bg-white text-muted'
                    }`}
                  >
                    {complete ? (
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                    ) : active ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span
                    className={`text-[11.5px] ${
                      active
                        ? 'font-semibold text-ink'
                        : complete
                          ? 'text-ink-soft'
                          : 'text-muted'
                    }`}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        <div className="mt-5 rounded-xl bg-sand/70 px-3.5 py-3 text-[10px] leading-relaxed text-muted">
          <strong className="font-semibold text-ink-soft">This is a simulation.</strong>{' '}
          {mpesa
            ? 'No real STK push is sent and no money leaves your account.'
            : 'No card details are collected and no real charge is made.'}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function CheckoutView({ user, addresses = [], settings = {} }) {
  const cart = useCart();
  const toast = useToast();
  const router = useRouter();
  const defaultAddress =
    addresses.find((address) => address.is_default) ?? addresses[0] ?? null;

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    deliveryMethod: 'door',
    paymentMethod: 'mpesa',
    county: defaultAddress?.county || 'Nairobi',
    town: defaultAddress?.town || '',
    addressLine: '',
    addressLabel: 'Home',
    instructions: '',
    notes: '',
    mpesaPhone: user?.phone || '',
    saveAddress: true,
  });
  const [selectedAddressId, setSelectedAddressId] = useState(
    defaultAddress?.id || 'new',
  );
  const [errors, setErrors] = useState({});
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quoteError, setQuoteError] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [payment, setPayment] = useState({ open: false, stage: 'idle' });

  const usingSavedAddress =
    Boolean(user) && selectedAddressId !== 'new'
      ? addresses.some((address) => address.id === selectedAddressId)
      : false;
  const isPickup = form.deliveryMethod === 'pickup';
  const itemsKey = cart.items
    .map((item) => `${item.key}:${item.quantity}`)
    .join('|');
  const couponCode = cart.coupon?.code || '';

  const deliveryFees = useMemo(
    () => ({
      door: Number(
        settings.delivery_door_cents ?? DELIVERY_METHODS.door.feeCents,
      ),
      pickup: Number(
        settings.delivery_pickup_cents ?? DELIVERY_METHODS.pickup.feeCents,
      ),
      express: Number(
        settings.delivery_express_cents ?? DELIVERY_METHODS.express.feeCents,
      ),
    }),
    [settings],
  );
  const freeThreshold = Number(settings.free_delivery_threshold_cents || 0);

  useEffect(() => {
    if (!cart.hydrated) return undefined;
    if (!cart.items.length) {
      setQuote(null);
      setQuoteLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setQuoteLoading(true);
    fetch('/api/checkout/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        items: cart.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        couponCode,
        deliveryMethod: form.deliveryMethod,
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not recheck your cart.');
        setQuote(data);
        setQuoteError('');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setQuoteError(error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setQuoteLoading(false);
      });

    return () => controller.abort();
  }, [cart.hydrated, itemsKey, couponCode, form.deliveryMethod]);

  const estimateFee = () => {
    if (cart.coupon?.freeDelivery) return 0;
    if (form.deliveryMethod === 'door' && cart.subtotalCents >= freeThreshold) {
      return 0;
    }
    return deliveryFees[form.deliveryMethod] ?? 0;
  };

  const subtotalCents = quote?.subtotalCents ?? cart.subtotalCents;
  const discountCents =
    quote?.discountCents ?? Number(cart.coupon?.discountCents || 0);
  const deliveryFeeCents = quote
    ? quote.deliveryFeeCents
    : estimateFee();
  const totalCents =
    quote?.totalCents ??
    Math.max(0, subtotalCents - discountCents + deliveryFeeCents);
  const summaryLines = quote?.lines ?? cart.items;
  const issues = quote?.issues ?? [];

  const update = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === 'phone' && !current.mpesaPhone) {
        next.mpesaPhone = value;
      }
      return next;
    });
    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  };

  const chooseSavedAddress = (id) => {
    setSelectedAddressId(id);
    setErrors((current) => {
      const next = { ...current };
      delete next.county;
      delete next.town;
      delete next.addressLine;
      return next;
    });
  };

  const chooseNewAddress = () => {
    setSelectedAddressId('new');
    if (defaultAddress) {
      setForm((current) => ({
        ...current,
        county: defaultAddress.county || current.county,
        town: defaultAddress.town || '',
        addressLine: '',
        instructions: '',
      }));
    }
    window.setTimeout(() => {
      document.getElementById('checkout-addressLine')?.focus();
    }, 50);
  };

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) {
      setCouponMessage('Enter a coupon code first.');
      return;
    }
    setCouponApplying(true);
    setCouponMessage('');
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          deliveryMethod: form.deliveryMethod,
          items: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'That code could not be applied.');
      cart.applyCoupon({
        ...data.coupon,
        discountCents: data.discountCents,
        freeDelivery: data.freeDelivery,
      });
      setCouponInput('');
      toast.success(
        data.discountCents > 0
          ? `You saved ${formatMoney(data.discountCents)} with ${data.coupon.code}.`
          : `${data.coupon.code} applied — delivery is on us.`,
        'Coupon applied',
      );
    } catch (error) {
      setCouponMessage(error.message);
    } finally {
      setCouponApplying(false);
    }
  };

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter the full name for this order.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
      next.email = 'Enter a valid email for your receipt.';
    }
    if (!isValidPhone(form.phone)) {
      next.phone = 'Enter a valid Kenyan phone number.';
    }
    if (!isPickup && !usingSavedAddress) {
      if (!form.county) next.county = 'Choose your county.';
      if (form.town.trim().length < 2) next.town = 'Enter your town or area.';
      if (form.addressLine.trim().length < 4) {
        next.addressLine = 'Add a street, building or house number.';
      }
    }
    if (form.paymentMethod === 'mpesa' && !isValidPhone(form.mpesaPhone)) {
      next.mpesaPhone = 'Enter the M-Pesa number for the demo prompt.';
    }
    return next;
  };

  const runDemoPayment = async (order) => {
    setPayment({
      open: true,
      stage: 'sending',
      order,
      phone: form.mpesaPhone || form.phone,
      error: '',
    });
    await wait(900);
    setPayment((current) => ({ ...current, stage: 'awaiting' }));
    await wait(1500);
    setPayment((current) => ({ ...current, stage: 'verifying' }));
    try {
      const response = await fetch('/api/payments/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: order.number,
          token: order.accessToken,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Demo payment could not be completed.');
      setPayment((current) => ({ ...current, stage: 'paid' }));
      toast.success(
        `Demo payment confirmed for ${order.number}. No real money moved.`,
        'Payment confirmed',
      );
      await wait(900);
      router.replace(`/orders/${order.number}?token=${order.accessToken}&placed=1`);
    } catch (error) {
      setPayment((current) => ({
        ...current,
        stage: 'error',
        error: error.message,
      }));
    }
  };

  const orderUrl = placedOrder
    ? `/orders/${placedOrder.number}?token=${placedOrder.accessToken}&placed=1`
    : null;

  const placeOrder = async () => {
    if (placing || !cart.items.length) return;
    if (quoteError) {
      toast.error('We could not recheck your cart. Please try again.');
      return;
    }
    if (quote?.couponError) {
      toast.error(quote.couponError);
      return;
    }
    if (issues.length) {
      toast.error('Some items need attention before checkout.');
      return;
    }
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const first = Object.keys(nextErrors)[0];
      document.getElementById(`checkout-${first}`)?.focus();
      toast.error('Check the highlighted checkout details.');
      return;
    }

    setPlacing(true);
    setOrderError('');
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone,
          paymentPhone: form.mpesaPhone,
          deliveryMethod: form.deliveryMethod,
          paymentMethod: form.paymentMethod,
          county: usingSavedAddress ? '' : form.county,
          town: usingSavedAddress ? '' : form.town,
          addressLine: usingSavedAddress ? '' : form.addressLine,
          addressLabel: form.addressLabel,
          instructions: form.instructions,
          notes: form.notes,
          couponCode,
          addressId: usingSavedAddress ? selectedAddressId : null,
          saveAddress:
            Boolean(user) &&
            form.saveAddress &&
            !usingSavedAddress &&
            !isPickup,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (Array.isArray(data.issues) && data.issues.length) {
          setQuote((current) =>
            current ? { ...current, issues: data.issues } : current,
          );
        }
        throw new Error(data.error || 'We could not place your order.');
      }

      const order = data.order;
      setPlacedOrder(order);
      cart.clearCart();

      if (form.paymentMethod === 'cod' || !data.demoPayments) {
        router.push(`/orders/${order.number}?token=${order.accessToken}&placed=1`);
        return;
      }
      await runDemoPayment(order);
    } catch (error) {
      setOrderError(error.message);
      toast.error(error.message);
    } finally {
      setPlacing(false);
    }
  };

  if (!cart.hydrated) {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-3">
          <div className="skeleton h-36 rounded-[1.3rem]" />
          <div className="skeleton h-64 rounded-[1.3rem]" />
          <div className="skeleton h-48 rounded-[1.3rem]" />
        </div>
        <div className="skeleton h-[420px] rounded-[1.3rem]" />
      </div>
    );
  }

  if (!cart.items.length && !placedOrder) {
    return (
      <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-sand">
          <Store className="h-6 w-6 text-ink-soft" strokeWidth={1.5} />
        </span>
        <h1 className="mt-5 font-display text-[23px] font-bold tracking-[-0.04em]">
          There is nothing to check out yet
        </h1>
        <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed text-muted">
          Add a few finds to your cart, then come back to complete your order.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/deals" className="btn btn-primary">
            Shop today&apos;s deals
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link href="/cart" className="btn btn-outline">
            Back to cart
          </Link>
        </div>
      </div>
    );
  }

  if (placedOrder) {
    return (
      <div className="card mx-auto max-w-xl px-6 py-12 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-leaf-soft text-leaf">
          <Check className="h-6 w-6" strokeWidth={2.2} />
        </span>
        <p className="eyebrow mt-5">Order created</p>
        <h1 className="mt-1.5 font-display text-[26px] font-extrabold tracking-[-0.045em]">
          {placedOrder.number}
        </h1>
        <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
          We are finishing the demo payment. You can also open the order now —
          its status will update there.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {orderUrl ? (
            <Link href={orderUrl} className="btn btn-primary">
              View order
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : null}
          <Link href="/deals" className="btn btn-outline">
            Continue shopping
          </Link>
        </div>
        <PaymentOverlay
          payment={payment}
          method={form.paymentMethod}
          onViewOrder={() => orderUrl && router.push(orderUrl)}
          onRetry={() => runDemoPayment(placedOrder)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-gold/30 bg-gold-soft px-3.5 py-2.5 text-[10.5px] leading-relaxed text-[#6e4d11]">
            <ShieldCheck className="h-4 w-4 shrink-0" strokeWidth={1.9} />
            <p>
              <strong className="font-semibold">Demo checkout.</strong> M-Pesa and
              card payments are simulated. No real money moves. Cash on delivery
              orders are also a demo.
            </p>
          </div>

          <section className="card p-4 sm:p-5" aria-labelledby="checkout-contact">
            <div className="flex items-center gap-2.5">
              <StepBadge>1</StepBadge>
              <div>
                <h2
                  id="checkout-contact"
                  className="font-display text-[16px] font-bold tracking-[-0.03em]"
                >
                  Contact details
                </h2>
                <p className="text-[10px] text-muted">
                  Your receipt and delivery updates go here.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="checkout-name" className="mb-1.5 block text-[10.5px] font-semibold text-ink-soft">
                  Full name
                </label>
                <input
                  id="checkout-name"
                  value={form.name}
                  onChange={(event) => update('name', event.target.value)}
                  className={`input ${errors.name ? 'border-[#a23415]' : ''}`}
                  placeholder="Amina Wanjiku"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name ? (
                  <p className="mt-1 text-[10px] text-[#a23415]">{errors.name}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="checkout-email" className="mb-1.5 block text-[10.5px] font-semibold text-ink-soft">
                  Email address
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => update('email', event.target.value)}
                  className={`input ${errors.email ? 'border-[#a23415]' : ''}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email ? (
                  <p className="mt-1 text-[10px] text-[#a23415]">{errors.email}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="checkout-phone" className="mb-1.5 block text-[10.5px] font-semibold text-ink-soft">
                  Delivery phone
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => update('phone', event.target.value)}
                  className={`input ${errors.phone ? 'border-[#a23415]' : ''}`}
                  placeholder="0712 345 678"
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                />
                {errors.phone ? (
                  <p className="mt-1 text-[10px] text-[#a23415]">{errors.phone}</p>
                ) : null}
              </div>
            </div>
            {!user ? (
              <p className="mt-3 text-[10px] text-muted">
                Checking out as a guest.{' '}
                <Link href="/login?next=/checkout" className="font-semibold text-brand-dark hover:underline">
                  Sign in
                </Link>{' '}
                to use saved addresses and see this order in your account.
              </p>
            ) : null}
          </section>

          <section className="card p-4 sm:p-5" aria-labelledby="checkout-delivery">
            <div className="flex items-center gap-2.5">
              <StepBadge>2</StepBadge>
              <div>
                <h2
                  id="checkout-delivery"
                  className="font-display text-[16px] font-bold tracking-[-0.03em]"
                >
                  Delivery
                </h2>
                <p className="text-[10px] text-muted">
                  Door, pickup or express — across Kenya.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {Object.entries(DELIVERY_METHODS).map(([key, option]) => {
                const selected = form.deliveryMethod === key;
                const free =
                  key === 'door' &&
                  freeThreshold > 0 &&
                  subtotalCents >= freeThreshold;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => update('deliveryMethod', key)}
                    aria-pressed={selected}
                    className={`rounded-xl border p-3 text-left transition ${
                      selected
                        ? 'border-brand bg-brand-soft/60 shadow-[0_0_0_1px_rgba(240,90,40,0.15)]'
                        : 'border-line bg-white/60 hover:border-ink/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11.5px] font-semibold text-ink">
                        {option.label}
                      </span>
                      <span className="price text-[10.5px] font-bold text-ink">
                        {free ? 'Free' : formatMoney(deliveryFees[key])}
                      </span>
                    </div>
                    <p className="mt-1 text-[9.5px] text-muted">{option.eta}</p>
                    <p className="mt-0.5 text-[9px] text-muted">
                      {key === 'pickup'
                        ? 'Westlands pickup point'
                        : key === 'express'
                          ? 'Nairobi same-day'
                          : 'Countrywide courier'}
                    </p>
                  </button>
                );
              })}
            </div>

            {form.deliveryMethod === 'door' && freeThreshold > 0 ? (
              <p className="mt-2 text-[9.5px] text-muted">
                Door delivery is free on orders over {formatMoney(freeThreshold)}.
              </p>
            ) : null}

            {!isPickup ? (
              <div className="mt-4">
                {addresses.length ? (
                  <div className="space-y-2">
                    {addresses.map((address) => {
                      const selected =
                        usingSavedAddress && selectedAddressId === address.id;
                      return (
                        <button
                          key={address.id}
                          type="button"
                          onClick={() => chooseSavedAddress(address.id)}
                          aria-pressed={selected}
                          className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                            selected
                              ? 'border-brand bg-brand-soft/40'
                              : 'border-line bg-white/60 hover:border-ink/20'
                          }`}
                        >
                          <span
                            className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                              selected ? 'border-brand bg-brand text-white' : 'border-ink/25'
                            }`}
                          >
                            {selected ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[11px] font-bold text-ink">{address.label || 'Address'}</span>
                              {address.is_default ? (
                                <span className="rounded-full bg-sand px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-muted">
                                  Default
                                </span>
                              ) : null}
                            </span>
                            <span className="mt-0.5 block text-[10.5px] text-ink-soft">
                              {address.recipient} · {address.phone}
                            </span>
                            <span className="mt-0.5 block text-[10px] leading-relaxed text-muted">
                              {address.address_line}, {address.town}, {address.county}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={chooseNewAddress}
                      className={`flex w-full items-center gap-3 rounded-xl border border-dashed p-3 text-left transition ${
                        !usingSavedAddress
                          ? 'border-brand bg-brand-soft/30'
                          : 'border-line hover:border-ink/25'
                      }`}
                    >
                      <span
                        className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                          !usingSavedAddress ? 'border-brand bg-brand text-white' : 'border-ink/25'
                        }`}
                      >
                        {!usingSavedAddress ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : null}
                      </span>
                      <span className="text-[11px] font-semibold text-ink">
                        Deliver to a different address
                      </span>
                    </button>
                  </div>
                ) : null}

                {!usingSavedAddress ? (
                  <div className={`grid gap-3 sm:grid-cols-2 ${addresses.length ? 'mt-3' : ''}`}>
                    <div>
                      <label htmlFor="checkout-county" className="mb-1.5 block text-[10.5px] font-semibold text-ink-soft">
                        County
                      </label>
                      <select
                        id="checkout-county"
                        value={form.county}
                        onChange={(event) => update('county', event.target.value)}
                        className={`input ${errors.county ? 'border-[#a23415]' : ''}`}
                        aria-invalid={Boolean(errors.county)}
                      >
                        <option value="">Choose a county</option>
                        {COUNTIES.map((county) => (
                          <option key={county} value={county}>
                            {county}
                          </option>
                        ))}
                      </select>
                      {errors.county ? (
                        <p className="mt-1 text-[10px] text-[#a23415]">{errors.county}</p>
                      ) : null}
                    </div>
                    <div>
                      <label htmlFor="checkout-town" className="mb-1.5 block text-[10.5px] font-semibold text-ink-soft">
                        Town / area
                      </label>
                      <input
                        id="checkout-town"
                        value={form.town}
                        onChange={(event) => update('town', event.target.value)}
                        className={`input ${errors.town ? 'border-[#a23415]' : ''}`}
                        placeholder="e.g. Kilimani"
                        autoComplete="address-level2"
                        aria-invalid={Boolean(errors.town)}
                      />
                      {errors.town ? (
                        <p className="mt-1 text-[10px] text-[#a23415]">{errors.town}</p>
                      ) : null}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="checkout-addressLine" className="mb-1.5 block text-[10.5px] font-semibold text-ink-soft">
                        Street, building and house number
                      </label>
                      <input
                        id="checkout-addressLine"
                        value={form.addressLine}
                        onChange={(event) => update('addressLine', event.target.value)}
                        className={`input ${errors.addressLine ? 'border-[#a23415]' : ''}`}
                        placeholder="e.g. Riverside Drive, House 12"
                        autoComplete="street-address"
                        aria-invalid={Boolean(errors.addressLine)}
                      />
                      {errors.addressLine ? (
                        <p className="mt-1 text-[10px] text-[#a23415]">{errors.addressLine}</p>
                      ) : null}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="checkout-instructions" className="mb-1.5 block text-[10.5px] font-semibold text-ink-soft">
                        Delivery notes <span className="font-normal text-muted">(optional)</span>
                      </label>
                      <input
                        id="checkout-instructions"
                        value={form.instructions}
                        onChange={(event) => update('instructions', event.target.value)}
                        className="input"
                        placeholder="Landmark, gate colour or a good time to call"
                        maxLength={300}
                      />
                    </div>
                    {user ? (
                      <label className="flex cursor-pointer items-center gap-2 text-[10.5px] text-ink-soft sm:col-span-2">
                        <input
                          type="checkbox"
                          checked={form.saveAddress}
                          onChange={(event) => update('saveAddress', event.target.checked)}
                          className="h-3.5 w-3.5 accent-[#f05a28]"
                        />
                        Save this address to my account
                      </label>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-line bg-white/60 p-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sand">
                  <MapPin className="h-4 w-4 text-ink-soft" strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-[11px] font-semibold text-ink">
                    Martify Pickup — Westlands Square, Shop 4
                  </p>
                  <p className="mt-1 text-[10px] leading-relaxed text-muted">
                    Collect from Shop 4, Westlands Square, Nairobi. Bring your
                    order number and a valid ID. Ready in 1–2 working days.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4">
              <label htmlFor="checkout-notes" className="mb-1.5 block text-[10.5px] font-semibold text-ink-soft">
                Order notes <span className="font-normal text-muted">(optional)</span>
              </label>
              <textarea
                id="checkout-notes"
                value={form.notes}
                onChange={(event) => update('notes', event.target.value)}
                className="input min-h-[64px] resize-y py-2.5"
                placeholder="Anything the seller or rider should know?"
                maxLength={500}
              />
            </div>
          </section>

          <section className="card p-4 sm:p-5" aria-labelledby="checkout-payment">
            <div className="flex items-center gap-2.5">
              <StepBadge>3</StepBadge>
              <div>
                <h2
                  id="checkout-payment"
                  className="font-display text-[16px] font-bold tracking-[-0.03em]"
                >
                  Payment
                </h2>
                <p className="text-[10px] text-muted">
                  All payment methods in this demo are simulated.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                {
                  key: 'mpesa',
                  icon: Smartphone,
                  title: 'M-Pesa',
                  caption: 'Demo STK push',
                },
                {
                  key: 'card',
                  icon: CreditCard,
                  title: 'Card',
                  caption: 'Demo authorisation',
                },
                {
                  key: 'cod',
                  icon: Banknote,
                  title: 'Cash',
                  caption: 'Pay on delivery',
                },
              ].map((option) => {
                const selected = form.paymentMethod === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => update('paymentMethod', option.key)}
                    aria-pressed={selected}
                    className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition ${
                      selected
                        ? 'border-brand bg-brand-soft/60'
                        : 'border-line bg-white/60 hover:border-ink/20'
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                        selected ? 'bg-brand text-white' : 'bg-sand text-ink-soft'
                      }`}
                    >
                      <option.icon className="h-4 w-4" strokeWidth={1.8} />
                    </span>
                    <span>
                      <span className="block text-[11.5px] font-semibold text-ink">
                        {option.title}
                      </span>
                      <span className="mt-0.5 block text-[9px] text-muted">
                        {option.caption}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {form.paymentMethod === 'mpesa' ? (
              <div className="mt-4 rounded-xl border border-line bg-white/60 p-3.5">
                <label htmlFor="checkout-mpesaPhone" className="mb-1.5 block text-[10.5px] font-semibold text-ink-soft">
                  M-Pesa number for the demo prompt
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                  <div className="flex-1">
                    <input
                      id="checkout-mpesaPhone"
                      type="tel"
                      value={form.mpesaPhone}
                      onChange={(event) => update('mpesaPhone', event.target.value)}
                      className={`input ${errors.mpesaPhone ? 'border-[#a23415]' : ''}`}
                      placeholder="0712 345 678"
                      autoComplete="tel"
                      aria-invalid={Boolean(errors.mpesaPhone)}
                    />
                    {errors.mpesaPhone ? (
                      <p className="mt-1 text-[10px] text-[#a23415]">{errors.mpesaPhone}</p>
                    ) : null}
                  </div>
                  <span className="inline-flex items-center gap-1 self-start rounded-md bg-sand px-2 py-2 text-[9px] font-semibold uppercase tracking-[0.08em] text-muted">
                    <LockKeyhole className="h-3 w-3" />
                    Simulated
                  </span>
                </div>
                <p className="mt-2 text-[9.5px] leading-relaxed text-muted">
                  A fake STK prompt is shown in the next step. No request is sent
                  to Safaricom and no money is deducted.
                </p>
              </div>
            ) : null}

            {form.paymentMethod === 'card' ? (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-white/60 p-3.5">
                <span className="grid h-9 w-12 place-items-center rounded-md bg-night text-[8px] font-bold uppercase tracking-[0.12em] text-white">
                  Demo
                </span>
                <div>
                  <p className="text-[11px] font-semibold text-ink">
                    No card details are collected
                  </p>
                  <p className="mt-0.5 text-[9.5px] leading-relaxed text-muted">
                    This demo simulates a successful authorisation without asking
                    for a card number, CVV or bank credentials.
                  </p>
                </div>
              </div>
            ) : null}

            {form.paymentMethod === 'cod' ? (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-line bg-white/60 p-3.5">
                <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" strokeWidth={1.8} />
                <p className="text-[10px] leading-relaxed text-muted">
                  Pay the rider in cash when your order arrives. In this demo the
                  payment stays marked as pending until delivery.
                </p>
              </div>
            ) : null}
          </section>

          <div className="flex items-center justify-between gap-3 px-1">
            <Link
              href="/cart"
              className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-ink-soft transition hover:text-brand-dark"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to cart
            </Link>
            <p className="inline-flex items-center gap-1 text-[9.5px] text-muted">
              <LockKeyhole className="h-3 w-3" />
              Secure demo checkout
            </p>
          </div>
        </div>

        <aside className="lg:sticky lg:top-[150px]">
          <div className="card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-[16px] font-bold tracking-[-0.03em]">
                Order summary
              </h2>
              <span className="text-[9.5px] text-muted">
                {cart.count} {cart.count === 1 ? 'item' : 'items'}
              </span>
            </div>

            <ul className="mt-3.5 space-y-2.5">
              {summaryLines.slice(0, 4).map((line) => (
                <li key={line.key} className="flex items-center gap-2.5">
                  <div className="relative shrink-0">
                    <SmartImage
                      src={line.image}
                      alt={line.title}
                      className="h-11 w-11 rounded-lg"
                      sizes="44px"
                    />
                    <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-night px-1 text-[8px] font-bold text-white">
                      {line.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-[10.5px] font-semibold text-ink">
                      {line.title}
                    </p>
                    {line.variantName ? (
                      <p className="text-[9px] text-muted">{line.variantName}</p>
                    ) : null}
                    <p className="price mt-0.5 text-[9.5px] text-muted">
                      {formatMoney(
                        line.lineTotalCents ??
                          (line.unitPriceCents ?? line.priceCents) *
                            line.quantity,
                      )}
                    </p>
                  </div>
                </li>
              ))}
              {summaryLines.length > 4 ? (
                <li className="text-[9.5px] text-muted">
                  + {summaryLines.length - 4} more{' '}
                  {summaryLines.length - 4 === 1 ? 'item' : 'items'}
                </li>
              ) : null}
            </ul>

            {quoteLoading ? (
              <div className="mt-3 flex items-center gap-1.5 text-[9.5px] text-muted">
                <Loader2 className="h-3 w-3 animate-spin" />
                Rechecking prices and stock…
              </div>
            ) : null}

            {(quoteError || quote?.couponError) ? (
              <div className="mt-3 flex items-start gap-1.5 rounded-lg border border-[#e8c8bd] bg-[#fdf2ee] px-2.5 py-2 text-[9.5px] leading-relaxed text-[#8a341c]">
                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                <span>{quoteError || quote?.couponError}</span>
              </div>
            ) : null}

            {issues.length ? (
              <div className="mt-3 rounded-lg border border-[#e8d4a8] bg-[#fdf8ec] px-2.5 py-2 text-[9.5px] leading-relaxed text-[#76551a]">
                <p className="font-semibold">Some items need attention</p>
                <ul className="mt-1 space-y-0.5">
                  {issues.slice(0, 3).map((issue) => (
                    <li key={issue.key}>{issue.message}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-4 border-t border-ink/[0.06] pt-3">
              {cart.coupon ? (
                <div className="rounded-xl border border-leaf/20 bg-leaf-soft px-3 py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <Tag className="mt-0.5 h-3.5 w-3.5 text-leaf" strokeWidth={1.9} />
                      <div>
                        <p className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-leaf">
                          {cart.coupon.code}
                        </p>
                        <p className="mt-0.5 text-[9px] leading-relaxed text-leaf/80">
                          {cart.coupon.freeDelivery
                            ? 'Free delivery applied.'
                            : cart.coupon.description || 'Coupon applied.'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        cart.removeCoupon();
                        setCouponMessage('');
                      }}
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-leaf/70 transition hover:bg-white/60 hover:text-leaf"
                      aria-label="Remove coupon"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start gap-2">
                    <div className="relative flex-1">
                      <Tag
                        className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
                        strokeWidth={1.8}
                      />
                      <input
                        value={couponInput}
                        onChange={(event) =>
                          setCouponInput(event.target.value.toUpperCase())
                        }
                        placeholder="Coupon code"
                        maxLength={40}
                        aria-label="Coupon code"
                        className="input py-2.5 pl-9 text-[11.5px] uppercase tracking-[0.04em]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponApplying}
                      className="btn btn-dark btn-sm h-[38px] shrink-0 px-3.5"
                    >
                      {couponApplying ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </button>
                  </div>
                  {couponMessage ? (
                    <p className="mt-1 text-[9.5px] text-[#a23415]">{couponMessage}</p>
                  ) : (
                    <p className="mt-1 text-[9px] text-muted">
                      Try WELCOME10 or FREEDEL
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2 border-t border-ink/[0.06] pt-3.5">
              <Row label="Subtotal" value={formatMoney(subtotalCents)} />
              {discountCents > 0 ? (
                <Row
                  label="Coupon discount"
                  value={`− ${formatMoney(discountCents)}`}
                  tone="text-leaf"
                />
              ) : null}
              <Row
                label="Delivery"
                value={
                  deliveryFeeCents === 0
                    ? 'Free'
                    : formatMoney(deliveryFeeCents)
                }
                tone={deliveryFeeCents === 0 ? 'text-leaf' : ''}
              />
            </div>

            <div className="mt-3 flex items-end justify-between gap-2 border-t border-ink/[0.06] pt-3">
              <div>
                <p className="text-[11.5px] font-semibold text-ink">Total</p>
                <p className="mt-0.5 text-[9px] text-muted">
                  {form.paymentMethod === 'cod'
                    ? 'Pay cash on delivery'
                    : 'Simulated payment — no real charge'}
                </p>
              </div>
              <p className="price text-[21px] font-extrabold text-ink">
                {formatMoney(totalCents)}
              </p>
            </div>

            {orderError ? (
              <div className="mt-3 flex items-start gap-1.5 rounded-lg border border-[#e8c8bd] bg-[#fdf2ee] px-2.5 py-2 text-[10px] leading-relaxed text-[#8a341c]">
                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                {orderError}
              </div>
            ) : null}

            <button
              id="checkout-place-order"
              type="button"
              onClick={placeOrder}
              disabled={placing || quoteLoading}
              className="btn btn-primary mt-4 flex w-full justify-between px-4 disabled:opacity-70"
            >
              <span className="inline-flex items-center gap-2">
                {placing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : form.paymentMethod === 'cod' ? (
                  <Truck className="h-4 w-4" />
                ) : (
                  <LockKeyhole className="h-4 w-4" />
                )}
                {placing
                  ? 'Placing order…'
                  : form.paymentMethod === 'cod'
                    ? 'Place order'
                    : form.paymentMethod === 'mpesa'
                      ? 'Pay with M-Pesa'
                      : 'Pay by card'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-2 text-center text-[9px] leading-relaxed text-muted">
              Demo mode · no real payment is taken. By placing this order you
              accept Martify&apos;s{' '}
              <Link href="/terms" className="underline decoration-line hover:text-ink">
                terms
              </Link>{' '}
              and{' '}
              <Link href="/returns" className="underline decoration-line hover:text-ink">
                returns policy
              </Link>
              .
            </p>

            <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-ink/[0.06] pt-3">
              {[
                { icon: ShieldCheck, label: 'Buyer protection' },
                { icon: BadgeCheck, label: 'Verified sellers' },
                { icon: Truck, label: 'Countrywide delivery' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-1 text-center"
                >
                  <item.icon className="h-3.5 w-3.5 text-ink-soft/55" strokeWidth={1.7} />
                  <span className="text-[8px] font-medium leading-tight text-muted">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <PaymentOverlay
        payment={payment}
        method={form.paymentMethod}
        onViewOrder={() => orderUrl && router.push(orderUrl)}
        onRetry={() => placedOrder && runDemoPayment(placedOrder)}
      />
    </>
  );
}
