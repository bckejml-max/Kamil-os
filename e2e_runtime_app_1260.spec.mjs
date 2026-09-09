import {test,expect} from '@playwright/test';

test('OS1260 keeps app shell owner stable while nav clicks still switch canonical views',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__KAMIL_RUNTIME_COORDINATOR1050__?.complete===true&&window.__KAMIL_RUNTIME1100__?.snapshot,{timeout:20000});
 const before=await page.evaluate(()=>window.__KAMIL_RUNTIME1100__.snapshot().owners?.['core.app41']?.listeners||0);
 expect(before).toBeGreaterThanOrEqual(10);
 expect(before).toBeLessThanOrEqual(16);
 const money=page.locator('[data-view="money"]').first();
 await money.dispatchEvent('pointerover');
 await money.click();
 await expect(page.locator('#view-money')).toHaveClass(/\bon\b/);
 await expect(money).toHaveAttribute('aria-current','page');
 const today=page.locator('[data-view="today"]').first();
 await today.dispatchEvent('focusin');
 await today.click();
 await expect(page.locator('#view-today')).toHaveClass(/\bon\b/);
 await expect(today).toHaveAttribute('aria-current','page');
 for(let i=0;i<8;i++){
  await money.click();
  await page.waitForTimeout(25);
  await today.click();
  await page.waitForTimeout(25);
 }
 const after=await page.evaluate(()=>window.__KAMIL_RUNTIME1100__.snapshot().owners?.['core.app41']?.listeners||0);
 expect(after).toBe(before);
});

test('OS1260 delegated nav prefetch events do not create duplicate app owners',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__KAMIL_RUNTIME_COORDINATOR1050__?.complete===true&&window.__KAMIL_RUNTIME1100__?.snapshot,{timeout:20000});
 const nav=page.locator('[data-view="tickets"]').first();
 for(let i=0;i<20;i++){
  await nav.dispatchEvent('pointerover');
  await nav.dispatchEvent('pointerdown');
  await nav.dispatchEvent('focusin');
 }
 await page.waitForTimeout(120);
 const snapshot=await page.evaluate(()=>window.__KAMIL_RUNTIME1100__.snapshot());
 expect(snapshot.owners?.['core.app41']).toBeTruthy();
 expect(snapshot.owners['core.app41'].listeners).toBeLessThanOrEqual(16);
 expect(Object.keys(snapshot.owners).filter(x=>x==='core.app41')).toHaveLength(1);
});
