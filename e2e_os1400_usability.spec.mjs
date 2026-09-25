import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

async function boot(page){
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await expect(page.locator('[data-os1400-home]')).toBeVisible({timeout:10000});
}

test('OS1400 presents one focused desktop cockpit',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);
 await expect(page.locator('html[data-os1400="1"]')).toHaveCount(1);
 await expect(page.locator('link[href="./os1400.css"]')).toHaveCount(1);
 await expect(page.locator('#commandInput')).toHaveAttribute('placeholder',/Co chceš udělat/);
 await expect(page.locator('.os1400-focus')).toBeVisible();
 await expect(page.locator('.os1400-metrics .os1400-metric')).toHaveCount(4);
 await expect(page.locator('.os1400-grid')).toBeVisible();
 const diag=await page.evaluate(()=>window.__KAMIL_TODAY_OS2000__);
 expect(diag.usabilityReset).toBe(1400);
 expect(diag.systemRows).toBe(9);
});

test('OS1400 keeps direct mobile destinations and stacks primary content',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await boot(page);
 await expect(page.locator('#bottomNav [data-view]')).toHaveCount(10);
 const layout=await page.evaluate(()=>{
  const grid=document.querySelector('.os1400-grid');
  const cards=[...grid.querySelectorAll(':scope > .os1400-card')].map(x=>x.getBoundingClientRect());
  const metrics=getComputedStyle(document.querySelector('.os1400-metrics')).gridTemplateColumns.split(' ').filter(Boolean).length;
  return {stacked:cards.length<2||cards[1].top>=cards[0].bottom-2,metrics};
 });
 expect(layout.stacked).toBe(true);
 expect(layout.metrics).toBe(2);
});
