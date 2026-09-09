import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const hubs=[
 ['betting','./js/bettingHub630.js','betting.hub630'],
 ['tickets','./js/ticketHub640.js','tickets.hub640']
];
for(const [name,path,owner] of hubs){
 const src=await read(path);
 assert.ok(src.includes(`OWNER='${owner}'`)||src.includes(`OWNER=\'${owner}\'`),`${name} hub must declare OS1100 owner ${owner}`);
 assert.ok(src.includes('ownEvent1100'),`${name} hub must use owned event subscriptions`);
 assert.ok(src.includes('schedule1100'),`${name} hub must use the OS1100 scheduler`);
 assert.ok(src.includes('activateDomain1100'),`${name} hub must activate its runtime domain`);
 assert.equal((src.match(/setInterval\s*\(/g)||[]).length,0,`${name} hub must not poll with setInterval`);
 assert.equal((src.match(/addEventListener\s*\(/g)||[]).length,0,`${name} hub must not own raw event listeners`);
 assert.equal((src.match(/setTimeout\s*\(/g)||[]).length,0,`${name} hub must not own raw timeouts`);
 assert.equal((src.match(/clearTimeout\s*\(/g)||[]).length,0,`${name} hub must not own raw timeout cancellation`);
}
console.log('OS1101 hotspot guard PASS: Betting and Ticket hubs are event-driven OS1100 owners with no raw polling/listeners/timeouts');
