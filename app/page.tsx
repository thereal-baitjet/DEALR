import Link from 'next/link';
import { ArrowRight, Search, Layers3, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { HomeDiscovery } from '@/components/home-discovery';

export default function Home() { return <div className="container"><section className="hero"><span className="eyebrow"><span className="status-dot" /> ONE MARKETPLACE. ENDLESS POSSIBILITIES.</span><h1>What are you<br /><em>looking for?</em></h1><p>From your next set of wheels to your next big idea.<br />Find it. List it. Deal it.</p><form className="hero-search" action="/marketplace"><Search size={24} /><input name="q" aria-label="Describe what you are looking for" placeholder="A Toyota truck under $30K near Charlotte…" maxLength={500} /><Button type="submit">Search DEALR <ArrowRight size={17} /></Button></form><div className="suggestions"><span>Try something like</span>{[['Toyota truck under $30K', 'Toyota truck under $30K near Charlotte'], ['A place to call home', '3 bedroom house in Charlotte under $450K'], ['Help around the house', 'Pressure washing in Charlotte']].map(([label, q]) => <Link key={q} href={'/marketplace?q=' + encodeURIComponent(q)}>{label}<ArrowUp /></Link>)}</div></section><HomeDiscovery /></div>; }
function ArrowUp() { return <ArrowRight size={12} />; }
