import { NextResponse } from 'next/server';
import { googleAvailable, safeNext, supabase } from '@/lib/auth';
import { applicationOrigin } from '@/lib/origin';

export const dynamic = 'force-dynamic';

// Starts Supabase's PKCE Google flow. The verifier cookie set here lets /auth/callback finish it.
export async function GET(request: Request) {
  const origin = applicationOrigin(request), next = safeNext(new URL(request.url).searchParams.get('next'));
  if (await googleAvailable()) {
    const redirectTo = new URL('/auth/callback', origin);
    redirectTo.searchParams.set('next', next);
    const { data, error } = await (await supabase()).auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectTo.toString(), skipBrowserRedirect: true } });
    if (!error && data.url) return NextResponse.redirect(data.url);
  }
  return NextResponse.redirect(new URL('/login?error=google', origin));
}
