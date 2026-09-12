import { NextResponse } from 'next/server';
import { safeNext, supabase } from '@/lib/auth';

export async function GET(request: Request) {
  const url = new URL(request.url), code = url.searchParams.get('code');
  const origin = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  if (code) {
    const { error } = await (await supabase()).auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safeNext(url.searchParams.get('next')), origin));
  }
  return NextResponse.redirect(new URL('/login?error=confirmation', origin));
}
