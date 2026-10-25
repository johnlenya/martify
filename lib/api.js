import 'server-only';
import { NextResponse } from 'next/server';
import { firstIssue } from './validation.js';

export function ok(data = {}, init = {}) {
  return NextResponse.json(data, init);
}

export function fail(message, status = 400, extra = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function validationFail(error) {
  return fail(firstIssue(error), 422);
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function methodNotAllowed() {
  return fail('Method not allowed.', 405);
}
