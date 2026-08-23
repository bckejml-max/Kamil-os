import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('65.0 is decision-first, searchable and keeps Waiting actionable',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const out=await page.evaluate(async()=>{
  const state=await import('./js/state.js');
  const today=await import('./js/personalToday640.js');
  const ask=await import('./js/personalAsk640.js');
  const assistant=await import('./js/personalAssistant650.js');
  const hardening=await import('./js/personalHardening650.js');
  state.store.mutate('65.0 test seed',s=>{
   s.tasks=Array.isArray(s.tasks)?s.tasks:[];s.tasks.push({id:'test-personal-65',title:'Vyřídit osobní test',area:'osobní',status:'OPEN',due:new Date().toISOString(),estimateMinutes:5});
   s.delegations=Array.isArray(s.delegations)?s.delegations:[];s.delegations.push({id:'test-wait-65',title:'Čekám na test odpověď',status:'OPEN',followUpAt:new Date().toISOString()});
  },{undo:false,cloud:false,audit:false});
  today.renderPersonalToday640();
  const daily=assistant.personalDailyAssistant650(state.store.get()),waiting=assistant.personalWaitingCenter650(state.store.get()),search=assistant.personalSearch650('Allianz',state.store.get()),answer=ask.answerPersonalQuestion640('Na co čekám?',state.store.get()),pre=hardening.personalReleasePreflight650();
  return{primaryCards:document.querySelectorAll('.ux65-primary').length,dataHealth:document.querySelectorAll('.ux64-data-health').length,body:document.body.innerText,primary:daily.primary?.title||null,waiting:waiting.count,search:search.length,answer:answer.title,pre};
 });
 expect(out.primaryCards).toBeLessThanOrEqual(1);expect(out.dataHealth).toBe(0);expect(out.body).not.toContain('KAMIL OS 64.1 / DNES');expect(out.waiting).toBeGreaterThan(0);expect(out.answer).toContain('Čekáš na');expect(out.search).toBeGreaterThan(0);expect(out.pre.ok).toBe(true);
});
