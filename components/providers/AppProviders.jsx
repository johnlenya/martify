'use client';

import { CartProvider } from './CartProvider';
import { LocaleProvider } from './LocaleProvider';
import { RecentlyViewedProvider } from './RecentlyViewedProvider';
import { ReferralTracker } from './ReferralTracker';
import { ToastProvider } from './ToastProvider';
import { WishlistProvider } from './WishlistProvider';

export default function AppProviders({
  children,
  locale,
  wishlistIds,
  signedIn,
}) {
  return (
    <LocaleProvider locale={locale}>
      <ToastProvider>
        <WishlistProvider initialIds={wishlistIds} signedIn={signedIn}>
          <CartProvider>
            <RecentlyViewedProvider>
              <ReferralTracker />
              {children}
            </RecentlyViewedProvider>
          </CartProvider>
        </WishlistProvider>
      </ToastProvider>
    </LocaleProvider>
  );
}
