import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('65.2 late mode becomes calm after 21:00',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const out=await page.evaluate(async()=>{const m=await import('./js/personalDailyRhythm651.js');return{late:m.personalDailyMode652(new Date('2026-08-23T22:30:00')),evening:m.personalDailyMode652(new Date('2026-08-23T19:00:00')),morning:m.personalDailyMode652(new Date('2026-08-23T08:00:00'))}});
 expect(out).toEqual({late:'late',evening:'evening',morning:'morning'});
});

test('65.2 one-tap tomorrow snoozes personal work to 09:00',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const out=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const {postponePersonalActionToTomorrow642}=await import('./js/personalFollowup642.js');
  store.mutate('seed 65.2 snooze',s=>{s.tasks=Array.isArray(s.tasks)?s.tasks:[];s.tasks.push({id:'snooze-652',title:'Test zítra',status:'OPEN',due:new Date().toISOString(),createdAt:new Date().toISOString()})});
  const ok=postponePersonalActionToTomorrow642({id:'task:snooze-652',kind:'task',title:'Test zítra'});
  const row=store.get().tasks.find(x=>x.id==='snooze-652');
  return{ok,due:row?.due,status:row?.status};
 });
 expect(out.ok).toBe(true);expect(out.status).toBe('OPEN');const due=new Date(out.due);expect(due.getHours()).toBe(9);expect(due.getTime()).toBeGreaterThan(Date.now());
});
