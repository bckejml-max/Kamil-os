import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('62.6 confidence uses only confidence stored with private records',async({page})=>{
 await page.goto(BASE);
 const result=await page.evaluate(async()=>{
  const {personalDataConfidence626}=await import('./js/personalDataConfidence626.js');
  const state={personalAdmin:{items:[{id:'confirmed',title:'A',confidence:96,confidenceLabel:'POTVRZENO'},{id:'verify',title:'B',confidence:40,confidenceLabel:'OVĚŘIT'}]},assetBook:{items:[]}};
  const x=personalDataConfidence626(state);
  return{confirmed:x.confirmed.map(v=>v.id),verify:x.verify.map(v=>v.id),average:x.average};
 });
 expect(result.confirmed).toEqual(['confirmed']);
 expect(result.verify).toEqual(['verify']);
 expect(result.average).toBe(68);
});
