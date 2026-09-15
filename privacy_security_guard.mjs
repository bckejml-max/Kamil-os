import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const snapshot=read('js/personalSnapshot737.js');
const betSeed=read('lib/bet-ledger.js');
const bettingStore=read('lib/betting-ledger543-store.js');
const bettingMigration=read('supabase/migrations/0034_betting_ledger543.sql');
const bettingApi=read('api/betting-ledger543.js');
const gmail=read('api/ticket-gmail-sync.js');

for(const forbidden of ['RAW_TICKETS','RAW_XTB','DEBTS=[','KNOWN_BETS','Sázky.xlsx','Dluhy.xlsx']){
 assert.equal(snapshot.includes(forbidden),false,`personalSnapshot737.js must not embed personal data: ${forbidden}`);
}
assert.ok(snapshot.includes('NO_EMBEDDED_PERSONAL_DATA'),'personal snapshot must explicitly remain data-free');
assert.ok(snapshot.length<2000,'personalSnapshot737.js unexpectedly contains a large embedded payload');

assert.ok(betSeed.includes('Object.freeze([])'),'public source must not contain hardcoded personal bets');
assert.ok(!/stakeCzk\s*:\s*\d+/.test(betSeed),'public betting seed must not contain personal stake amounts');
for(const token of ['AUTH_REQUIRED','REMOTE_BETTING_LEDGER_MIGRATION_REQUIRED','supabase_rls','auth/v1/user'])assert.ok(bettingStore.includes(token),`server betting ledger missing secure contract: ${token}`);
assert.ok(bettingStore.includes("REQUIRED_REVISION='0034_betting_ledger543.sql'"),'server betting ledger must name its migration revision');
for(const token of ['enable row level security','auth.uid()','revoke all on table public.betting_ledger543_settings from anon','revoke all on table public.betting_ledger543_bets from anon','BETTING_LEDGER_SETTLED_IMMUTABLE'])assert.ok(bettingMigration.includes(token),`betting RLS migration missing ${token}`);
assert.ok(bettingApi.includes('getBettingLedger543(req)'),'betting reads must carry authenticated request context');
assert.ok(bettingApi.includes('mutateBettingLedger543(await readBody(req),req)'),'betting writes must carry authenticated request context');

assert.ok(gmail.includes('authorizedMailbox(req,res)'),'Gmail sync must authenticate every mode');
assert.ok(gmail.includes("error:'AUTH_REQUIRED'"),'Gmail sync must expose an auth-required contract');
assert.match(gmail,/async function ticketMode\(req,res(?:,input)?\)/,'ticket mode must receive the authenticated request');
assert.ok(!gmail.includes('async function ticketMode(res)'),'ticket mode must never bypass request authentication');
assert.match(gmail,/ticketMode\(req,res,input\)/,'ticket handler must pass request plus bounded checkpoint input');

console.log('PRIVACY + API SECURITY GUARD PASS');
