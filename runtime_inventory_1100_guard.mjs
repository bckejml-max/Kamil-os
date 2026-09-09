import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
import {join,relative} from 'node:path';
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
const budgets={timers:464,listeners:846,intervals:40};
const targets={timers:375,listeners:700,intervals:0};
assert.ok(totals.timers<=budgets.timers,`OS1100 timer budget regression: ${totals.timers} > ${budgets.timers}`);
assert.ok(totals.listeners<=budgets.listeners,`OS1100 listener budget regression: ${totals.listeners} > ${budgets.listeners}`);
assert.ok(totals.intervals<=budgets.intervals,`OS1100 interval budget regression: ${totals.intervals} > ${budgets.intervals}`);
console.log(JSON.stringify({name:'OS1100 runtime inventory',totals,budgets,targets,topHotspots:hotspots.slice(0,20)},null,2));
