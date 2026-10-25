'use client';

import { useI18n } from '@/components/providers/LocaleProvider';
import { locales } from '@/lib/i18n';

export default function LanguageToggle() {
  const { locale, setLocale, switching, t } = useI18n();

  return (
    <div
      className="flex items-center rounded-full border border-line bg-white/60 p-0.5"
      title={t('nav.switchLanguage')}
      aria-label={t('nav.language')}
    >
      {locales.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => setLocale(item.code)}
          disabled={switching}
          aria-pressed={locale === item.code}
          aria-label={`Switch to ${item.label}`}
          className={`rounded-full px-2 py-1 text-[9.5px] font-semibold uppercase tracking-[0.08em] transition ${
            locale === item.code
              ? 'bg-night text-white'
              : 'text-muted hover:text-ink'
          }`}
        >
          {item.short}
        </button>
      ))}
    </div>
  );
}
