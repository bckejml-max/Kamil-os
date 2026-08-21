import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=f=>fs.readFileSync(f,'utf8');
const shell=read('js/instantShell42.js');
const lite=read('js/todayLite43.js');
const state=read('js/state.js');
const runtime=read('js/viewRuntime41.js');
const sw=read('sw.js');
const meta=read('js/releaseMeta.js');

const version=meta.match(/APP_VERSION='(\d+)\.(\d+)\.(\d+)'/)?.slice(1).map(Number);
const progressiveOk=version&&(version[0]>41||(version[0]===41&&version[1]>=3));
assert.ok(progressiveOk,'41.3+ progressive release metadata missing');
assert.ok(shell.includes('partitionReady()'),'repeat-boot partition fast path missing');
assert.ok(shell.includes("window.__KAMIL_PARTITION_READY_AT_BOOT__"),'partition diagnostic missing');
assert.ok(shell.includes('bindEarlyNavigation()'),'early navigation missing');
assert.ok(shell.includes("import('./app.js')"),'app progressive import missing');
assert.ok(lite.includes("import('./today29.js')"),'full Today must remain available');
assert.ok(lite.includes('requestIdleCallback'),'full Today must wait for browser idle time');
assert.ok(lite.includes('Math.max(12000,delay)')&&lite.includes('15000'),'Today must enforce a real minimum grace period before heavy hydration');
assert.ok(shell.includes("finish('safe-timeout')")&&shell.includes('6000'),'instant shell must have a bounded interactive wait');
assert.ok(runtime.includes("today:['./todayLite43.js','renderTodayLite43']"),'runtime must boot through lightweight Today');
assert.ok(state.includes('if(previous.storage)next.storage=previous.storage'),'boot summary must preserve partition metadata');
assert.ok(state.includes('this.persist();'),'legacy compaction must use the active persistence strategy');
assert.ok(sw.includes('instantNavigate'),'service worker cache-first navigation missing');
assert.ok(sw.includes('staleWhileRevalidate'),'runtime stale-while-revalidate missing');

console.log(`KAMIL OS ${version.join('.')} PROGRESSIVE BOOT STATIC TEST PASS`);
