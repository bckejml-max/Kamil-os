import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const [src,cold,backup,cloud,recovery,more,settings]=await Promise.all([readFile(new URL('./js/state.js',import.meta.url),'utf8'),readFile(new URL('./js/coldPartition42.js',import.meta.url),'utf8'),readFile(new URL('./js/backupGuard26.js',import.meta.url),'utf8'),readFile(new URL('./js/cloud.js',import.meta.url),'utf8'),readFile(new URL('./js/recoveryShield32.js',import.meta.url),'utf8'),readFile(new URL('./js/more26.js',import.meta.url),'utf8'),readFile(new URL('./js/personalSettings647.js',import.meta.url),'utf8')]);

assert.match(src,/schedule1100/,'OS1132 state maintenance must use OS1100 scheduling');
assert.equal((src.match(/\bsetTimeout\s*\(/g)||[]).length,0,'OS1132 state.js must not use raw setTimeout');
assert.match(src,/STAGE_KEY='kamil-os-state-stage-1132'/,'OS1132 state persistence must use a staging key');
assert.match(src,/RECOVERY_KEY='kamil-os-state-recovery-1131'/,'OS1132 state persistence must retain corrupt payload recovery');
assert.match(src,/localStorage\.setItem\(STAGE_KEY,payload\)/,'OS1132 persistence must stage before commit');
assert.match(src,/localStorage\.setItem\(LOCAL_KEY,payload\)/,'OS1132 persistence must commit staged payload to canonical storage');
assert.match(src,/persist-blocked-invalid-state/,'OS1132 invalid fatal state must fail closed into recovery');
assert.match(src,/STATE_PERSIST_BLOCKED/,'OS1132 invalid fatal state must block persistence');

console.log('OS1132 state persistence guard PASS: staged, recoverable, runtime-owned storage lifecycle');


assert.match(cold,/LAYOUT_VERSION=4/,'OS1310 cold storage layout v4 must be active');
assert.match(cold,/ownEvent1100/,'OS1310 cold lifecycle must use owned listeners');
assert.equal((cold.match(/\bdocument\.addEventListener\s*\(/g)||[]).length,0,'OS1310 cold partition must not own raw document listeners');
assert.equal((cold.match(/\bwindow\.addEventListener\s*\(/g)||[]).length,0,'OS1310 cold partition must not own raw window listeners');
assert.match(cold,/replaceColdState42/,'OS1310 must support authoritative cold-state replacement');
assert.match(backup,/mergeColdState42/,'OS1310 canonical backup must rehydrate cold history');
assert.match(cloud,/replaceColdState42\(merged\)/,'OS1310 cloud accept must overwrite stale cold history');
assert.match(recovery,/replaceColdState42\(merged\)/,'OS1310 recovery restore must overwrite stale cold history');
assert.match(more,/replaceColdState42\(repaired\.state\)/,'OS1310 JSON restore must overwrite stale cold history');
assert.match(settings,/mergeColdState42/,'OS1310 personal/full exports must include cold history');
