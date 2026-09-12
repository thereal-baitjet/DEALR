import { AppError, emptyProfile, matchListing, money, parseQuery } from './domain';
import { samples } from './samples';

// Explicitly fictional, read-only catalog for visitors before account setup.
export function previewSearch(params: URLSearchParams) {
  const intent = parseQuery(params.get('q') || '');
  if (params.get('category')) intent.category = params.get('category')!;
  if (params.get('subcategory')) intent.subcategory = params.get('subcategory')!;
  if (params.get('type')) intent.transaction_type = params.get('type')!;
  if (params.get('budget')) intent.budget = money(params.get('budget'), true)!;
  if (params.get('location')) intent.location = params.get('location')!;
  if (params.get('radius')) throw new AppError(400, 'Open the interactive demo to search by radius.');
  if (params.get('verified') === 'true') intent.verification = true;
  const sort = params.get('sort');
  const matched = samples.map(l => ({ ...l, sample: true, match: matchListing(l, intent, emptyProfile) })).filter(l => l.match.eligible);
  matched.sort((a, b) => sort === 'price-low' ? (a.price ?? Infinity) - (b.price ?? Infinity) : sort === 'price-high' ? (b.price ?? 0) - (a.price ?? 0) : sort === 'newest' ? b.created_at.localeCompare(a.created_at) : b.match.score - a.match.score);
  const page = Math.max(1, Math.floor(Number(params.get('page')) || 1));
  return { listings: matched.slice((page - 1) * 12, page * 12), total: matched.length, page, pages: Math.ceil(matched.length / 12), intent, searchMode: 'Structured search', notice: intent.unsupported.join(' '), preview: true };
}

export function previewListing(id: string) {
  const listing = samples.find(l => l.id === id);
  if (!listing) throw new AppError(404, 'Listing not found or no longer available.');
  return { ...listing, sample: true, seller_name: 'Morgan Reed · fictional seller' };
}
