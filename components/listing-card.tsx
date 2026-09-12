'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, ShoppingBag, Car, House, BriefcaseBusiness, Wrench, Tractor, ArrowUpRight, ImageOff } from 'lucide-react';
import type { ListingResult } from '@/lib/contracts';
import { dollars } from '@/lib/domain';
import { request } from '@/lib/client';
import { useSession } from './session';

export const categoryIcons = { Marketplace: ShoppingBag, Vehicles: Car, 'Real Estate': House, Businesses: BriefcaseBusiness, Services: Wrench, Equipment: Tractor };
export function ListingVisual({ listing, index = 0, large = false }: { listing: Pick<ListingResult, 'images' | 'title' | 'category' | 'sample'>; index?: number; large?: boolean }) {
  const [failed, setFailed] = useState<string[]>([]), source = listing.images[index], Icon = categoryIcons[listing.category];
  if (source && !failed.includes(source)) return <img className="listing-image" src={source} alt={listing.title} loading={large ? 'eager' : 'lazy'} onError={() => setFailed([...failed, source])} />;
  return <div className={'listing-visual art-' + listing.category.toLowerCase().replace(' ', '-')}><div className="art-orbit" /><div className="art-block"><Icon strokeWidth={1} size={large ? 120 : 80} /></div><span className="art-label">{listing.sample ? 'DEMO ILLUSTRATION' : <><ImageOff size={11} /> NO PHOTO PROVIDED</>}</span></div>;
}
export function SaveButton({ listing, text = false }: { listing: ListingResult; text?: boolean }) {
  const { state, refresh, notify } = useSession(), router = useRouter(), [busy, setBusy] = useState(false);
  const saved = state.saved.includes(listing.id);
  async function toggle() { if (!state.actor) { router.push('/login?next=' + encodeURIComponent('/listing/' + listing.id)); return; } setBusy(true); try { await request(`listings/${listing.id}/save`, { saved: !saved }); await refresh(); notify(saved ? 'Removed from saved items.' : 'Saved to your DEALR.'); } catch (error) { notify((error as Error).message); } finally { setBusy(false); } }
  return <button type="button" className={text ? 'button button-secondary' : 'save-button'} aria-label={saved ? 'Unsave ' + listing.title : 'Save ' + listing.title} aria-pressed={saved} disabled={busy} onClick={() => void toggle()}><Heart size={17} fill={saved ? 'currentColor' : 'none'} />{text && (saved ? 'Saved' : 'Save')}</button>;
}
export function ListingCard({ listing, showMatch = false }: { listing: ListingResult; showMatch?: boolean }) {
  const main = Object.entries(listing.attributes).filter(([key]) => ['year', 'mileage', 'bedrooms', 'bathrooms', 'sqft', 'annual_revenue', 'sde', 'brand', 'service_area', 'hours'].includes(key)).slice(0, 2);
  return <article className="listing-card"><div className="listing-cover"><Link href={'/listing/' + listing.id} tabIndex={-1} aria-hidden="true"><ListingVisual listing={listing} /></Link><div className="cover-badges"><span className="badge badge-white">{listing.transaction_type === 'Wanted' ? 'Wanted' : listing.category}</span>{showMatch && listing.match && <span className="badge">{listing.match.score}% filter match</span>}</div><SaveButton listing={listing} /></div><div className="listing-info"><div className="listing-location"><MapPin size={12} />{listing.location || 'Location not provided'}{listing.sample && <span>Demo</span>}</div><Link className="listing-title" href={'/listing/' + listing.id}>{listing.title}</Link><p className="listing-attributes">{main.map(([key, value]) => `${typeof value === 'number' ? value.toLocaleString() : value}${key === 'mileage' ? ' mi' : key === 'bedrooms' ? ' beds' : key === 'bathrooms' ? ' baths' : key === 'sqft' ? ' sq ft' : key === 'sde' ? ' SDE/yr' : key === 'annual_revenue' ? ' revenue/yr' : key === 'hours' ? ' hours' : ''}`).join(' · ') || listing.subcategory}</p><div className="listing-price"><strong>{listing.price_type === 'Starting at' && <small>From </small>}{dollars(listing.price)}</strong>{listing.price_type === 'Per month' && <small>/ month</small>}<ArrowUpRight size={17} /></div>{showMatch && Boolean(listing.match?.reasons.length) && <p className="match-reason">{listing.match?.reasons.slice(0, 2).join(' ')}</p>}</div></article>;
}
