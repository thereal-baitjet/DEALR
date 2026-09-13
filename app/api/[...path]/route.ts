import { NextResponse } from 'next/server';
import { z } from 'zod';
import { currentActor, googleAvailable, leaveDemo, signOut, startDemo, supabase } from '@/lib/auth';
import { authConfigured, dataConfigured, demoEnabled, service } from '@/lib/runtime';
import { AppError, emptyProfile, groundedAnswer } from '@/lib/domain';
import { body } from '@/lib/http';
import { previewListing, previewSearch } from '@/lib/preview';
import { applicationOrigin } from '@/lib/origin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ path: string[] }> };
// Readable names for validation paths, e.g. images.0 is shown as "Photo 1".
const fieldLabel = (path: (string | number)[]) => path[0] === 'images' && typeof path[1] === 'number' ? 'Photo ' + (path[1] + 1) : path[0] === 'video' ? 'Video link' : path.join('.') || 'Input';

async function handle(request: Request, context: Context) {
  try {
    const { path } = await context.params;
    const route = path.join('/');
    const method = request.method;
    const input = method === 'GET' ? undefined : await body(request);
    const url = new URL(request.url);
    let result: unknown;
    if (method === 'POST' && route === 'auth/demo') {
      const data = z.object({ role: z.enum(['buyer', 'seller', 'broker']).default('buyer') }).strict().parse(input);
      result = { actor: await startDemo(data.role) };
    } else if (method === 'POST' && route === 'auth/logout') {
      await signOut(); result = { signedOut: true };
    } else if (method === 'POST' && ['auth/login', 'auth/signup'].includes(route)) {
      const data = z.object({ email: z.string().email().max(254), password: z.string().min(8).max(128), name: z.string().trim().min(2).max(100).optional() }).strict().parse(input);
      const client = await supabase();
      const response = route === 'auth/signup'
        ? await client.auth.signUp({ email: data.email, password: data.password, options: { data: { name: data.name || 'DEALR member' }, emailRedirectTo: new URL('/auth/callback', applicationOrigin(request)).toString() } })
        : await client.auth.signInWithPassword({ email: data.email, password: data.password });
      if (response.error) throw new AppError(400, route === 'auth/login' ? 'Sign-in failed. Check your email, password, and email confirmation.' : 'Could not create an account. Check your details and try again.');
      if (response.data.session) await leaveDemo();
      result = { signedIn: Boolean(response.data.session), confirmationRequired: !response.data.session };
    } else {
      const actor = await currentActor();
      if (route === 'state' && method === 'GET') {
        result = { ...(actor ? await (await service()).state(actor) : { actor: null, profile: emptyProfile, saved: [], demo: false, brokers: [], ready: dataConfigured() }), demoAvailable: demoEnabled(), authAvailable: authConfigured(), googleAvailable: await googleAvailable(), preview: !process.env.DATABASE_URL && !actor };
      } else if (route === 'brokers' && method === 'GET' && !dataConfigured()) {
        result = [];
      } else if (route === 'marketplace' && method === 'GET' && !process.env.DATABASE_URL && !actor) {
        result = previewSearch(url.searchParams);
      } else if (path[0] === 'listings' && path[1]?.startsWith('sample-') && !actor && !process.env.DATABASE_URL && path.length <= 3) {
        const listing = previewListing(path[1]);
        if (method === 'GET' && path.length === 2) result = listing;
        else if (method === 'POST' && path[2] === 'ai') result = groundedAnswer(listing, z.object({ question: z.string().trim().min(1).max(500) }).strict().parse(input).question);
        else throw new AppError(401, 'Sign in or open the demo to continue.');
      } else {
        const api = await service();
        const id = path[1]?.startsWith('sample-') && actor?.workspace.startsWith('demo-') ? actor.workspace + '-' + path[1] : path[1];
        if (route === 'marketplace' && method === 'GET') result = await api.search(actor, url.searchParams);
        else if (route === 'brokers' && method === 'GET') result = await api.brokers(actor);
        else if (route === 'dashboard' && method === 'GET') result = await api.dashboard(actor);
        else if (route === 'broker' && method === 'GET') result = await api.dashboard(actor, true);
        else if (route === 'admin' && method === 'GET') result = await api.admin(actor);
        else if (route === 'admin' && method === 'POST') result = await api.moderate(actor, input);
        else if (route === 'profile' && method === 'POST') result = await api.setProfile(actor, input);
        else if (route === 'account' && method === 'POST') result = await api.account(actor, input);
        else if (route === 'reports' && method === 'POST') result = await api.report(actor, input);
        else if (route === 'blocks' && method === 'POST') result = await api.block(actor, input);
        else if (route === 'extract' && method === 'POST') result = await api.extract(actor, input);
        else if (route === 'listings' && method === 'POST') result = await api.saveListing(actor, input);
        else if (path[0] === 'listings' && id && path.length === 2 && method === 'GET') result = await api.listing(actor, id, url.searchParams.get('track') === 'true');
        else if (path[0] === 'listings' && id && path.length === 2 && method === 'POST') result = await api.saveListing(actor, input, id);
        else if (path[0] === 'listings' && id && path.length === 3 && method === 'POST') {
          if (path[2] === 'save') result = await api.saved(actor, id, input);
          else if (path[2] === 'inquire') result = await api.inquire(actor, id, input);
          else if (path[2] === 'offer') result = await api.offer(actor, id, input);
          else if (path[2] === 'ai') result = await api.ai(actor, id, input);
          else throw new AppError(404, 'Action not found.');
        } else if (path[0] === 'conversations' && id && path.length === 2 && method === 'GET') result = await api.conversation(actor, id);
        else if (path[0] === 'conversations' && id && path.length === 3) {
          if (path[2] === 'copilot' && method === 'GET') result = await api.copilot(actor, id);
          else if (path[2] === 'messages' && method === 'POST') result = await api.message(actor, id, input);
          else if (path[2] === 'read' && method === 'POST') result = await api.markRead(actor, id, input);
          else if (path[2] === 'broker' && method === 'POST') result = await api.requestBroker(actor, id, input);
          else if (path[2] === 'stage' && method === 'POST') result = await api.stage(actor, id, input);
          else throw new AppError(404, 'Action not found.');
        } else if (path[0] === 'offers' && id && path.length === 2 && method === 'POST') result = await api.negotiate(actor, id, input);
        else throw new AppError(404, 'Action not found.');
      }
    }
    return NextResponse.json(result, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    const status = error instanceof AppError ? error.status : error instanceof z.ZodError ? 400 : 500;
    const message = error instanceof AppError ? error.message : error instanceof z.ZodError ? error.issues.map(issue => `${fieldLabel(issue.path)}: ${issue.message}`).slice(0, 3).join(' ') : 'Something went wrong. Please try again.';
    if (status === 500) console.error('DEALR request failed:', error instanceof Error ? error.name : 'Unknown error');
    return NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'private, no-store' } });
  }
}

export const GET = handle;
export const POST = handle;
