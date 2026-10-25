'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}) {
  const panelRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    previousFocus.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => {
      const target = panelRef.current?.querySelector(
        'input, select, textarea, button, [href]',
      );
      target?.focus();
    }, 60);

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
      if (event.key === 'Tab' && panelRef.current) {
        const focusable = Array.from(
          panelRef.current.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((element) => element.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(timer);
      if (previousFocus.current instanceof HTMLElement) {
        previousFocus.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const sizes = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close dialog"
        className="absolute inset-0 cursor-default bg-night/50 backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        className={`animate-fade-up relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[26px] border border-line bg-[#fffdfa] shadow-[0_40px_90px_-30px_rgba(23,23,20,0.55)] sm:rounded-[24px] ${sizes[size] ?? sizes.md}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink/[0.06] px-5 py-4 sm:px-6">
          <div>
            {title ? (
              <h2 className="font-display text-[18px] font-bold tracking-[-0.03em] text-ink">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-[12px] leading-relaxed text-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-sand hover:text-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer ? (
          <div className="border-t border-ink/[0.06] bg-[#fffdfa] px-5 py-4 sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
