'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useI18n } from '@/components/providers/LocaleProvider';

export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete,
  hint,
  error,
  accessory = null,
}) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const hintId = hint || error ? `${id}-hint` : undefined;

  return (
    <div className="field">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="label">
          {label}
        </label>
        {accessory}
      </div>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          strokeWidth={1.7}
          aria-hidden="true"
        />
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required
          minLength={8}
          maxLength={100}
          aria-invalid={Boolean(error)}
          aria-describedby={hintId}
          className="input pl-10 pr-11"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={t(visible ? 'auth.hidePassword' : 'auth.showPassword')}
          aria-pressed={visible}
          className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted transition hover:bg-sand hover:text-ink"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" strokeWidth={1.7} />
          ) : (
            <Eye className="h-4 w-4" strokeWidth={1.7} />
          )}
        </button>
      </div>
      {hint || error ? (
        <p
          id={hintId}
          className={`text-[10.5px] ${error ? 'text-[#a23415]' : 'text-muted'}`}
        >
          {error || hint}
        </p>
      ) : null}
    </div>
  );
}
