'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowUpRight, Search, Plus, MessageCircle, LayoutGrid, Menu, X, ChevronDown, ArrowRight, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useSession } from './session';
import { Button } from './ui';
import { CookieSettingsButton } from './cookie-consent';
import { request } from '@/lib/client';

function Brand() {
  return <Link className="brand" href="/" aria-label="DEALR — a Baitjet company, home"><span className="wordmark">DEALR<span aria-hidden="true">↗</span></span><span className="brand-company">a Baitjet company</span></Link>;
}

export function Header() {
  const pathname = usePathname(), router = useRouter(), { state, refresh, notify } = useSession();
  const [menu, setMenu] = useState(false), [busy, setBusy] = useState(false);
  async function switchRole(role: string) { setBusy(true); try { await request('auth/demo', { role }); await refresh(); router.push(role === 'broker' ? '/broker' : '/dashboard'); } catch (error) { notify((error as Error).message); } finally { setBusy(false); } }
  return <><header className="site-header"><div className="header-inner"><Brand /><nav className={menu ? 'desktop-nav menu-open' : 'desktop-nav'} aria-label="Main navigation"><Link onClick={() => setMenu(false)} className={pathname === '/marketplace' ? 'active' : ''} href="/marketplace">Explore</Link><Link onClick={() => setMenu(false)} href="/marketplace?type=Wanted">Wanted</Link><Link onClick={() => setMenu(false)} href="/brokers">Find a broker <ArrowUpRight size={13} /></Link></nav><div className="header-actions">{state.actor ? <><Link className="icon-button desktop-only" href="/messages" aria-label="Messages"><MessageCircle size={20} /></Link><Link className="account-link" href="/dashboard"><span className="avatar avatar-small">{state.actor.name.slice(0, 1)}</span><span className="desktop-only">My DEALR</span><ChevronDown size={14} /></Link></> : <Link className="login-link" href="/login">Log in</Link>}<Button asChild className="list-button"><Link href="/sell"><Plus size={17} /> List something</Link></Button><button className="icon-button menu-button" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button></div></div></header>{state.demo && <div className="demo-bar"><span><b>Interactive demo</b> · Your private fictional marketplace</span><label>View as <select aria-label="Demo role" disabled={busy} value={state.actor?.id.endsWith('-broker') ? 'broker' : state.actor?.id.endsWith('-seller') ? 'seller' : 'buyer'} onChange={event => void switchRole(event.target.value)}><option value="buyer">Buyer</option><option value="seller">Seller</option><option value="broker">Broker</option></select></label><button aria-label="Leave demo" onClick={async () => { await request('auth/logout', {}); await refresh(); router.push('/'); }}><LogOut size={15} /></button></div>}<nav className="mobile-nav" aria-label="Mobile navigation"><Link href="/marketplace"><Search size={20} />Explore</Link><Link href="/sell"><Plus size={20} />List</Link><Link href="/messages"><MessageCircle size={20} />Messages</Link><Link href="/dashboard"><LayoutGrid size={20} />My DEALR</Link></nav></>;
}
export function Footer() { return <footer className="footer"><div><Brand /><p>Find it. List it. Deal it.</p></div><div className="footer-links"><Link href="/marketplace">Marketplace</Link><Link href="/sell?type=Wanted">Post a wanted request</Link><Link href="/privacy">Privacy</Link><Link href="/cookies">Cookie policy</Link><CookieSettingsButton className="footer-cookie-settings" /><Link href="/trust">Trust & safety <ArrowRight size={14} /></Link></div><small>© {new Date().getFullYear()} DEALR. A world of possibility.</small></footer>; }
