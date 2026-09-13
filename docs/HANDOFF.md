# DEALR shared AI handoff

Updated September 13, 2026. This file is the entry point for contributors using different AIs and accounts.

## Source of truth

- Repository: https://github.com/thereal-baitjet/DEALR, branch `main`.
- Production: https://baitjet.com. This repository is the DEALR marketplace, branded **DEALR — a Baitjet company**.
- Product contract: `CORE.md`; working instructions: `AGENTS.md`.
- Current verification history: `docs/GAUNTLET-REPORT.md`; hosting/auth configuration: `docs/DEPLOYMENT.md`.
- Use the committed npm lockfile: `npm ci`. This current repository uses Next.js, Supabase Auth, PostgreSQL, and Vercel. Older local starter snapshots are not the current app.

Fetch `main` before editing. Preserve other contributors' commits; never force-push or replace the repository with an old local snapshot. Commit and push after coherent features as the user requested, and update this file when behavior or outstanding work changes. A push to `main` automatically deploys production on the connected Vercel project `dealr` in `thereal-baitjets-projects`.

## Visitor cookie controls

This change starts from GitHub commit `43b52f5a06a2782d349a6472238c57d59c29c5e5` and preserves its authentication and marketplace work.

- `components/cookie-consent.tsx` provides the first-visit banner, equal Accept optional / Reject optional actions, preferences dialog, footer controls, persistence confirmation, and cross-tab refresh. Closing the dialog does not grant consent.
- `/cookies` lists actual cookie names, purposes, and durations; `/privacy` links to those controls and distinguishes optional browsing events from necessary marketplace records.
- `/api/cookie-consent` is an anonymous GET/POST endpoint independent of the database and authentication. It reuses the application's mutation origin, content type, and body-size checks.
- `lib/cookie-consent.ts` owns the policy version, cookie parsing, 180-day lifetime, and Global Privacy Control handling. The necessary preference cookie is HttpOnly, SameSite=Lax, path `/`, and Secure on HTTPS/Vercel. It contains a policy version, analytics boolean, and choice time, with no visitor identifier.
- Optional search and listing-view events require valid, unexpired opt-in on the server. A client `track=true` parameter alone is insufficient. Missing, malformed, ambiguous, expired, or outdated consent and `Sec-GPC: 1` keep collection off.
- `DealrService.search` defaults to no analytics. Its fourth argument enables a requested tracking event only after the API has checked consent. `listing` retains its explicit tracking argument; the API gates it with the same consent check.
- Necessary account, message, offer, save, listing, moderation, and security records still work after rejection. Prior records are not deleted by withdrawal. Anonymous visitors are not assigned an analytics identifier.
- No advertising SDK or third-party analytics tool was added. Do not add another tracker without including its actual behavior in the policy and enforcing the applicable choice before it runs. Bump `COOKIE_POLICY_VERSION` when the purposes materially change; the server then requires a new choice.
- No database migration, environment variable, or new dependency is required for this feature.

## Validation and next steps

The current automated suite passes 33 checks, the compiled HTTP suite passes 14 checks, and the local serverless preview suite passes nine checks (56 total). The production build passes, including TypeScript. See the newest checkpoint in `docs/GAUNTLET-REPORT.md` for the scope of these results.

Browser/mobile interaction QA remains unverified under the existing `AGENTS.md` restriction. Source review and HTTP tests do not establish visual or assistive-technology verification. Hosted Google consent/code exchange, real signup/email confirmation, and session revocation remain broader project gates. Do not claim the complete MVP passed the Gauntlet.

For cookie changes run `npm test`, `npm run build`, `npm run test:http`, and `npm run test:preview`. The HTTP suites use isolated local data and must not be pointed at the hosted database.

After pushing, verify the Vercel status on the exact GitHub commit and check the public `/cookies`, `/privacy`, and `/api/cookie-consent` endpoints. Direct project inspection through the connected Vercel account returned 403 in this session; the GitHub deployment integration and public production HTTP remain available.
