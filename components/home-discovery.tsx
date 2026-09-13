'use client';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Sparkles, ScanSearch } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import { useRemote } from '@/lib/client';
import type { SearchResult } from '@/lib/contracts';
import { useSession } from './session';
import { categoryIcons, ListingCard, ListPromptCard } from './listing-card';
import { Button, Empty, ErrorNotice, Loading } from './ui';

const subtitles = ['Everyday finds, extraordinary value', 'Your next adventure starts here', 'A place for your next chapter', 'Build on a new opportunity', 'Find the right person for the job', 'Tools to make things happen'];
export function HomeDiscovery() {
  const { state } = useSession();
  const result = useRemote<SearchResult>('marketplace?sort=newest', state.actor?.id);
  const invite = !state.preview && !state.demo;
  return <><section className="category-section"><div className="category-grid">{CATEGORIES.map((name, index) => { const Icon = categoryIcons[name]; return <Link className="category-tile" key={name} href={'/marketplace?category=' + encodeURIComponent(name)}><span className={'category-symbol category-' + index}><Icon size={24} strokeWidth={1.5} /></span><h2>{name}</h2><p>{subtitles[index]}</p><ArrowUpRight size={15} /></Link>; })}</div></section><section className="section"><div className="section-heading"><div><span className="eyebrow">FRESH FINDS</span><h2>A little of everything.</h2><p>{state.preview || state.demo ? 'Explore a fictional marketplace full of possibilities.' : 'The latest listings, all in one place.'}</p></div><Link href="/marketplace">Explore all<ArrowRight size={16} /></Link></div>{result.loading ? <Loading cards /> : result.error ? <ErrorNotice>{result.error}</ErrorNotice> : !result.data?.total && !invite ? <Empty title="Be the first to list." href="/sell" action="List something">A great marketplace starts with its first find.</Empty> : <div className="listing-grid">{invite && <ListPromptCard />}{result.data?.listings.slice(0, invite ? 7 : 8).map(listing => <ListingCard key={listing.id} listing={listing} />)}</div>}</section><section className="opportunity-grid section"><div className="wanted-callout"><span className="eyebrow"><ScanSearch size={14} /> LET THE RIGHT FIND COME TO YOU</span><h2>Can’t find it?<br /><em>Put it out there.</em></h2><p>Post what you’re looking for. We’ll match your request with compatible listings as they arrive.</p><Button asChild variant="secondary"><Link href="/sell?type=Wanted">Post a wanted request<ArrowRight size={16} /></Link></Button><div className="wanted-decoration" aria-hidden="true">↗</div></div><div className="broker-callout"><span className="eyebrow"><Sparkles size={13} /> A LITTLE EXPERTISE GOES A LONG WAY</span><h2>Big opportunity.<br />The right guidance.</h2><p>For more complex deals, bring an approved broker into the conversation when you need one.</p><Link href="/brokers">Explore broker assistance<ArrowRight size={16} /></Link></div></section></>;
}
