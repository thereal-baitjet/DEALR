import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { createHmac } from 'node:crypto';

// Runs the compiled app with Vercel-like flags and no external services.
// This is a local compatibility check, not a hosted Vercel test.
const port = Number(process.env.DEALR_PREVIEW_TEST_PORT || 3101);
const address = 'http://127.0.0.1:' + port, hostedOrigin = 'https://dealr-preview.vercel.app';
const unconfigured = { DATABASE_URL: '', NEXT_PUBLIC_SUPABASE_URL: '', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: '', NEXT_PUBLIC_APP_URL: '', VERCEL: '1', VERCEL_ENV: 'preview', VERCEL_URL: 'dealr-preview.vercel.app', VERCEL_BRANCH_URL: 'dealr-git-main.vercel.app', VERCEL_PROJECT_PRODUCTION_URL: 'dealr-production.vercel.app', DEALR_DEMO_MODE: 'true', DEALR_DEMO_SECRET: '', NEXT_TELEMETRY_DISABLED: '1' };
let server, output = '';
async function start(env) {
  output = '';
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port), '--hostname', '127.0.0.1'], { env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  for (const stream of [server.stdout, server.stderr]) stream.on('data', chunk => { output = (output + chunk).slice(-6000); });
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error('Preview stopped during startup: ' + output);
    try { if ((await api('state')).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Preview did not start');
}
async function stop() { if (server?.exitCode === null) { const stopped = new Promise(resolve => server.once('exit', resolve)); server.kill('SIGTERM'); await stopped; } }
async function api(route, data, origin = hostedOrigin) {
  return fetch(address + '/api/' + route, { method: data === undefined ? 'GET' : 'POST', headers: data === undefined ? {} : { Origin: origin, 'Content-Type': 'application/json' }, body: data === undefined ? undefined : JSON.stringify(data) });
}
// Local Auth fixtures exercise the installed Supabase client without real accounts or a live database.
const user = { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email: 'gauntlet@example.test', app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: { name: 'Gauntlet' }, created_at: '2026-09-13T00:00:00Z' };
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
function authSession() {
  const issued = Math.floor(Date.now() / 1000);
  return { access_token: encode({ alg: 'HS256', typ: 'JWT' }) + '.' + encode({ sub: user.id, aud: user.aud, role: user.role, iat: issued, exp: issued + 3600 }) + '.bG9jYWwtdGVzdC1zaWduYXR1cmU', refresh_token: 'local-test-refresh', token_type: 'bearer', expires_in: 3600, user };
}
const demoSecret = 'isolated-preview-gauntlet-signing-secret', demo = { id: 'a'.repeat(48), role: 'buyer', active: true, expires: Date.now() + 86400_000 };
const demoPayload = encode(demo), demoCookie = 'dealr-demo=' + demoPayload + '.' + createHmac('sha256', demoSecret).update(demoPayload).digest('base64url');
const setCookies = response => response.headers.getSetCookie();
const demoUpdate = response => setCookies(response).find(cookie => cookie.startsWith('dealr-demo='));
const requestCookies = response => setCookies(response).map(cookie => cookie.split(';')[0]).join('; ');
function assertAccountSession(response) {
  assert.ok(setCookies(response).some(cookie => /^sb-.*-auth-token(?:\.\d+)?=/.test(cookie) && !/Max-Age=0/.test(cookie)), 'Supabase must set an account session cookie');
  const cookie = demoUpdate(response);
  assert.ok(cookie, 'Successful account sign-in must leave the demo');
  assert.match(cookie, /HttpOnly/i); assert.match(cookie, /Secure/i);
  const value = cookie.split(';')[0].slice('dealr-demo='.length), [payload, signature] = value.split('.');
  assert.equal(signature, createHmac('sha256', demoSecret).update(payload).digest('base64url'));
  assert.deepEqual(JSON.parse(Buffer.from(payload, 'base64url').toString()), { ...demo, active: false });
}
let lastExchange;
const auth = createServer(async (request, response) => {
  response.setHeader('Content-Type', 'application/json');
  if (request.headers.apikey !== 'sb_publishable_test') { response.statusCode = 401; response.end('{}'); return; }
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname === '/auth/v1/settings') { response.end(JSON.stringify({ external: { email: true, google: true } })); return; }
  let body = ''; for await (const chunk of request) body += chunk;
  const data = JSON.parse(body || '{}');
  if (url.pathname === '/auth/v1/token') {
    if (url.searchParams.get('grant_type') === 'pkce') lastExchange = data;
    if (data.password === 'wrong-password' || data.auth_code === 'invalid-code') { response.statusCode = 400; response.end(JSON.stringify({ error_code: 'invalid_credentials', msg: 'Invalid test credentials' })); }
    else response.end(JSON.stringify(authSession()));
  } else if (url.pathname === '/auth/v1/signup') response.end(JSON.stringify(data.email === 'confirm@example.test' ? user : authSession()));
  else { response.statusCode = 404; response.end('{}'); }
});
try {
  await start(unconfigured);
  const cookieChoice = await api('cookie-consent', { version: 1, analytics: false });
  assert.equal(cookieChoice.status, 200, 'Consent works without database/auth configuration');
  const preferenceCookie = setCookies(cookieChoice).find(cookie => cookie.startsWith('dealr-cookie-consent='));
  assert.ok(preferenceCookie);
  for (const flag of [/HttpOnly/i, /Secure/i, /SameSite=Lax/i, /Path=\//i, /Max-Age=15552000/i]) assert.match(preferenceCookie, flag);
  assert.equal((await api('cookie-consent', { version: 1, analytics: true }, 'https://evil.vercel.app')).status, 403);
  console.log('PASS consent cookies are Secure, HttpOnly, scoped, and origin-checked on Vercel');
  const state = await (await api('state')).json();
  assert.equal(state.preview, true); assert.equal(state.demoAvailable, false); assert.equal(state.authAvailable, false);
  console.log('PASS serverless preview disables unavailable account/demo activity');
  const search = await (await api('marketplace?q=' + encodeURIComponent('Toyota truck under $30K'))).json();
  assert.ok(search.total > 0); assert.ok(search.listings.every(listing => listing.price <= 3000000));
  for (const route of ['/', '/marketplace', '/brokers', '/login', '/sell', '/dashboard', '/messages', '/broker', '/trust', '/privacy']) assert.equal((await fetch(address + route)).status, 200, route);
  assert.deepEqual(await (await api('brokers')).json(), []);
  console.log('PASS preview catalog, search, route shells, and empty broker directory');
  const answer = await api('listings/sample-tacoma/ai', { question: 'Has it ever been in an accident?' });
  assert.equal(answer.status, 200); assert.equal((await answer.json()).kind, 'UNKNOWN INFORMATION');
  assert.equal((await api('listings/sample-tacoma/ai', { question: 'Summarize' }, 'https://evil.vercel.app')).status, 403);
  assert.equal((await api('auth/demo', { role: 'buyer' })).status, 404);
  console.log('PASS configured hosted origins allow valid requests and reject foreign origins');
  assert.equal(state.googleAvailable, false);
  const unavailable = await fetch(address + '/auth/google', { redirect: 'manual' });
  assert.equal(unavailable.status, 307); assert.equal(unavailable.headers.get('location'), hostedOrigin + '/login?error=google');
  console.log('PASS Google sign-in stays hidden and returns to login while the provider is unavailable');
  for (const query of ['', '?code=unavailable-code']) {
    const callback = await fetch(address + '/auth/callback' + query, { redirect: 'manual' });
    assert.equal(callback.status, 307); assert.equal(callback.headers.get('location'), hostedOrigin + '/login?error=confirmation');
  }
  console.log('PASS account callbacks return to login when authentication is unconfigured');
  await stop();
  await new Promise(resolve => auth.listen(0, '127.0.0.1', resolve));
  const authUrl = 'http://127.0.0.1:' + auth.address().port;
  await start({ ...unconfigured, DATABASE_URL: 'postgres://dealr:unused@127.0.0.1:9/dealr', NEXT_PUBLIC_SUPABASE_URL: authUrl, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test', DEALR_DEMO_SECRET: demoSecret });
  const configured = await (await api('state')).json();
  assert.equal(configured.authAvailable, true); assert.equal(configured.googleAvailable, true);
  const begin = await fetch(address + '/auth/google?next=' + encodeURIComponent('//evil.example/steal'), { redirect: 'manual' });
  assert.equal(begin.status, 307);
  const target = new URL(begin.headers.get('location'));
  assert.equal(target.origin + target.pathname, authUrl + '/auth/v1/authorize'); assert.equal(target.searchParams.get('provider'), 'google');
  assert.equal(target.searchParams.get('redirect_to'), hostedOrigin + '/auth/callback?next=%2Fdashboard'); assert.ok(target.searchParams.get('code_challenge'));
  assert.match(begin.headers.get('set-cookie') || '', /-code-verifier=/);
  console.log('PASS enabled Google sign-in starts a PKCE flow back to the application origin with a safe destination');

  async function account(route, data) {
    return fetch(address + '/api/auth/' + route, { method: 'POST', headers: { Origin: hostedOrigin, 'Content-Type': 'application/json', Cookie: demoCookie }, body: JSON.stringify(data) });
  }
  for (const route of ['login', 'signup']) {
    const response = await account(route, { email: user.email, password: 'local-test-password', ...(route === 'signup' ? { name: 'Gauntlet' } : {}) });
    assert.equal(response.status, 200); assert.equal((await response.json()).signedIn, true); assertAccountSession(response);
  }
  const failed = await account('login', { email: user.email, password: 'wrong-password' });
  assert.equal(failed.status, 400); assert.equal(demoUpdate(failed), undefined);
  const pending = await account('signup', { email: 'confirm@example.test', password: 'local-test-password', name: 'Gauntlet' });
  assert.equal(pending.status, 200); assert.equal((await pending.json()).confirmationRequired, true); assert.equal(demoUpdate(pending), undefined);
  console.log('PASS email sign-in and immediate signup leave the demo only after an account session exists');

  const destinations = ['//evil.example/steal', '/\t/evil.example/steal', '/\n/evil.example/steal', '/\r/evil.example/steal', '/\\evil.example/steal', '/folder/..//evil.example/steal'];
  for (const next of [...destinations, '/messages/thread?tab=offers#latest']) {
    const expected = destinations.includes(next) ? '/dashboard' : next;
    const begin = await fetch(address + '/auth/google?next=' + encodeURIComponent(next), { redirect: 'manual' });
    const authorize = new URL(begin.headers.get('location')), callback = new URL(authorize.searchParams.get('redirect_to'));
    assert.equal(callback.origin, hostedOrigin); assert.equal(callback.searchParams.get('next'), expected);
    const complete = await fetch(address + callback.pathname + '?' + new URLSearchParams({ code: 'valid-code', next }), { redirect: 'manual', headers: { Cookie: requestCookies(begin) + '; ' + demoCookie } });
    assert.equal(complete.status, 307); assert.equal(complete.headers.get('location'), hostedOrigin + expected); assertAccountSession(complete);
    assert.equal(lastExchange.auth_code, 'valid-code'); assert.ok(lastExchange.code_verifier?.length >= 43);
  }
  const failedBegin = await fetch(address + '/auth/google', { redirect: 'manual' });
  const rejected = await fetch(address + '/auth/callback?code=invalid-code&next=/messages', { redirect: 'manual', headers: { Cookie: requestCookies(failedBegin) + '; ' + demoCookie } });
  assert.equal(rejected.headers.get('location'), hostedOrigin + '/login?error=confirmation'); assert.equal(demoUpdate(rejected), undefined);
  console.log('PASS PKCE callback keeps redirects on-site and leaves the demo only after a successful exchange');
  console.log('9 local serverless-preview checks passed. Hosted deployment remains unverified.');
} catch (error) { console.error(error); console.error(output); process.exitCode = 1; }
finally { await stop(); if (auth.listening) auth.close(); }
