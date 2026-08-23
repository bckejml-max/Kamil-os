import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('65.1 Daily Rhythm shows completed count and opens daily close',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const out=await page.evaluate(async()=>{
  const state=await import('./js/state.js');
  const today=await import('./js/personalToday640.js');
  const rhythm=await import('./js/personalDailyRhythm651.js');
  const now=new Date().toISOString(),tomorrow=new Date(Date.now()+86400000).toISOString();
  state.store.mutate('65.1 test seed',s=>{
   s.tasks=Array.isArray(s.tasks)?s.tasks:[];s.tasks.push({id:'done-651',title:'Hotový osobní test',status:'DONE',completedAt:now,area:'osobní'});
   s.delegations=Array.isArray(s.delegations)?s.delegations:[];s.delegations.push({id:'wait-651',title:'Čekám na odpověď 65.1',status:'OPEN',followUpAt:tomorrow});
   s.calendar=s.calendar||{events:[]};s.calendar.events=Array.isArray(s.calendar.events)?s.calendar.events:[];s.calendar.events.push({id:'event-651',title:'Rodinný test zítra',start:tomorrow});
  },{undo:false,cloud:false,audit:false});
  today.renderPersonalToday640();
  const r=rhythm.personalDailyRhythm651(state.store.get());
  return{done:r.done,tomorrow:r.tomorrow.length,followups:r.followups.length,closeButtons:document.querySelectorAll('[data-daily-close]').length,text:document.querySelector('#todayView')?.innerText||''};
 });
 expect(out.done).toBeGreaterThanOrEqual(1);expect(out.tomorrow).toBeGreaterThanOrEqual(1);expect(out.followups).toBeGreaterThanOrEqual(1);expect(out.closeButtons).toBeGreaterThanOrEqual(1);expect(out.text).toContain('Dnes hotovo');
 await page.locator('[data-daily-close]').last().click();
 const modal=page.locator('#modalHost');
 await expect(modal.getByText('Follow-up do zítřka')).toBeVisible();
 await expect(modal.getByText('Rodinný test zítra')).toBeVisible();
});
