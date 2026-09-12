import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import path from 'node:path';

// Tests use an isolated local database, never a configured live database.
await mkdir('.test-output', { recursive: true });
const directory = await mkdtemp(path.resolve('.test-output/http-'));
const port = Number(process.env.DEALR_TEST_PORT || 3100), origin = 'http://127.0.0.1:' + port;
const environment = { ...process.env, DATABASE_URL: '', NEXT_PUBLIC_SUPABASE_URL: '', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: '', DEALR_DEMO_MODE: 'true', DEALR_DEMO_SECRET: randomBytes(48).toString('hex'), DEALR_DATA_DIR: directory, NEXT_PUBLIC_APP_URL: origin, NEXT_TELEMETRY_DISABLED: '1' };
let server, output = '', passed = 0;
const records = [];
async function start() {
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port), '--hostname', '127.0.0.1'], { env: environment, stdio: ['ignore', 'pipe', 'pipe'] });
  server.stdout.on('data', chunk => { output = (output + chunk.toString()).slice(-6000); });
  server.stderr.on('data', chunk => { output = (output + chunk.toString()).slice(-6000); });
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error('Application stopped during startup: ' + output);
    try { const response = await fetch(origin + '/api/state'); if (response.ok) return; } catch { /* Wait for listening socket. */ }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Application did not become ready: ' + output);
}
async function stop() { if (!server || server.exitCode !== null) return; const exited = new Promise(resolve => server.once('exit', resolve)); server.kill('SIGTERM'); await exited; }
const jar = () => new Map();
async function api(cookies, route, data, expected = 200, customHeaders = {}) {
  const response = await fetch(origin + '/api/' + route, { method: data === undefined ? 'GET' : 'POST', headers: { Cookie: [...cookies].map(([key, value]) => key + '=' + value).join('; '), ...(data === undefined ? {} : { Origin: origin, 'Content-Type': 'application/json' }), ...customHeaders }, body: data === undefined ? undefined : JSON.stringify(data) });
  for (const cookie of response.headers.getSetCookie()) { const pair = cookie.split(';')[0], index = pair.indexOf('='); cookies.set(pair.slice(0, index), pair.slice(index + 1)); }
  const result = await response.json();
  assert.equal(response.status, expected, route + ': ' + JSON.stringify(result));
  return result;
}
async function check(name, fn) { await fn(); passed++; records.push({ check: name, status: 'PASS' }); console.log('PASS ' + name); }
function input(listing, changes = {}) {
  const { title, description, category, subcategory, transaction_type, price_type, location, latitude, longitude, condition, attributes, negotiable, delivery } = listing;
  return { title, description, category, subcategory, transaction_type, price_type, location, latitude, longitude, condition, attributes, negotiable, delivery, price: listing.price === null ? '' : String(listing.price / 100), images: [], video: '', status: 'published', ...changes };
}

