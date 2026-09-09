import {test,expect} from '@playwright/test';

test('OS1250 keeps Money hub ownership stable across repeated refreshes',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__KAMIL_RUNTIME_COORDINATOR1050__?.complete===true,{timeout:20000});
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'money'})));
 await page.waitForFunction(()=>document.querySelector('#moneyView [data-money-hub680]')&&window.__KAMIL_MONEY_HUB680__?.healthy===true,{timeout:15000});
 await expect(page.locator('#moneyView')).toHaveAttribute('data-money-delegated680','1');
 const before=await page.evaluate(()=>window.__KAMIL_RUNTIME1100__?.snapshot?.().owners?.['finance.money680']?.listeners||0);
 expect(before).toBeGreaterThan(0);
 expect(before).toBeLessThanOrEqual(7);
 for(let i=0;i<6;i++){
  await page.evaluate(()=>window.__KAMIL_MONEY_HUB680__?.refresh?.(0));
  await page.waitForTimeout(90);
 }
 const after=await page.evaluate(()=>window.__KAMIL_RUNTIME1100__?.snapshot?.().owners?.['finance.money680']?.listeners||0);
 expect(after).toBe(before);
 await expect(page.locator('#moneyView [data-money-hub680]')).toBeVisible();
});
