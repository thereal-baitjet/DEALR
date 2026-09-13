'use client';

import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { COOKIE_POLICY_VERSION, type CookieConsentState } from '@/lib/cookie-consent';
import { request } from '@/lib/client';
import { Button } from './ui';
import { useSession } from './session';

const CookieContext = createContext({ available: false });

export function CookieSettingsButton({ children = 'Cookie settings', className = 'text-link', ...props }: ComponentProps<'button'>) {
  const { available } = useContext(CookieContext);
  return <Dialog.Trigger asChild><button {...props} type="button" className={className} disabled={!available || props.disabled}>{children}</button></Dialog.Trigger>;
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<CookieConsentState | null>(null);
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadingPreferences, setLoadingPreferences] = useState(false);
  const [error, setError] = useState('');
  const saving = useRef(false);
  const readVersion = useRef(0);
  const returnFocus = useRef<HTMLElement | null>(null);
  const channel = useRef<BroadcastChannel | null>(null);
  const { notify } = useSession();

  const refresh = useCallback(async (signal?: AbortSignal) => {
    const version = ++readVersion.current;
    const current = await request<CookieConsentState>('cookie-consent', undefined, signal ?? AbortSignal.timeout(10_000));
    if (version === readVersion.current) setSnapshot(current);
    return current;
  }, []);

  useEffect(() => {
    const abort = new AbortController();
    const sync = () => { if (!saving.current) void refresh(abort.signal).catch(() => {}); };
    sync();
    window.addEventListener('focus', sync);
    const visible = () => { if (document.visibilityState === 'visible') sync(); };
    document.addEventListener('visibilitychange', visible);
    // Cross-tab updates contain no identifiers and do not use local storage.
    try {
      channel.current = new BroadcastChannel('dealr-cookie-consent');
      channel.current.onmessage = sync;
    } catch { /* Focus/visibility refresh still synchronizes settings. */ }
    return () => { abort.abort(); window.removeEventListener('focus', sync); document.removeEventListener('visibilitychange', visible); channel.current?.close(); channel.current = null; };
  }, [refresh]);

  function changeOpen(next: boolean) {
    if (saving.current) return;
    setOpen(next);
    setError('');
    if (next) {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setAnalytics(snapshot?.analyticsAllowed ?? false);
      setLoadingPreferences(true);
      void refresh().then(current => setAnalytics(current.analyticsAllowed)).catch(() => setError('Could not load your saved choice. You can still choose necessary only below.')).finally(() => setLoadingPreferences(false));
    }
  }

  async function save(allow: boolean) {
    if (saving.current) return;
    readVersion.current++;
    saving.current = true; setBusy(true); setError('');
    try {
      const saved = await request<CookieConsentState>('cookie-consent', { version: COOKIE_POLICY_VERSION, analytics: allow }, AbortSignal.timeout(10_000));
      const confirmed = await refresh();
      if (confirmed.consent?.updatedAt !== saved.consent?.updatedAt || confirmed.consent?.analytics !== saved.consent?.analytics) {
        throw new Error('Your browser did not save this choice. Check its cookie settings and try again.');
      }
      setAnalytics(confirmed.analyticsAllowed);
      setOpen(false);
      channel.current?.postMessage('changed');
      notify(confirmed.analyticsAllowed ? 'Cookie choice saved. Optional analytics are on.' : 'Cookie choice saved. Optional analytics are off.');
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not save your choice. Please try again.'); }
    finally { saving.current = false; setBusy(false); }
  }

  return <CookieContext.Provider value={{ available: true }}><Dialog.Root open={open} onOpenChange={changeOpen}>
    {children}
    {snapshot && !snapshot.consent && <section className="cookie-banner" aria-labelledby="cookie-banner-title" aria-describedby="cookie-banner-description">
      <div className="cookie-banner-heading"><span className="cookie-symbol"><Cookie size={22} aria-hidden="true" /></span><h2 id="cookie-banner-title">Your privacy. Your choice.</h2></div>
      <p id="cookie-banner-description">We use necessary cookies for sign-in, security, and your choices. With your permission, we also record search and listing-view events to improve DEALR. <Link href="/cookies">Read our cookie policy</Link>.</p>
      {snapshot.globalPrivacyControl && <p className="cookie-gpc">Your browser’s privacy signal keeps optional analytics off.</p>}
      {error && !open && <p className="cookie-error" role="alert">{error}</p>}
      <div className="cookie-actions">
        <Button type="button" variant="secondary" disabled={busy} onClick={() => void save(false)}>Reject optional</Button>
        <Button type="button" variant="secondary" disabled={busy || snapshot.globalPrivacyControl} onClick={() => void save(true)}>Accept optional</Button>
        <CookieSettingsButton className="button button-ghost" disabled={busy}>Manage preferences</CookieSettingsButton>
      </div>
    </section>}
    <Dialog.Portal><Dialog.Overlay className="modal-overlay" /><Dialog.Content className="modal cookie-modal" onCloseAutoFocus={event => {
      const target = returnFocus.current?.isConnected ? returnFocus.current : document.querySelector<HTMLButtonElement>('.footer-cookie-settings');
      if (target) { event.preventDefault(); target.focus(); }
    }}>
      <div className="modal-heading"><div><Dialog.Title>Cookie preferences</Dialog.Title><Dialog.Description>Choose how DEALR uses optional analytics on this browser. You can change your mind at any time.</Dialog.Description></div><Dialog.Close asChild><button type="button" className="icon-button" aria-label="Close cookie preferences" disabled={busy}><X size={20} /></button></Dialog.Close></div>
      <div className="cookie-category"><div><h3><ShieldCheck size={18} aria-hidden="true" />Necessary cookies</h3><p>Keep sign-in and the private demo working, protect requests, and remember your cookie choice. These are used when the relevant feature is needed.</p></div><span className="cookie-required">Always active</span></div>
      <div className="cookie-category"><div><h3 id="cookie-analytics-label">Optional analytics</h3><p id="cookie-analytics-description">Record search event counts and viewed listing IDs linked to your account or private demo. Raw search text is not included in these events. Declining does not affect searching, messaging, or making offers.</p></div><label className="cookie-toggle"><input type="checkbox" checked={analytics && !snapshot?.globalPrivacyControl} disabled={busy || loadingPreferences || !snapshot || snapshot.globalPrivacyControl} aria-labelledby="cookie-analytics-label" aria-describedby="cookie-analytics-description" onChange={event => setAnalytics(event.target.checked)} /><span aria-hidden="true">{analytics && !snapshot?.globalPrivacyControl ? 'On' : 'Off'}</span></label></div>
      <p className="cookie-detail">We do not use advertising cookies or third-party analytics tools. Your choice is remembered for 180 days on this browser.</p>
      {snapshot?.globalPrivacyControl && <p className="cookie-gpc" role="status">Global Privacy Control is on in your browser, so optional analytics stay off.</p>}
      {error && <p className="cookie-error" role="alert">{error}</p>}
      <div className="cookie-actions"><Button type="button" variant="secondary" disabled={busy} onClick={() => void save(false)}>Reject optional</Button><Button type="button" disabled={busy || loadingPreferences || !snapshot} onClick={() => void save(analytics)}>{busy ? 'Saving…' : 'Save preferences'}</Button></div>
      <p className="cookie-policy-links"><Link href="/cookies" onClick={() => setOpen(false)}>Cookie policy</Link><Link href="/privacy" onClick={() => setOpen(false)}>Privacy policy</Link></p>
    </Dialog.Content></Dialog.Portal>
  </Dialog.Root></CookieContext.Provider>;
}
