import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function PageIntro({
  breadcrumbs = [],
  eyebrow,
  title,
  description,
  children,
  aside = null,
  tone = 'light',
}) {
  const dark = tone === 'dark';

  return (
    <header
      className={`relative overflow-hidden rounded-[1.75rem] border p-5 sm:p-7 ${
        dark
          ? 'border-white/10 bg-night text-white'
          : 'border-line/70 bg-white/55'
      }`}
    >
      {dark ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-leaf/20 blur-3xl"
          />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-28 h-64 w-64 rounded-full bg-brand-soft/80 blur-2xl"
        />
      )}

      <nav
        aria-label="Breadcrumb"
        className={`relative flex flex-wrap items-center gap-1 text-[9px] font-medium uppercase tracking-[0.1em] ${
          dark ? 'text-white/35' : 'text-muted'
        }`}
      >
        {breadcrumbs.map((crumb, index) => (
          <span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
            {index > 0 ? (
              <ChevronRight className="h-2.5 w-2.5 opacity-50" strokeWidth={2} />
            ) : null}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className={`transition ${dark ? 'hover:text-white/70' : 'hover:text-ink'}`}
              >
                {crumb.label}
              </Link>
            ) : (
              <span className={dark ? 'text-white/60' : 'text-ink-soft'}>
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      <div className="relative mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p
              className={`eyebrow ${dark ? 'text-[#ffb494]' : 'text-brand-dark'}`}
            >
              {eyebrow}
            </p>
          ) : null}
          <h1
            className={`mt-2 text-[1.9rem] font-extrabold leading-[1.05] tracking-[-0.055em] sm:text-[2.5rem] ${
              dark ? 'text-white' : 'text-ink'
            }`}
          >
            {title}
          </h1>
          {description ? (
            <p
              className={`mt-2.5 max-w-xl text-[12px] leading-relaxed sm:text-[12.5px] ${
                dark ? 'text-white/55' : 'text-muted'
              }`}
            >
              {description}
            </p>
          ) : null}
        </div>
        {aside}
      </div>

      {children ? <div className="relative mt-5">{children}</div> : null}
    </header>
  );
}
