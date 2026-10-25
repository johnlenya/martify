import { cookies } from 'next/headers';
import { z } from 'zod';
import { fail, ok, readJson, validationFail } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { one, query } from '@/lib/db';
import { newId } from '@/lib/ids';
import { createOrder, isDemoPayments, OrderError } from '@/lib/orders';
import {
  clientIp,
  originGuard,
  rateLimit,
  rateLimitResponse,
} from '@/lib/security';
import {
  emailSchema,
  nameSchema,
  normalizePhone,
  phoneSchema,
} from '@/lib/validation';

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1).max(80),
        variantId: z.string().trim().max(80).nullish(),
        quantity: z.coerce.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50),
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  paymentPhone: z.string().trim().max(20).optional().default(''),
  deliveryMethod: z.enum(['door', 'pickup', 'express']),
  paymentMethod: z.enum(['mpesa', 'card', 'cod']),
  county: z.string().trim().max(80).optional().default(''),
  town: z.string().trim().max(120).optional().default(''),
  addressLine: z.string().trim().max(240).optional().default(''),
  instructions: z.string().trim().max(300).optional().default(''),
  notes: z.string().trim().max(500).optional().default(''),
  couponCode: z.string().trim().max(40).optional().default(''),
  affiliateCode: z.string().trim().max(40).optional().default(''),
  addressId: z.string().trim().max(80).optional().nullable(),
  addressLabel: z.string().trim().max(40).optional().default(''),
  saveAddress: z.boolean().optional().default(false),
});

export async function POST(request) {
  const blocked = originGuard(request);
  if (blocked) return blocked;

  const limit = rateLimit(`orders:${clientIp(request)}`, {
    limit: 12,
    windowMs: 60_000,
  });
  if (!limit.ok) return rateLimitResponse(limit.retryAfter);

  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return validationFail(parsed.error);
  const payload = parsed.data;
  const user = await getCurrentUser();

  if (payload.paymentMethod === 'mpesa' && payload.paymentPhone) {
    const normalizedPaymentPhone = normalizePhone(payload.paymentPhone);
    if (!normalizedPaymentPhone) {
      return fail('Enter a valid M-Pesa phone number.', 422);
    }
    payload.paymentPhone = normalizedPaymentPhone;
  }

  if (payload.addressId) {
    if (!user) return fail('Sign in to use a saved address.', 401);
    const saved = await one(
      `SELECT * FROM addresses WHERE id = $1 AND user_id = $2`,
      [payload.addressId, user.id],
    );
    if (!saved) return fail('That saved address could not be found.', 404);
    payload.county = saved.county;
    payload.town = saved.town;
    payload.addressLine = saved.address_line;
    payload.instructions = saved.instructions || payload.instructions;
    payload.addressLabel = saved.label || payload.addressLabel;
  }

  const cookieStore = await cookies();
  if (!payload.affiliateCode) {
    payload.affiliateCode = cookieStore.get('martify_ref')?.value || '';
  }

  try {
    const result = await createOrder({ user, payload });

    if (
      user &&
      payload.saveAddress &&
      payload.deliveryMethod !== 'pickup' &&
      payload.county &&
      payload.town &&
      payload.addressLine
    ) {
      const existing = await one(
        `SELECT id FROM addresses
         WHERE user_id = $1 AND county = $2 AND town = $3 AND address_line = $4`,
        [user.id, payload.county, payload.town, payload.addressLine],
      );
      const [{ count }] = await query(
        `SELECT count(*)::int AS count FROM addresses WHERE user_id = $1`,
        [user.id],
      );
      if (!existing && Number(count) < 20) {
        await query(
          `INSERT INTO addresses
            (id, user_id, label, recipient, phone, county, town, address_line,
             instructions, is_default)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [
            newId(),
            user.id,
            payload.addressLabel || (payload.deliveryMethod === 'express' ? 'Express' : 'Home'),
            payload.name,
            payload.phone,
            payload.county,
            payload.town,
            payload.addressLine,
            payload.instructions || null,
            Number(count) === 0,
          ],
        );
      }
    }

    return ok({
      order: result.order,
      demoPayments: isDemoPayments(),
    });
  } catch (error) {
    if (error instanceof OrderError) {
      return fail(error.message, error.status, error.extra);
    }
    throw error;
  }
}
