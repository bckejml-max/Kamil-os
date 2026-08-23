import fs from 'node:fs';
import assert from 'node:assert/strict';

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
const personalShell=read('js/personalShell640.js');
const personalToday=read('js/personalToday640.js');
const personalAssistant=read('js/personalAssistant650.js');
const hardening=read('js/personalHardening650.js');
const ticketCommander=read('js/ticketCommander660.js');
const ticketCloud=read('js/ticketCloud660.js');
const marketDecision=read('js/marketDecision534.js');
const actionQueue=read('js/actionQueue559.js');
const ticketSeed=read('js/currentTickets33.js');
const investmentSeed=read('js/externalInvestments33.js');
const platform43=read('js/platform43.js');
const stability431=read('js/platform431Stability.js');
const diagnostics=read('js/systemDiagnostics421.js');
const lifeFiles=['lifePlanner446.js','cashflow447.js','wealth448.js','ticketIntel449.js','inbox450.js','maintenance451.js','family452.js','goals453.js','decision454.js','lifeDashboard455.js'].map(f=>read(`js/${f}`));
const lifePlus=read('js/personalLifePlus475.js');
const rootPackage=JSON.parse(read('package.json'));

const version=meta.match(/APP_VERSION='([^']+)'/)?.[1];
const release=meta.match(/APP_RELEASE='([^']+)'/)?.[1];
assert.ok(version&&/^\d+\.\d+\.\d+$/.test(version)&&Number(version.split('.')[0])>=65,'current personal release metadata must be aligned');
assert.ok(release&&/^\d+\.\d+$/.test(release)&&release===version.split('.').slice(0,2).join('.'),'release label must match APP_VERSION');
assert.equal(rootPackage.version,version,'root package version must match APP_VERSION');
assert.ok(config.includes('SCHEMA_VERSION = 80'),'schema 80 must remain');

// Canonical startup / personal UX
assert.ok(index.includes('./js/instantShell64.js'),'current personal instant startup shell must remain wired');
assert.ok(index.includes('./personal65.css'),'personal assistant styles must remain wired');
assert.ok(index.includes('Dnes')&&index.includes('Rodina')&&index.includes('Domov')&&index.includes('Peníze')&&index.includes('Dokumenty'),'personal navigation missing');
assert.ok(!index.includes('Personal Home')&&!index.includes('Pohledávka'),'legacy labels must not return to current shell');
assert.ok(personalToday.includes('ux65-primary')&&personalToday.includes('POTOM'),'decision-first Today missing');
assert.ok(!personalToday.includes('ux64-data-health')&&!personalToday.includes('KAMIL OS 64.1 / DNES'),'Today must stay free of technical dashboard/version clutter');
assert.ok(personalAssistant.includes('personalDailyAssistant650')&&personalAssistant.includes('personalWaitingCenter650')&&personalAssistant.includes('personalSearch650'),'personal assistant engines missing');
assert.ok(personalShell.includes('Najít / zeptat se')&&personalShell.includes('openVaultRecord640'),'global search/assistant integration missing');
assert.ok(hardening.includes('primary<=1')&&hardening.includes('dataHealth===0'),'decision-first preflight missing');
assert.ok(ticketCommander.includes('TICKET PROFIT COMMANDER 66.0')&&ticketCloud.includes("from('ticket_inventory')")&&!/service[_-]?role/i.test(ticketCloud),'66.0 private Ticket Intelligence missing or unsafe');

// Core persistence/cloud/render safety
assert.ok(sw.includes("self.addEventListener('fetch'")&&sw.includes('networkFirst'),'service worker fresh-code policy missing');
assert.ok(/const CACHE='kamil-os-\d+\.\d+-[^']+'/.test(sw)&&sw.includes('./js/instantShell64.js'),'current service-worker shell/cache missing');
assert.ok(!sw.includes('staleWhileRevalidate'),'runtime code must not prefer stale cache');
assert.ok(state.includes('export const store=new Store()'),'state store export missing');
assert.ok(cloud.includes('mergeColdState42'),'cloud payload must restore cold history before upload');
assert.ok(!cloud.includes('autoTrade:true'),'cloud payload must never enable automatic trading');
assert.ok(app.includes("dataset.viewReady==='1'"),'rendered views must stay mounted');
assert.ok(app.includes('requestAnimationFrame(()=>{const runForce='),'UI renders must remain coalesced');
assert.ok(runtime.includes('warmViews=new Map()')&&runtime.includes('hydrateColdView42(key)'),'lazy view hydration/cache missing');
for(const line of ['prefetchView41(){return Promise.resolve(null)}','renderExtras41(){return Promise.resolve([])}','refreshRiskBadge41(){return Promise.resolve(null)}','scheduleNotifications41(){return Promise.resolve(null)}','warmRuntime41(){return Promise.resolve(null)}'])assert.ok(runtime.includes(line),`background runtime guard missing: ${line}`);

// Legacy market modules remain available but never become background/automatic behavior.
for(const [name,file] of [['Market Decision',marketDecision],['Action Queue',actionQueue]]){
 for(const bad of ['setInterval(','requestIdleCallback','store.subscribe('])assert.ok(!file.includes(bad),`${name} must stay click-only: ${bad}`);
 assert.ok(!file.includes('store.update(')&&!file.includes('store.patch('),`${name} must stay read-only`);
}
assert.ok(marketDecision.includes("from './xtbPlanner24.js'")&&marketDecision.includes("from './ticketCockpit24.js'"),'market compatibility engines missing');
assert.ok(!ticketSeed.includes('store.subscribe(')&&!ticketSeed.includes('queueMicrotask(ensure)'),'ticket seed must never mutate on import');
assert.ok(!investmentSeed.includes('store.subscribe(')&&!investmentSeed.includes('queueMicrotask(ensure)'),'investment seed must never mutate on import');

// Legacy life engines remain loadable/read-only compatibility modules, but are no longer the canonical Home.
for(const file of lifeFiles){assert.ok(!file.includes('setInterval(')&&!file.includes('requestIdleCallback')&&!file.includes('store.subscribe('),'legacy Life OS modules must stay click-only');assert.ok(!file.includes('store.update(')&&!file.includes('store.patch('),'legacy Life OS modules must stay read-only')}
assert.ok(lifeFiles[9].includes('export function lifeDashboard455'),'legacy Life Dashboard compatibility module missing');
assert.ok(!lifePlus.includes('setInterval(')&&!lifePlus.includes('requestIdleCallback')&&!lifePlus.includes('store.subscribe('),'legacy Life+ must stay click-only');
assert.ok(!lifePlus.includes('store.update(')&&!lifePlus.includes('store.patch(')&&!lifePlus.includes('store.set('),'legacy Life+ must stay read-only');

// Platform/stability infrastructure stays intact.
assert.ok(platform43.includes('export const ROADMAP43=['),'platform registry missing');
assert.ok(stability431.includes("entryTypes:['longtask']")&&stability431.includes('setSafeMode43(true)'),'freeze detector/Safe Mode missing');
assert.ok(lazy.includes("STABILITY_MEMORY_KEY='kamil-os-stability-memory-43-7'")&&lazy.includes('refreshStabilityMemory'),'stability memory missing');
assert.ok(diagnostics.includes('43.7 STABILITY MEMORY'),'stability diagnostics missing');

console.log(`KAMIL OS CURRENT QA PASS · ${version} · PERSONAL + TICKET INTELLIGENCE`);
