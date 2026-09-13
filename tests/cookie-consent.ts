import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COOKIE_CONSENT_MAX_AGE, COOKIE_CONSENT_NAME, COOKIE_POLICY_VERSION, consentChoiceSchema, cookieConsentState, parseCookieConsent } from '../lib/cookie-consent';

const now = Date.parse('2026-09-13T15:00:00Z');
const choice = { version: COOKIE_POLICY_VERSION, analytics: true, updatedAt: now };
const cookie = (value: unknown) => COOKIE_CONSENT_NAME + '=' + encodeURIComponent(JSON.stringify(value));

test('visitors default to no optional collection, including corrupt and outdated cookies', () => {
  assert.deepEqual(cookieConsentState(new Headers(), now), { consent: null, analyticsAllowed: false, globalPrivacyControl: false });
  for (const value of [undefined, '', '%', 'null', '{}', 'true', JSON.stringify({ ...choice, version: 0 }), JSON.stringify({ ...choice, analytics: 'true' }), JSON.stringify({ ...choice, extra: true }), JSON.stringify({ ...choice, updatedAt: now - COOKIE_CONSENT_MAX_AGE * 1000 }), JSON.stringify({ ...choice, updatedAt: now + 120_000 }), 'a'.repeat(513)]) {
    assert.equal(parseCookieConsent(value, now), null, String(value));
  }
});

test('valid choices round-trip and rejection remains a remembered explicit choice', () => {
  const accepted = cookieConsentState(new Headers({ Cookie: 'unrelated=ok; ' + cookie(choice) }), now);
  assert.deepEqual(accepted.consent, choice);
  assert.equal(accepted.analyticsAllowed, true);
  const rejected = cookieConsentState(new Headers({ Cookie: cookie({ ...choice, analytics: false }) }), now);
  assert.equal(rejected.consent?.analytics, false);
  assert.equal(rejected.analyticsAllowed, false);
});

test('expired consent disables analytics on requests even before a page refresh', () => {
  const headers = new Headers({ Cookie: cookie(choice) });
  assert.equal(cookieConsentState(headers, now + COOKIE_CONSENT_MAX_AGE * 1000 - 1).analyticsAllowed, true);
  assert.equal(cookieConsentState(headers, now + COOKIE_CONSENT_MAX_AGE * 1000).analyticsAllowed, false);
});

test('Global Privacy Control overrides a previously accepted choice', () => {
  const state = cookieConsentState(new Headers({ Cookie: cookie(choice), 'Sec-GPC': '1' }), now);
  assert.equal(state.globalPrivacyControl, true);
  assert.equal(state.analyticsAllowed, false);
  assert.equal(state.consent?.analytics, true);
});

test('ambiguous cookie paths and malformed preference requests fail closed', () => {
  assert.equal(cookieConsentState(new Headers({ Cookie: cookie(choice) + '; ' + cookie({ ...choice, analytics: false }) }), now).analyticsAllowed, false);
  for (const input of [{}, { analytics: true }, { version: 1, analytics: 'true' }, { version: 1, analytics: true, essential: false }, { version: 0, analytics: true }, null]) assert.equal(consentChoiceSchema.safeParse(input).success, false);
  assert.deepEqual(consentChoiceSchema.parse({ version: 1, analytics: false }), { version: 1, analytics: false });
});
