import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=f=>fs.readFileSync(f,'utf8');
const shell=read('js/instantShell42.js');
const lite=read('js/todayLite43.js');
const runtime=read('js/viewRuntime41.js');
const sw=read('sw.js');
const meta=read('js/releaseMeta.js');
const safeIntel=read('js/safeIntelligence438.js');

const version=meta.match(/APP_VERSION='(\d+)\.(\d+)\.(\d+)'/)?.slice(1).map(Number);
assert.ok(version&&version[0]>=43,'Safe Core release metadata missing');
assert.ok(shell.includes('window.__KAMIL_SAFE_CORE__=true'),'Safe Core boot flag missing');
assert.ok(shell.includes('bindEarlyNavigation()'),'early navigation missing');
assert.ok(shell.includes("import('./app.js')"),'core app import missing');
assert.ok(lite.includes("import('./today29.js')"),'full Today must remain manually available');
assert.ok(!lite.includes('scheduleFull('),'full Today must never auto-hydrate');
assert.ok(!lite.includes('requestIdleCallback'),'Today must not schedule hidden idle hydration');
assert.ok(lite.includes("import('./safeIntelligence438.js')"),'Safe Intelligence must be lazy imported on explicit click');
assert.ok(runtime.includes('export function prefetchView41(){return Promise.resolve(null)}'),'hover/focus prefetch must stay disabled');
assert.ok(runtime.includes('export function renderExtras41(){return Promise.resolve([])}'),'background extras must stay disabled');
assert.ok(runtime.includes('export function refreshRiskBadge41(){return Promise.resolve(null)}'),'background risk calculation must stay disabled');
assert.ok(runtime.includes('export function scheduleNotifications41(){return Promise.resolve(null)}'),'background notification calculations must stay disabled');
assert.ok(runtime.includes('export function warmRuntime41(){return Promise.resolve(null)}'),'runtime warming must stay disabled');
assert.ok(!safeIntel.includes('setInterval(')&&!safeIntel.includes('requestIdleCallback')&&!safeIntel.includes('store.subscribe('),'Safe Intelligence must stay purely on-demand');
assert.ok(safeIntel.includes('window.__KAMIL_SAFE_INTEL_LAST__'),'Safe Intelligence must expose timing measurement');
assert.ok(sw.includes('networkFirst'),'Safe Core service worker must prefer fresh runtime code');
assert.ok(!sw.includes('staleWhileRevalidate'),'Safe Core must not serve stale runtime code first');

console.log(`KAMIL OS ${version.join('.')} SAFE CORE PERFORMANCE STATIC TEST PASS`);
