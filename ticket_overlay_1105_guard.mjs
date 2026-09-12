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
 ['ticketRecoveryHydration188','./js/ticketRecoveryHydration188.js','tickets.recovery188'],
 ['ticketActionQueue410','./js/ticketActionQueue410.js','tickets.action410'],
 ['ticketSettlement411','./js/ticketSettlement411.js','tickets.settlement411'],
 ['ticketGmailSync429','./js/ticketGmailSync429.js','tickets.gmail429'],
 ['ticketLayoutGuard458','./js/ticketLayoutGuard458.js','tickets.layout458'],
 ['ticketRuntimeHealth455','./js/ticketRuntimeHealth455.js','tickets.runtime455'],
 ['ticketRecovery456','./js/ticketRecovery456.js','tickets.recovery456'],
 ['ticketWorkflow461','./js/ticketWorkflow461.js','tickets.workflow461'],
 ['ticketEventStrategy464','./js/ticketEventStrategy464.js','tickets.event464']
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
for(const [,path] of files){
 const src=await read(path);
 if(/cloudClient|loadTicketCloud660|updateTicketTracking660|fetch\('\/api\//.test(src))assert.ok(/\b(?:isActive|active)\s*=\s*\(\)\s*=>/.test(src),`${path} must gate cloud/network work to the active Ticket view`);
}
const decision=await read('./js/ticketDecision507.js');
assert.ok(decision.includes("schedule1100(OWNER,'cadence'"),'ticketDecision507 cadence must be OS1100 scheduled');
const runtime=await read('./js/ticketRuntimeHealth455.js');
const recovery=await read('./js/ticketRecovery456.js');
for(const [name,src] of [['RuntimeHealth455',runtime],['Recovery456',recovery]])assert.ok(src.includes("schedule1100(OWNER,'cadence'"),`${name} cadence must be OS1100 scheduled`);
console.log(`OS1105 Ticket lifecycle guard PASS: ${files.length} modules are owner-scoped and free of raw polling/window/document/MutationObserver lifecycles`);
