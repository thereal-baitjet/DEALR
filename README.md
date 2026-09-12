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
- `DATABASE_URL`: PostgreSQL transaction pooler connection string with migration permissions for setup. Runtime tables are in the private `dealr` schema, outside the public Data API.
- `NEXT_PUBLIC_APP_URL`: approved application origin; register `/auth/callback` with Supabase's redirect allowlist.
- `DEALR_ADMIN_IDS`: server-managed, verified Supabase user UUIDs. Signup metadata never grants permissions. Approved administrators can grant broker access.
- `DEALR_DEMO_MODE`: disabled by default. If explicitly enabled in production, also set `DEALR_DEMO_SECRET` to at least 32 random characters. Serverless hosts require a real `DATABASE_URL`.

```sh
npm run db:migrate
npm run build
npm start
```

Live activity uses Supabase-validated identities and PostgreSQL. Without a database, visitors can browse an explicitly fictional, read-only catalog; account mutations are unavailable. Hosted authentication and deployment require validation against the configured project.

## Validation

```sh
npm test
npm run typecheck
npm run build
```

The automated Gauntlet uses an actual PostgreSQL engine with pgvector. See [docs/GAUNTLET-REPORT.md](docs/GAUNTLET-REPORT.md) for evidence and unverified gates. Browser/mobile QA remains restricted by the repository instructions. No production deployment or full Gauntlet pass is claimed.

## Milestone status

App foundation: Next.js App Router, design system, login/signup, signed demo sessions, persistent local demo database, Supabase integration, and authorized API adapters for the existing marketplace service. Marketplace screens and workflow interfaces are being connected in subsequent commits.

AI uses explicit, deterministic fallback rules. No live LLM or embedding pipeline is currently active. Payments, escrow, legally binding agreements, and blockchain settlement are not implemented.

Implementation references: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation) and [Supabase server authentication](https://supabase.com/docs/guides/auth/server-side/creating-a-client).
