import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const snapshot=read('js/personalSnapshot737.js');
const betSeed=read('lib/bet-ledger.js');
const bettingStore=read('lib/betting-ledger543-store.js');
const gmail=read('api/ticket-gmail-sync.js');

for(const forbidden of ['RAW_TICKETS','RAW_XTB','DEBTS=[','KNOWN_BETS','Sázky.xlsx','Dluhy.xlsx']){
 assert.equal(snapshot.includes(forbidden),false,`personalSnapshot737.js must not embed personal data: ${forbidden}`);
}
assert.ok(snapshot.includes('NO_EMBEDDED_PERSONAL_DATA'),'personal snapshot must explicitly remain data-free');
assert.ok(snapshot.length<2000,'personalSnapshot737.js unexpectedly contains a large embedded payload');

assert.ok(betSeed.includes('Object.freeze([])'),'public source must not contain hardcoded personal bets');
assert.ok(!/stakeCzk\s*:\s*\d+/.test(betSeed),'public betting seed must not contain personal stake amounts');
assert.ok(bettingStore.includes('REMOTE_BETTING_LEDGER_DISABLED'),'server betting ledger must fail closed while the private ledger migration is absent');
assert.ok(bettingStore.includes("status:'disabled'")||bettingStore.includes("status:error===DISABLED_ERROR?'disabled'"),'server betting ledger must expose an explicit disabled state');
assert.ok(bettingStore.includes('writable:false'),'server betting ledger must not expose anonymous writes');
assert.ok(bettingStore.includes("REQUIRED_REVISION='0034_betting_ledger543.sql'"),'server betting ledger must name the migration required before writes can be enabled');

assert.ok(gmail.includes('authorizedMailbox(req,res)'),'Gmail sync must authenticate every mode');
assert.ok(gmail.includes("error:'AUTH_REQUIRED'"),'Gmail sync must expose an auth-required contract');
assert.match(gmail,/async function ticketMode\(req,res(?:,input)?\)/,'ticket mode must receive the authenticated request');
assert.ok(!gmail.includes('async function ticketMode(res)'),'ticket mode must never bypass request authentication');
assert.match(gmail,/ticketMode\(req,res,input\)/,'ticket handler must pass request plus bounded checkpoint input');

console.log('PRIVACY + API SECURITY GUARD PASS');
