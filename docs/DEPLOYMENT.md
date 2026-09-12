# DEALR progress deployment

The user authorized an in-progress Vercel deployment on 2026-09-12 and requested Supabase for persistent data and authentication. This preview is for reviewing current progress; it is not a claim that CORE.md's full exit criteria have passed.

## Prepared code

- Next.js App Router with the committed npm lockfile and `vercel.json` configuration.
- Exact application-origin checks for generated Vercel deployment/branch URLs and a configured custom URL. Foreign origins and forged forwarded-host headers remain rejected.
- Secure demo cookies on Vercel. Interactive demo access stays unavailable if hosted persistence or its signing secret is missing.
- PostgreSQL transaction-pooler adapter, prepared statements disabled, one connection per warm instance, encrypted remote connections, and a transaction-local private schema search path.
- Migration runner uses `MIGRATION_DATABASE_URL`, falling back to `DATABASE_URL`. The existing migration files are preserved.

## Supabase setup

1. Inspect the connected account for an existing DEALR project before creating one. Confirm the target project's identity and inspect existing schema/migration state.
2. Obtain its actual project URL, publishable key, transaction-pooler connection string, and direct/session-pooler migration string. Do not guess the pooler host or reset a database password used by other applications.
3. Configure the excluded `.env.local` file or the corresponding deployment secret settings. Apply migrations with `npm run db:migrate` against the selected target.
4. Keep the `dealr` schema outside the exposed Data API schemas. All application operations pass through the Next.js server, which validates the Supabase identity and ownership/role permissions.
5. Set the Supabase Site URL and allowed `/auth/callback` redirect URLs to the actual deployment domains. Test signup/confirmation, login, refresh, logout, and revocation against that project before opening real account activity to users.

Supabase recommends transaction pooling for serverless runtimes and direct connections for migrations; session pooling is an alternative when the setup environment needs IPv4. Copy endpoint values from the project's Connect dialog. [Supabase connection documentation](https://supabase.com/docs/guides/database/connecting-to-postgres).

## Vercel setup

Import `thereal-baitjet/DEALR`, choose the repository root and the Next.js preset, and use the committed npm build/install commands. No custom domain change is needed for the progress preview.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Secret transaction-pooler connection used by the running application |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL for account authentication |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable authentication key |
| `NEXT_PUBLIC_APP_URL` | Custom origin if one is used; otherwise leave blank to use generated Vercel URLs |
| `DEALR_DEMO_MODE` | Set `true` only for the explicitly fictional interactive demo |
| `DEALR_DEMO_SECRET` | Random signing secret of at least 32 characters when enabling the demo |
| `DEALR_ADMIN_IDS` | Verified Supabase user UUIDs authorized as administrators |

Keep preview data and credentials isolated from any real marketplace. Do not upload `.env.local` or `.vercel` credentials to GitHub. `MIGRATION_DATABASE_URL` belongs to the setup environment and is not needed in Vercel runtime settings.

Enable Vercel system environment variables so the app can recognize its exact generated deployment and branch domains. The app does not accept arbitrary `*.vercel.app` origins. [Vercel system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables).

With no database configured, the app can show the fictional read-only catalog, search, listing pages, and fact-based answers. An interactive hosted demo needs `DATABASE_URL`, migrations, `DEALR_DEMO_MODE=true`, and a signing secret. Real accounts additionally require configured and verified Supabase Auth.

## Verification after connection

Run `npm test`, `npm run build`, `npm run test:http`, and `npm run test:preview`. The latter two commands use local isolated configuration and cannot certify the hosted project. After deployment, verify the actual URL, configured origins, authentication callbacks, authorized API operations, and persistence on the hosted database. Keep all restrictions and unverified gates in `GAUNTLET-REPORT.md`.

## Current external status

- Supabase plugin: connected, confirmed by the user and plugin state.
- Supabase project changes: none; project-management tool definitions were not exposed to this running session after connection.
- Vercel plugin: installation/account connection pending.
- Hosted deployment URL: none verified.
- Browser/mobile QA: existing repository restriction remains in force.
