import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const read=f=>fs.readFileSync(f,'utf8');
const meta=read('js/releaseMeta.js');
const config=read('js/config.js');
const index=read('index.html');
const sw=read('sw.js');
const state=read('js/state.js');
const cloud=read('js/cloudPayload32.js');
const app=read('js/app.js');
const runtime=read('js/viewRuntime41.js');
const lazy=read('js/lazyBoot41.js');
const instant=read('js/instantShell64.js');
const personalShell=read('js/personalShell640.js');
const personalAssistant=read('js/personalAssistant650.js');
const hardening=read('js/personalHardening650.js');
const todayPage=read('js/todayPage101.js');
const ticketPage=read('js/ticketPage100.js');
const moneyPage=read('js/moneyPage100.js');
const os181=read('js/os181Suite.js');
const ticketCommander=read('js/ticketCommander660.js');
const ticketCloud=read('js/ticketCloud660.js');
const marketDecision=read('js/marketDecision534.js');
const actionQueue=read('js/actionQueue559.js');
const ticketSeed=read('js/currentTickets33.js');
const investmentSeed=read('js/externalInvestments33.js');
const platform43=read('js/platform43.js');
const stability431=read('js/platform431Stability.js');
const diagnostics=read('js/systemDiagnostics421.js');
const rootPackage=JSON.parse(read('package.json'));

const version=meta.match(/APP_VERSION='([^']+)'/)?.[1];
const release=meta.match(/APP_RELEASE='([^']+)'/)?.[1];
assert.ok(version&&/^\d+\.\d+\.\d+$/.test(version)&&Number(version.split('.')[0])>=181,'OS 181+ release metadata required');
assert.ok(release&&/^\d+\.\d+$/.test(release)&&release===version.split('.').slice(0,2).join('.'),'release label must match APP_VERSION');
assert.equal(rootPackage.version,version,'root package version must match APP_VERSION');
assert.ok(config.includes('SCHEMA_VERSION = 80'),'schema 80 must remain');

const syntaxFiles=['js/instantShell64.js','js/app.js','js/viewRuntime41.js','js/todayPage101.js','js/ticketPage100.js','js/moneyPage100.js','js/os181Suite.js','js/executiveCommand164.js','js/dataTrust163.js','js/ticketCloud660.js','js/ticketSales150.js','js/ticketSaleDetail151.js'];
for(const file of syntaxFiles)execFileSync(process.execPath,['--check',file],{stdio:'pipe'});

assert.ok(index.includes('./js/instantShell64.js'),'instant startup shell must remain wired');
assert.ok(index.includes('./personal65.css'),'personal assistant styles must remain wired');
for(const label of ['Dnes','Vstupenky','Rodina','Domov','Peníze','Dokumenty'])assert.ok(index.includes(label),`navigation missing: ${label}`);
assert.ok(!index.includes('Personal Home')&&!index.includes('Pohledávka'),'legacy shell labels must not return');
assert.ok(instant.includes("import('./app.js')")&&instant.includes('async function optionalImport')&&instant.includes("optionalImport('./personalShell640.js'")&&instant.includes("optionalImport('./personalHardening650.js'"),'bootstrap core/addon isolation missing');
assert.ok(personalAssistant.includes('personalDailyAssistant650')&&personalAssistant.includes('personalWaitingCenter650')&&personalAssistant.includes('personalSearch650'),'personal assistant engines missing');
assert.ok(personalShell.includes('Najít / zeptat se')&&personalShell.includes('openVaultRecord640'),'global search/assistant integration missing');
assert.ok(hardening.includes('primary<=1')&&hardening.includes('dataHealth===0'),'personal preflight guard missing');

assert.ok(todayPage.includes("import {renderDashboard1103}")&&todayPage.includes("import {enhanceXtbReview110}")&&todayPage.includes("import {renderPersonalToday640}"),'Today core imports changed unexpectedly');
assert.ok(todayPage.includes("['./os181Suite.js','enhanceToday181']"),'OS 181 Today command center missing');
assert.ok(todayPage.includes('await import(path)')&&todayPage.includes('[today addon failed]'),'Today addon isolation missing');
assert.ok(!todayPage.includes("import {enhanceToday181} from './os181Suite.js'"),'OS 181 addon must not become a static Today import');

