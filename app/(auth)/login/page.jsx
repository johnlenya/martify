import { redirect } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import { getCurrentUser, homePathFor, safeNextPath } from '@/lib/auth';

export const metadata = {
  title: 'Sign in',
  description:
    'Sign in to Martify to track orders, save favourites and check out faster with M-Pesa, card or cash.',
  robots: { index: false, follow: true },
};

export default async function LoginPage({ searchParams }) {
  const user = await getCurrentUser();
  if (user) redirect(homePathFor(user));

  const params = await searchParams;
  const next = safeNextPath(params?.next, null);
  const initialError =
    typeof params?.error === 'string' ? params.error : null;
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );

  return (
    <LoginForm
      next={next}
      googleEnabled={googleEnabled}
      initialError={initialError}
    />
  );
}
