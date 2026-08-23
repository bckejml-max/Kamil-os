import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('62.5 recovery surfaces archived personal facts without persisting them',async({page})=>{
 await page.goto(BASE);
 const result=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const {personalLifeSuite625}=await import('./js/personalLifeSuite625.js');
  const before=JSON.stringify(store.get());
  const x=personalLifeSuite625(store.get());
  const after=JSON.stringify(store.get());
  return{before,after,recovered:x.recovery.recovered,gaps:x.recovery.gaps.length,admin:x.features.admin.items.map(v=>v.title),finance:x.features.finance.items.map(v=>v.title)};
 });
 expect(result.before).toBe(result.after);
 expect(result.recovered.admin).toBeGreaterThanOrEqual(6);
 expect(result.recovered.assets).toBeGreaterThanOrEqual(2);
 expect(result.gaps).toBeGreaterThanOrEqual(5);
 expect(result.admin.join(' ')).toContain('Pojištění');
});
