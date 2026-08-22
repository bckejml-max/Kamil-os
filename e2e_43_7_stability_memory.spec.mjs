import {test,expect} from '@playwright/test';

const base='http://127.0.0.1:4173/';

test('43.7 stability memory blocks risky background module', async ({page})=>{
  await page.goto(base);
  const result=await page.evaluate(async()=>{
    localStorage.setItem('kamil-os-stability-memory-43-7',JSON.stringify({
      './ticketProfitUi29.js':{score:12,samples:4,failures:2,successes:4,lastMs:1500,updatedAt:Date.now()}
    }));
    const mod=await import('./js/lazyBoot41.js');
    mod.refreshStabilityMemory();
    const policy=mod.stabilityPolicy('./ticketProfitUi29.js');
    const automatic=await mod.responsiveLoad(['./ticketProfitUi29.js'],{gap:0});
    return {
      policy,
      automatic:automatic.map(x=>({status:x.status,path:x.path,score:x.score})),
      blocked:window.__KAMIL_MEMORY_BLOCKED_MODULES__||[],
      deferred:window.__KAMIL_MEMORY_DEFERRED__||null
    };
  });
  expect(result.policy.mode).toBe('blocked');
  expect(result.automatic[0].status).toBe('memory-blocked');
  expect(result.blocked.some(x=>x.path==='./ticketProfitUi29.js')).toBeTruthy();
  expect(result.deferred?.path).toBe('./ticketProfitUi29.js');
});
