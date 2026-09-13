import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';

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
// Stands in for Supabase Auth's public settings endpoint with the Google provider enabled.
const auth = createServer((request, response) => {
  response.setHeader('Content-Type', 'application/json');
  if (request.url === '/auth/v1/settings' && request.headers.apikey === 'sb_publishable_test') response.end(JSON.stringify({ external: { email: true, google: true } }));
  else { response.statusCode = 401; response.end('{}'); }
});
try {
  await start(unconfigured);
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
  await stop();
  await new Promise(resolve => auth.listen(0, '127.0.0.1', resolve));
  const authUrl = 'http://127.0.0.1:' + auth.address().port;
  await start({ ...unconfigured, DATABASE_URL: 'postgres://dealr:unused@127.0.0.1:9/dealr', NEXT_PUBLIC_SUPABASE_URL: authUrl, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test' });
  const configured = await (await api('state')).json();
  assert.equal(configured.authAvailable, true); assert.equal(configured.googleAvailable, true);
  const begin = await fetch(address + '/auth/google?next=' + encodeURIComponent('//evil.example/steal'), { redirect: 'manual' });
  assert.equal(begin.status, 307);
  const target = new URL(begin.headers.get('location'));
  assert.equal(target.origin + target.pathname, authUrl + '/auth/v1/authorize'); assert.equal(target.searchParams.get('provider'), 'google');
  assert.equal(target.searchParams.get('redirect_to'), hostedOrigin + '/auth/callback?next=%2Fdashboard'); assert.ok(target.searchParams.get('code_challenge'));
  assert.match(begin.headers.get('set-cookie') || '', /-code-verifier=/);
  console.log('PASS enabled Google sign-in starts a PKCE flow back to the application origin with a safe destination');
  console.log('5 local serverless-preview checks passed. Hosted deployment remains unverified.');
} catch (error) { console.error(error); console.error(output); process.exitCode = 1; }
finally { await stop(); if (auth.listening) auth.close(); }
