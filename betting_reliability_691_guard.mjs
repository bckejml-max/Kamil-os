import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const read=p=>fs.readFileSync(p,'utf8');
const syntaxFiles=[
 'api/market-history.js','lib/browser-chance-model694.js','chance-feeder694.user.js','js/bettingBrowserFeed694.js','js/bettingDomGuard691.js','js/bettingOddsFeed693.js','js/bettingPage144.js','js/bettingBootstrap543.js','js/bettingRequestBudget561.js','js/bettingCommander542.js','js/bettingLedger543.js','js/bettingIntelligence560.js','js/bettingTiming564.js','js/bettingPerformance565.js','js/bettingMissed566.js','js/bettingControl586.js'
];
for(const file of syntaxFiles)execFileSync(process.execPath,['--check',file],{stdio:'pipe'});
const observerFiles=['js/bettingRequestBudget561.js','js/bettingCommander542.js','js/bettingIntelligence560.js','js/bettingTiming564.js','js/bettingPerformance565.js','js/bettingMissed566.js','js/bettingControl586.js'];
for(const file of observerFiles){const text=read(file);assert.ok(text.includes("from './bettingDomGuard691.js'"),`${file}: missing source DOM guard import`);assert.ok(text.includes('bettingSourceMutation691(records)'),`${file}: observer is not source-filtered`)}
const page=read('js/bettingPage144.js');assert.ok(page.includes('maxPages=12'),'Chance fallback discovery must stay capped at 12 pages');
const bootstrap=read('js/bettingBootstrap543.js');assert.ok(bootstrap.includes("const REV='os694'"),'OS694 bootstrap cache-bust revision missing');assert.ok(bootstrap.indexOf('await ensureBrowserFeed();')<bootstrap.indexOf('await ensureFeed();'),'browser feed must install before external providers');assert.ok(bootstrap.includes('boot().then(ok=>{if(!ok)installBootObserver()})'),'async bootstrap fallback is not awaited');
const browser=read('js/bettingBrowserFeed694.js');assert.ok(browser.includes('KAMIL_CHANCE_FEED_694'),'browser relay event missing');assert.ok(browser.includes("window.fetch=fetch694"),'browser feed fetch switch missing');assert.ok(browser.includes('/chance-feeder694.user.js'),'userscript install link missing');
const user=read('chance-feeder694.user.js');assert.ok(user.includes('@match        https://www.chance.cz/*'),'Chance userscript match missing');assert.ok(user.includes('/rest/offer/'),'Chance offer capture missing');assert.ok(user.includes('chance_browser_model694'),'browser model endpoint missing');assert.ok(user.includes('GM_setValue'),'cross-origin userscript relay storage missing');
const model=read('lib/browser-chance-model694.js');assert.ok(model.includes('resolveAutoBettingModels'),'browser odds must reuse canonical auto model');assert.ok(model.includes('decorateLedgerSelection'),'browser model must reuse ledger lock logic');
const backend=read('api/market-history.js');assert.ok(backend.includes("source==='chance_browser_model694'"),'browser model route missing');assert.ok(backend.includes("import('../lib/browser-chance-model694.js')"),'browser model adapter import missing');assert.ok(backend.includes("ODDS_BASE='https://api.odds-api.io/v3'"),'Odds-API fallback missing');
const feed=read('js/bettingOddsFeed693.js');assert.ok(feed.includes('resetPulseStop()'),'provider fallback must release stale PulseScore STOP state');
const budget=read('js/bettingRequestBudget561.js');assert.ok(budget.includes('providerExhausted'),'provider-side quota state missing');
const timing=read('js/bettingTiming564.js');assert.ok(timing.includes("8*3600000"),'normal autoscan cooldown must be 8h');
const control=read('js/bettingControl586.js');assert.ok(control.includes("b.sport||'Nezařazeno'"),'unknown sports must stay Nezařazeno');
const missed=read('js/bettingMissed566.js');assert.ok(missed.includes('freshObservation'),'missed-bet observations must be deduplicated');
const ledger=read('js/bettingLedger543.js');assert.ok(ledger.includes('kamil:betting-ledger543-updated'),'canonical ledger update event missing');
console.log('OS694 BETTING RELIABILITY PASS');
