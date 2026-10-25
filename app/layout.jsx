import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/jetbrains-mono';
import './globals.css';
import AppProviders from '@/components/providers/AppProviders';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { getLocale } from '@/lib/i18n-server';

export const metadata = {
  metadataBase: new URL(process.env.APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Martify — Kenya’s marketplace for everyday finds',
    template: '%s · Martify',
  },
  description:
    'Shop electronics, fashion, home, beauty and groceries from verified Kenyan sellers. Pay with M-Pesa, card or cash on delivery, and get countrywide delivery.',
  applicationName: 'Martify',
  keywords: [
    'Martify',
    'online shopping Kenya',
    'Kenyan marketplace',
    'M-Pesa checkout',
    'buy electronics Kenya',
    'Nairobi online shop',
  ],
  authors: [{ name: 'Martify' }],
  creator: 'Martify',
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    alternateLocale: ['sw_KE'],
    siteName: 'Martify',
    title: 'Martify — Kenya’s marketplace for everyday finds',
    description:
      'Verified sellers, fair prices and M-Pesa checkout. Shop thousands of finds across Kenya on Martify.',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Martify — Kenya’s marketplace for everyday finds',
    description:
      'Verified sellers, fair prices and M-Pesa checkout. Shop thousands of finds across Kenya on Martify.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#faf7f1',
};

export default async function RootLayout({ children }) {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);

  let wishlistIds = [];
  if (user) {
    const rows = await query(
      `SELECT product_id FROM wishlist_items WHERE user_id = $1`,
      [user.id],
    );
    wishlistIds = rows.map((row) => row.product_id);
  }

  return (
    <html lang={locale}>
      <body>
        <AppProviders
          locale={locale}
          signedIn={Boolean(user)}
          wishlistIds={wishlistIds}
        >
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
