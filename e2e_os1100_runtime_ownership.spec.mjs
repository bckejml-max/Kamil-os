import {test,expect} from '@playwright/test';

test('OS1100 runtime registry is installed before One OS runtime completes',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_RUNTIME1100__?.snapshot?.().version||''),{timeout:20000}).toBe('1100.0.0');
 const health=await page.evaluate(()=>window.__KAMIL_RUNTIME_COORDINATOR1050__);
 expect(health?.steps?.runtimeOwnership1100?.status).toMatch(/installed|already-installed/);
});

test('OS1100 dedupes owned subscriptions and disposes a domain cleanly',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>!!window.__KAMIL_RUNTIME1100__),{timeout:20000}).toBe(true);
 const result=await page.evaluate(async()=>{
  const rt=window.__KAMIL_RUNTIME1100__;let hits=0;const handler=()=>hits++;
  rt.activateDomain('test1100',['test1100.owner']);
  rt.ownEvent('test1100.owner',window,'kamil:test1100',handler);
  rt.ownEvent('test1100.owner',window,'kamil:test1100',handler);
  window.dispatchEvent(new Event('kamil:test1100'));
  const before=rt.snapshot();
  rt.schedule('test1100.owner','slow',()=>{hits+=100},10000);
  const scheduled=rt.snapshot();
  rt.disposeDomain('test1100');
  window.dispatchEvent(new Event('kamil:test1100'));
  await new Promise(resolve=>setTimeout(resolve,20));
  const after=rt.snapshot();
  return{hits,before:before.owners['test1100.owner'],scheduled:scheduled.owners['test1100.owner'],after:after.owners['test1100.owner']||null};
 });
 expect(result.hits).toBe(1);
 expect(result.before.listeners).toBe(1);
 expect(result.scheduled.timers).toBe(1);
 expect(result.after).toBeNull();
});
