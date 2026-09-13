import type { Attributes, Listing } from './domain';
import { type Category, categoryConfig } from './categories';

export type EditorData = {
  title: string; description: string; category: Category; subcategory: string; transaction_type: string;
  price: string; price_type: string; currency: 'USD'; location: string; latitude: number | null; longitude: number | null;
  radius_miles: number | null; condition: string; images: string[]; video: string; attributes: Attributes;
  negotiable: boolean; delivery: string[]; expires_at: string | null; brokerId: string | null;
};
export function emptyEditor(wanted = false): EditorData {
  return { title: '', description: '', category: 'Marketplace', subcategory: categoryConfig.Marketplace.subcategories[0], transaction_type: wanted ? 'Wanted' : 'For Sale', price: '', price_type: wanted ? 'Maximum budget' : 'Negotiable', currency: 'USD', location: '', latitude: null, longitude: null, radius_miles: null, condition: 'Not applicable', images: [], video: '', attributes: {}, negotiable: true, delivery: ['Local pickup'], expires_at: null, brokerId: null };
}
export function listingEditor(l: Listing): EditorData {
  return { title: l.title, description: l.description, category: l.category, subcategory: l.subcategory, transaction_type: l.transaction_type, price: l.price === null ? '' : String(l.price / 100), price_type: l.price_type, currency: 'USD', location: l.location, latitude: l.latitude, longitude: l.longitude, radius_miles: l.radius_miles, condition: l.condition, images: l.images, video: l.video, attributes: l.attributes, negotiable: l.negotiable, delivery: l.delivery, expires_at: l.expires_at, brokerId: l.broker_id };
}
// Cleans pasted photo links for the server's https-only rule: blank lines are dropped, links like
// i.imgur.com/a.jpg get https://, and http:// is upgraded (browsers upgrade those images on https pages anyway).
export function photoLinks(lines: string[]): { images: string[]; problem: string } {
  const images: string[] = [];
  for (const [index, line] of lines.map(value => value.trim()).filter(Boolean).entries()) {
    const link = /^http:\/\//i.test(line) ? 'https://' + line.slice(7) : /^[\w-]+(\.[\w-]+)+\/\S*$/.test(line) ? 'https://' + line : line;
    let usable = false;
    try { const url = new URL(link); usable = url.protocol === 'https:' && !url.username && !url.password; } catch { /* reported below */ }
    if (!usable) return { images, problem: `Photo ${index + 1} isn’t a web link. Paste a public https:// link to the image, or remove that line. Uploading files isn’t available yet.` };
    images.push(link);
  }
  return { images, problem: images.length > 8 ? 'Add up to 8 photo links.' : '' };
}
