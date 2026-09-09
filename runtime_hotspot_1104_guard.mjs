import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const files=[
 ['platform431Stability','./js/platform431Stability.js','core.platform431Stability'],
 ['bettingAutoSettle544','./js/bettingAutoSettle544.js','betting.autoSettle544'],
 ['bettingBrowserFeed694','./js/bettingBrowserFeed694.js','betting.browserFeed695']
];
for(const [name,path,owner] of files){
 const src=await read(path);
 assert.ok(src.includes(owner),`${name} must declare/use OS1100 owner ${owner}`);
 assert.ok(src.includes('schedule1100'),`${name} must schedule recurring work through OS1100`);
 assert.ok(src.includes('activateDomain1100'),`${name} must activate an OS1100 domain`);
 assert.equal((src.match(/setInterval\s*\(/g)||[]).length,0,`${name} must not use raw setInterval`);
}
const stability=await read('./js/platform431Stability.js');
const browser=await read('./js/bettingBrowserFeed694.js');
const settle=await read('./js/bettingAutoSettle544.js');
assert.equal((stability.match(/addEventListener\s*\(/g)||[]).length,0,'platform431Stability must not own raw listeners');
assert.equal((browser.match(/addEventListener\s*\(/g)||[]).length,0,'bettingBrowserFeed694 must not own raw listeners');
assert.ok(settle.includes('runSingleFlight1100'),'betting auto-settlement must be single-flight');
console.log('OS1104 polling guard PASS: platform heartbeat/watchdog and betting auto-settle/browser-feed polling are OS1100-owned');
