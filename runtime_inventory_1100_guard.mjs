import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
import {relative} from 'node:path';
const root=new URL('./',import.meta.url);
const jsRoot=new URL('./js/',root);
async function walk(dirUrl){
 const out=[];
 for(const entry of await readdir(dirUrl,{withFileTypes:true})){
  const child=new URL(`${entry.name}${entry.isDirectory()?'/':''}`,dirUrl);
  if(entry.isDirectory())out.push(...await walk(child));
  else if(entry.name.endsWith('.js'))out.push(child);
 }
 return out;
}
const files=await walk(jsRoot);
const totals={files:files.length,timers:0,intervals:0,listeners:0,mutationObservers:0,resizeObservers:0};
const hotspots=[];
for(const file of files){
 const src=await readFile(file,'utf8');
 const row={file:relative(new URL('.',root).pathname,file.pathname),timers:(src.match(/setTimeout\s*\(/g)||[]).length,intervals:(src.match(/setInterval\s*\(/g)||[]).length,listeners:(src.match(/addEventListener\s*\(/g)||[]).length,mutationObservers:(src.match(/new\s+MutationObserver\s*\(/g)||[]).length,resizeObservers:(src.match(/new\s+ResizeObserver\s*\(/g)||[]).length};
 totals.timers+=row.timers;totals.intervals+=row.intervals;totals.listeners+=row.listeners;totals.mutationObservers+=row.mutationObservers;totals.resizeObservers+=row.resizeObservers;
 if(row.timers+row.intervals+row.listeners+row.mutationObservers+row.resizeObservers)hotspots.push(row);
}
hotspots.sort((a,b)=>(b.timers+b.intervals+b.listeners+b.mutationObservers+b.resizeObservers)-(a.timers+a.intervals+a.listeners+a.mutationObservers+a.resizeObservers));
const intervalHotspots=hotspots.filter(row=>row.intervals>0).sort((a,b)=>b.intervals-a.intervals||b.timers-a.timers||a.file.localeCompare(b.file));
const budgets={timers:401,listeners:769,intervals:41};
const targets={timers:350,listeners:650,intervals:0};
assert.ok(totals.timers<=budgets.timers,`OS1200 timer budget regression: ${totals.timers} > ${budgets.timers}`);
assert.ok(totals.listeners<=budgets.listeners,`OS1200 listener budget regression: ${totals.listeners} > ${budgets.listeners}`);
assert.ok(totals.intervals<=budgets.intervals,`OS1200 interval budget regression: ${totals.intervals} > ${budgets.intervals}`);
const today=await readFile(new URL('./js/todayLite43.js',root),'utf8');
assert.equal((today.match(/addEventListener\s*\(/g)||[]).length,0,'OS1110 Today must keep a single delegated click router');
assert.match(today,/confidenceFor/,'OS1110 Today must expose priority confidence');
assert.match(today,/whyFor/,'OS1110 Today must explain priority ranking');
const health=await readFile(new URL('./js/runtimeHealth1120.js',root),'utf8');
assert.match(health,/PerformanceObserver/,'OS1120 must measure long tasks');
assert.match(health,/recordModuleFailure1120/,'OS1120 must track repeated module failures');
assert.match(health,/q\.count>=3/,'OS1120 self-healing quarantine threshold must remain explicit');
assert.equal((health.match(/setInterval\s*\(/g)||[]).length,0,'OS1120 must not add polling intervals');
const decision=await readFile(new URL('./js/decisionCore1140.js',root),'utf8');
assert.match(decision,/noAction/,'OS1140 must support an explicit do-nothing recommendation');
assert.match(decision,/HISTORY/,'OS1140 must retain bounded recommendation history');
assert.match(decision,/conflicts/,'OS1140 must expose recommendation conflicts');
const links=await readFile(new URL('./js/linkGraph1150.js',root),'utf8');
assert.match(links,/duplicates/,'OS1150 must expose duplicate candidates');
const waiting=await readFile(new URL('./js/waitingIntelligence1160.js',root),'utf8');
assert.match(waiting,/escalate/,'OS1160 must expose escalation candidates');
assert.match(waiting,/suggestedAt/,'OS1160 must suggest a concrete next follow-up');
const risk=await readFile(new URL('./js/financeRisk1180.js',root),'utf8');
assert.match(risk,/monthlyInterest/,'OS1180 must calculate known bank interest');
assert.match(risk,/riskPct/,'OS1180 must expose cross-domain risk');
const ui=await readFile(new URL('./js/runtimeHealthUi1200.js',root),'utf8');
assert.match(ui,/data-os-health-1046/,'OS1200 health ribbon must open the unified health screen');
assert.match(ui,/SELF-HEALING/,'OS1200 health UI must surface quarantine state');
const coordinator=await readFile(new URL('./js/runtimeCoordinator1050.js',root),'utf8');
for(const token of ['runtimeHealth1120','decisionCore1140','linkGraph1150','waitingIntelligence1160','financeRisk1180','runtimeHealthUi1200'])assert.match(coordinator,new RegExp(token),`OS1200 canonical coordinator missing ${token}`);
console.log(JSON.stringify({name:'OS1200 runtime + intelligence contract',totals,budgets,targets,topHotspots:hotspots.slice(0,20),intervalHotspots},null,2));
