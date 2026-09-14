import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const src=await readFile(new URL('./js/state.js',import.meta.url),'utf8');

assert.match(src,/schedule1100/,'OS1132 state maintenance must use OS1100 scheduling');
assert.equal((src.match(/\bsetTimeout\s*\(/g)||[]).length,0,'OS1132 state.js must not use raw setTimeout');
assert.match(src,/STAGE_KEY='kamil-os-state-stage-1132'/,'OS1132 state persistence must use a staging key');
assert.match(src,/RECOVERY_KEY='kamil-os-state-recovery-1131'/,'OS1132 state persistence must retain corrupt payload recovery');
assert.match(src,/localStorage\.setItem\(STAGE_KEY,payload\)/,'OS1132 persistence must stage before commit');
assert.match(src,/localStorage\.setItem\(LOCAL_KEY,payload\)/,'OS1132 persistence must commit staged payload to canonical storage');
assert.match(src,/persist-blocked-invalid-state/,'OS1132 invalid fatal state must fail closed into recovery');
assert.match(src,/STATE_PERSIST_BLOCKED/,'OS1132 invalid fatal state must block persistence');

console.log('OS1132 state persistence guard PASS: staged, recoverable, runtime-owned storage lifecycle');
