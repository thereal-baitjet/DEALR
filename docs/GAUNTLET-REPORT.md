# DEALR Gauntlet report

Status: **IN PROGRESS — progress preview authorized; full MVP not certified.**

The repository began at `4b023d1` with domain/service/database foundations, 16 automated tests, and no runnable application. CORE.md is unchanged.

## Foundation milestone

- 16/16 existing PostgreSQL-backed automated Gauntlet tests passed on 2026-09-12.
- Production build and its TypeScript gate passed after the adapter fix (Next.js 16.3.5).
- Covered: universal listing inputs, monetary validation, query constraints, truthful fallback answers, listing lifecycle, the three transaction scenarios, wanted matching in both directions, duplicate offers, ownership and role permissions, demo isolation, service reauthentication persistence, reports, blocks, CSRF, and request size protection.
- New: Next.js runtime, Supabase server-validated auth integration, signed opt-in demo identities, persistent PGlite demo database, API adapters, application shell and account forms.
- TypeScript identified an incorrect local transaction-driver type; the adapter now distinguishes an open transaction from the root connection.
- Frontend discovery and transaction screens are being implemented in subsequent milestones.

## Discovery milestone

- Added category discovery, search results, dynamic filters, pagination/sorting, listing details, galleries/fallback illustrations, saved controls, listing questions, message/offer/report forms.
- Preview and signed-in searches now share the same validated filter compiler. Explicit query constraints cannot be relaxed by looser form controls; malformed filters and invalid coordinates/page inputs fail cleanly.
- Fixed mileage being interpreted as a dollar budget, laundromat search losing its keyword, and demo references to missing image files.
- Production build passed. Targeted filter regressions were added alongside the original three transaction scenarios.

## Seller and dashboard milestone

- Added a description-first listing editor, editable category attributes, saved drafts, explicit review/approval before publishing, editing, unpublishing, wanted requests, buying/selling dashboards, saved items, match discovery, preferences, and account settings.
- Production build passed. The running production application passed **12 HTTP Gauntlet checks**, including all three final-boss scenarios through authenticated HTTP, server-side permissions, request idempotency, CSRF, workspace isolation, logout/re-entry, and persistence after stopping and restarting the application process.
- HTTP tests create their own local PostgreSQL data directory and clear all live database/auth configuration. They do not touch a connected production database.
- The HTTP Gauntlet found valid same-origin writes were rejected when Next.js supplied an internal hostname. CSRF now compares against the configured application origin; the foreign-origin regression still fails with 403 as required.
- This evidence validates the HTTP/API boundary and persistence, not browser interaction or hosted Supabase sessions.

## Conversation and broker milestone — 2026-09-12

- Added persistent conversation pages, inbox, offer/counter history, explicit human approval for negotiation, block/unblock and message reports, broker directory, stage-filtered broker dashboard, grounded copilot, admin moderation UI, and trust guidance.
- Fixed counteroffers being omitted from the broker summary, stale offer responses, read receipts clearing unseen messages, and conversation ordering after inquiries/offers.
- Production build, **22 automated tests**, and **12 HTTP checks** pass. The route crawl includes all current navigation targets. This is HTTP route coverage, not browser interaction verification.
- Supabase plugin installation/connection is confirmed. Its project-management tools have not been exposed to this running session, so no hosted database change or authentication validation is claimed.
- The user explicitly requested a Vercel progress deployment during this session. That authorizes publishing an in-progress preview; it does not certify the full MVP or clear the existing browser/mobile restriction. Vercel access is still pending.

## Remaining external gates

- Hosted Supabase signup, confirmation, login, logout, refresh, and revocation: no hosted project credentials configured.
- Browser interaction, mobile widths, accessibility interaction, hydration/console checks, and visual polish: the existing AGENTS.md records a browser/mobile QA denial; this session does not bypass it.
- Live LLM extraction, semantic embeddings, map view, and scalable matching performance are not yet implemented or verified.
- Full CORE.md completion scores are withheld until there is supporting evidence. Service-level passes are not browser end-to-end passes.

No hosted URL has been verified. The user authorized an in-progress Vercel preview; full MVP release remains gated by CORE.md's exit criteria.


## Deployment preparation milestone — 2026-09-12

- Prepared Vercel configuration, exact deployment-origin validation, secure hosted demo cookies, safe read-only behavior when hosted demo requirements are incomplete, and separate migration/runtime database configuration.
- Updated the PostgreSQL adapter for transaction pooling: one warm-instance connection, encrypted remote connections, no prepared statements, and transaction-local schema selection. Regression checks verify private-table access and atomic rollback without relying on session state.
- Production build and **24 automated Gauntlet checks** pass. **12 HTTP checks** and **3 local serverless-preview checks** pass. Preview checks cover missing-service behavior, catalog/search, public route shells, fact-based answers, valid hosted origins, and foreign-origin rejection.
- Hosted Supabase sessions, actual network/database connectivity, a Vercel deployment, and browser/mobile behavior remain unverified. No hosted deployment is claimed.
- See `docs/DEPLOYMENT.md` for the prepared configuration and remaining account/project setup.

## Google sign-in milestone — 2026-09-12

- Added **Continue with Google** to login and signup (CORE.md §26). The button renders only when the Supabase project reports the Google provider enabled. `/auth/google` starts Supabase's server-side PKCE flow and the existing `/auth/callback` completes it. Destinations pass through the same `safeNext` guard, and Google profile names fall back to `full_name`.
- The login page now explains failed sign-in callbacks (`?error=`) instead of returning silently.
- Typecheck, production build, **24 automated Gauntlet checks**, **12 HTTP checks**, and **5 local serverless-preview checks** pass. The two new preview checks cover the hidden/unavailable state and, against a stand-in Supabase settings endpoint, the authorize redirect, PKCE challenge, verifier cookie, application-origin callback, and rewriting of an off-site `next` to `/dashboard`.
- The user requested this change be pushed to `main` and deployed. Vercel is now connected to GitHub, so `main` deploys production.
- Not verified: a real Google consent screen and Supabase code exchange. No DEALR Supabase project or Google OAuth client exists yet (the user deferred Supabase creation), so hosted deployments keep the button hidden.
