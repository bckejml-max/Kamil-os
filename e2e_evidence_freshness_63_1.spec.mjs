import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('63.1 stale evidence stays in ledger but no longer boosts effective confidence',async({page})=>{
 await page.goto(BASE);
 const result=await page.evaluate(async()=>{
  const {evidenceLedgerStorageKey630}=await import('./js/personalEvidenceLedger630.js');
  const {personalEvidenceFreshness631}=await import('./js/personalEvidenceFreshness631.js');
  const {personalProofReview629}=await import('./js/personalProofReview629.js');
  const key=evidenceLedgerStorageKey630();
  const old=new Date(Date.now()-31*86400000).toISOString();
  localStorage.setItem(key,JSON.stringify([{id:'recovered-auto-insurance',title:'Pojištění auta',confirmedAt:old,before:35,after:95,gain:60,proofType:'zelená karta'}]));
  sessionStorage.removeItem('kamil-os-personal-proof-review-629');
  const freshness=personalEvidenceFreshness631();
  const review=personalProofReview629();
  const auto=review.items.find(x=>x.id==='recovered-auto-insurance');
  return{stale:freshness.stale.map(x=>x.id),stage:auto?.stage,effective:auto?.effectiveConfidence,current:auto?.current,persistent:auto?.persistent,usable:auto?.proofUsable};
 });
 expect(result.stale).toContain('recovered-auto-insurance');
 expect(result.stage).toBe('REVIEW');
 expect(result.effective).toBe(result.current);
 expect(result.persistent).toBe(true);
 expect(result.usable).toBe(false);
});