try {
  await start();
  const anonymous = jar(), buyer = jar(), attacker = jar();
  await check('public route shells and preview catalog', async () => {
    for (const route of ['/', '/marketplace', '/login', '/signup', '/sell', '/dashboard', '/listing/sample-tacoma', '/messages', '/messages/missing', '/broker', '/brokers', '/admin', '/trust']) assert.equal((await fetch(origin + route)).status, 200, route);
    const results = await api(anonymous, 'marketplace?q=' + encodeURIComponent('Toyota truck under $30K'));
    assert.ok(results.total > 0); assert.ok(results.listings.every(listing => listing.price <= 3000000));
    await api(anonymous, 'listings/does-not-exist', undefined, 404);
  });
  await check('anonymous mutations and protected workspaces are denied', async () => {
    await api(anonymous, 'dashboard', undefined, 401); await api(anonymous, 'broker', undefined, 401); await api(anonymous, 'admin', undefined, 401);
    await api(anonymous, 'listings/sample-tacoma/save', { saved: true }, 401);
  });
  await api(buyer, 'auth/demo', { role: 'buyer' });
  const seller = new Map(buyer), broker = new Map(buyer);
  await api(seller, 'auth/demo', { role: 'seller' }); await api(broker, 'auth/demo', { role: 'broker' });
  const buyerState = await api(buyer, 'state');
  let truck, p2pLead, p2pOffer, serviceListing, serviceLead, business, businessLead, wantedId;
  await check('signed demo sessions isolate visitors and reject tampering', async () => {
    await api(attacker, 'auth/demo', { role: 'buyer' });
    assert.notEqual((await api(attacker, 'state')).actor.workspace, buyerState.actor.workspace);
    const tampered = new Map(buyer); const value = tampered.get('dealr-demo'); tampered.set('dealr-demo', value.slice(0, -5) + 'aaaaa');
    assert.equal((await api(tampered, 'state')).actor, null);
    await api(tampered, 'dashboard', undefined, 401);
    await api(buyer, 'auth/demo', { role: 'admin' }, 400);
  });
  const samples = (await api(seller, 'marketplace?category=Vehicles')).listings;
  const template = samples.find(listing => listing.attributes.model === 'Tacoma' && listing.price === 2950000);
  await check('seller draft, publish, edit, unpublish and republish through HTTP', async () => {
    truck = await api(seller, 'listings', input(template, { title: '', description: '', price: '', location: '', status: 'draft' }));
    await api(buyer, 'listings/' + truck.id, undefined, 404);
    truck = await api(seller, 'listings/' + truck.id, input(template));
    await api(seller, 'listings/' + truck.id, input(truck, { status: 'draft' }));
    await api(buyer, 'listings/' + truck.id, undefined, 404);
    truck = await api(seller, 'listings/' + truck.id, input(truck));
    await api(buyer, 'listings/' + truck.id, { ...input(truck), seller_id: buyerState.actor.id }, 400);
    await api(buyer, 'listings/' + truck.id, input(truck), 403);
  });
  await check('P2P final boss through authenticated HTTP', async () => {
    const found = await api(buyer, 'marketplace?q=' + encodeURIComponent('Toyota truck under $30K near Charlotte'));
    assert.ok(found.listings.some(listing => listing.id === truck.id));
    await api(buyer, 'listings/' + truck.id + '/save', { saved: true });
    p2pLead = (await api(buyer, 'listings/' + truck.id + '/inquire', { message: 'Can I see the service records?' })).leadId;
    p2pOffer = await api(buyer, 'listings/' + truck.id + '/offer', { price: '27500', requestId: crypto.randomUUID(), acknowledged: true });
    await api(seller, 'offers/' + p2pOffer.id, { action: 'COUNTER', amount: '28500', message: 'Happy to discuss $28,500.' });
    const conversation = await api(buyer, 'conversations/' + p2pLead);
    assert.equal(conversation.offers[0].history[0].amount, 2850000);
    assert.equal(conversation.offers[0].status, 'COUNTERED');
  });
  await check('service final boss through authenticated HTTP', async () => {
    const template = (await api(seller, 'marketplace?q=pressure+washing')).listings[0];
    serviceListing = await api(seller, 'listings', input(template));
    serviceLead = (await api(buyer, 'listings/' + serviceListing.id + '/inquire', { message: 'Please quote my driveway in Charlotte.' })).leadId;
    await api(seller, 'conversations/' + serviceLead + '/messages', { message: 'Please send dimensions and your preferred date.' });
    assert.equal((await api(buyer, 'conversations/' + serviceLead)).messages.length, 2);
  });
  await check('broker final boss and human stage transitions through HTTP', async () => {
    const template = (await api(seller, 'marketplace?q=' + encodeURIComponent('business under $300K with $100K+ cash flow and seller financing'))).listings[0];
    business = await api(seller, 'listings', input(template));
    await api(buyer, 'profile', { budget: 300000, cash: 100000, location: 'Charlotte', minSde: 100000, financing: true, category: 'Businesses' });
    businessLead = (await api(buyer, 'listings/' + business.id + '/inquire', { message: 'Please share earnings documentation.' })).leadId;
    await api(buyer, 'listings/' + business.id + '/offer', { price: 235000, cash: 100000, financing: 135000, days: 30, requestId: crypto.randomUUID(), acknowledged: true });
    const brokerId = (await api(broker, 'state')).actor.id;
    await api(buyer, 'conversations/' + businessLead + '/broker', { brokerId });
    assert.ok((await api(broker, 'broker')).leads.some(lead => lead.id === businessLead));
    const summary = await api(broker, 'conversations/' + businessLead + '/copilot'); assert.equal(summary.gap, 3000000);
    for (const [fromStage, stage] of [['NEW LEAD', 'CONTACTED'], ['CONTACTED', 'QUALIFIED'], ['QUALIFIED', 'NEGOTIATING']]) await api(broker, 'conversations/' + businessLead + '/stage', { fromStage, stage });
    await api(buyer, 'conversations/' + businessLead + '/stage', { fromStage: 'NEGOTIATING', stage: 'DUE DILIGENCE' }, 403);
  });
  await check('wanted matching in both directions through HTTP', async () => {
    const wanted = await api(buyer, 'listings', input(truck, { title: 'Wanted: Tacoma under $30K', transaction_type: 'Wanted', price_type: 'Maximum budget', price: '30000', attributes: { make: 'Toyota', model: 'Tacoma' }, radius_miles: 50 })); wantedId = wanted.id;
    assert.ok((await api(buyer, 'dashboard')).matches.some(match => match.wanted_id === wantedId && match.listing_id === truck.id));
    const later = await api(seller, 'listings', input(truck, { price: '28000' }));
    assert.ok((await api(buyer, 'dashboard')).matches.some(match => match.wanted_id === wantedId && match.listing_id === later.id));
  });
  await check('offer idempotency and invalid terms through HTTP', async () => {
    const offer = { price: 26000, requestId: crypto.randomUUID(), acknowledged: true };
    const first = await api(buyer, 'listings/' + truck.id + '/offer', offer);
    const second = await api(buyer, 'listings/' + truck.id + '/offer', offer); assert.equal(first.id, second.id); assert.equal(second.duplicate, true);
    await api(buyer, 'listings/' + truck.id + '/offer', { ...offer, price: 27000 }, 409);
    await api(buyer, 'listings/' + truck.id + '/offer', { ...offer, price: 0 }, 400);
    await api(seller, 'listings/' + truck.id + '/offer', { ...offer, requestId: crypto.randomUUID() }, 400);
  });
  await check('private data, moderation and CSRF protections through HTTP', async () => {
    await api(attacker, 'conversations/' + p2pLead, undefined, 404);
    await api(attacker, 'listings/' + truck.id, undefined, 404);
    await api(buyer, 'admin', undefined, 403); await api(buyer, 'broker', undefined, 403);
    await api(buyer, 'listings/' + truck.id + '/save', { saved: true }, 403, { Origin: 'https://untrusted.example' });
    const result = await api(buyer, 'listings/' + truck.id + '/ai', { question: 'Has it ever been in an accident?' }); assert.equal(result.kind, 'UNKNOWN INFORMATION');
  });
  await check('logout and re-entry restore the same persisted workspace', async () => {
    await api(buyer, 'auth/logout', {}); assert.equal((await api(buyer, 'state')).actor, null);
    await api(buyer, 'auth/demo', { role: 'buyer' }); const state = await api(buyer, 'state');
    assert.equal(state.actor.id, buyerState.actor.id); assert.ok(state.saved.includes(truck.id));
    assert.ok((await api(buyer, 'conversations/' + p2pLead)).offers.some(offer => offer.id === p2pOffer.id && offer.status === 'COUNTERED'));
  });
  await stop(); await start();
  await check('data survives an application process restart', async () => {
    assert.ok((await api(buyer, 'state')).saved.includes(truck.id));
    assert.equal((await api(broker, 'conversations/' + businessLead)).lead.stage, 'NEGOTIATING');
    assert.equal((await api(buyer, 'conversations/' + serviceLead)).messages.length, 2);
    assert.ok((await api(buyer, 'dashboard')).matches.some(match => match.wanted_id === wantedId));
  });
  await writeFile('.test-output/http-report.json', JSON.stringify({ testedAt: new Date().toISOString(), passed, checks: records, scope: 'Production HTTP/API and PostgreSQL persistence. No browser/mobile or hosted Supabase validation.' }, null, 2));
  console.log(`${passed} HTTP Gauntlet checks passed.`);
} catch (error) { console.error(error); console.error(output); process.exitCode = 1; }
finally { await stop(); }
