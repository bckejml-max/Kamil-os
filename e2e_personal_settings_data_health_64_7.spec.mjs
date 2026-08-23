import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('64.7 exposes personal data health and safe priority bias',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const out=await page.evaluate(async()=>{
  const settings=await import('./js/personalSettings647.js');
  const actions=await import('./js/personalActions640.js');
  const state=await import('./js/state.js');
  settings.savePriorityArea647('family');
  const s=state.store.get(),health=settings.personalSettings647(s),queue=actions.personalActions640(s);
  return{area:health.priorityArea,coverage:health.coverage,records:health.records,top:queue.top3.map(x=>({title:x.title,area:x.area,score:x.score})),hasWork:JSON.stringify(settings.exportPersonalData647).includes('xtbReport')};
 });
 expect(out.area).toBe('family');expect(out.coverage).toBeGreaterThan(0);expect(out.records).toBeGreaterThan(0);expect(out.hasWork).toBe(false);
});
