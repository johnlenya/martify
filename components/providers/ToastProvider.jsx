'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const ACCENTS = {
  success: 'text-[#7ed9a6]',
  error: 'text-[#ff9d85]',
  info: 'text-[#f7c98b]',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const remove = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message, variant = 'info', title = '') => {
      counter.current += 1;
      const id = counter.current;
      setToasts((current) => [
        ...current.slice(-2),
        { id, message, variant, title },
      ]);
      window.setTimeout(() => remove(id), 4400);
    },
    [remove],
  );

  const api = useMemo(
    () => ({
      push,
      success: (message, title) => push(message, 'success', title),
      error: (message, title) => push(message, 'error', title),
      info: (message, title) => push(message, 'info', title),
      remove,
    }),
    [push, remove],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[120] flex flex-col items-stretch gap-2 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[360px]"
      >
        {toasts.map((toast) => {
          const Icon = ICONS[toast.variant] ?? Info;
          return (
            <div
              key={toast.id}
              className="animate-toast pointer-events-auto flex items-start gap-3 rounded-2xl border border-white/10 bg-night px-4 py-3.5 text-white shadow-[0_24px_50px_-20px_rgba(23,24,21,0.65)]"
            >
              <Icon
                className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${ACCENTS[toast.variant] ?? ACCENTS.info}`}
                strokeWidth={1.8}
              />
              <div className="min-w-0 flex-1">
                {toast.title ? (
                  <p className="text-[12px] font-semibold">{toast.title}</p>
                ) : null}
                <p
                  className={`text-[12px] leading-relaxed ${toast.variant === 'error' ? 'text-white/85' : 'text-white/80'}`}
                >
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(toast.id)}
                className="rounded-full p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
