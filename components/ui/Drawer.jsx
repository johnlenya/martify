'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Drawer({
  open,
  onClose,
  title,
  eyebrow,
  side = 'right',
  children,
  footer,
  width = 'max-w-md',
}) {
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[115]" role="dialog" aria-modal="true">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close panel"
        className="absolute inset-0 bg-night/45 backdrop-blur-[1px]"
      />
      <aside
        className={`animate-drawer absolute top-0 flex h-full w-full ${width} flex-col border-line bg-[#fffdfa] shadow-[0_0_80px_-10px_rgba(23,23,20,0.4)] ${
          side === 'right'
            ? 'right-0 border-l'
            : 'left-0 border-r'
        }`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-ink/[0.06] px-5 py-4">
          <div>
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h2 className="mt-1 font-display text-[18px] font-bold tracking-[-0.03em]">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-muted transition hover:bg-sand hover:text-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer ? (
          <div className="border-t border-ink/[0.06] bg-white px-5 py-4">
            {footer}
          </div>
        ) : null}
      </aside>
    </div>,
    document.body,
  );
}
