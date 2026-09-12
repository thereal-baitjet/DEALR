import postgres from 'postgres';
import { readdir,readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const databaseUrl=process.env.MIGRATION_DATABASE_URL||process.env.DATABASE_URL;
if(!databaseUrl)throw new Error('Set MIGRATION_DATABASE_URL or DATABASE_URL in .env.local.');
const host=new URL(databaseUrl).hostname;
const local=['localhost','127.0.0.1','[::1]'].includes(host);
const sql=postgres(databaseUrl,{max:1,prepare:false,ssl:local?false:'require'});
try{await sql`CREATE SCHEMA IF NOT EXISTS dealr`;await sql`CREATE TABLE IF NOT EXISTS dealr.schema_migrations(name text PRIMARY KEY,hash text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())`;for(const file of (await readdir('supabase/migrations')).filter(x=>x.endsWith('.sql')).sort()){const content=await readFile('supabase/migrations/'+file,'utf8'),hash=createHash('sha256').update(content).digest('hex');const prior=await sql`SELECT hash FROM dealr.schema_migrations WHERE name=${file}`;if(prior.length){if(prior[0].hash!==hash)throw new Error('Applied migration was changed: '+file);continue}await sql.begin(async t=>{await t.unsafe(content);await t`INSERT INTO dealr.schema_migrations(name,hash) VALUES(${file},${hash})`});console.log('Applied '+file)}}finally{await sql.end()}