assert.ok(ticketPage.includes('enhanceTickets181')&&ticketPage.includes('if(running){rerun=true;return}'),'Ticket OS 181 integration/single-flight guard missing');
assert.ok(moneyPage.includes('enhanceMoney181')&&moneyPage.includes('if(running){rerun=true;return}'),'Money OS 181 integration/single-flight guard missing');
assert.ok(os181.includes("from('xtb_transaction_ledger')")&&os181.includes("from('os_action_state')")&&os181.includes('truthfulAccounting:true'),'OS 181 truthful accounting/action layer missing');
assert.ok(ticketCommander.includes('TICKET PROFIT COMMANDER 66.')&&ticketCloud.includes("from('ticket_inventory')")&&!/service[_-]?role/i.test(ticketCloud),'private Ticket Intelligence missing or unsafe');

assert.ok(sw.includes("self.addEventListener('fetch'")&&sw.includes('networkFirst'),'service worker fresh-code policy missing');
assert.ok(/const CACHE='kamil-os-\d+\.\d+-[^']+'/.test(sw)&&sw.includes('./js/instantShell64.js'),'service-worker shell/cache missing');
assert.ok(!sw.includes('staleWhileRevalidate'),'runtime code must never prefer stale cache');
assert.ok(state.includes('export const store=new Store()'),'state store export missing');
assert.ok(cloud.includes('mergeColdState42'),'cloud payload must restore cold history before upload');
assert.ok(!cloud.includes('autoTrade:true'),'cloud payload must never enable automatic trading');
assert.ok(app.includes("dataset.viewReady==='1'"),'rendered views must stay mounted');
assert.ok(app.includes('requestAnimationFrame(()=>{const runForce='),'UI renders must remain coalesced');
assert.ok(runtime.includes('warmViews=new Map()')&&runtime.includes('hydrateColdView42(key)'),'lazy view hydration/cache missing');
assert.ok(runtime.includes("load('./qa143.js').catch"),'optional QA addon isolation missing');
for(const fn of ['prefetchView41','renderExtras41','refreshRiskBadge41','scheduleNotifications41','warmRuntime41'])assert.ok(runtime.includes(`function ${fn}`),`runtime function missing: ${fn}`);

for(const [name,file] of [['Market Decision',marketDecision],['Action Queue',actionQueue]]){
 for(const bad of ['setInterval(','requestIdleCallback','store.subscribe('])assert.ok(!file.includes(bad),`${name} must stay click-only: ${bad}`);
 assert.ok(!file.includes('store.update(')&&!file.includes('store.patch('),`${name} must stay read-only`);
}
assert.ok(marketDecision.includes("from './xtbPlanner24.js'")&&marketDecision.includes("from './ticketCockpit24.js'"),'market compatibility engines missing');
assert.ok(!ticketSeed.includes('store.subscribe(')&&!ticketSeed.includes('queueMicrotask(ensure)'),'ticket seed must never mutate on import');
assert.ok(!investmentSeed.includes('store.subscribe(')&&!investmentSeed.includes('queueMicrotask(ensure)'),'investment seed must never mutate on import');

assert.ok(platform43.includes('export const ROADMAP43=['),'platform registry missing');
assert.ok(stability431.includes("entryTypes:['longtask']")&&stability431.includes('setSafeMode43(true)'),'freeze detector/Safe Mode missing');
assert.ok(lazy.includes("STABILITY_MEMORY_KEY='kamil-os-stability-memory-43-7'")&&lazy.includes('refreshStabilityMemory'),'stability memory missing');
assert.ok(diagnostics.includes('43.7 STABILITY MEMORY'),'stability diagnostics missing');

console.log(`KAMIL OS RELEASE QA PASS · ${version} · OS 181`);
