import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('64.4 turns family events into one deduplicated preparation task',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const out=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  store.mutate('seed 64.4',s=>{s.tasks=[];s.calendar={events:[{id:'fam-e1',title:'Rodinná návštěva',start:new Date(Date.now()+3*86400000).toISOString()}]};},{undo:false,cloud:false,audit:false});
  const m=await import('./js/personalFamilyHomeActions644.js'),event=store.get().calendar.events[0];m.prepareFamilyEvent644(event);m.prepareFamilyEvent644(event);
  const tasks=store.get().tasks.filter(x=>x.sourceEventId==='fam-e1');return{count:tasks.length,title:tasks[0]?.title,due:tasks[0]?.due};
 });
 expect(out.count).toBe(1);expect(out.title).toMatch(/Připravit/);expect(out.due).toBeTruthy();
});

test('64.4 maps maintenance rows into existing personal action workflow',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const out=await page.evaluate(async()=>{const m=await import('./js/personalFamilyHomeActions644.js');return m.maintenanceAction644({id:'m1',title:'Servis rekuperace',estimateMinutes:20},'task')});
 expect(out.id).toBe('task:m1');expect(out.kind).toBe('task');expect(out.route).toBe('home');expect(out.minutes).toBe(20);
});
