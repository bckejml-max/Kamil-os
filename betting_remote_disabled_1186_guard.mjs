import assert from 'node:assert/strict';
import fs from 'node:fs';
import {getBettingLedger543,mutateBettingLedger543,REQUIRED_REVISION} from './lib/betting-ledger543-store.js';

const store=fs.readFileSync('lib/betting-ledger543-store.js','utf8');
const market=fs.readFileSync('api/market-history.js','utf8');
const bridge=fs.readFileSync('js/apiAuthBridge1210.js','utf8');
const vercel=fs.readFileSync('vercel.json','utf8');
const migration='supabase/migrations/0034_betting_ledger543.sql';
assert.equal(REQUIRED_REVISION,'0034_betting_ledger543.sql');
assert.ok(fs.existsSync(migration),'OS1186 migration 0034 must exist');
const sql=fs.readFileSync(migration,'utf8');

for(const token of ['betting_ledger543_settings','betting_ledger543_bets','enable row level security','auth.uid()','BETTING_LEDGER_SETTLED_IMMUTABLE','primary key (user_id, id)'])assert.ok(sql.includes(token),`OS1186 migration missing ${token}`);
for(const token of ['auth/v1/user','supabase_rls','BET_ALREADY_SETTLED','BET_SETTLEMENT_RACE','status=eq.OPEN','AUTH_REQUIRED'])assert.ok(store.includes(token),`OS1186 store missing ${token}`);
assert.ok(market.includes('getBettingLedger543(req)'),'Shared betting route must pass request auth to reads');
assert.ok(market.includes('mutateBettingLedger543(await readBody(req),req)'),'Shared betting route must pass request auth to mutations');
assert.ok(bridge.includes("headers.set('Authorization',`Bearer ${token}`)"),'Same-origin API bridge must forward cloud bearer token');
assert.ok(vercel.includes('"source": "/api/betting-ledger543"')&&vercel.includes('"destination": "/api/market-history?source=ledger543"'),'Betting ledger must share market-history to stay within Hobby function limit');
assert.equal(fs.existsSync('api/betting-ledger543.js'),false,'Dedicated betting API would exceed the 12-function Hobby deployment limit');

{
 let called=false;const original=globalThis.fetch;globalThis.fetch=async()=>{called=true;throw new Error('must not fetch without auth')};
 try{const body=await getBettingLedger543({headers:{}});assert.equal(body.error,'AUTH_REQUIRED');assert.equal(called,false)}finally{globalThis.fetch=original}
}
{
 const original=globalThis.fetch;globalThis.fetch=async url=>{
  const u=String(url);
  if(u.includes('/auth/v1/user'))return new Response(JSON.stringify({id:'user-1'}),{status:200,headers:{'content-type':'application/json'}});
  return new Response(JSON.stringify({message:'relation betting_ledger543_settings does not exist'}),{status:404,headers:{'content-type':'application/json'}});
 };
 try{const body=await getBettingLedger543({headers:{authorization:'Bearer test-token'}});assert.equal(body.error,'REMOTE_BETTING_LEDGER_MIGRATION_REQUIRED');assert.equal(body.writable,false)}finally{globalThis.fetch=original}
}
{
 const original=globalThis.fetch;globalThis.fetch=async (url,init={})=>{
  const u=String(url);
  if(u.includes('/auth/v1/user'))return new Response(JSON.stringify({id:'user-1'}),{status:200,headers:{'content-type':'application/json'}});
  if(u.includes('/rest/v1/betting_ledger543_bets')&&init.method==='POST')return new Response(JSON.stringify([{user_id:'user-1',id:'bet-1',status:'OPEN',stake_czk:100,odds:2,payload:{id:'bet-1',status:'OPEN',stakeCzk:100,odds:2}}]),{status:201,headers:{'content-type':'application/json'}});
  throw new Error(`unexpected ${u}`);
 };
 try{const result=await mutateBettingLedger543({action:'add',bet:{id:'bet-1',status:'OPEN',stakeCzk:100,odds:2}},{headers:{authorization:'Bearer test-token'}});assert.equal(result.status,201);assert.equal(result.body.ok,true);assert.equal(result.body.bet.id,'bet-1')}finally{globalThis.fetch=original}
}

console.log('OS1181-1186 PASS: betting ledger is RLS owner-scoped, shared within Vercel limits, idempotent by key and settled rows are DB-immutable');
