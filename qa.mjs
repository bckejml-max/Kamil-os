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
const ticketOverview=read('js/ticketOverview.js');
const moneyOverview=read('js/moneyOverview.js');
const bettingOverview=read('js/bettingOverview.js');
const tasksOverview=read('js/tasksOverview.js');
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
const product=read('productReset1300.css');
const rootPackage=JSON.parse(read('package.json'));

const version=meta.match(/APP_VERSION='([^']+)'/)?.[1];
const release=meta.match(/APP_RELEASE='([^']+)'/)?.[1];
assert.ok(version&&/^\d+\.\d+\.\d+$/.test(version),'release metadata required');
assert.equal(release,version,'APP_RELEASE must equal APP_VERSION');
assert.equal(rootPackage.version,version,'root package version must match APP_VERSION');
assert.ok(config.includes('SCHEMA_VERSION = 80'),'schema 80 must remain');

const syntaxFiles=['js/instantShell64.js','js/app.js','js/viewRuntime41.js','js/todayPage2000.js','js/workPage1300.js','js/propertyPage1300.js','js/ticketPage100.js','js/bettingPage527.js','js/moneyOverview.js','js/ticketOverview.js','js/bettingOverview.js','js/tasksOverview.js','js/familyPage140.js','js/homePage140.js','js/documentsPage141.js','js/bettingBootstrap543.js','js/state.js','js/privateSnapshot1320.js','js/privateSnapshotImport1320.js','js/cloudPayload32.js','js/ticketCloud660.js','js/ticketSales150.js','js/ticketSaleDetail151.js','os2000_guard.mjs','runtime_boot_guard.mjs','runtime_ownership_1100_guard.mjs','release_guard_333.mjs','os1500_product_guard.mjs'];
for(const file of syntaxFiles)execFileSync(process.execPath,['--check',file],{stdio:'pipe'});

