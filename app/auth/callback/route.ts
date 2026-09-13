import { NextResponse } from 'next/server';
import { leaveDemo, supabase } from '@/lib/auth';
import { safeNext } from '@/lib/navigation';
import { applicationOrigin } from '@/lib/origin';
import { authConfigured } from '@/lib/runtime';

export async function GET(request: Request) {
  const url = new URL(request.url), code = url.searchParams.get('code');
  const origin = applicationOrigin(request);
  if (code && authConfigured()) {
    const { data, error } = await (await supabase()).auth.exchangeCodeForSession(code);
    if (!error && data.session) {
      await leaveDemo();
      return NextResponse.redirect(new URL(safeNext(url.searchParams.get('next')), origin));
    }
  }
  return NextResponse.redirect(new URL('/login?error=confirmation', origin));
}
