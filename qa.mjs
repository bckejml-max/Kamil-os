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
const instant=read('js/instantShell64.js');
const today=read('js/todayPage2000.js');
const ticketPage=read('js/ticketPage100.js');
const ticketCloud=read('js/ticketCloud660.js');
const bettingPage=read('js/bettingPage527.js');
const bettingBootstrap=read('js/bettingBootstrap543.js');
const marketDecision=read('js/marketDecision534.js');
const actionQueue=read('js/actionQueue559.js');
const ticketSeed=read('js/currentTickets33.js');
const investmentSeed=read('js/externalInvestments33.js');
const platform43=read('js/platform43.js');
const stability431=read('js/platform431Stability.js');
const diagnostics=read('js/systemDiagnostics421.js');
const convergence=read('os2010.css');
const rootPackage=JSON.parse(read('package.json'));

const version=meta.match(/APP_VERSION='([^']+)'/)?.[1];
const release=meta.match(/APP_RELEASE='([^']+)'/)?.[1];
assert.ok(version&&/^\d+\.\d+\.\d+$/.test(version),'release metadata required');
assert.equal(release,version,'APP_RELEASE must equal APP_VERSION');
assert.equal(rootPackage.version,version,'root package version must match APP_VERSION');
assert.ok(config.includes('SCHEMA_VERSION = 80'),'schema 80 must remain');

const syntaxFiles=['js/instantShell64.js','js/app.js','js/viewRuntime41.js','js/todayPage2000.js','js/ticketPage100.js','js/bettingPage527.js','js/bettingBootstrap543.js','js/state.js','js/cloudPayload32.js','js/ticketCloud660.js','js/ticketSales150.js','js/ticketSaleDetail151.js','os2000_guard.mjs','runtime_boot_guard.mjs','runtime_ownership_1100_guard.mjs','release_guard_333.mjs'];
for(const file of syntaxFiles)execFileSync(process.execPath,['--check',file],{stdio:'pipe'});

assert.ok(index.includes('data-os2="1"'),'OS2 shell marker missing');
assert.equal((index.match(/rel="stylesheet"/g)||[]).length,3,'OS2 shell may eager-load only base + OS2 + convergence CSS');
assert.ok(index.includes('./os2.css'),'OS2 stylesheet missing');
assert.ok(index.includes('./os2010.css'),'OS2010 convergence stylesheet missing');
assert.ok(convergence.includes('#ticketIntelView')&&convergence.includes('#bettingView')&&convergence.includes('#moneyView')&&convergence.includes('#inboxView'),'OS2010 primary workspace convergence missing');
for(const label of ['Dnes','Inbox','Vstupenky','Sázení','Peníze','Rodina','Domov','Dokumenty'])assert.ok(index.includes(label),`navigation missing: ${label}`);
assert.ok(!index.includes('bettingBootstrap543.js'),'Betting bootstrap must not eager-load from index');
assert.ok(instant.includes("architecture:'os2-on-demand'")&&instant.includes("await import('./app.js')"),'OS2 startup contract missing');
assert.ok(!instant.includes('optionalImport(')&&!instant.includes('deferredImport('),'layered startup queues must stay retired');
assert.ok(!instant.includes('ticketDesk331.js')&&!instant.includes('todayCockpit363.js'),'heavy domains must stay off startup');

