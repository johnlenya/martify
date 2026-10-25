'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowRight,
  FlaskConical,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import AuthAlert from '@/components/auth/AuthAlert';
import PasswordInput from '@/components/auth/PasswordInput';
import { useI18n } from '@/components/providers/LocaleProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { DEMO_ACCOUNTS } from '@/lib/demo-accounts';

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.94-2.91l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.26A12 12 0 0 0 0 12c0 1.94.46 3.77 1.26 5.38l4.01-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.26 6.62l4.01 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

export default function LoginForm({
  next = null,
  googleEnabled = false,
  initialError = null,
}) {
  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [initialShown, setInitialShown] = useState(true);
  const [pending, setPending] = useState(false);
  const [activeDemo, setActiveDemo] = useState('');

  const pageError =
    initialShown && initialError
      ? t(
          initialError === 'google-not-configured'
            ? 'auth.googleNotConfigured'
            : 'auth.googleFailed',
        )
      : '';
  const shownError = error || pageError;

  async function handleSubmit(event) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError('');
    setInitialShown(false);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || t('auth.networkError'));
        setPending(false);
        return;
      }

      const firstName = data.user?.name?.split(' ')[0];
      toast.success(t('auth.signedInToast', { name: firstName || 'friend' }));
      router.push(next || data.redirect || '/account');
      router.refresh();
    } catch {
      setError(t('auth.networkError'));
      setPending(false);
    }
  }

  function fillDemo(account) {
    setEmail(account.email);
    setPassword(account.password);
    setActiveDemo(account.role);
    setError('');
    setInitialShown(false);
    toast.info(t('auth.demoFilled', { role: account.role }));
  }

  const googleHref = `/api/auth/google${
    next ? `?next=${encodeURIComponent(next)}` : ''
  }`;
  const registerHref = next
    ? `/register?next=${encodeURIComponent(next)}`
    : '/register';

  return (
    <div>
      <p className="eyebrow">{t('auth.accountEyebrow')}</p>
      <h1 className="mt-2 text-[2rem] font-extrabold leading-[1.04] tracking-[-0.055em] sm:text-[2.3rem]">
        {t('auth.signInTitle')}
      </h1>
      <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
        {t('auth.signInSubtitle')}
      </p>

      <div className="card mt-6 p-5 shadow-[0_28px_60px_-50px_rgba(23,23,20,0.5)] sm:p-7">
        {googleEnabled ? (
          <>
            <a href={googleHref} className="btn btn-light w-full">
              <GoogleMark />
              {t('auth.google')}
            </a>
            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="text-[9.5px] font-medium uppercase tracking-[0.12em] text-muted">
                {t('auth.or')}
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>
          </>
        ) : null}

        <form onSubmit={handleSubmit}>
          <fieldset disabled={pending} className="min-w-0 space-y-4">
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
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="input pl-10"
                />
              </div>
            </div>

            <PasswordInput
              id="password"
              label={t('auth.password')}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              accessory={
                <Link
                  href="/help#account"
                  className="text-[10.5px] font-semibold text-brand-dark transition hover:text-brand"
                >
                  {t('auth.forgot')}
                </Link>
              }
            />
          </fieldset>

          {shownError ? (
            <div className="mt-4">
              <AuthAlert>{shownError}</AuthAlert>
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
                {t('auth.signingIn')}
              </>
            ) : (
              <>
                {t('signIn')}
                <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
              </>
            )}
          </button>

          <p className="mt-3.5 flex items-center justify-center gap-1.5 text-[10px] text-muted">
            <Lock className="h-3 w-3" strokeWidth={1.8} />
            {t('auth.secureNote')}
          </p>
        </form>
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-[#d9cfc0] bg-white/45 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-ink">
              <FlaskConical
                className="h-3.5 w-3.5 text-brand-dark"
                strokeWidth={1.8}
              />
              {t('auth.demo')}
            </p>
            <p className="mt-0.5 text-[10px] text-muted">
              {t('auth.demoHint')}
            </p>
          </div>
          <span className="hidden shrink-0 items-center gap-1 rounded-full bg-leaf-soft px-2 py-1 text-[8.5px] font-semibold text-leaf sm:inline-flex">
            <ShieldCheck className="h-3 w-3" strokeWidth={2} />
            {t('auth.secureBadge')}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.role}
              type="button"
              onClick={() => fillDemo(account)}
              title={account.email}
              aria-pressed={activeDemo === account.role}
              className={`rounded-xl border px-2.5 py-2 text-left transition ${
                activeDemo === account.role
                  ? 'border-brand bg-brand-soft'
                  : 'border-line bg-white hover:border-[#c9bfae] hover:bg-[#fffdfa]'
              }`}
            >
              <span className="block text-[10px] font-semibold text-ink">
                {account.role}
              </span>
              <span className="mt-0.5 block truncate text-[8.5px] text-muted">
                {account.email.split('@')[0]}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2.5 text-[9px] text-muted">{t('auth.demoNote')}</p>
      </div>

      <p className="mt-6 text-center text-[12px] text-muted">
        {t('auth.newHere')}{' '}
        <Link
          href={registerHref}
          className="font-semibold text-brand-dark transition hover:text-brand"
        >
          {t('auth.createOne')}
        </Link>
      </p>
    </div>
  );
}
