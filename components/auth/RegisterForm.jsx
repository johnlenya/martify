'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowRight,
  Loader2,
  Mail,
  Phone,
  Store,
  UserRound,
} from 'lucide-react';
import AuthAlert from '@/components/auth/AuthAlert';
import PasswordInput from '@/components/auth/PasswordInput';
import { useI18n } from '@/components/providers/LocaleProvider';
import { useToast } from '@/components/providers/ToastProvider';

export default function RegisterForm({ next = null }) {
  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const mismatch =
    form.confirm.length > 0 && form.password !== form.confirm;

  function update(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      if (error) setError('');
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (pending) return;
    setError('');

    if (form.password !== form.confirm) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    if (!acceptTerms) {
      setError(t('auth.termsRequired'));
      return;
    }

    setPending(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone.trim() || null,
          password: form.password,
          acceptTerms,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || t('auth.networkError'));
        setPending(false);
        return;
      }

      const firstName = data.user?.name?.split(' ')[0] || form.name.split(' ')[0];
      toast.success(
        t('auth.accountCreatedToast', { name: firstName || 'friend' }),
      );
      router.push(next || data.redirect || '/account');
      router.refresh();
    } catch {
      setError(t('auth.networkError'));
      setPending(false);
    }
  }

  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : '/login';

  return (
    <div>
      <p className="eyebrow">{t('auth.accountEyebrow')}</p>
      <h1 className="mt-2 text-[2rem] font-extrabold leading-[1.04] tracking-[-0.055em] sm:text-[2.3rem]">
        {t('auth.signUpTitle')}
      </h1>
      <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
        {t('auth.signUpSubtitle')}
      </p>

      <div className="card mt-6 p-5 shadow-[0_28px_60px_-50px_rgba(23,23,20,0.5)] sm:p-7">
        <form onSubmit={handleSubmit}>
          <fieldset disabled={pending} className="min-w-0 space-y-4">
            <div className="field">
              <label htmlFor="name" className="label">
                {t('auth.fullName')}
              </label>
              <div className="relative">
                <UserRound
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={100}
                  value={form.name}
                  onChange={update('name')}
                  placeholder="Aisha Mwangi"
                  className="input pl-10"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="email" className="label">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  maxLength={200}
                  value={form.email}
                  onChange={update('email')}
                  placeholder="you@example.com"
                  className="input pl-10"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="phone" className="label">
                {t('auth.phoneOptional')}
              </label>
              <div className="relative">
                <Phone
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={20}
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="0712 345 678"
                  className="input pl-10"
                  aria-describedby="phone-hint"
                />
              </div>
              <p id="phone-hint" className="text-[10.5px] text-muted">
                {t('auth.phoneHint')}
              </p>
            </div>

            <PasswordInput
              id="password"
              label={t('auth.password')}
              value={form.password}
              onChange={update('password')}
              autoComplete="new-password"
              hint={t('auth.passwordRules')}
            />

            <PasswordInput
              id="confirm"
              label={t('auth.confirmPassword')}
              value={form.confirm}
              onChange={update('confirm')}
              autoComplete="new-password"
              error={mismatch ? t('auth.passwordMismatch') : ''}
            />

            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(event) => {
                  setAcceptTerms(event.target.checked);
                  if (error) setError('');
                }}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-line accent-[#ed5a22]"
              />
              <label
                htmlFor="terms"
                className="text-[10.5px] leading-relaxed text-ink-soft"
              >
                {t('auth.termsAgree')}{' '}
                <Link
                  href="/terms"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-brand-dark underline decoration-[#f0c8b6] underline-offset-2 transition hover:text-brand"
                >
                  {t('auth.termsOfService')}
                </Link>{' '}
                {t('auth.and')}{' '}
                <Link
                  href="/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-brand-dark underline decoration-[#f0c8b6] underline-offset-2 transition hover:text-brand"
                >
                  {t('auth.privacyPolicy')}
                </Link>
                .
              </label>
            </div>
          </fieldset>

          {error ? (
            <div className="mt-4">
              <AuthAlert>{error}</AuthAlert>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary btn-lg mt-5 w-full"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                {t('auth.creatingAccount')}
              </>
            ) : (
              <>
                {t('auth.createAccount')}
                <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
              </>
            )}
          </button>
        </form>
      </div>

      <Link
        href="/sell"
        className="group mt-4 flex items-center gap-3 rounded-2xl bg-night px-4 py-3 text-white transition hover:bg-night-soft"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-[#ffb494]">
          <Store className="h-4 w-4" strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[9px] font-medium uppercase tracking-[0.1em] text-white/40">
            {t('auth.sellerPrompt')}
          </span>
          <span className="mt-0.5 block text-[11px] font-semibold text-white/85">
            {t('auth.sellerLink')}
          </span>
        </span>
        <ArrowRight
          className="h-4 w-4 text-white/35 transition group-hover:translate-x-0.5 group-hover:text-white"
          strokeWidth={1.9}
        />
      </Link>

      <p className="mt-6 text-center text-[12px] text-muted">
        {t('auth.haveAccount')}{' '}
        <Link
          href={loginHref}
          className="font-semibold text-brand-dark transition hover:text-brand"
        >
          {t('auth.signInLink')}
        </Link>
      </p>
    </div>
  );
}
