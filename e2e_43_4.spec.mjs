import {test,expect} from '@playwright/test';

const base='http://127.0.0.1:4173/';

test('43.4 defers the learned worst background module until explicitly allowed',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('kamil-os-module-stats-43-3',JSON.stringify({
      './changePulseUi35.js':{avg:1500,last:1500,count:4,at:Date.now()},
      './deadlineRadarUi35.js':{avg:600,last:600,count:4,at:Date.now()}
    }));
  });
  await page.goto(base);
  const result=await page.evaluate(async()=>{
    const loader=await import('./js/lazyBoot41.js');
    const before=await loader.responsiveLoad(['./changePulseUi35.js'],{gap:0,allowCold:false});
    const cold=window.__KAMIL_COLD_MODULE__;
    const deferred=window.__KAMIL_COLD_DEFERRED__?.path||null;
    const after=await loader.responsiveLoad(['./changePulseUi35.js'],{gap:0,allowCold:true});
    return {
      cold,
      deferred,
      beforeStatus:before[0]?.status,
      afterStatus:after[0]?.status,
      timing:window.__KAMIL_MODULE_TIMINGS__?.['./changePulseUi35.js']
    };
  });
  expect(result.cold).toBe('./changePulseUi35.js');
  expect(result.deferred).toBe('./changePulseUi35.js');
  expect(result.beforeStatus).toBe('deferred');
  expect(result.afterStatus).toBe('fulfilled');
  expect(Number(result.timing)).toBeGreaterThanOrEqual(0);
});
