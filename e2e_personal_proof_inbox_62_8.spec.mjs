import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('62.8 proof inbox turns missing data into concrete proof requests without mutation',async({page})=>{
 await page.goto(BASE);
 const r=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const {personalProofInbox628,previewProofImpact628}=await import('./js/personalProofInbox628.js');
  const before=JSON.stringify(store.get());
  const x=personalProofInbox628(store.get());
  const p=previewProofImpact628(x.main?.id,store.get());
  const after=JSON.stringify(store.get());
  return{before,after,open:x.open,main:x.main,preview:p};
 });
 expect(r.before).toBe(r.after);
 expect(r.open).toBeGreaterThan(0);
 expect(r.main.proof.length).toBeGreaterThan(8);
 expect(r.main.where.length).toBeGreaterThan(5);
 expect(r.preview.after).toBeGreaterThan(r.preview.before);
});
