import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const snapshot=read('js/personalSnapshot737.js');
const betSeed=read('lib/bet-ledger.js');
const bettingStore=read('lib/betting-ledger543-store.js');
const bettingMigration=read('supabase/migrations/0034_betting_ledger543.sql');
const marketHistory=read('api/market-history.js');
const vercel=read('vercel.json');
const gmail=read('api/ticket-gmail-sync.js');

const state=read('js/state.js');
const bettingOverview=read('js/bettingOverview.js');
const sw=read('sw.js');
const privateBootFiles=['js/bettingMaster1335.js','js/ticketMaster1336.js','js/insuranceMaster1336.js','js/personalDataRecovery625.js','js/personalDataConfidence626.js','js/personalVault640.js','js/personalMissingDataResolver627.js'];
for(const file of privateBootFiles){
 const src=read(file);
 assert.ok(src.length<12000,file+' unexpectedly contains a large embedded private payload');
}
for(const file of ['js/bettingMaster1335.js','js/ticketMaster1336.js','js/insuranceMaster1336.js']){
 const src=read(file);
 assert.match(src,/embedded:false/,'public master contract must explicitly be data-free: '+file);
}
assert.doesNotMatch(state,/apply(?:Betting|Ticket|Insurance)Master133[56]\(s\)/,'state migration must never auto-apply public personal masters');
assert.doesNotMatch(bettingOverview,/kamil_betting_ledger_543/,'canonical betting UI must never revive legacy localStorage');
for(const file of ['bettingMaster1335.js','ticketMaster1336.js','insuranceMaster1336.js'])assert.equal(sw.includes(file),false,'service worker must not precache private master contracts: '+file);

const repoTextFiles=[];
const walk=dir=>{for(const ent of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules','test-results','playwright-report'].includes(ent.name))continue;const path=dir==='.'?ent.name:dir+'/'+ent.name;if(ent.isDirectory())walk(path);else if(/\.(?:js|mjs|json|md|html|css)$/i.test(ent.name)&&path!=='privacy_security_guard.mjs')repoTextFiles.push(path)}};
walk('.');
const forbiddenPrivateTokens=[
 'sazky_portfolio_FINAL_2026-09-23'+'.xlsx',
 'Sázky(1)'+'.xlsx',
 'Kamil · Allianz '+'ŽIVOT',
 'Tereza · NN '+'Orange Risk',
 '552093'+'1006',
 '335040'+'9671',
 '3424369'+'.42',
 '4382826'+'.31',
 '5700287'+'.82'
];
for(const file of repoTextFiles){
 const src=read(file);
 for(const token of forbiddenPrivateTokens)assert.equal(src.includes(token),false,`private token leaked in ${file}: ${token}`);
}


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
assert.ok(marketHistory.includes('getBettingLedger543(req)'),'betting reads must carry authenticated request context');
assert.ok(marketHistory.includes('mutateBettingLedger543(await readBody(req),req)'),'betting writes must carry authenticated request context');
assert.ok(vercel.includes('"destination": "/api/market-history?source=ledger543"'),'betting ledger must share an existing function to preserve Hobby deployment limits');
assert.equal(fs.existsSync('api/betting-ledger543.js'),false,'no dedicated 13th betting API function may be deployed on Hobby');

assert.ok(gmail.includes('authorizedMailbox(req,res)'),'Gmail sync must authenticate every mode');
assert.ok(gmail.includes("error:'AUTH_REQUIRED'"),'Gmail sync must expose an auth-required contract');
assert.match(gmail,/async function ticketMode\(req,res(?:,input)?\)/,'ticket mode must receive the authenticated request');
assert.ok(!gmail.includes('async function ticketMode(res)'),'ticket mode must never bypass request authentication');
assert.match(gmail,/ticketMode\(req,res,input\)/,'ticket handler must pass request plus bounded checkpoint input');

console.log('PRIVACY + API SECURITY GUARD PASS');
