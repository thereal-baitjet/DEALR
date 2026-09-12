# DEALR Gauntlet report

Status: **IN PROGRESS — not approved for production publication.**

The repository began at `4b023d1` with domain/service/database foundations, 16 automated tests, and no runnable application. CORE.md is unchanged.

## Foundation milestone

- 16/16 existing PostgreSQL-backed automated Gauntlet tests passed on 2026-09-12.
- Production build and its TypeScript gate passed after the adapter fix (Next.js 16.3.5).
- Covered: universal listing inputs, monetary validation, query constraints, truthful fallback answers, listing lifecycle, the three transaction scenarios, wanted matching in both directions, duplicate offers, ownership and role permissions, demo isolation, service reauthentication persistence, reports, blocks, CSRF, and request size protection.
- New: Next.js runtime, Supabase server-validated auth integration, signed opt-in demo identities, persistent PGlite demo database, API adapters, application shell and account forms.
- TypeScript identified an incorrect local transaction-driver type; the adapter now distinguishes an open transaction from the root connection.
- Frontend discovery and transaction screens are being implemented in subsequent milestones.

## Unverified gates

## Discovery milestone

- Added category discovery, search results, dynamic filters, pagination/sorting, listing details, galleries/fallback illustrations, saved controls, listing questions, message/offer/report forms.
- Preview and signed-in searches now share the same validated filter compiler. Explicit query constraints cannot be relaxed by looser form controls; malformed filters and invalid coordinates/page inputs fail cleanly.
- Fixed mileage being interpreted as a dollar budget, laundromat search losing its keyword, and demo references to missing image files.
- Production build passed. Targeted filter regressions were added alongside the original three transaction scenarios.

## Remaining verification

## Seller and dashboard milestone

- Added a description-first listing editor, editable category attributes, saved drafts, explicit review/approval before publishing, editing, unpublishing, wanted requests, buying/selling dashboards, saved items, match discovery, preferences, and account settings.
- Production build passed. The running production application passed **12 HTTP Gauntlet checks**, including all three final-boss scenarios through authenticated HTTP, server-side permissions, request idempotency, CSRF, workspace isolation, logout/re-entry, and persistence after stopping and restarting the application process.
- HTTP tests create their own local PostgreSQL data directory and clear all live database/auth configuration. They do not touch a connected production database.
- The HTTP Gauntlet found valid same-origin writes were rejected when Next.js supplied an internal hostname. CSRF now compares against the configured application origin; the foreign-origin regression still fails with 403 as required.
- This evidence validates the HTTP/API boundary and persistence, not browser interaction or hosted Supabase sessions.

## Outstanding external gates

- Hosted Supabase signup, confirmation, login, logout, refresh, and revocation: no project credentials supplied.
- Browser interaction, mobile widths, accessibility interaction, hydration/console checks, and visual polish: the existing AGENTS.md records a browser/mobile QA denial; this session does not bypass it.
- Live LLM extraction, semantic embeddings, map view, and scalable matching performance are not yet implemented or verified.
- Full CORE.md completion scores are withheld until there is supporting evidence. Service-level passes are not browser end-to-end passes.

No production URL exists for this work. Publishing remains gated by CORE.md's exit criteria.
