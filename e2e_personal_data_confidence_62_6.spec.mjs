import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('62.6 classifies recovered personal data confidence without persisting',async({page})=>{
 await page.goto(BASE);
 const result=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const {personalDataConfidence626}=await import('./js/personalDataConfidence626.js');
  const before=JSON.stringify(store.get());
  const x=personalDataConfidence626(store.get());
  const after=JSON.stringify(store.get());
  const byId=Object.fromEntries(x.records.map(v=>[v.id,v]));
  return{before,after,average:x.average,confirmed:x.confirmed.length,probable:x.probable.length,verify:x.verify.length,allianz:byId['recovered-life-kamil-allianz'],auto:byId['recovered-auto-insurance'],bank:byId['recovered-bank-coverage']};
 });
 expect(result.before).toBe(result.after);
 expect(result.average).toBeGreaterThan(60);
 expect(result.allianz.confidenceLabel).toBe('POTVRZENO');
 expect(result.allianz.confidence).toBeGreaterThanOrEqual(90);
 expect(result.auto.confidenceLabel).toBe('OVĚŘIT');
 expect(result.auto.confidence).toBeLessThan(65);
 expect(result.bank.confidenceLabel).toContain('POTVRZENO');
});
