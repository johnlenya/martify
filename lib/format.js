const DATE_TIME = new Intl.DateTimeFormat('en-KE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Nairobi',
});

const DATE_ONLY = new Intl.DateTimeFormat('en-KE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Africa/Nairobi',
});

const DATE_SHORT = new Intl.DateTimeFormat('en-KE', {
  day: 'numeric',
  month: 'short',
  timeZone: 'Africa/Nairobi',
});

export function formatDateTime(value) {
  if (!value) return '—';
  return DATE_TIME.format(new Date(value));
}

export function formatDate(value) {
  if (!value) return '—';
  return DATE_ONLY.format(new Date(value));
}

export function formatDateShort(value) {
  if (!value) return '—';
  return DATE_SHORT.format(new Date(value));
}

export function timeAgo(value) {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(months / 12)}y ago`;
}

export function estimatedDelivery(daysFromNow = 3) {
  const date = new Date(Date.now() + daysFromNow * 86_400_000);
  return DATE_ONLY.format(date);
}

export function toIso(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}
