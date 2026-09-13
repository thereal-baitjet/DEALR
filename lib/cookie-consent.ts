import { z } from 'zod';

export const COOKIE_CONSENT_NAME = 'dealr-cookie-consent';
export const COOKIE_POLICY_VERSION = 1;
export const COOKIE_CONSENT_MAX_AGE = 180 * 24 * 60 * 60;

const consentSchema = z.object({
  version: z.literal(COOKIE_POLICY_VERSION),
  analytics: z.boolean(),
  updatedAt: z.number().int().nonnegative(),
}).strict();

export const consentChoiceSchema = consentSchema.pick({ version: true, analytics: true });
export type CookieConsent = z.infer<typeof consentSchema>;
export type CookieConsentState = {
  consent: CookieConsent | null;
  analyticsAllowed: boolean;
  globalPrivacyControl: boolean;
};

// Unknown versions, invalid values, and expired choices must never enable collection.
export function parseCookieConsent(value: string | undefined, now = Date.now()): CookieConsent | null {
  if (!value || value.length > 512) return null;
  try {
    const result = consentSchema.safeParse(JSON.parse(decodeURIComponent(value)));
    if (!result.success) return null;
    const age = now - result.data.updatedAt;
    return age >= -60_000 && age < COOKIE_CONSENT_MAX_AGE * 1000 ? result.data : null;
  } catch { return null; }
}

export function cookieConsentState(headers: Headers, now = Date.now()): CookieConsentState {
  const values = (headers.get('cookie') || '').split(';').map(value => value.trim())
    .filter(value => value.startsWith(COOKIE_CONSENT_NAME + '='));
  // Ambiguous cookies (for example from a stale domain/path) also fail closed.
  const consent = values.length === 1 ? parseCookieConsent(values[0].slice(COOKIE_CONSENT_NAME.length + 1), now) : null;
  const globalPrivacyControl = headers.get('sec-gpc') === '1';
  return { consent, analyticsAllowed: consent?.analytics === true && !globalPrivacyControl, globalPrivacyControl };
}
