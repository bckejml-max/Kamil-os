import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const src=await readFile(new URL('./js/app.js',import.meta.url),'utf8');

assert.ok(src.includes("./runtimeOwnership1100.js"),'app.js must import OS1100 runtime ownership');
assert.ok(src.includes("const OWNER='core.app41'"),'app.js must keep a stable runtime owner');
assert.ok(src.includes('installRuntimeOwnership1100()'),'app.js must install OS1100 runtime ownership');
assert.ok(src.includes('ownEvent1100('),'app.js must route global event subscriptions through OS1100 ownership');
assert.equal((src.match(/\bsetInterval\s*\(/g)||[]).length,0,'app.js must not use raw setInterval');
assert.equal((src.match(/\bnew\s+MutationObserver\s*\(/g)||[]).length,0,'app.js must not create raw MutationObserver');
assert.equal((src.match(/\bwindow\.addEventListener\s*\(/g)||[]).length,0,'app.js must not own raw window listeners');
assert.equal((src.match(/\bdocument\.addEventListener\s*\(/g)||[]).length,0,'app.js must not own raw document listeners');

console.log('OS1109 app lifecycle guard PASS: core app global lifecycle stays OS1100-owned');
