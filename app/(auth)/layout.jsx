import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  HelpCircle,
  ShieldCheck,
  Star,
  Truck,
  Wallet,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import LanguageToggle from '@/components/auth/LanguageToggle';
import { getDictionary, translate } from '@/lib/i18n';
import { getLocale } from '@/lib/i18n-server';

export default async function AuthLayout({ children }) {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const t = (key, vars) => translate(dictionary, key, vars);
  const stages = [
    t('auth.asideStage1'),
    t('auth.asideStage2'),
    t('auth.asideStage3'),
  ];
  const trust = [
    { icon: ShieldCheck, label: t('auth.asideTrust1') },
    { icon: Truck, label: t('auth.asideTrust2') },
    { icon: Wallet, label: t('auth.asideTrust3') },
  ];
  const mobileTrust = [
    { icon: ShieldCheck, label: t('auth.shortTrust1') },
    { icon: Truck, label: t('auth.shortTrust2') },
    { icon: Wallet, label: t('auth.shortTrust3') },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="sticky top-0 z-30 border-b border-line/80 bg-cream/90 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <Link
              href="/track"
              className="hidden items-center gap-1.5 text-[11px] font-medium text-ink-soft transition hover:text-ink sm:flex"
            >
              <Truck className="h-3.5 w-3.5" strokeWidth={1.7} />
              {t('auth.track')}
            </Link>
            <Link
              href="/help"
              className="hidden items-center gap-1.5 text-[11px] font-medium text-ink-soft transition hover:text-ink md:flex"
            >
              <HelpCircle className="h-3.5 w-3.5" strokeWidth={1.7} />
              {t('auth.help')}
            </Link>
            <Link href="/" className="btn btn-outline btn-sm">
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
              <span className="hidden sm:inline">{t('auth.backToShop')}</span>
              <span className="sm:hidden">Shop</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container-page grid flex-1 items-stretch gap-8 py-5 sm:py-8 lg:grid-cols-[minmax(0,1fr)_minmax(370px,0.88fr)] lg:gap-10 lg:py-10">
        <main className="flex flex-col justify-center">
          <div className="mx-auto w-full max-w-[430px] animate-fade-up">
            {children}

            <div className="mt-8 flex flex-wrap justify-center gap-2 lg:hidden">
              {mobileTrust.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/60 px-2.5 py-1.5 text-[9.5px] font-medium text-ink-soft"
                >
                  <Icon
                    className="h-3 w-3 text-brand-dark"
                    strokeWidth={1.8}
                  />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </main>

        <aside className="relative hidden overflow-hidden rounded-[2rem] bg-night p-8 text-white lg:flex lg:flex-col xl:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-leaf/25 blur-3xl"
          />

          <div className="relative flex items-center justify-between gap-3">
            <p className="eyebrow text-white/45">{t('auth.asideEyebrow')}</p>
            <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-white/55">
              {t('auth.asideBadge')}
            </span>
          </div>

          <div className="relative mt-8">
            <h2 className="max-w-[360px] text-[2.05rem] font-extrabold leading-[1.05] tracking-[-0.05em] xl:text-[2.35rem]">
              {t('auth.asideTitle')}
            </h2>
            <p className="mt-3.5 max-w-sm text-[12.5px] leading-relaxed text-white/55">
              {t('auth.asideBody')}
            </p>
          </div>

          <div className="relative mt-7 rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/35">
                {t('auth.asideOrder')}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-[#8fe3b0]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8fe3b0]" />
                {t('auth.asidePaid')}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#3aa86b]/15 text-[#8fe3b0]">
                <Check className="h-4.5 w-4.5" strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold">
                  {t('auth.asideReceived')}
                </p>
                <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-white/35">
                  MFT-8K2P4A · Soko Yard
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[8.5px] text-white/55">
                {t('auth.asideItems')}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-1.5">
              {stages.map((stage, index) => (
                <div key={stage}>
                  <div
                    className={`h-1 rounded-full ${index < 2 ? 'bg-brand' : 'bg-white/15'}`}
                  />
                  <p
                    className={`mt-2 text-[8.5px] font-medium ${index < 2 ? 'text-white/70' : 'text-white/30'}`}
                  >
                    {stage}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3 text-[9.5px] text-white/40">
              <Truck className="h-3.5 w-3.5" strokeWidth={1.7} />
              {t('auth.asideDelivery')}
            </div>
          </div>

          <ul className="relative mt-6 space-y-2.5">
            {trust.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2.5 text-[11px] text-white/55"
              >
                <Icon
                  className="h-3.5 w-3.5 shrink-0 text-white/40"
                  strokeWidth={1.7}
                />
                {label}
              </li>
            ))}
          </ul>

          <figure className="relative mt-auto border-t border-white/10 pt-6">
            <blockquote className="text-[12px] leading-relaxed text-white/65">
              {t('auth.asideQuote')}
            </blockquote>
            <figcaption className="mt-3.5 flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand/20 text-[10px] font-bold text-[#ffb494]">
                AH
              </span>
              <div className="min-w-0">
                <p className="text-[10.5px] font-semibold text-white/85">
                  Amina Hassan
                </p>
                <p className="text-[9px] text-white/35">
                  {t('auth.asideQuoteMeta')}
                </p>
              </div>
              <span
                className="ml-auto flex gap-0.5 text-[#f6b26b]"
                aria-label="5 out of 5 stars"
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className="h-2.5 w-2.5"
                    fill="currentColor"
                    strokeWidth={0}
                  />
                ))}
              </span>
            </figcaption>
          </figure>
        </aside>
      </div>

      <footer className="container-page flex flex-col gap-3 border-t border-line/70 py-5 text-[10px] text-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[440px] leading-relaxed">{t('footer.demo')}</p>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="transition hover:text-ink">
            {t('auth.termsOfService')}
          </Link>
          <Link href="/privacy" className="transition hover:text-ink">
            {t('auth.privacyPolicy')}
          </Link>
          <a
            href="mailto:support@martify.co.ke"
            className="transition hover:text-ink"
          >
            support@martify.co.ke
          </a>
        </div>
      </footer>
    </div>
  );
}
