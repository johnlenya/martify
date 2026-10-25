'use client';

import { AlertCircle } from 'lucide-react';

export default function AuthAlert({ children }) {
  if (!children) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-[#f2c7bb] bg-[#fff3ee] px-3.5 py-3 text-[11.5px] leading-relaxed text-[#a23415]"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} />
      <span>{children}</span>
    </div>
  );
}
