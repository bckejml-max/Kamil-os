import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
const root=new URL('./',import.meta.url);
const read=p=>readFile(new URL(p,root),'utf8');
const runtime=await read('./js/runtimeCoordinator1050.js');
const betting=await read('./js/bettingBootstrap543.js');
const wrappers=['oneOS967Boot.js','oneOS977Boot.js','legacyCleanup987Boot.js','controlPlane1037Boot.js','controlOperations1047Boot.js'];
for(const name of wrappers){
 const src=await read(`./js/${name}`);
 assert.ok(src.includes('scheduleRuntime1050'),`${name} must delegate to OS1050`);
 assert.equal((src.match(/setTimeout\s*\(/g)||[]).length,0,`${name} must not own fallback timers`);
 assert.equal((src.match(/addEventListener\s*\(/g)||[]).length,0,`${name} must not own lifecycle listeners`);
}
for(const token of [
 "['oneOS967','./oneOS967.js','installOneOS967'",
 "['oneOS977','./oneOS977.js','installOneOS977'",
 "['legacyCleanup987','./legacyCleanup987.js','installLegacyCleanup987'",
 "['controlPlane1037','./controlPlane1037.js','installControlPlane1037'",
 "['controlOperations1047','./controlOperations1047.js','installControlOperations1047'"
])assert.ok(runtime.includes(token),`Runtime stage missing: ${token}`);
assert.ok(runtime.includes('if(bootPromise)return bootPromise'),'runtime boot must be single-flight');
assert.ok(runtime.includes('if(state.complete||state.scheduled)'),'runtime scheduling must be idempotent');
assert.equal((runtime.match(/setInterval\s*\(/g)||[]).length,0,'runtime coordinator must not poll');
assert.ok((runtime.match(/addEventListener\s*\(/g)||[]).length<=2,'runtime coordinator listener budget exceeded');
assert.ok((runtime.match(/setTimeout\s*\(/g)||[]).length<=1,'runtime coordinator timer budget exceeded');
assert.ok(betting.includes("import('./runtimeCoordinator1050.js')"),'betting bootstrap must wire OS1050');
for(const name of wrappers)assert.equal(betting.includes(`import('./${name}')`),false,`betting bootstrap must not directly import ${name}`);
assert.equal((betting.match(/setTimeout\s*\(/g)||[]).length,0,'betting bootstrap re-entry must not schedule timers');
assert.ok(betting.includes('__KAMIL_BETTING_NAV_BOOT_HANDLER695__'),'betting navigation handler must be singleton');
const bootFiles=(await readdir(new URL('./js/',root))).filter(x=>/Boot\.js$/.test(x));
console.log(`Runtime boot guard PASS: OS1050 single-flight, ${wrappers.length} legacy wrappers timer/listener-free, ${bootFiles.length} Boot modules in repo`);
