import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('62.7 resolver turns weak personal data into concrete read-only checklist',async({page})=>{
 await page.goto(BASE);
 const result=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const {personalMissingDataResolver627}=await import('./js/personalMissingDataResolver627.js');
  const before=JSON.stringify(store.get());
  const x=personalMissingDataResolver627(store.get());
  const after=JSON.stringify(store.get());
  return{before,after,open:x.open,main:x.main,tasks:x.tasks};
 });
 expect(result.before).toBe(result.after);
 expect(result.open).toBeGreaterThan(0);
 expect(result.main.id).toBe('recovered-auto-insurance');
 expect(result.main.proof).toContain('zelená karta');
 expect(result.main.target).toBeGreaterThan(result.main.current);
});