assert.ok(runtime.includes("today:['./todayPage2000.js','renderTodayPage2000']"),'OS2 Today renderer mapping missing');
assert.ok(runtime.includes('ensureViewStyles')&&runtime.includes('dataset.os2Lazy'),'view-specific CSS lazy loading missing');
assert.ok(runtime.includes('warmViews=new Map()')&&runtime.includes('hydrateColdView42(key)'),'lazy view hydration/cache missing');
for(const symbol of ['data-os2-today','data-os2060-today','os2060-priorities','os2060-waiting','os2060-statuses','__KAMIL_TODAY_OS2000__'])assert.ok(today.includes(symbol),`Today OS2060 missing ${symbol}`);
assert.ok(!today.includes('os2-kpis')&&!today.includes('Kalendář')&&!today.includes('Rychlý přístup'),'Today OS2060 must stay compact and decision-first');
assert.ok(today.includes('slice(0,3)'),'Today OS2060 must cap priorities at three');
assert.ok(app.includes("dataset.viewReady==='1'"),'rendered views must stay mounted');
assert.ok(app.includes('requestAnimationFrame(()=>{const runForce='),'UI renders must remain coalesced');
assert.ok(app.includes("const input=qs('#commandInput')")&&app.includes('executeCommand41(v)'),'canonical command bar missing');

assert.ok(ticketPage.includes('let bootPromise=null')&&ticketPage.includes("await import('./ticketDesk331.js')")&&ticketPage.includes('state.criticalDone=true'),'Ticket canonical critical-first adapter missing');
assert.ok(runtime.includes("tickets:['./ticketPage100.js','renderTicketPage100']"),'Ticket page must be view-owned');
assert.ok(ticketCloud.includes("from('ticket_inventory')")&&!/service[_-]?role/i.test(ticketCloud),'Ticket cloud contract missing or unsafe');
assert.ok(ticketCloud.includes("c.includes('official-api')")&&ticketCloud.includes("u.includes('viagogo.com')"),'Viagogo source detection missing');

assert.ok(runtime.includes("betting:['./bettingPage527.js','renderBettingPage527']"),'Betting page must be view-owned');
assert.ok(bettingPage.includes("import('./bettingBootstrap543.js')")&&bettingPage.includes('installBettingBootstrap543'),'Betting lazy bootstrap bridge missing');
assert.ok(bettingBootstrap.includes('export function installBettingBootstrap543'),'Betting view-owned bootstrap export missing');
assert.ok(!bettingBootstrap.includes('runtimeCoordinator1050')&&!bettingBootstrap.includes('commandCopilot840'),'Betting must not revive global legacy runtime');

assert.ok(sw.includes("self.addEventListener('fetch'")&&sw.includes('networkFirst'),'service worker fresh-code policy missing');
assert.ok(/const CACHE='kamil-os-[0-9.]+-core-r\d+'/.test(sw)&&sw.includes('instantShell64.js')&&sw.includes('os2010.css'),'service-worker shell/cache missing');
assert.ok(!sw.includes('staleWhileRevalidate'),'runtime code must never prefer stale cache');
assert.ok(state.includes('export const store=new Store()'),'state store export missing');
assert.ok(cloud.includes('mergeColdState42'),'cloud payload must restore cold history before upload');
assert.ok(!cloud.includes('autoTrade:true'),'cloud payload must never enable automatic trading');
for(const [name,file] of [['Market Decision',marketDecision],['Action Queue',actionQueue]]){
 for(const bad of ['setInterval(','requestIdleCallback','store.subscribe('])assert.ok(!file.includes(bad),`${name} must stay click-only: ${bad}`);
 assert.ok(!file.includes('store.update(')&&!file.includes('store.patch('),`${name} must stay read-only`);
}
assert.ok(!ticketSeed.includes('store.subscribe(')&&!ticketSeed.includes('queueMicrotask(ensure)'),'ticket seed must never mutate on import');
assert.ok(!investmentSeed.includes('store.subscribe(')&&!investmentSeed.includes('queueMicrotask(ensure)'),'investment seed must never mutate on import');
assert.ok(platform43.includes('export const ROADMAP43=['),'platform registry missing');
assert.ok(stability431.includes("entryTypes:['longtask']")&&stability431.includes('setSafeMode43(true)'),'freeze detector/Safe Mode missing');
assert.ok(diagnostics.includes('43.7 STABILITY MEMORY'),'stability diagnostics missing');

execFileSync(process.execPath,['os2000_guard.mjs'],{stdio:'pipe'});
console.log(`KAMIL OS 2.0 RELEASE QA PASS · ${version}`);
