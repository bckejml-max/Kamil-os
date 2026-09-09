import {test,expect} from '@playwright/test';

test('OS1200 boots unified runtime intelligence and opens Personal OS Health',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__KAMIL_RUNTIME_COORDINATOR1050__?.complete===true,{timeout:20000});
 const snapshot=await page.evaluate(async()=>{
  const m=await import('./js/runtimeCoordinator1050.js');
  return m.runtimeHealth1050();
 });
 expect(snapshot.complete).toBe(true);
 for(const name of ['runtimeHealth1120','decisionCore1140','linkGraph1150','waitingIntelligence1160','financeRisk1180','runtimeHealthUi1200'])expect(['installed','already-installed']).toContain(snapshot.steps[name]?.status);
 expect(snapshot.runtimeHealth?.installed).toBe(true);
 expect(snapshot.decision).toBeTruthy();
 expect(snapshot.linkGraph).toBeTruthy();
 expect(snapshot.waiting).toBeTruthy();
 expect(snapshot.financeRisk).toBeTruthy();
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('kamil:open-runtime-health')));
 const panel=page.locator('[data-runtime-health1200]');
 await expect(panel).toBeVisible();
 await expect(panel).toContainText('PERSONAL OS HEALTH');
 await expect(panel).toContainText('PRIORITA');
 await expect(panel).toContainText('WAITING');
 await expect(panel).toContainText('LINKY / DUPLICITY');
 await expect(panel).toContainText('PENÍZE & RISK');
 await expect(panel).toContainText('SELF-HEALING');
 await page.locator('[data-health1200-close]').click();
 await expect(panel).toHaveCount(0);
});

test('OS1120 quarantines repeated module failures and OS1200 can clear them',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__KAMIL_RUNTIME_COORDINATOR1050__?.complete===true&&window.__KAMIL_RUNTIME_HEALTH_UI1200__?.installed===true&&window.__KAMIL_RUNTIME_HEALTH1120_API__?.recordFailure,{timeout:20000});
 const result=await page.evaluate(()=>{
  const api=window.__KAMIL_RUNTIME_HEALTH1120_API__;
  api.recordFailure('demo-module.js',new Error('synthetic failure'));
  api.recordFailure('demo-module.js',new Error('synthetic failure'));
  api.recordFailure('demo-module.js',new Error('synthetic failure'));
  return api.health();
 });
 expect(result.quarantine.some(x=>x.module==='demo-module.js')).toBe(true);
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('kamil:open-runtime-health')));
 const panel=page.locator('[data-runtime-health1200]');
 await expect(panel).toBeVisible();
 await expect(panel).toContainText('demo-module.js');
 await page.locator('[data-health1200-clear="demo-module.js"]').click();
 const after=await page.evaluate(()=>window.__KAMIL_RUNTIME_HEALTH1120_API__.health());
 expect(after.quarantine.some(x=>x.module==='demo-module.js')).toBe(false);
});
