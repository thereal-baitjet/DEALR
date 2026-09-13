# DEALR project instructions

Read CORE.md before changing this project. It is the user's authoritative product specification.

DEALR is a universal marketplace: **Find it. List it. Deal it.** Do not narrow the product to business acquisitions. Use a shared listing, search, messaging, offer, and optional broker engine across categories.

CORE.md takes precedence over the earlier business-only acceptance example in docs/GAUNTLET.md. Keep that older scenario as a regression case. Category-specific data belongs in validated attributes derived from lib/categories.ts. Accounts may buy and sell simultaneously; broker/admin permissions require server-side grants.

Implement real persistent operations, reject unauthorized access on the server, respect hard search constraints, and never invent listing facts or verification. AI must have a truthful fallback. Do not add payments, wallets, or binding-contract claims without implementing and validating those features.

Run the production build and the automated Gauntlet. Do not claim full completion or publish until CORE.md's exit criteria are verified. Record failures and unverified checks honestly in docs/GAUNTLET-REPORT.md. Browser/mobile QA was denied in the initial build session; do not bypass that denial. Keep credentials out of Git.

Preferred stack: Next.js App Router, TypeScript, Tailwind, shadcn/ui, Supabase Auth, PostgreSQL with pgvector, and Vercel. Follow the existing lockfile.

Commit and push to thereal-baitjet/DEALR after each coherent core feature. Use descriptive commits and preserve CORE.md. Do not wait for the entire MVP to finish before backing up working milestones.

Multiple AIs and accounts contribute to this repository. Read docs/HANDOFF.md and the latest checkpoint in docs/GAUNTLET-REPORT.md, fetch current main before editing, and update those notes before handing work over. Preserve the server-side cookie consent gate: optional search/view analytics must remain off without valid consent and when Global Privacy Control is on. Keep /cookies and /privacy aligned with actual data handling.
