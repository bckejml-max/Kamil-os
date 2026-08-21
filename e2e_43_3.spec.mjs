import {test,expect} from '@playwright/test';

const BASE='http://127.0.0.1:4173';

test('43.3 learns module timing history for future pacing',async({page})=>{
  await page.goto(BASE,{waitUntil:'networkidle'});
  await page.evaluate(()=>localStorage.removeItem('kamil-os-module-stats-43-3'));
  const stats=await page.evaluate(async()=>{
    const m=await import('./js/lazyBoot41.js');
    await m.responsiveLoad(['./utils.js'],{gap:0});
    return JSON.parse(localStorage.getItem('kamil-os-module-stats-43-3')||'{}');
  });
  expect(stats['./utils.js']).toBeTruthy();
  expect(stats['./utils.js'].count).toBeGreaterThanOrEqual(1);
  expect(stats['./utils.js'].avg).toBeGreaterThanOrEqual(0);
});
