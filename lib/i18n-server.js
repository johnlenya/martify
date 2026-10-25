import 'server-only';
import { cookies } from 'next/headers';
import { LOCALE_COOKIE } from './i18n.js';

export async function getLocale() {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value === 'sw' ? 'sw' : 'en';
}
