import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const files=[
 ['ticketPolish501','./js/ticketPolish501.js','tickets.polish501'],
 ['ticketLayout502','./js/ticketLayout502.js','tickets.layout502'],
 ['ticketRail503','./js/ticketRail503.js','tickets.rail503'],
 ['ticketStability504','./js/ticketStability504.js','tickets.stability504'],
 ['ticketAnchor505','./js/ticketAnchor505.js','tickets.anchor505'],
 ['ticketEconomics506','./js/ticketEconomics506.js','tickets.economics506'],
 ['ticketDecision507','./js/ticketDecision507.js','tickets.decision507'],
 ['ticketGrouping508','./js/ticketGrouping508.js','tickets.grouping508'],
 ['ticketEventDetail509','./js/ticketEventDetail509.js','tickets.event509'],
 ['ticketExecutive510','./js/ticketExecutive510.js','tickets.executive510'],
 ['ticketRecoveryHydration188','./js/ticketRecoveryHydration188.js','tickets.recovery188']
];
for(const [name,path,owner] of files){
 const src=await read(path);
 assert.ok(src.includes(owner),`${name} must declare/use OS1100 owner ${owner}`);
 assert.ok(src.includes("./runtimeOwnership1100.js"),`${name} must import OS1100 runtime ownership`);
 assert.equal((src.match(/setInterval\s*\(/g)||[]).length,0,`${name} must not use raw setInterval`);
 assert.equal((src.match(/window\.addEventListener\s*\(/g)||[]).length,0,`${name} must not own raw window listeners`);
 assert.equal((src.match(/document\.addEventListener\s*\(/g)||[]).length,0,`${name} must not own raw document listeners`);
 assert.equal((src.match(/new\s+MutationObserver\s*\(/g)||[]).length,0,`${name} must not create raw MutationObserver`);
}
for(const path of ['./js/ticketEconomics506.js','./js/ticketDecision507.js','./js/ticketGrouping508.js','./js/ticketEventDetail509.js','./js/ticketExecutive510.js','./js/ticketRecoveryHydration188.js']){
 const src=await read(path);
 assert.ok(/const\s+(?:isActive|active)=\(\)=>/.test(src),`${path} must gate work to the active Ticket view`);
}
const decision=await read('./js/ticketDecision507.js');
assert.ok(decision.includes("schedule1100(OWNER,'cadence'"),'ticketDecision507 cadence must be OS1100 scheduled');
console.log(`OS1105 Ticket overlay guard PASS: ${files.length} overlays are owner-scoped and free of raw polling/window/document/MutationObserver lifecycles`);
