import 'server-only';
import { readFile, readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { vector } from '@electric-sql/pglite-pgvector';
import { createHash } from 'node:crypto';
import { getDatabase, parameters, type Database } from './database';
import { DealrService } from './service';
import { AppError } from './domain';

export const demoEnabled = () => process.env.DEALR_DEMO_MODE === 'true'
  && (!process.env.VERCEL || Boolean(process.env.DATABASE_URL && process.env.DEALR_DEMO_SECRET && process.env.DEALR_DEMO_SECRET.length >= 32));
export const authConfigured = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && process.env.DATABASE_URL);
export const dataConfigured = () => Boolean(process.env.DATABASE_URL) || demoEnabled();
const shared = globalThis as typeof globalThis & { dealrLocalDatabase?: Promise<Database> };

async function localDatabase(): Promise<Database> {
  if (process.env.VERCEL) throw new AppError(503, 'A persistent database connection is required on this host.');
  const directory = path.resolve(process.env.DEALR_DATA_DIR || '.data');
  await mkdir(directory, { recursive: true });
  const pg = await PGlite.create(path.join(directory, 'postgres'), { extensions: { vector }, parsers: { 20: Number } });
  await pg.exec('CREATE SCHEMA IF NOT EXISTS dealr; CREATE TABLE IF NOT EXISTS dealr.schema_migrations(name text PRIMARY KEY, hash text NOT NULL)');
  for (const name of (await readdir('supabase/migrations')).filter(n => n.endsWith('.sql')).sort()) {
    const sql = await readFile(path.join('supabase/migrations', name), 'utf8');
    const hash = createHash('sha256').update(sql).digest('hex');
    const prior = await pg.query<{ hash: string }>('SELECT hash FROM dealr.schema_migrations WHERE name=$1', [name]);
    if (prior.rows.length) {
      if (prior.rows[0].hash !== hash) throw new Error('Applied migration changed: ' + name);
      continue;
    }
    await pg.transaction(async transaction => {
      await transaction.exec(sql);
      await transaction.query('INSERT INTO dealr.schema_migrations(name,hash) VALUES($1,$2)', [name, hash]);
    });
  }
  await pg.exec('SET search_path TO dealr,public');
  type Driver = Pick<PGlite, 'query'>;
  const wrap = (driver: Driver, inTransaction = false): Database => ({
    async query<T>(sql: string, params: unknown[] = []) { return (await driver.query<T>(parameters(sql), params)).rows; },
    async transaction<T>(fn: (db: Database) => Promise<T>) { return inTransaction ? fn(wrap(driver, true)) : pg.transaction(transaction => fn(wrap(transaction, true))); },
  });
  return wrap(pg);
}

export async function service() {
  if (process.env.DATABASE_URL) return new DealrService(getDatabase());
  if (!demoEnabled()) throw new AppError(503, 'Account activity is not available yet. You can still explore sample listings.');
  shared.dealrLocalDatabase ??= localDatabase().catch(error => { shared.dealrLocalDatabase = undefined; throw error; });
  return new DealrService(await shared.dealrLocalDatabase);
}
