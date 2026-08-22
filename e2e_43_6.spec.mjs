import {test,expect} from '@playwright/test';

const base='http://127.0.0.1:4173/';

test('43.6 self-heals a quarantined background module in a controlled probe',async({page})=>{
  await page.addInitScript(()=>{
    const now=Date.now();
    localStorage.setItem('kamil-os-module-quarantine-43-5',JSON.stringify({
      './changePulseUi35.js':{
        failures:[now-25*60*1000,now-24*60*1000],
        lastFailureAt:now-24*60*1000,
        until:now+5*60*60*1000,
        autoProbes:0,
        nextProbeAt:now-1000
      }
    }));
  });
  await page.goto(base);
  const result=await page.evaluate(async()=>{
    const loader=await import('./js/lazyBoot41.js');
    const healed=await loader.runSelfHealingSweep436({force:true,path:'./changePulseUi35.js'});
    return {
      healed,
      stillQuarantined:loader.isQuarantined('./changePulseUi35.js'),
      last:window.__KAMIL_LAST_SELF_HEAL__||null
    };
  });
  expect(result.healed).toBe(true);
  expect(result.stillQuarantined).toBe(false);
  expect(result.last?.path).toBe('./changePulseUi35.js');
  expect(result.last?.attempt).toBe(1);
});
