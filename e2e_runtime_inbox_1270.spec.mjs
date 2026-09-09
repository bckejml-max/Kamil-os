import {test,expect} from '@playwright/test';

test('OS1270 keeps Inbox delegated and owner-stable across refresh and filtering',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__KAMIL_RUNTIME_COORDINATOR1050__?.complete===true,{timeout:20000});
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'inbox'})));
 await page.waitForFunction(()=>window.__KAMIL_INBOX_HUB660__?.healthy===true&&document.querySelector('#inboxView [data-inbox-hub660]'),{timeout:15000});
 const host=page.locator('#inboxView');
 await expect(host).toHaveAttribute('data-inbox-delegated660','1');
 const before=await page.evaluate(()=>window.__KAMIL_RUNTIME1100__?.snapshot?.().owners?.['core.inbox660']?.listeners||0);
 expect(before).toBeGreaterThanOrEqual(2);
 expect(before).toBeLessThanOrEqual(4);
 const firstFilter=page.locator('#inboxView [data-inbox660-filter]').first();
 if(await firstFilter.count())await firstFilter.click();
 const search=page.locator('#inboxView [data-inbox660-search]');
 if(await search.count()){await search.fill('zz-runtime-no-match');await search.fill('')}
 for(let i=0;i<6;i++){
  await page.evaluate(()=>window.__KAMIL_INBOX_HUB660__?.refresh?.());
  await page.waitForTimeout(120);
 }
 const after=await page.evaluate(()=>window.__KAMIL_RUNTIME1100__?.snapshot?.().owners?.['core.inbox660']?.listeners||0);
 expect(after).toBe(before);
 expect(after).toBeLessThanOrEqual(4);
 await expect(page.locator('#inboxView [data-inbox-hub660]')).toBeVisible();
});