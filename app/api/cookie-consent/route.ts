import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AppError } from '@/lib/domain';
import { body } from '@/lib/http';
import { COOKIE_CONSENT_MAX_AGE, COOKIE_CONSENT_NAME, COOKIE_POLICY_VERSION, consentChoiceSchema, cookieConsentState } from '@/lib/cookie-consent';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie, Sec-GPC' };

// Visitors can manage consent without an account, database, or working sign-in provider.
export function GET(request: Request) {
  return NextResponse.json(cookieConsentState(request.headers), { headers });
}

export async function POST(request: Request) {
  try {
    const choice = consentChoiceSchema.parse(await body(request));
    const globalPrivacyControl = request.headers.get('sec-gpc') === '1';
    const consent = { version: COOKIE_POLICY_VERSION, analytics: choice.analytics && !globalPrivacyControl, updatedAt: Date.now() };
    const response = NextResponse.json({ consent, analyticsAllowed: consent.analytics, globalPrivacyControl }, { headers });
    response.cookies.set(COOKIE_CONSENT_NAME, JSON.stringify(consent), {
      httpOnly: true, sameSite: 'lax', path: '/', maxAge: COOKIE_CONSENT_MAX_AGE,
      secure: new URL(request.url).protocol === 'https:' || Boolean(process.env.VERCEL) || (process.env.NEXT_PUBLIC_APP_URL || '').startsWith('https:'),
    });
    return response;
  } catch (error) {
    const status = error instanceof AppError ? error.status : error instanceof z.ZodError ? 400 : 500;
    const message = error instanceof AppError ? error.message : status === 400 ? 'Choose your cookie settings again, or refresh this page.' : 'Your cookie choice could not be saved. Please try again.';
    return NextResponse.json({ error: message }, { status, headers });
  }
}
