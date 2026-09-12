import postgres from 'postgres';
import { AppError } from './domain';
export type QueryResult={rows:Record<string,unknown>[]};
export interface Database{query<T=Record<string,unknown>>(sql:string,params?:unknown[]):Promise<T[]>;transaction<T>(fn:(db:Database)=>Promise<T>):Promise<T>;}
export function parameters(sql:string){let i=0;return sql.replace(/\?/g,()=>`$${++i}`)}
let pool:ReturnType<typeof postgres>|undefined;
export function getDatabase():Database{if(!process.env.DATABASE_URL)throw new AppError(503,'The marketplace is not accepting account activity yet. Please try again later.');pool??=postgres(process.env.DATABASE_URL,{max:5,prepare:false,idle_timeout:20,connect_timeout:10,connection:{search_path:'dealr,public'},types:{bigint:{to:20,from:[20],serialize:(x:unknown)=>String(x),parse:(x:string)=>Number(x)}}});const wrap=(sql:ReturnType<typeof postgres>):Database=>({async query<T>(text:string,params:unknown[]=[]){return await sql.unsafe(parameters(text),params as never[]) as unknown as T[]},async transaction<T>(fn:(db:Database)=>Promise<T>){return await sql.begin(async t=>fn(wrap(t as unknown as ReturnType<typeof postgres>))) as T}});return wrap(pool)}
