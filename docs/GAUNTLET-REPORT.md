# DEALR Gauntlet report

Status: **IN PROGRESS — progress preview authorized; full MVP not certified.**

The repository began at `4b023d1` with domain/service/database foundations, 16 automated tests, and no runnable application. CORE.md is unchanged.

## Authentication Gauntlet checkpoint — 2026-09-13

- Production build, **27 automated Gauntlet checks**, **12 HTTP checks**, and **8 local preview checks** pass: **47 checks total**. The three marketplace transaction scenarios and restart persistence remain passing.
- Reproduced an off-site redirect bypass: a `next` path containing a tab/newline between leading slashes passed the old prefix guard, but URL parsing removed those characters and resolved an external host. Both the Google authorize route and the final callback now use the same `lib/navigation.ts` guard as the email/demo UI. It rejects control characters, backslashes, external origins, and dot segments that normalize to a double-leading-slash path. Legitimate local paths, queries, and fragments are preserved.
- Reproduced successful email sign-in leaving the signed demo cookie active, which caused `currentActor` to continue choosing the fictional identity. Email login, immediate signup, and successful PKCE callbacks now deactivate the demo only after Supabase returns an account session. The private workspace identifier and expiration remain available for a later demo visit. Failed login, rejected codes, and signup awaiting confirmation do not change the demo.
- Callbacks on deployments without Auth configuration return to the login explanation instead of throwing an unavailable-service error.
- Expanded the existing preview harness with a local Supabase Auth stand-in. It exercises the installed Supabase client, password and signup responses, PKCE verifier forwarding, account/demo response cookies, callback redirects, and failure paths through the compiled Next.js app. No hosted user, database, or Google account is used by these tests.
- Vercel reported the branding commit `771de79` deployed successfully. A real hosted Google consent/code exchange, signup/email confirmation, and refresh/revocation still need validation. Browser/mobile QA remains restricted by AGENTS.md; the full MVP is not certified.

## Branding and connection checkpoint — 2026-09-13

- Synced all 12 commits through `c53b666`, including the hosted Supabase, Google sign-in, JSON repair, privacy page, and baitjet.com setup.
- Applied the requested **DEALR — a Baitjet company** identity to the shared header/footer, application metadata, privacy introduction, and README. The existing marketplace tagline remains **Find it. List it. Deal it.**
- Production build, **26 automated Gauntlet checks**, **12 HTTP checks**, and **5 local preview checks** pass. Production HTML contains both accessible brand links and the company label on the home, marketplace, login, and privacy pages. This is markup verification, not visual/browser QA.
- Supabase reports `dealr` (`hfkuiedcutulobirfoir`) as `ACTIVE_HEALTHY`. All three entries in `dealr.schema_migrations` match the SHA-256 hashes of the committed migrations. The Supabase CLI migration history is empty because this application uses its own migration ledger.
- GitHub's Vercel status for `c53b666` reports a completed deployment. The configured production destination is **https://baitjet.com**. Direct Vercel project reads returned 403 in this session; public HTTP checks were blocked by the runtime's network proxy. Hosted behavior has not been re-certified here.
- Remaining gates: real signup/email confirmation, completed Google consent/code exchange, session refresh/revocation, browser/mobile/accessibility interaction, live LLM/embeddings, maps, and matching at scale. No full MVP score or completion claim is made.

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

## Gate checkpoint before hosted setup — 2026-09-12

- Hosted Supabase signup, confirmation, login, logout, refresh, and revocation: no hosted project credentials configured.
- Browser interaction, mobile widths, accessibility interaction, hydration/console checks, and visual polish: the existing AGENTS.md records a browser/mobile QA denial; this session does not bypass it.
- Live LLM extraction, semantic embeddings, map view, and scalable matching performance are not yet implemented or verified.
- Full CORE.md completion scores are withheld until there is supporting evidence. Service-level passes are not browser end-to-end passes.

At this earlier checkpoint, no hosted URL had been verified. Later hosted milestones are recorded below; full MVP release remains gated by CORE.md's exit criteria.


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
- The user requested this change be pushed to `main` and deployed. Vercel is now connected to GitHub, so `main` deploys production. Production `dealr-mu.vercel.app` is public. At `f8e6a59` it was checked over HTTP only: public pages return 200, `/api/state` reports Google unavailable, and `/auth/google` returns to the login page.
- Not verified: a real Google consent screen and Supabase code exchange. No DEALR Supabase project or Google OAuth client exists yet (the user deferred Supabase creation), so hosted deployments keep the button hidden.

