'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, FlaskConical, LockKeyhole } from 'lucide-react';
import { Button, ErrorNotice, Field } from './ui';
import { useSession } from './session';
import { request } from '@/lib/client';

export function AuthForm({ signup = false }: { signup?: boolean }) {
  const { state, refresh } = useSession(), router = useRouter(), params = useSearchParams();
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [confirmed, setConfirmed] = useState(false);
  const next = params.get('next');
  const destination = next?.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : '/dashboard';
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const result = await request<{ signedIn: boolean }>('auth/' + (signup ? 'signup' : 'login'), { email: form.get('email'), password: form.get('password'), ...(signup ? { name: form.get('name') } : {}) });
      if (result.signedIn) { await refresh(); router.push(destination); } else setConfirmed(true);
    } catch (error) { setError((error as Error).message); } finally { setBusy(false); }
  }
  async function demo() { setBusy(true); setError(''); try { await request('auth/demo', { role: 'buyer' }); await refresh(); router.push(destination); } catch (error) { setError((error as Error).message); } finally { setBusy(false); } }
  return <div className="auth-layout"><aside className="auth-story"><span className="eyebrow">GOOD THINGS START WITH A CONNECTION</span><h1>Find your<br />next <em>possibility.</em></h1><p>A new home. A growing business. The perfect find.<br />Whatever comes next, start here.</p><div className="auth-art"><div /><div /><div /><span>↗</span></div><p className="auth-tagline">One account. Every side of the deal.</p></aside><section className="auth-panel"><div className="auth-icon"><LockKeyhole /></div><h1>{signup ? 'A world of opportunity.' : 'Welcome back.'}</h1><p>{signup ? 'Create your account to buy, sell, and connect.' : 'Your listings, conversations, and next great find await.'}</p>{confirmed ? <div className="notice">Check your email to confirm your account, then return to sign in.</div> : <form onSubmit={submit} className="stack">{signup && <Field label="Your name"><input name="name" autoComplete="name" minLength={2} maxLength={100} required /></Field>}<Field label="Email address"><input type="email" name="email" autoComplete="email" required /></Field><Field label="Password" hint="At least 8 characters."><input type="password" name="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength={8} maxLength={128} required /></Field><Button type="submit" disabled={busy || !state.authAvailable}>{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}<ArrowRight size={17} /></Button></form>}{error && <ErrorNotice>{error}</ErrorNotice>}{!state.authAvailable && <p className="muted small">Account registration is not open yet.{state.demoAvailable ? ' Explore every side of a fictional deal in your private demo below.' : ' You can explore the sample catalog while account setup is completed.'}</p>}{state.demoAvailable && <><div className="divider"><span>Take a look around</span></div><Button className="full-width" variant="secondary" disabled={busy} onClick={() => void demo()}><FlaskConical size={17} />Open interactive demo<ArrowRight size={16} /></Button><p className="muted small">Fictional listings. Private workspace. Switch between buyer, seller, and broker to explore a complete deal.</p></>}<p className="auth-switch">{signup ? 'Already have an account?' : 'New to DEALR?'} <Link href={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Create an account'}</Link></p></section></div>;
}
