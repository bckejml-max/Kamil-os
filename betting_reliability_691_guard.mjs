import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const read=p=>fs.readFileSync(p,'utf8');
const syntaxFiles=[
 'js/bettingDomGuard691.js',
 'js/bettingPage144.js',
 'js/bettingBootstrap543.js',
 'js/bettingRequestBudget561.js',
 'js/bettingCommander542.js',
 'js/bettingLedger543.js',
 'js/bettingIntelligence560.js',
 'js/bettingTiming564.js',
 'js/bettingPerformance565.js',
 'js/bettingMissed566.js',
 'js/bettingControl586.js'
];
for(const file of syntaxFiles)execFileSync(process.execPath,['--check',file],{stdio:'pipe'});

const observerFiles=[
 'js/bettingRequestBudget561.js',
 'js/bettingCommander542.js',
 'js/bettingIntelligence560.js',
 'js/bettingTiming564.js',
 'js/bettingPerformance565.js',
 'js/bettingMissed566.js',
 'js/bettingControl586.js'
];
for(const file of observerFiles){
 const text=read(file);
 assert.ok(text.includes("from './bettingDomGuard691.js'"),`${file}: missing OS691 DOM guard import`);
 assert.ok(text.includes('bettingSourceMutation691(records)'),`${file}: observer is not source-filtered`);
}

const page=read('js/bettingPage144.js');
assert.ok(page.includes('maxPages=12'),'OS691 must cap Chance discovery at 12 pages');
assert.ok(page.includes('měsíční kvótu PulseScore BASIC (500 requestů)'),'monthly quota must be explicit in scanner UI');
assert.ok(!page.includes('limit 1 požadavek/s'),'monthly quota must not be mislabeled as per-second throttling');

const budget=read('js/bettingRequestBudget561.js');
assert.ok(budget.includes('providerExhausted'),'provider-side quota state missing');
assert.ok(budget.includes("24*3600000"),'discovery cache should be at least 24h in normal mode');
assert.ok(budget.includes("return syntheticBudgetError(s)"),'exhausted budget must block upstream requests');

const timing=read('js/bettingTiming564.js');
assert.ok(timing.includes("8*3600000"),'normal autoscan cooldown must be 8h');
assert.ok(timing.includes("mode==='exhausted'?Infinity"),'autoscan must stop when provider quota is exhausted');

const bootstrap=read('js/bettingBootstrap543.js');
assert.ok(bootstrap.includes("const REV='os691'"),'bootstrap cache-bust revision missing');
assert.ok(bootstrap.includes('boot().then(ok=>{if(!ok)installBootObserver()})'),'async bootstrap fallback is not awaited');
assert.ok(!bootstrap.includes('if(!boot())'),'broken Promise truthiness bootstrap pattern returned');

const control=read('js/bettingControl586.js');
assert.ok(control.includes("b.sport||'Nezařazeno'"),'unknown sports must stay Nezařazeno');

const missed=read('js/bettingMissed566.js');
assert.ok(missed.includes('freshObservation'),'missed-bet observations must be deduplicated');

const ledger=read('js/bettingLedger543.js');
assert.ok(ledger.includes('kamil:betting-ledger543-updated'),'canonical ledger update event missing');

console.log('OS691 BETTING RELIABILITY PASS');
