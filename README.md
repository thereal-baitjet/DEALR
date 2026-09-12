# DEALR

**Find it. List it. Deal it.** One marketplace engine across goods, vehicles, real estate, businesses, services, and equipment. [CORE.md](CORE.md) is the product specification.

## Run locally

Requires Node.js 20.9+ (Node.js 24 recommended).

```sh
npm ci
DEALR_DEMO_MODE=true npm run dev
```

Open http://localhost:3000 and choose **Log in → Open interactive demo**. Each visitor receives a signed, isolated fictional marketplace with 32 sample listings. The role selector switches between buyer, seller, and broker in that same private workspace. Changes persist in local PostgreSQL via PGlite under `.data/`. Development creates a local session signing secret automatically. Do not delete `.data/` if you want to keep demo activity.

Demo access does not create a real user, confer live broker permissions, or publish fictional listings to the live marketplace. Demo identities last seven days in the same browser. They are not transferable credentials.

## Live configuration

Copy `.env.example` to `.env.local` and configure:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase Auth.
- `DATABASE_URL`: PostgreSQL transaction pooler connection string. Runtime tables are in the private `dealr` schema, outside the public Data API.
- `MIGRATION_DATABASE_URL`: direct or session-pooler connection for schema setup; defaults to `DATABASE_URL` when omitted.
- `NEXT_PUBLIC_APP_URL`: approved custom application origin; register `/auth/callback` with Supabase's redirect allowlist. Vercel's exact generated deployment/branch domains are recognized automatically when system environment variables are enabled.
- `DEALR_ADMIN_IDS`: server-managed, verified Supabase user UUIDs. Signup metadata never grants permissions. Approved administrators can grant broker access.
- `DEALR_DEMO_MODE`: disabled by default. If explicitly enabled in production, also set `DEALR_DEMO_SECRET` to at least 32 random characters. Serverless hosts require a real `DATABASE_URL`.

```sh
npm run db:migrate
npm run build
npm run test:http
npm run test:preview
npm start
```

Live activity uses Supabase-validated identities and PostgreSQL. Without a database, visitors can browse an explicitly fictional, read-only catalog; account mutations are unavailable. Hosted authentication and deployment require validation against the configured project.

## Validation

```sh
npm test
npm run typecheck
npm run build
```

The automated Gauntlet uses an actual PostgreSQL engine with pgvector. The HTTP checks run the compiled application with isolated test data. Preview checks exercise local Vercel-like configuration without external credentials. See [docs/GAUNTLET-REPORT.md](docs/GAUNTLET-REPORT.md) for evidence and unverified gates. Browser/mobile QA remains restricted by the repository instructions. No hosted deployment or full Gauntlet pass is claimed.

## Milestone status

Implemented: universal discovery and filters, listing details and fact-based assistance, seller drafts/review/publishing, wanted requests/matches, buyer/seller dashboards, preferences, persistent conversations, offers and counteroffers, broker directory/pipeline/copilot, reports/blocking, and administrator moderation. Optional demo accounts allow buyer, seller, and broker views inside the same private fictional marketplace.

The Vercel progress preview is explicitly authorized by the user. Setup is documented in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Supabase connection is confirmed, but hosted project configuration still needs to be performed when its project tools are available. Vercel account connection is pending.

AI uses explicit, deterministic fallback rules. No live LLM or embedding pipeline is currently active. Payments, escrow, legally binding agreements, and blockchain settlement are not implemented.

Implementation references: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation) and [Supabase server authentication](https://supabase.com/docs/guides/auth/server-side/creating-a-client).
