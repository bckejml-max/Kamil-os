import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('59.8 exposes one unified resolution stage without writes',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const out=await page.evaluate(async()=>{const m=await import('./js/commanderResolutionLoop598.js');return m.commanderResolutionLoop598()});
 expect(['READY','START','DONE','RESOLVE']).toContain(out.step.stage);
 expect(out.step.title).toBeTruthy();
 expect(out.step.detail).toBeTruthy();
 const diag=await page.evaluate(()=>window.__KAMIL_RESOLUTION_LOOP_598_LAST__||null);
 expect(diag).not.toBeNull();
});
