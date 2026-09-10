import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
const root=new URL('./',import.meta.url);
const read=p=>readFile(new URL(p,root),'utf8');
const runtime=await read('./js/runtimeCoordinator1050.js');
const betting=await read('./js/bettingBootstrap543.js');
const shell=await read('./js/instantShell64.js');
const wrappers=['oneOS967Boot.js','oneOS977Boot.js','legacyCleanup987Boot.js','controlPlane1037Boot.js','controlOperations1047Boot.js'];
for(const name of wrappers){
 const src=await read(`./js/${name}`);
 assert.ok(src.includes('scheduleRuntime1050'),`${name} must remain a compatibility adapter`);
 assert.equal((src.match(/setTimeout\s*\(/g)||[]).length,0,`${name} must not own fallback timers`);
 assert.equal((src.match(/addEventListener\s*\(/g)||[]).length,0,`${name} must not own lifecycle listeners`);
}
assert.ok(runtime.includes('if(bootPromise)return bootPromise'),'legacy runtime coordinator must remain single-flight if explicitly invoked');
assert.equal((runtime.match(/setInterval\s*\(/g)||[]).length,0,'legacy runtime coordinator must not poll');
assert.match(shell,/architecture:'os2-on-demand'/,'OS2 shell architecture marker missing');
assert.equal(shell.includes('runtimeCoordinator1050'),false,'OS2 shell must not boot legacy runtime coordinator');
assert.equal(betting.includes('runtimeCoordinator1050'),false,'Betting must not boot the global legacy runtime stack');
assert.equal(betting.includes('commandCopilot840'),false,'Betting must not boot global Copilot');
assert.equal(betting.includes('strategyCommand790'),false,'Betting must not boot global strategy command layer');
assert.match(betting,/export function installBettingBootstrap543/,'Betting must expose a view-owned bootstrap');
assert.equal((betting.match(/addEventListener\s*\(/g)||[]).length,0,'Betting bootstrap must not own global navigation listeners');
const bootFiles=(await readdir(new URL('./js/',root))).filter(x=>/Boot\.js$/.test(x));
console.log(`Runtime boot guard PASS: OS2 on-demand shell, legacy coordinator detached, ${bootFiles.length} compatibility Boot modules retained`);
