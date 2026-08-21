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
const ticketSeed=read('js/currentTickets33.js');
const investmentSeed=read('js/externalInvestments33.js');
const directorUi=read('js/directorUi34.js');
const followUi=read('js/followUpUi35.js');
const radarUi=read('js/deadlineRadarUi35.js');
const followEngine=read('js/followUp35.js');

const version=meta.match(/APP_VERSION='([^']+)'/)?.[1];
const release=meta.match(/APP_RELEASE='([^']+)'/)?.[1];
assert.ok(version&&/^\d+\.\d+\.\d+$/.test(version),'release metadata must contain semantic APP_VERSION');
assert.ok(release&&/^\d+\.\d+(?:\.\d+)?$/.test(release),'release metadata must contain APP_RELEASE');
assert.ok(config.includes('SCHEMA_VERSION = 80'),'schema 80 must remain');
assert.ok(index.includes('./js/instantShell42.js'),'instant startup shell must remain wired');
assert.ok(sw.includes("self.addEventListener('fetch'"),'service worker fetch handler missing');
assert.ok(state.includes('export const store=new Store()'),'state store export missing');
assert.ok(cloud.includes('mergeColdState42'),'cloud payload must restore cold history before upload');
assert.ok(!cloud.includes('autoTrade:true'),'QA guard: cloud payload must not enable automatic trading');
assert.ok(app.includes("dataset.viewReady==='1'"),'41.4 must keep already-rendered views mounted');
assert.ok(app.includes('requestAnimationFrame(()=>{const runForce='),'41.4 must coalesce UI renders to animation frames');
assert.ok(runtime.includes('warmViews=new Map()'),'41.4 must cache warmed view renderers');
assert.ok(runtime.includes('hydrateColdView42(key)'),'41.4 prefetch must hydrate required cold data before navigation');
assert.ok(!ticketSeed.includes('store.subscribe(')&&!ticketSeed.includes('queueMicrotask(ensure)'),'41.5 ticket seed must never mutate on import');
assert.ok(!investmentSeed.includes('store.subscribe(')&&!investmentSeed.includes('queueMicrotask(ensure)'),'41.5 external investment seed must never mutate on import');
assert.ok(ticketSeed.includes('explicit ensureCurrentTicketSnapshot33()'),'41.5 ticket seed must document explicit restore policy');
assert.ok(investmentSeed.includes('explicit ensureExternalInvestments33()'),'41.5 investment seed must document explicit restore policy');
assert.ok(!lazy.includes("primary:['./currentTickets33.js'")&&!lazy.includes("primary:['./externalInvestments33.js'"),'41.5 lazy boot must not schedule data seed modules directly');
for(const [name,src] of [['Director',directorUi],['Waiting For',followUi],['Deadline Radar',radarUi]]){
 assert.ok(!src.includes('subtree:true'),`41.6 ${name} must not use broad subtree observers`);
 assert.ok(src.includes('const setHtml='),`41.6 ${name} must use stable DOM writes`);
}
assert.ok(!directorUi.includes('.observe(document.body'),'41.6 Director must not observe the whole document body');
assert.ok(!directorUi.includes('function start(){ensureBook()'),'41.6 Director import must not initialize state automatically');
assert.ok(followEngine.includes("hello=informal?(person?`Ahoj ${person},`:'Ahoj,'):'Dobrý den,'"),'41.6 formal follow-up greeting must stay neutral and grammatically safe');

console.log(`KAMIL OS CURRENT SMOKE QA PASS · ${version}`);
