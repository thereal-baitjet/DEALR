import postgres from 'postgres';
import { readdir,readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
if(!process.env.DATABASE_URL)throw new Error('Set DATABASE_URL in .env.local.');
const sql=postgres(process.env.DATABASE_URL,{max:1,prepare:false});
try{await sql`CREATE SCHEMA IF NOT EXISTS dealr`;await sql`CREATE TABLE IF NOT EXISTS dealr.schema_migrations(name text PRIMARY KEY,hash text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())`;for(const file of (await readdir('supabase/migrations')).filter(x=>x.endsWith('.sql')).sort()){const content=await readFile('supabase/migrations/'+file,'utf8'),hash=createHash('sha256').update(content).digest('hex');const prior=await sql`SELECT hash FROM dealr.schema_migrations WHERE name=${file}`;if(prior.length){if(prior[0].hash!==hash)throw new Error('Applied migration was changed: '+file);continue}await sql.begin(async t=>{await t.unsafe(content);await t`INSERT INTO dealr.schema_migrations(name,hash) VALUES(${file},${hash})`});console.log('Applied '+file)}}finally{await sql.end()}
