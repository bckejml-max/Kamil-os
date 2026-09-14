import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');

const [index,hardening,dataIntegrity,cloud,state,gmail,app]=await Promise.all([
 read('./index.html'),read('./js/osHardening1110.js'),read('./js/dataIntegrity1130.js'),read('./js/cloud.js'),read('./js/state.js'),read('./api/ticket-gmail-sync.js'),read('./js/app.js')
]);

assert.ok(index.indexOf('./js/osHardening1110.js')<index.indexOf('./js/instantShell64.js'),'hardening must load before app boot');
assert.ok(index.includes('./js/dataIntegrity1130.js'),'data integrity monitor must load');

for(const token of ['unhandledrejection','API_TIMEOUT_MS','X-Kamil-Action-Id','X-Kamil-Client-Version','version-mismatch','runtime-growth','Europe/Prague','runSingleFlight1100','runtimeSnapshot1100'])assert.ok(hardening.includes(token),`hardening missing ${token}`);
assert.ok(hardening.includes("pathname.startsWith('/api/')"),'fetch hardening must be scoped to same-origin API only');
assert.ok(hardening.includes('AbortController'),'API calls must have abort timeout protection');

for(const token of ['validateState','RECOVERY_KEY','settledBaseline','settledViolations','repairSettled','integrity-auto-repair','store.subscribe','ownEvent1100','schedule1100'])assert.ok(dataIntegrity.includes(token),`data integrity missing ${token}`);
assert.ok(dataIntegrity.includes("store.replace(corrected,'integrity-auto-repair')"),'settled bet / duplicate transaction violations must be actively repaired, not only observed');
assert.equal((dataIntegrity.match(/\bwindow\.addEventListener\s*\(/g)||[]).length,0,'data integrity must not own raw window listeners');
assert.equal((dataIntegrity.match(/\bsetTimeout\s*\(/g)||[]).length,0,'data integrity must not own raw timeouts');

for(const token of ['runtimeOwnership1100.js',"const OWNER='cloud.core32'",'sessionEpoch','STALE_SESSION','CLOUD_TIMEOUT_MS','withCloudTimeout','onSyncStatus','statusFns','pauseWhenHidden'])assert.ok(cloud.includes(token),`cloud hardening missing ${token}`);
assert.equal((cloud.match(/\bwindow\.addEventListener\s*\(/g)||[]).length,0,'cloud must not own raw window listeners');
assert.equal((cloud.match(/\bsetTimeout\s*\(/g)||[]).length,0,'cloud must not own raw setTimeout');
assert.ok(cloud.includes("ownEvent1100(OWNER,window,'online'"),'online sync must be runtime-owned');
assert.ok(cloud.includes("ownEvent1100(OWNER,window,'offline'"),'offline status must be runtime-owned');
assert.ok(cloud.includes('futureSchema'),'future cloud schema must fail closed');
assert.ok(cloud.includes("choice==='cloud'")&&cloud.includes("choice==='local'"),'cloud conflict resolution must stay explicit');

for(const token of ['validateState','repairState','compactUndo','MAX_UNDO','queueSync','undo:[]','Duplicitní ID'])assert.ok(state.includes(token),`state safety missing ${token}`);
assert.ok(state.includes('schemaVersion=SCHEMA_VERSION'),'state writes must retain current schema');

for(const token of ['AUTH_REQUIRED','GMAIL_ACCOUNT_NOT_AUTHORIZED','AbortController','timeoutMs','retryableStatus',"req.method!=='POST'"])assert.ok(gmail.includes(token),`gmail safety missing ${token}`);
assert.ok(gmail.includes('msg.id')&&gmail.includes('threadId'),'gmail rows must carry stable replay identifiers');

assert.ok(app.includes('renderSeq'),'app must keep stale render sequence guard');
assert.ok(app.includes('sessionSeq'),'app must keep stale session sequence guard');
assert.ok(app.includes('withActionLock'),'app must keep duplicate action lock');
assert.equal((app.match(/\bsetInterval\s*\(/g)||[]).length,0,'app must not use raw setInterval');
assert.equal((app.match(/\bnew\s+MutationObserver\s*\(/g)||[]).length,0,'app must not create raw MutationObserver');

console.log('OS1159 full hardening guard PASS: runtime, cloud, data, Gmail, API and release contracts protected');
