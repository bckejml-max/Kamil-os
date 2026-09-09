import {test,expect} from '@playwright/test';

test('OS1050 coordinates One OS runtime exactly once',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__KAMIL_BOOT_BUDGET343__?.complete===true,{timeout:20000});
 await page.waitForFunction(()=>window.__KAMIL_RUNTIME_COORDINATOR1050__?.complete===true,{timeout:20000});
 const before=await page.evaluate(()=>({
  state:JSON.parse(JSON.stringify(window.__KAMIL_RUNTIME_COORDINATOR1050__)),
  bootErrors:[...(window.__KAMIL_BOOT_ERRORS__||[])]
 }));
 expect(before.state.complete).toBe(true);
 expect(before.state.running).toBe(false);
 expect(before.state.errors).toEqual([]);
 for(const name of ['oneOS967','oneOS977','legacyCleanup987','controlPlane1037','controlOperations1047']){
  expect(['installed','already-installed']).toContain(before.state.steps[name]?.status);
 }
 const after=await page.evaluate(async()=>{
  const m=await import('./js/runtimeCoordinator1050.js');
  await Promise.all([m.scheduleRuntime1050(),m.scheduleRuntime1050(),m.runRuntime1050()]);
  return m.runtimeHealth1050();
 });
 expect(after.complete).toBe(true);
 expect(after.errors).toEqual([]);
 expect(after.startedAt).toBe(before.state.startedAt);
 expect(after.completedAt).toBe(before.state.completedAt);
});

test('legacy boot adapters do not create independent boot state',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__KAMIL_RUNTIME_COORDINATOR1050__?.complete===true,{timeout:20000});
 const result=await page.evaluate(async()=>{
  const paths=['oneOS967Boot','oneOS977Boot','legacyCleanup987Boot','controlPlane1037Boot','controlOperations1047Boot'];
  const before=window.__KAMIL_RUNTIME_COORDINATOR1050__.startedAt;
  for(const p of paths)await import(`./js/${p}.js`);
  await new Promise(resolve=>queueMicrotask(resolve));
  return {before,after:window.__KAMIL_RUNTIME_COORDINATOR1050__.startedAt,complete:window.__KAMIL_RUNTIME_COORDINATOR1050__.complete};
 });
 expect(result.complete).toBe(true);
 expect(result.after).toBe(result.before);
});
