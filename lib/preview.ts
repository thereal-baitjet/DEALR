import { searchIntent } from './search';
import { AppError, emptyProfile, matchListing, money, parseQuery } from './domain';
import { samples } from './samples';

// Explicitly fictional, read-only catalog for visitors before account setup.
export function previewSearch(params: URLSearchParams) {
  const intent = searchIntent(params);
  const sort = params.get('sort');
  const matched = samples.map(l => ({ ...l, sample: true, match: matchListing(l, intent, emptyProfile) })).filter(l => l.match.eligible && (intent.transaction_type === 'Wanted' || l.transaction_type !== 'Wanted'));
  matched.sort((a, b) => sort === 'price-low' ? (a.price ?? Infinity) - (b.price ?? Infinity) : sort === 'price-high' ? (b.price ?? 0) - (a.price ?? 0) : sort === 'newest' ? b.created_at.localeCompare(a.created_at) : b.match.score - a.match.score);
  const page = Math.max(1, Math.floor(Number(params.get('page')) || 1));
  return { listings: matched.slice((page - 1) * 12, page * 12), total: matched.length, page, pages: Math.ceil(matched.length / 12), intent, searchMode: 'Structured search', notice: intent.unsupported.join(' '), preview: true };
}

export function previewListing(id: string) {
  const listing = samples.find(l => l.id === id);
  if (!listing) throw new AppError(404, 'Listing not found or no longer available.');
  return { ...listing, sample: true, seller_name: 'Morgan Reed · fictional seller' };
}
