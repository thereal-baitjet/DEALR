import postgres from 'postgres';
import { AppError } from './domain';
export type QueryResult={rows:Record<string,unknown>[]};
export interface Database{query<T=Record<string,unknown>>(sql:string,params?:unknown[]):Promise<T[]>;transaction<T>(fn:(db:Database)=>Promise<T>):Promise<T>;}
export function parameters(sql:string){let i=0;return sql.replace(/\?/g,()=>`$${++i}`)}
let pool:ReturnType<typeof postgres>|undefined;
// postgres.js JSON-encodes every json/jsonb parameter, but the service already passes JSON text (as PGlite
// expects). Pass strings through so jsonb columns store arrays and objects, not double-encoded strings.
export const jsonType = { to: 114, from: [114, 3802], serialize: (x: unknown) => typeof x === 'string' ? x : JSON.stringify(x), parse: (x: string) => JSON.parse(x) };

export type TransactionDriver = { unsafe: (text: string, params?: unknown[]) => PromiseLike<unknown> };
export type PooledDriver = TransactionDriver & { begin: <T>(fn: (transaction: TransactionDriver) => Promise<T>) => Promise<T> };

// Transaction poolers may hand the next transaction a different connection.
// Resolve private tables inside each transaction rather than relying on a
// session-level startup search_path surviving across requests.
export function pooledDatabase(driver: PooledDriver): Database {
  const wrap = (transaction: TransactionDriver): Database => {
    const db: Database = {
      async query<T>(text: string, params: unknown[] = []) { return await transaction.unsafe(parameters(text), params) as T[]; },
      async transaction<T>(fn: (db: Database) => Promise<T>) { return fn(db); },
    };
    return db;
  };
  const transaction = <T>(fn: (db: Database) => Promise<T>) => driver.begin(async connection => {
    await connection.unsafe('SET LOCAL search_path TO dealr,public');
    return fn(wrap(connection));
  });
  return { query: <T>(text: string, params: unknown[] = []) => transaction(db => db.query<T>(text, params)), transaction };
}

export function getDatabase(): Database {
  const url = process.env.DATABASE_URL;
  if (!url) throw new AppError(503, 'The marketplace is not accepting account activity yet. Please try again later.');
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(new URL(url).hostname);
  pool ??= postgres(url, {
    max: 1, prepare: false, idle_timeout: 20, connect_timeout: 10,
    ssl: local ? false : 'require',
    types: { bigint: { to: 20, from: [20], serialize: (x: unknown) => String(x), parse: (x: string) => Number(x) }, json: jsonType },
  });
  return pooledDatabase(pool as unknown as PooledDriver);
}
