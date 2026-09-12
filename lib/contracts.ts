import type { DealrService } from './service';
import type { Actor, Listing, Match, Profile } from './domain';

export type SessionState = { actor: Actor | null; profile: Profile; saved: string[]; demo: boolean; brokers: Broker[]; ready: boolean; demoAvailable: boolean; authAvailable: boolean; preview: boolean };
export type Broker = { id: string; name: string; bio?: string; categories?: string[]; location?: string; verification?: string; commission_bps?: number };
export type ListingResult = Listing & { sample: boolean; match?: Match; seller_name?: string };
export type SearchResult = Omit<Awaited<ReturnType<DealrService['search']>>, 'listings'> & { listings: ListingResult[]; preview?: boolean };
export type Dashboard = Awaited<ReturnType<DealrService['dashboard']>>;
export type Conversation = Awaited<ReturnType<DealrService['conversation']>>;
export type Copilot = Awaited<ReturnType<DealrService['copilot']>>;
export type Answer = Awaited<ReturnType<DealrService['ai']>>;
export type Extraction = Awaited<ReturnType<DealrService['extract']>>;
