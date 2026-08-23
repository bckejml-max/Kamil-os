import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('62.9 proof review gates effective confidence behind explicit confirmation',async({page})=>{
 await page.goto(BASE);
 const result=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const {personalProofReview629,setProofStage629,proofReviewStorageKey629}=await import('./js/personalProofReview629.js');
  sessionStorage.removeItem(proofReviewStorageKey629());
  const before=JSON.stringify(store.get());
  const a=personalProofReview629(store.get());
  const id=a.items.find(x=>x.id==='recovered-auto-insurance')?.id;
  const initial=a.items.find(x=>x.id===id);
  setProofStage629(id,'FOUND');
  const found=personalProofReview629(store.get()).items.find(x=>x.id===id);
  setProofStage629(id,'CONFIRMED');
  const confirmed=personalProofReview629(store.get()).items.find(x=>x.id===id);
  const after=JSON.stringify(store.get());
  return{before,after,initial,found,confirmed};
 });
 expect(result.before).toBe(result.after);
 expect(result.initial.effectiveConfidence).toBe(result.initial.current);
 expect(result.found.effectiveConfidence).toBe(result.initial.current);
 expect(result.confirmed.effectiveConfidence).toBe(result.confirmed.target);
 expect(result.confirmed.stage).toBe('CONFIRMED');
});
