import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { AppError, type Actor } from './domain';
import { authConfigured, demoEnabled, service } from './runtime';

const demoCookie = 'dealr-demo';
type DemoSession = { id: string; role: 'buyer' | 'seller' | 'broker'; active: boolean; expires: number };

async function secret() {
  if (process.env.DEALR_DEMO_SECRET) {
    if (process.env.DEALR_DEMO_SECRET.length < 32) throw new AppError(503, 'Demo session configuration needs attention.');
    return process.env.DEALR_DEMO_SECRET;
  }
  if (process.env.NODE_ENV === 'production') throw new AppError(503, 'Demo session configuration needs attention.');
  const directory = path.resolve(process.env.DEALR_DATA_DIR || '.data');
  await mkdir(directory, { recursive: true });
  const file = path.join(directory, 'session-secret');
  try { return await readFile(file, 'utf8'); } catch {
    try { await writeFile(file, randomBytes(48).toString('hex'), { flag: 'wx', mode: 0o600 }); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; }
    return readFile(file, 'utf8');
  }
}

export async function readDemo(): Promise<DemoSession | null> {
  if (!demoEnabled()) return null;
  const value = (await cookies()).get(demoCookie)?.value;
  if (!value) return null;
  const [payload, signature, extra] = value.split('.');
  if (!payload || !signature || extra) return null;
  const expected = createHmac('sha256', await secret()).update(payload).digest();
  const actual = Buffer.from(signature, 'base64url');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const result = JSON.parse(Buffer.from(payload, 'base64url').toString()) as DemoSession;
    return /^[a-f0-9]{48}$/.test(result.id) && ['buyer', 'seller', 'broker'].includes(result.role) && typeof result.active === 'boolean' && result.expires > Date.now() ? result : null;
  } catch { return null; }
}

export async function writeDemo(session: DemoSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = createHmac('sha256', await secret()).update(payload).digest('base64url');
  (await cookies()).set(demoCookie, payload + '.' + signature, {
    httpOnly: true, sameSite: 'lax', secure: Boolean(process.env.VERCEL) || (process.env.NEXT_PUBLIC_APP_URL || '').startsWith('https:'),
    path: '/', maxAge: Math.max(0, Math.floor((session.expires - Date.now()) / 1000)),
  });
}

export async function startDemo(role: DemoSession['role']) {
  if (!demoEnabled()) throw new AppError(404, 'Demo sign-in is not enabled.');
  const previous = await readDemo();
  const session: DemoSession = { id: previous?.id ?? randomBytes(24).toString('hex'), role, active: true, expires: Date.now() + 7 * 86400_000 };
  // Provision before setting the cookie, so failures never create a broken session.
  const actor = await (await service()).identity(session.id, 'Demo', [], role);
  await writeDemo(session);
  return actor;
}

export async function supabase() {
  if (!authConfigured()) throw new AppError(503, 'Account sign-in is not available yet.');
  const jar = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: { getAll: () => jar.getAll(), setAll: entries => { entries.forEach(({ name, value, options }) => jar.set(name, value, options)); } },
  });
}

export async function currentActor(): Promise<Actor | null> {
  const demo = await readDemo();
  if (demo?.active) return (await service()).identity(demo.id, 'Demo', [], demo.role);
  if (!authConfigured()) return null;
  const client = await supabase();
  // Validate with Supabase. A client-provided role or decoded session is never authority.
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  return (await service()).identity(user.id, String(user.user_metadata?.name || 'DEALR member'), (process.env.DEALR_ADMIN_IDS || '').split(',').map(id => id.trim()).filter(Boolean));
}

export async function signOut() {
  const demo = await readDemo();
  if (demo) await writeDemo({ ...demo, active: false });
  if (authConfigured()) { const { error } = await (await supabase()).auth.signOut(); if (error) throw new AppError(502, 'Could not sign out. Please try again.'); }
}

export function safeNext(value: string | null) { return value?.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : '/dashboard'; }
