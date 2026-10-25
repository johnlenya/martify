import { NextResponse } from 'next/server';
import { endSession } from '@/lib/auth';
import { originGuard } from '@/lib/security';

export async function POST(request) {
  const blocked = originGuard(request);
  if (blocked) return blocked;

  await endSession();
  return NextResponse.redirect(new URL('/', request.url), 303);
}
