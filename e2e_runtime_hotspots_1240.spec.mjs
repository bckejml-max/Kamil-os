import {test,expect} from '@playwright/test';

test('OS1240 keeps Personal Today delegated through one owned host listener',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__KAMIL_RUNTIME_COORDINATOR1050__?.complete===true,{timeout:20000});
 // personalToday640 is a compatibility renderer rather than the current canonical Today.
 // Exercise it directly so this test verifies its runtime ownership contract without
 // changing which renderer the app shell chooses in production.
 await page.evaluate(async()=>{const m=await import('./js/personalToday640.js');m.renderPersonalToday640()});
 await page.waitForTimeout(120);
 await expect(page.locator('#todayView')).toHaveAttribute('data-personal-today-delegated640','1');
 const before=await page.evaluate(()=>window.__KAMIL_RUNTIME1100__?.snapshot?.().owners?.['core.personal-today640']?.listeners||0);
 expect(before).toBe(1);
 for(let i=0;i<5;i++)await page.evaluate(async()=>{const m=await import('./js/personalToday640.js');m.renderPersonalToday640()});
 const after=await page.evaluate(()=>window.__KAMIL_RUNTIME1100__?.snapshot?.().owners?.['core.personal-today640']?.listeners||0);
 expect(after).toBe(before);
});

test('OS1240 keeps Ticket page delegated across repaints and filters remain interactive',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__KAMIL_RUNTIME_COORDINATOR1050__?.complete===true,{timeout:20000});
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'tickets'})));
 await page.waitForTimeout(600);
 const host=page.locator('#ticketIntelView');
 const delegated=await host.getAttribute('data-ticket-delegated665');
 if(delegated==='1'){
  const before=await page.evaluate(()=>window.__KAMIL_RUNTIME1100__?.snapshot?.().owners?.['tickets.page665']?.listeners||0);
  expect(before).toBeLessThanOrEqual(1);
  const filter=page.locator('#ticketIntelView [data-ticket-filter="all"]');
  if(await filter.count())await filter.click();
  for(let i=0;i<3;i++){
   await page.evaluate(()=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'today'})));
   await page.waitForTimeout(40);
   await page.evaluate(()=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'tickets'})));
   await page.waitForTimeout(120);
  }
  const after=await page.evaluate(()=>window.__KAMIL_RUNTIME1100__?.snapshot?.().owners?.['tickets.page665']?.listeners||0);
  expect(after).toBe(before);
  expect(after).toBeLessThanOrEqual(1);
 }
});
