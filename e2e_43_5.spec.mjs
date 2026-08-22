import {test,expect} from '@playwright/test';

const base='http://127.0.0.1:4173/';

test('43.5 keeps a quarantined background module isolated until manual retry',async({page})=>{
  await page.addInitScript(()=>{
    const now=Date.now();
    localStorage.setItem('kamil-os-module-quarantine-43-5',JSON.stringify({
      './changePulseUi35.js':{failures:[now-1000,now-500],lastFailureAt:now-500,until:now+60*60*1000}
    }));
  });
  await page.goto(base);
  const result=await page.evaluate(async()=>{
    const loader=await import('./js/lazyBoot41.js');
    const before=await loader.responsiveLoad(['./changePulseUi35.js'],{gap:0,allowCold:true});
    const deferred=window.__KAMIL_QUARANTINE_DEFERRED__?.path||null;
    const recovered=new Promise(resolve=>window.addEventListener('kamil:module-quarantine-recovered',e=>resolve(e.detail?.path),{once:true}));
    window.dispatchEvent(new CustomEvent('kamil:retry-quarantined-module',{detail:{path:'./changePulseUi35.js'}}));
    const recoveredPath=await recovered;
    const active=loader.quarantineSnapshot();
    return {beforeStatus:before[0]?.status,deferred,recoveredPath,stillQuarantined:!!active['./changePulseUi35.js']};
  });
  expect(result.beforeStatus).toBe('quarantined');
  expect(result.deferred).toBe('./changePulseUi35.js');
  expect(result.recoveredPath).toBe('./changePulseUi35.js');
  expect(result.stillQuarantined).toBe(false);
});
