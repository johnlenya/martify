import { z } from 'zod';

export const emailSchema = z
  .string()
  .trim()
  .min(3, 'Enter your email address.')
  .max(200)
  .email('Enter a valid email address.')
  .transform((value) => value.toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .max(100, 'That password is too long.');

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Enter your full name.')
  .max(100, 'That name is too long.');

export const phoneSchema = z
  .string()
  .trim()
  .min(9, 'Enter a valid phone number.')
  .max(20)
  .refine((value) => Boolean(normalizePhone(value)), {
    message: 'Enter a valid Kenyan phone number.',
  })
  .transform((value) => normalizePhone(value));

export const countySchema = z.string().trim().min(2).max(80);

export const addressInputSchema = z.object({
  label: z.string().trim().max(40).optional().default('Home'),
  recipient: nameSchema,
  phone: phoneSchema,
  county: countySchema,
  town: z.string().trim().min(2, 'Enter your town or estate.').max(120),
  addressLine: z
    .string()
    .trim()
    .min(4, 'Add a street, building or house detail.')
    .max(240),
  instructions: z.string().trim().max(300).optional().default(''),
  isDefault: z.boolean().optional().default(false),
});

export const quantitySchema = z.coerce
  .number()
  .int('Use a whole number.')
  .min(1, 'Quantity must be at least 1.')
  .max(20, 'Maximum 20 per item.');

export function normalizePhone(input) {
  if (!input) return null;
  const cleaned = String(input).replace(/[\s\-().]/g, '');
  let digits = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned;

  if (digits.startsWith('00254')) digits = digits.slice(2);
  if (digits.startsWith('254') && digits.length === 12) {
    return /^254[71]\d{8}$/.test(digits) ? `+${digits}` : null;
  }
  if (digits.startsWith('0') && digits.length === 10) {
    const rest = digits.slice(1);
    return /^[71]\d{8}$/.test(rest) ? `+254${rest}` : null;
  }
  if (digits.length === 9 && /^[71]\d{8}$/.test(digits)) {
    return `+254${digits}`;
  }
  return null;
}

export function toE164Digits(phone) {
  const normalized = normalizePhone(phone);
  return normalized ? normalized.slice(1) : null;
}

export function parsePriceInput(value) {
  if (value === null || value === undefined || value === '') return null;
  const amount = Number(String(value).replace(/,/g, ''));
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100);
}

export function parseInteger(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function firstIssue(error) {
  if (error?.issues?.length) return error.issues[0].message;
  if (error?.errors?.length) return error.errors[0]?.message;
  return error?.message || 'Something went wrong.';
}
