import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const src=await readFile(new URL('./js/app.js',import.meta.url),'utf8');

assert.ok(src.includes("./runtimeOwnership1100.js"),'app.js must import OS1100 runtime ownership');
assert.ok(src.includes("./osHardening1110.js"),'app.js must import OS1110 owned frame/idle scheduling');
assert.ok(src.includes("const OWNER='core.app41'"),'app.js must keep a stable runtime owner');
assert.ok(src.includes('installRuntimeOwnership1100()'),'app.js must install OS1100 runtime ownership');
assert.ok(src.includes('ownEvent1100('),'app.js must route global event subscriptions through OS1100 ownership');
assert.ok(src.includes('ownCleanup1100('),'app.js must own long-lived subscriptions');
assert.ok(src.includes('schedule1100('),'app.js must route timeouts through OS1100 scheduling');
assert.ok(src.includes('scheduleFrame1110('),'app.js must route animation frames through OS1110 scheduling');
assert.ok(src.includes('scheduleIdle1110('),'app.js must route idle work through OS1110 scheduling');
assert.equal((src.match(/\bsetTimeout\s*\(/g)||[]).length,0,'app.js must not use raw setTimeout');
assert.equal((src.match(/\bclearTimeout\s*\(/g)||[]).length,0,'app.js must not use raw clearTimeout');
assert.equal((src.match(/\bsetInterval\s*\(/g)||[]).length,0,'app.js must not use raw setInterval');
assert.equal((src.match(/\brequestAnimationFrame\s*\(/g)||[]).length,0,'app.js must not use raw requestAnimationFrame');
assert.equal((src.match(/\brequestIdleCallback\s*\(/g)||[]).length,0,'app.js must not use raw requestIdleCallback');
assert.equal((src.match(/\bnew\s+MutationObserver\s*\(/g)||[]).length,0,'app.js must not create raw MutationObserver');
assert.equal((src.match(/\bwindow\.addEventListener\s*\(/g)||[]).length,0,'app.js must not own raw window listeners');
assert.equal((src.match(/\bdocument\.addEventListener\s*\(/g)||[]).length,0,'app.js must not own raw document listeners');

console.log('OS1114 app lifecycle guard PASS: core app timers, frames, idle work, subscriptions and events are runtime-owned');
