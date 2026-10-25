import { redirect } from 'next/navigation';
import RegisterForm from '@/components/auth/RegisterForm';
import { getCurrentUser, homePathFor, safeNextPath } from '@/lib/auth';

export const metadata = {
  title: 'Create account',
  description:
    'Create a Martify account to shop verified Kenyan sellers, save favourites and pay with M-Pesa.',
  robots: { index: false, follow: true },
};

export default async function RegisterPage({ searchParams }) {
  const user = await getCurrentUser();
  if (user) redirect(homePathFor(user));

  const params = await searchParams;
  const next = safeNextPath(params?.next, null);

  return <RegisterForm next={next} />;
}
