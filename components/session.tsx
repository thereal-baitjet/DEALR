'use client';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Check, X } from 'lucide-react';
import { emptyProfile } from '@/lib/domain';
import { request } from '@/lib/client';
import type { SessionState } from '@/lib/contracts';
import { Empty, Loading } from './ui';

const initial: SessionState = { actor: null, profile: emptyProfile, saved: [], demo: false, brokers: [], ready: false, demoAvailable: false, authAvailable: false, preview: true };
const Context = createContext<{ state: SessionState; loading: boolean; refresh: () => Promise<void>; notify: (message: string) => void }>({ state: initial, loading: true, refresh: async () => {}, notify: () => {} });
export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initial), [loading, setLoading] = useState(true), [toast, setToast] = useState('');
  const refresh = useCallback(async () => { try { setState(await request<SessionState>('state')); } catch (error) { setState(initial); setToast((error as Error).message); } finally { setLoading(false); } }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 5500); return () => clearTimeout(timer); }, [toast]);
  return <Context.Provider value={{ state, loading, refresh, notify: setToast }}>{children}{toast && <div className="toast" role="status"><Check size={18} /><span>{toast}</span><button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={16} /></button></div>}</Context.Provider>;
}
export const useSession = () => useContext(Context);
export function Gate({ children, role }: { children: ReactNode; role?: 'broker' | 'admin' }) {
  const { state, loading } = useSession();
  if (loading) return <Loading />;
  if (!state.actor) return <Empty title="Your next deal starts here." href="/login" action="Sign in to continue">Sign in to keep your listings, conversations, and offers together.</Empty>;
  if (role && state.actor.role !== role) return <Empty title={role === 'broker' ? 'A workspace for approved brokers.' : 'Administrator access required.'} href="/dashboard" action="Back to dashboard">{role === 'broker' ? 'Broker access is granted after review. You can still buy, sell, and request help with a deal.' : 'This account does not have permission to review marketplace activity.'}</Empty>;
  return children;
}
