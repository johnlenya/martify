import { z } from 'zod';
import { fail, ok, readJson, validationFail } from '@/lib/api';
import { startSession, verifyPassword } from '@/lib/auth';
import { one } from '@/lib/db';
import {
  clientIp,
  originGuard,
  rateLimit,
  rateLimitResponse,
} from '@/lib/security';
import { emailSchema } from '@/lib/validation';

const schema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password.').max(100),
});

export async function POST(request) {
  const blocked = originGuard(request);
  if (blocked) return blocked;

  const ip = clientIp(request);
  const ipLimit = rateLimit(`login-ip:${ip}`, {
    limit: 12,
    windowMs: 5 * 60_000,
  });
  if (!ipLimit.ok) return rateLimitResponse(ipLimit.retryAfter);

  const body = await readJson(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return validationFail(parsed.error);

  const { email, password } = parsed.data;
  const emailLimit = rateLimit(`login-email:${email}`, {
    limit: 8,
    windowMs: 10 * 60_000,
  });
  if (!emailLimit.ok) return rateLimitResponse(emailLimit.retryAfter);

  const user = await one(
    `SELECT id, name, email, role, status, password_hash
     FROM users WHERE email = $1`,
    [email],
  );

  if (!user || !user.password_hash) {
    return fail('Email or password is incorrect.', 401);
  }
  if (user.status !== 'active') {
    return fail(
      'This account is suspended. Contact support@martify.co.ke for help.',
      403,
    );
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return fail('Email or password is incorrect.', 401);

  await startSession(user);

  const redirect =
    user.role === 'admin'
      ? '/admin'
      : user.role === 'seller'
        ? '/seller'
        : '/account';

  return ok({
    redirect,
    user: { name: user.name, role: user.role },
  });
}
