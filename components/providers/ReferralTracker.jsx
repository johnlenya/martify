'use client';

import { useEffect } from 'react';

export function ReferralTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (!ref) return;
    const clean = ref.trim().toUpperCase().slice(0, 40);
    if (!/^[A-Z0-9-]{3,40}$/.test(clean)) return;
    document.cookie = `martify_ref=${clean}; path=/; max-age=2592000; samesite=lax`;
    fetch('/api/affiliate/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: clean }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  return null;
}
