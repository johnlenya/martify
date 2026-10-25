import { randomBytes, randomUUID } from 'node:crypto';

export function newId() {
  return randomUUID();
}

export function newToken(bytes = 24) {
  return randomBytes(bytes).toString('hex');
}

export function newOrderNumber() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(6);
  let suffix = '';
  for (const byte of bytes) suffix += alphabet[byte % alphabet.length];
  return `MFT-${suffix}`;
}

export function newAffiliateCode(name = 'MARTY') {
  const base = name
    .split(' ')[0]
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 8);
  return `${base || 'MARTY'}-${randomBytes(2).toString('hex').toUpperCase()}`;
}
