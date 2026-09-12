import { z } from 'zod';
import { CATEGORIES, TRANSACTION_TYPES, attributeDefs } from './categories';
import { AppError, cities, money, parseQuery, type SearchIntent } from './domain';

export function searchIntent(params: URLSearchParams, override?: SearchIntent): SearchIntent {
  const intent = override ? structuredClone(override) : parseQuery(params.get('q') || '');
  const choose = (key: 'category' | 'subcategory' | 'transaction_type' | 'location' | 'delivery', value: string | null) => {
    if (!value) return;
    if (value.length > 100) throw new AppError(400, 'Filter text must be at most 100 characters.');
    if (intent[key] && intent[key]!.toLowerCase() !== value.toLowerCase()) throw new AppError(400, 'A selected filter conflicts with your search. Update the search text or reset the filters.');
    intent[key] = value;
  };
  const category = params.get('category');
  if (category && !(CATEGORIES as string[]).includes(category)) throw new AppError(400, 'Choose a valid category.');
  const type = params.get('type');
  if (type && !(TRANSACTION_TYPES as readonly string[]).includes(type)) throw new AppError(400, 'Choose a valid transaction type.');
  choose('category', category); choose('subcategory', params.get('subcategory')); choose('transaction_type', type);
  choose('location', params.get('location')); choose('delivery', params.get('delivery'));
  if (params.get('budget')) { const budget = money(params.get('budget'), true)!; intent.budget = Math.min(intent.budget ?? budget, budget); }
  if (intent.location) {
    const city = Object.keys(cities).find(name => name.toLowerCase() === intent.location!.toLowerCase());
    if (city) [intent.latitude, intent.longitude] = cities[city];
  }
  for (const coordinate of ['latitude', 'longitude'] as const) {
    if (!params.has(coordinate)) continue;
    const value = Number(params.get(coordinate));
    if (!params.get(coordinate)?.trim() || !Number.isFinite(value) || Math.abs(value) > (coordinate === 'latitude' ? 90 : 180)) throw new AppError(400, 'Use valid geographic coordinates.');
    if (intent[coordinate] !== undefined && intent[coordinate] !== value) throw new AppError(400, 'Selected coordinates conflict with the city in your search.');
    intent[coordinate] = value;
  }
  if ((intent.latitude === undefined) !== (intent.longitude === undefined)) throw new AppError(400, 'Provide both coordinates.');
  if (params.has('radius')) {
    const radius = Number(params.get('radius'));
    if (!Number.isFinite(radius) || radius < 1 || radius > 1000) throw new AppError(400, 'Choose a radius between 1 and 1,000 miles.');
    intent.radius = Math.min(intent.radius ?? radius, radius);
  }
  if (intent.radius !== undefined && (intent.latitude === undefined || intent.longitude === undefined)) throw new AppError(400, 'Choose a recognized city or coordinates for radius search.');
  if (params.get('verified') === 'true') intent.verification = true;
  if (params.get('attributes')) {
    let attributes: Record<string, string | boolean | number>;
    try { attributes = z.record(z.union([z.string().max(500), z.boolean(), z.number().finite()])).parse(JSON.parse(params.get('attributes')!)); } catch { throw new AppError(400, 'Invalid category filters.'); }
    const definitions = attributeDefs(intent.category || '');
    for (const [key, value] of Object.entries(attributes)) {
      const def = definitions.find(d => d.key === key);
      if (!def) throw new AppError(400, 'Choose filters that belong to the selected category.');
      if (value === '') continue;
      const existing = intent.attributes[key] || {};
      if (def.kind === 'number' || def.kind === 'money') {
        const numeric = def.kind === 'money' ? money(value, true)! / 100 : Number(String(value).replaceAll(',', ''));
        if (!Number.isFinite(numeric) || numeric < 0 || numeric > (def.max ?? 1e9)) throw new AppError(400, 'Invalid numeric filter.');
        intent.attributes[key] = def.filter === 'max' ? { ...existing, max: Math.min(existing.max ?? numeric, numeric) } : { ...existing, min: Math.max(existing.min ?? numeric, numeric) };
      } else {
        if (def.kind === 'boolean' && ![true, false, 'true', 'false'].includes(value as boolean | string)) throw new AppError(400, 'Choose yes or no for a boolean filter.');
        const equals = def.kind === 'boolean' ? value === true || value === 'true' : String(value);
        if (existing.equals !== undefined && String(existing.equals).toLowerCase() !== String(equals).toLowerCase()) throw new AppError(400, 'A category filter conflicts with your search.');
        intent.attributes[key] = { ...existing, equals };
      }
    }
  }
  if (params.has('page') && (!/^\d+$/.test(params.get('page')!) || Number(params.get('page')) < 1 || Number(params.get('page')) > 1_000_000)) throw new AppError(400, 'Choose a valid results page.');
  if (params.has('sort') && !['match', 'newest', 'price-low', 'price-high'].includes(params.get('sort')!)) throw new AppError(400, 'Choose a valid sort order.');
  return intent;
}