## Hosted Supabase milestone — 2026-09-12

- The user approved creating the Supabase project and switching production to it with the interactive demo enabled. Project `dealr` (`hfkuiedcutulobirfoir`) exists, both migrations are applied, and production has the database, auth, and demo variables. Previews remain without them.
- Verified over HTTP against `dealr-mu.vercel.app`: the state flags, the empty live marketplace, Supabase-backed rejection of unknown credentials, a hosted demo session that seeds and reads 32 fictional listings and then logs out, and the Google fallback redirect.
- Not verified: real signup, email confirmation, session refresh/revocation, Google sign-in, and browser/mobile behavior. The Supabase Site URL, redirect allow-list, and Google provider still need to be configured.
- Supabase's security advisor flags RLS as disabled on all `dealr` tables. Those tables are not reachable through the Data API or with the publishable key (no schema usage; `PGRST106`). Whether to enable RLS is left to the user.

## Google provider milestone — 2026-09-12

- At the user's request, the Google OAuth client and Supabase configuration were set up through the user's browser. The client is `DEALR web` in Google Cloud project `dealr-508500`; the Supabase Google provider, Site URL, and preview redirect allow-list are set.
- Verified over HTTP: production reports Google available, and `/auth/google` redirects through Supabase's PKCE authorize endpoint to Google with the correct client ID, callback, and scopes.
- Not verified: a completed Google consent and code exchange. The Google app is still in Testing mode, so only listed test users can sign in. Publishing is blocked until the consent-screen Branding is complete, which likely needs a privacy policy page DEALR does not have.
- The client secret appeared in automation tool output during setup (Google embeds it in the copy button's accessible label). It was rotated the same day. A new secret was added in Google and saved in Supabase, checked by length and prefix without reading it, and the exposed secret was disabled in Google.

## Custom domain milestone — 2026-09-12

- At the user's request, DEALR replaced the ChatGPT-hosted BaitJet Arcade on baitjet.com. The domains were attached to the Vercel project, and DNS was switched at Namecheap in the user's browser. Email forwarding records were left unchanged.
- Verified by pinning requests to Vercel's IP while local DNS caught up: the home page serves DEALR, `www` and `dealr-mu.vercel.app` redirect to `https://baitjet.com`, a Let's Encrypt certificate is issued, and a demo sign-in from the baitjet.com origin succeeds after the rebuild. `/auth/google` requests the callback `https://baitjet.com/auth/callback`.
- Google Branding now uses baitjet.com links and domain.
- The Supabase Site URL is now `https://baitjet.com`, so Supabase accepts the baitjet.com callback. Not verified: a completed Google sign-in on baitjet.com.

## Listing page and photo link fixes — 2026-09-12

- Production bug reported by the user: opening a listing showed the error page. On hosted Postgres, postgres.js JSON-encoded jsonb parameters that the service had already serialized, so every jsonb column stored strings, and the listing page called `.map` on them. PGlite stores the same text as JSON, which hid the bug in tests.
- Fix: `lib/database.ts` passes JSON text through unchanged. A write-free query against the hosted database confirmed the new handler stores arrays where the default produced strings. Migration `0003` unwraps existing double-encoded values, and only when the inner text is valid JSON.
- Photo links: the editor adds `https://` to bare links, upgrades `http://`, and explains an unusable line before review or save. API validation errors now name "Photo N" instead of `images.N`. File upload is still not implemented.
- Typecheck, production build, **26 automated checks**, **12 HTTP checks**, and **5 preview checks** pass. The new checks cover the JSON handler, the `0003` repair, and photo link handling.
- Remaining gaps: no automated test runs postgres.js against a real Postgres server, and browser rendering is still not covered. Hosted verification follows the deploy and the `0003` run.

## Hosted repair and privacy milestone — 2026-09-12

- The JSON fix was deployed (`fde29e7`), and migration `0003` ran on the hosted database. No string-encoded jsonb values remain across 98 listings, 3 broker profiles, 25 analytics events, and 2 audit records. Hosted listing APIs now return arrays and objects for a demo listing and for the user's listing.
- Added `/privacy` (`3f1b72c`). It describes the data DEALR actually stores, its essential cookies, and the Supabase, Vercel, and Google services it uses. The user chose info@santosautomation.com as the contact and chose to name only "DEALR" as operator. The page is linked from the footer and was verified publicly (200).
- Google Branding now lists the home page and privacy policy, with `dealr-mu.vercel.app` as an authorized domain, and the Google app is published (In production).
- Not verified: a completed Google sign-in, and browser rendering of the listing and privacy pages.
