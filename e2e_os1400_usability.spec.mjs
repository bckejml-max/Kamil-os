import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

async function boot(page){
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await expect(page.locator('[data-os1400-home]')).toBeVisible({timeout:10000});
}

test('OS1500 preserves the focused desktop cockpit',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);
 await expect(page.locator('html[data-os1400="1"]')).toHaveCount(1);
 await expect(page.locator('link[href="./os1400.css"]')).toHaveCount(1);
 await expect(page.locator('#commandInput')).toHaveAttribute('placeholder',/Co chceš udělat/);
 await expect(page.locator('.os1600-attention')).toBeVisible();
 await expect(page.locator('.os1600-summary .os1600-summary-item')).toHaveCount(4);
 await expect(page.locator('.os1600-areas')).toBeVisible();
 const diag=await page.evaluate(()=>window.__KAMIL_TODAY_OS2000__);
 expect(diag.usabilityReset).toBe(1500);
 expect(diag.systemRows).toBe(9);
});

test('OS1500 keeps direct mobile destinations and stacks primary content',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await boot(page);
 await expect(page.locator('#bottomNav [data-view]')).toHaveCount(10);
 const layout=await page.evaluate(()=>{
  const summary=document.querySelector('.os1600-summary');
  const areas=document.querySelector('.os1600-areas');
  const metrics=getComputedStyle(summary).gridTemplateColumns.split(' ').filter(Boolean).length;
  const areaColumns=getComputedStyle(areas).gridTemplateColumns.split(' ').filter(Boolean).length;
  return {metrics,areaColumns};
 });
 expect(layout.metrics).toBe(2);
 expect(layout.areaColumns).toBe(2);
});
