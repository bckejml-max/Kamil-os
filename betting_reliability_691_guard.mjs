import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const read=p=>fs.readFileSync(p,'utf8');
const syntaxFiles=[
 'api/market-history.js',
 'js/bettingDomGuard691.js',
 'js/bettingOddsFeed693.js',
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
 assert.ok(text.includes("from './bettingDomGuard691.js'"),`${file}: missing source DOM guard import`);
 assert.ok(text.includes('bettingSourceMutation691(records)'),`${file}: observer is not source-filtered`);
}

const page=read('js/bettingPage144.js');
assert.ok(page.includes('maxPages=12'),'Chance fallback discovery must stay capped at 12 pages');
assert.ok(page.includes('měsíční kvótu PulseScore BASIC (500 requestů)'),'PulseScore fallback quota must remain explicit');
assert.ok(!page.includes('limit 1 požadavek/s'),'monthly quota must not be mislabeled as per-second throttling');

const budget=read('js/bettingRequestBudget561.js');
assert.ok(budget.includes('providerExhausted'),'provider-side quota state missing');
assert.ok(budget.includes("24*3600000"),'fallback discovery cache should be at least 24h');
assert.ok(budget.includes("return syntheticBudgetError(s)"),'exhausted fallback budget must block upstream requests');

const timing=read('js/bettingTiming564.js');
assert.ok(timing.includes("8*3600000"),'normal autoscan cooldown must be 8h');
assert.ok(timing.includes("mode==='exhausted'?Infinity"),'fallback autoscan must stop when PulseScore quota is exhausted');

const bootstrap=read('js/bettingBootstrap543.js');
assert.ok(bootstrap.includes("const REV='os693'"),'OS693 bootstrap cache-bust revision missing');
assert.ok(bootstrap.includes('await ensureFeed();'),'Odds feed must install before PulseScore budget wrapper');
assert.ok(bootstrap.includes('boot().then(ok=>{if(!ok)installBootObserver()})'),'async bootstrap fallback is not awaited');
assert.ok(!bootstrap.includes('if(!boot())'),'broken Promise truthiness bootstrap pattern returned');

const feed=read('js/bettingOddsFeed693.js');
assert.ok(feed.includes("source=chance_odds_health693"),'OS693 provider health route missing');
assert.ok(feed.includes("const SCAN_SOURCE='chance_odds693'"),'OS693 scan route missing');
assert.ok(feed.includes('resetPulseStop()'),'new provider must release stale PulseScore STOP state');
assert.ok(feed.includes("window.fetch=fetch693"),'OS693 fetch provider switch missing');

const backend=read('api/market-history.js');
assert.ok(backend.includes("ODDS_BASE='https://api.odds-api.io/v3'"),'Odds-API.io base missing');
assert.ok(backend.includes("ODDS_BOOKMAKER='Chance.cz'"),'Chance.cz bookmaker binding missing');
assert.ok(backend.includes('ODDS_API_IO_KEY'),'server-only Odds-API.io key missing');
assert.ok(backend.includes('/odds/multi?eventIds='),'batch odds endpoint missing');
assert.ok(backend.includes('i+=10'),'odds requests must batch at most ten events');
assert.ok(backend.includes('ODDS_CACHE_TTL=20*60*1000'),'provider cache missing');
assert.ok(!backend.includes('odds_probe692'),'temporary source probe must be removed');
assert.ok(!backend.includes('tipsport_rest_probe692'),'temporary Tipsport probe must be removed');

const control=read('js/bettingControl586.js');
assert.ok(control.includes("b.sport||'Nezařazeno'"),'unknown sports must stay Nezařazeno');

const missed=read('js/bettingMissed566.js');
assert.ok(missed.includes('freshObservation'),'missed-bet observations must be deduplicated');

const ledger=read('js/bettingLedger543.js');
assert.ok(ledger.includes('kamil:betting-ledger543-updated'),'canonical ledger update event missing');

console.log('OS693 BETTING RELIABILITY PASS');
