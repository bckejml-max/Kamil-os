import {test,expect} from '@playwright/test';
const URL='http://127.0.0.1:4173/';

test('OS347 keeps unified307 out of critical boot and loads it deferred',async({page})=>{
 await page.goto(URL);
 await page.waitForFunction(()=>window.__KAMIL_BOOT_BUDGET343__?.complete===true);
 const boot=await page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__);
 expect(boot.modules.some(x=>x.path==='./unified307.js')).toBeFalsy();
 await expect(page.locator('#todayView')).toBeVisible();
 await page.waitForFunction(()=>window.__KAMIL_DEFERRED345__?.complete===true);
 const state=await page.evaluate(()=>({deferred:window.__KAMIL_DEFERRED345__,unified:window.__KAMIL_UNIFIED307__}));
 expect(state.deferred.modules.some(x=>x.path==='./unified307.js'&&x.ok)).toBeTruthy();
 expect(state.unified?.version).toBe(307);
});

test('OS347 deferred unified layer survives navigation',async({page})=>{
 await page.goto(URL);
 await page.waitForFunction(()=>window.__KAMIL_DEFERRED345__?.complete===true&&window.__KAMIL_UNIFIED307__?.version===307);
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'home'})));
 await page.waitForTimeout(250);
 const state=await page.evaluate(()=>({version:window.__KAMIL_UNIFIED307__?.version,count:window.__KAMIL_UNIFIED307__?.components||0}));
 expect(state.version).toBe(307);
 expect(state.count).toBeGreaterThanOrEqual(0);
});
