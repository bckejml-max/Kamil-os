import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=f=>fs.readFileSync(f,'utf8');
const shell=read('js/instantShell42.js');
const lite=read('js/todayLite43.js');
const runtime=read('js/viewRuntime41.js');
const sw=read('sw.js');
const meta=read('js/releaseMeta.js');
const personalIntel=read('js/personalIntelligence441.js');
const life=read('js/lifeDashboard455.js');
const lifeFiles=['lifePlanner446.js','cashflow447.js','wealth448.js','ticketIntel449.js','inbox450.js','maintenance451.js','family452.js','goals453.js','decision454.js','lifeDashboard455.js'].map(f=>read(`js/${f}`));

const version=meta.match(/APP_VERSION='(\d+)\.(\d+)\.(\d+)'/)?.slice(1).map(Number);
assert.ok(version&&version[0]>=43,'Safe Core release metadata missing');
assert.ok(shell.includes('window.__KAMIL_SAFE_CORE__=true'),'Safe Core boot flag missing');
assert.ok(shell.includes('bindEarlyNavigation()'),'early navigation missing');
assert.ok(shell.includes("import('./app.js')"),'core app import missing');
assert.ok(lite.includes("import('./today29.js')"),'full Today must remain manually available');
assert.ok(!lite.includes('scheduleFull('),'full Today must never auto-hydrate');
assert.ok(!lite.includes('requestIdleCallback'),'Today must not schedule hidden idle hydration');
assert.ok(lite.includes("import('./lifeDashboard455.js')"),'Unified Life Dashboard must be lazy imported on explicit click');
assert.ok(lite.includes('data-life-dashboard'),'Unified Life Dashboard click control missing');
assert.ok(!lite.includes('data-safe-intel="work"'),'Work Command Center must not be exposed in personal core UI');
assert.ok(lite.includes('MARKET COCKPIT 53.3')&&lite.includes('__KAMIL_MARKET_TOP3_533_LAST__')&&lite.includes('__KAMIL_PERSONAL_HOME_531_LAST__'),'Market Home 53.3 lightweight cockpit contract missing');
assert.ok(lite.includes('smartMarketTop3(')&&lite.includes('ticketStats(')&&lite.includes('xtbStats('),'Market Home 53.3 decision signals missing');
assert.ok(runtime.includes('export function prefetchView41(){return Promise.resolve(null)}'),'hover/focus prefetch must stay disabled');
assert.ok(runtime.includes('export function renderExtras41(){return Promise.resolve([])}'),'background extras must stay disabled');
assert.ok(runtime.includes('export function refreshRiskBadge41(){return Promise.resolve(null)}'),'background risk calculation must stay disabled');
assert.ok(runtime.includes('export function scheduleNotifications41(){return Promise.resolve(null)}'),'background notification calculations must stay disabled');
assert.ok(runtime.includes('export function warmRuntime41(){return Promise.resolve(null)}'),'runtime warming must stay disabled');
assert.ok(!personalIntel.includes('setInterval(')&&!personalIntel.includes('requestIdleCallback')&&!personalIntel.includes('store.subscribe('),'Legacy Personal Intelligence must stay purely on-demand');
for(const file of lifeFiles){assert.ok(!file.includes('setInterval(')&&!file.includes('requestIdleCallback')&&!file.includes('store.subscribe('),'Life OS engines must be purely click-only');assert.ok(!file.includes('store.update(')&&!file.includes('store.patch('),'Life OS engines must stay read-only')}
assert.ok(life.includes('Unified Life Dashboard 53.0')&&life.includes('lifeDashboard455'),'Unified Life Dashboard 53.0 contract missing');
assert.ok(sw.includes('networkFirst'),'Safe Core service worker must prefer fresh runtime code');
assert.ok(!sw.includes('staleWhileRevalidate'),'Safe Core must not serve stale runtime code first');

console.log(`KAMIL OS ${version.join('.')} MARKET HOME 53.3 PERFORMANCE STATIC TEST PASS`);