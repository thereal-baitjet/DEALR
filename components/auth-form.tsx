'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, FlaskConical, LockKeyhole } from 'lucide-react';
import { Button, ErrorNotice, Field } from './ui';
import { useSession } from './session';
import { request } from '@/lib/client';
import { safeNext } from '@/lib/navigation';

export function AuthForm({ signup = false }: { signup?: boolean }) {
  const { state, refresh } = useSession(), router = useRouter(), params = useSearchParams();
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [confirmed, setConfirmed] = useState(false);
  const next = params.get('next'), failed = params.get('error');
  const destination = safeNext(next);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const result = await request<{ signedIn: boolean }>('auth/' + (signup ? 'signup' : 'login'), { email: form.get('email'), password: form.get('password'), ...(signup ? { name: form.get('name') } : {}) });
      if (result.signedIn) { await refresh(); router.push(destination); } else setConfirmed(true);
    } catch (error) { setError((error as Error).message); } finally { setBusy(false); }
  }
  async function demo() { setBusy(true); setError(''); try { await request('auth/demo', { role: 'buyer' }); await refresh(); router.push(destination); } catch (error) { setError((error as Error).message); } finally { setBusy(false); } }
  return <div className="auth-layout"><aside className="auth-story"><span className="eyebrow">GOOD THINGS START WITH A CONNECTION</span><h1>Find your<br />next <em>possibility.</em></h1><p>A new home. A growing business. The perfect find.<br />Whatever comes next, start here.</p><div className="auth-art"><div /><div /><div /><span>↗</span></div><p className="auth-tagline">One account. Every side of the deal.</p></aside><section className="auth-panel"><div className="auth-icon"><LockKeyhole /></div><h1>{signup ? 'A world of opportunity.' : 'Welcome back.'}</h1><p>{signup ? 'Create your account to buy, sell, and connect.' : 'Your listings, conversations, and next great find await.'}</p>{state.googleAvailable && !confirmed && <><Button asChild variant="secondary" className="full-width"><a href={'/auth/google?next=' + encodeURIComponent(destination)}><GoogleMark />Continue with Google</a></Button><div className="divider"><span>Or use your email</span></div></>}{confirmed ? <div className="notice">Check your email to confirm your account, then return to sign in.</div> : <form onSubmit={submit} className="stack">{signup && <Field label="Your name"><input name="name" autoComplete="name" minLength={2} maxLength={100} required /></Field>}<Field label="Email address"><input type="email" name="email" autoComplete="email" required /></Field><Field label="Password" hint="At least 8 characters."><input type="password" name="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength={8} maxLength={128} required /></Field><Button type="submit" disabled={busy || !state.authAvailable}>{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}<ArrowRight size={17} /></Button></form>}{(error || failed) && <ErrorNotice>{error || (failed === 'google' ? 'Google sign-in is not available right now. Please use your email instead.' : 'Sign-in could not be completed. Please try again.')}</ErrorNotice>}{!state.authAvailable && <p className="muted small">Account registration is not open yet.{state.demoAvailable ? ' Explore every side of a fictional deal in your private demo below.' : ' You can explore the sample catalog while account setup is completed.'}</p>}{state.demoAvailable && <><div className="divider"><span>Take a look around</span></div><Button className="full-width" variant="secondary" disabled={busy} onClick={() => void demo()}><FlaskConical size={17} />Open interactive demo<ArrowRight size={16} /></Button><p className="muted small">Fictional listings. Private workspace. Switch between buyer, seller, and broker to explore a complete deal.</p></>}<p className="auth-switch">{signup ? 'Already have an account?' : 'New to DEALR?'} <Link href={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Create an account'}</Link></p></section></div>;
}

// Google's multicolor "G", as its sign-in branding guidelines require.
function GoogleMark() {
  return <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>;
}