// Canonical product shell eagerly loads only the approved shared visual layers.
assert.ok(index.includes('data-os2="1"'),'OS2 shell marker missing');
const eagerStyles=[...index.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(x=>x[1]);
assert.deepEqual(eagerStyles,['./styles.css','./os2.css','./productReset1300.css','./os1331.css','./os1332.css','./os1333.css','./os1334.css','./os1400.css','./os1500.css'],'canonical shell eager styles changed unexpectedly');
assert.ok(index.includes('./os2.css'),'OS2 stylesheet missing');
assert.ok(index.includes('./productReset1300.css')&&index.includes('data-product-reset1300="1"'),'OS1300 product reset shell missing');
for(const label of ['Dnes','Úkoly','Práce','Vstupenky','Peníze','Reality','Sázení','Rodina','Domov','Dokumenty'])assert.ok(index.includes(label),`navigation missing: ${label}`);
for(const route of ['view-property','view-betting','view-family','view-home','view-more'])assert.ok(index.includes(`id="${route}"`),`secondary section shell missing: ${route}`);
assert.ok(!index.includes('bettingBootstrap543.js'),'Betting bootstrap must not eager-load from index');
assert.ok(instant.includes("architecture:'os2-on-demand'")&&instant.includes("await import('./app.js')"),'OS2 startup contract missing');
assert.ok(!instant.includes('optionalImport(')&&!instant.includes('deferredImport('),'layered startup queues must stay retired');
assert.ok(!instant.includes('ticketDesk331.js')&&!instant.includes('todayCockpit363.js'),'heavy domains must stay off startup');

// Canonical Today and lazy views.
assert.ok(runtime.includes("today:['./todayPage2000.js','renderTodayPage2000']"),'OS2 Today renderer mapping missing');
assert.ok(runtime.includes("work:['./workPage1300.js','renderWorkPage1300']")&&runtime.includes("property:['./propertyPage1300.js','renderPropertyPage1300']"),'OS1300 Work/Reality renderer mapping missing');
assert.ok(runtime.includes("money:['./moneyOverview.js','renderMoneyOverview']")&&runtime.includes("tickets:['./ticketOverview.js','renderTicketOverview']")&&runtime.includes("betting:['./bettingOverview.js','renderBettingOverview']")&&runtime.includes("inbox:['./tasksOverview.js','renderTasksOverview']"),'Product-first overview mappings missing');
for(const [name,file,marker] of [['Money',moneyOverview,'data-money-overview'],['Tickets',ticketOverview,'data-ticket-overview'],['Betting',bettingOverview,'data-betting-overview'],['Tasks',tasksOverview,'data-tasks-overview']])assert.ok(file.includes(marker),`${name} simple overview missing`);
assert.ok(runtime.includes('ensureViewStyles')&&runtime.includes('dataset.os2Lazy'),'view-specific CSS lazy loading missing');
assert.ok(runtime.includes('warmViews=new Map()')&&runtime.includes('hydrateColdView42(key)'),'lazy view hydration/cache missing');
for(const symbol of ['data-os2-today','data-product-home1300','data-os1400-home','os1600-attention','os1600-areas','os1400-list','__KAMIL_TODAY_OS2000__'])assert.ok(today.includes(symbol),`Today product cockpit missing ${symbol}`);
assert.ok(app.includes("dataset.viewReady==='1'"),'rendered views must stay mounted');
assert.ok(app.includes("scheduleFrame1110('app-render'")&&app.includes('renderQueued=true')&&app.includes('renderQueued=false'),'UI renders must remain coalesced through runtime-owned frame scheduling');
assert.ok(!app.includes('requestAnimationFrame('),'app render scheduling must not bypass runtime ownership');
assert.ok(app.includes("const input=qs('#commandInput')")&&app.includes('executeCommand41(v)'),'canonical command bar missing');

// Tickets remain on demand; business/data safety remains unchanged.
assert.ok(ticketPage.includes('let bootPromise=null')&&ticketPage.includes("await import('./ticketDesk331.js')")&&ticketPage.includes('state.criticalDone=true'),'Ticket canonical critical-first adapter missing');
assert.ok(runtime.includes("tickets:['./ticketOverview.js','renderTicketOverview']"),'Simple Ticket operations overview must own the default view');
assert.ok(ticketOverview.includes("import('./ticketAdvanced100.js')"),'Advanced Ticket desk must stay explicit/on-demand');
assert.ok(ticketCloud.includes("from('ticket_inventory')")&&!/service[_-]?role/i.test(ticketCloud),'Ticket cloud contract missing or unsafe');
assert.ok(ticketCloud.includes("c.includes('official-api')")&&ticketCloud.includes("u.includes('viagogo.com')"),'Viagogo source detection missing');

// Betting remains fully view-owned and may not revive the global legacy runtime.
assert.ok(runtime.includes("betting:['./bettingOverview.js','renderBettingOverview']"),'Simple Betting overview must own the default view');
assert.ok(bettingOverview.includes("import('./bettingAdvanced527.js')"),'Advanced betting scanner must stay explicit/on-demand');
assert.ok(bettingPage.includes("import('./bettingBootstrap543.js')")&&bettingPage.includes('installBettingBootstrap543'),'Betting lazy bootstrap bridge missing');
assert.ok(bettingBootstrap.includes('export function installBettingBootstrap543'),'Betting view-owned bootstrap export missing');
assert.ok(!bettingBootstrap.includes('runtimeCoordinator1050')&&!bettingBootstrap.includes('commandCopilot840'),'Betting must not revive global legacy runtime');

// Existing data and safety invariants.
assert.ok(sw.includes("self.addEventListener('fetch'")&&sw.includes('networkFirst'),'service worker fresh-code policy missing');
assert.ok(/const CACHE='kamil-os-[0-9.]+-core-r\d+'/.test(sw)&&sw.includes('instantShell64.js')&&sw.includes('productReset1300.css')&&sw.includes('os1400.css')&&sw.includes('workPage1300.js')&&sw.includes('propertyPage1300.js')&&!sw.includes('os2010.css')&&!sw.includes('os737.css'),'service-worker shell/cache missing');
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
assert.ok(product.includes('.pr1300-attention')&&product.includes('.pr1300-domains'),'OS1300 focused product visual layer missing');

execFileSync(process.execPath,['os2000_guard.mjs'],{stdio:'pipe'});
