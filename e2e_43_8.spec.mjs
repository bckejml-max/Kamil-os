import {test,expect} from '@playwright/test';

const base='http://127.0.0.1:4173/';

test('43.8 Freeze Sentinel measures real event-loop stalls with one heartbeat',async({page})=>{
  await page.goto(base);
  const result=await page.evaluate(async()=>{
    const mod=await import('./js/platform431Stability.js');
    const summary=mod.guardSummary431();
    return {
      lag:mod.heartbeatLag431(3000,1000,500),
      zero:mod.heartbeatLag431(1400,1000,500),
      sentinel:summary.sentinel
    };
  });
  expect(result.lag).toBe(1500);
  expect(result.zero).toBe(0);
  expect(result.sentinel.heartbeatMs).toBe(500);
  expect(result.sentinel.lagTripMs).toBe(1200);
  expect(result.sentinel.severeLagMs).toBe(2500);
  expect(result.sentinel.incidentCoalesceMs).toBe(1200);
});
