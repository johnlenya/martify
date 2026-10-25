export function formatMoney(cents, currency = 'KES') {
  const amount = Number(cents || 0) / 100;
  const fractionDigits = Number.isInteger(amount) ? 0 : 2;
  const formatted = amount.toLocaleString('en-KE', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  return currency === 'KES' ? `KSh ${formatted}` : `${currency} ${formatted}`;
}

export function formatMoneyCompact(cents, currency = 'KES') {
  const amount = Number(cents || 0) / 100;
  let value;
  if (Math.abs(amount) >= 1000000) {
    value = `${(amount / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  } else if (Math.abs(amount) >= 1000) {
    value = `${(amount / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  } else {
    value = `${Math.round(amount)}`;
  }
  return currency === 'KES' ? `KSh ${value}` : `${currency} ${value}`;
}

export function percentOff(basePriceCents, comparePriceCents) {
  if (!comparePriceCents || comparePriceCents <= basePriceCents) return 0;
  return Math.round(
    ((comparePriceCents - basePriceCents) / comparePriceCents) * 100,
  );
}

export function formatRating(rating) {
  return Number(rating || 0).toFixed(1);
}
