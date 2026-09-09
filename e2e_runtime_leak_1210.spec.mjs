import {test,expect} from '@playwright/test';

test('OS1210 survives 20 navigation cycles without runtime ownership leaks',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__KAMIL_RUNTIME_COORDINATOR1050__?.complete===true&&window.__KAMIL_RUNTIME_LEAK1210_API__?.begin,{timeout:20000});
 const sequence=['today','tickets','betting','money','today'];
 // Warm every lazy view once. Some legacy-compatible view layers intentionally
 // complete their first-load settle passes as late as ~2.6 s, so the baseline
 // must be taken after that one-time hydration window, not during it.
 for(const view of sequence){
  await page.evaluate(v=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:v})),view);
  await page.waitForTimeout(100);
 }
 await page.waitForTimeout(3200);
 // One short confirmation cycle after late settle passes makes the baseline
 // represent steady-state navigation while preserving tight leak tolerances.
 for(const view of sequence){
  await page.evaluate(v=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:v})),view);
  await page.waitForTimeout(50);
 }
 await page.waitForTimeout(200);
 const before=await page.evaluate(()=>window.__KAMIL_RUNTIME_LEAK1210_API__.begin('20-cycle-navigation-steady-state'));
 for(let cycle=0;cycle<20;cycle++)for(const view of sequence){
  await page.evaluate(v=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:v})),view);
  await page.waitForTimeout(18);
 }
 await page.waitForTimeout(300);
 const result=await page.evaluate(b=>window.__KAMIL_RUNTIME_LEAK1210_API__.finish(b,{listenerTolerance:2,timerTolerance:3,observerTolerance:1,ownerTolerance:2,domTolerance:120}),before);
 expect(result.ok,result.violations.join(', ')).toBe(true);
 expect(result.delta.listeners).toBeLessThanOrEqual(2);
 expect(result.delta.timers).toBeLessThanOrEqual(3);
 expect(result.delta.observers).toBeLessThanOrEqual(1);
 expect(result.delta.dom).toBeLessThanOrEqual(120);
});

test('OS1220 records per-view budgets and OS1230 tracks canonical lifecycle',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__KAMIL_RUNTIME_COORDINATOR1050__?.complete===true,{timeout:20000});
 for(const view of ['tickets','betting','money','today']){
  await page.evaluate(v=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:v})),view);
  await page.waitForTimeout(80);
 }
 const out=await page.evaluate(()=>({perf:window.__KAMIL_PERF_BUDGET1220_API__?.snapshot?.(),life:window.__KAMIL_VIEW_LIFECYCLE1230_API__?.snapshot?.(),timeline:window.__KAMIL_TIMELINE1170_API__?.snapshot?.()}));
 expect(out.perf?.budgets?.tickets).toBeGreaterThan(0);
 expect(out.perf?.views?.today).toBeTruthy();
 expect(out.life?.current).toBe('today');
 expect(out.life?.history?.length).toBeGreaterThanOrEqual(4);
 expect(out.timeline?.rows?.length).toBeGreaterThanOrEqual(0);
});
