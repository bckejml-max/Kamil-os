import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

async function boot(page){
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await expect(page.locator('[data-os2-today]')).toBeVisible({timeout:10000});
}

test('OS1331 keeps all sections direct and turns Today into a desktop command center',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);
 await expect(page.locator('link[href="./os1331.css"]')).toHaveCount(1);
 await expect(page.locator('#mainNav [data-view]')).toHaveCount(10);
 await expect(page.locator('#mainNav .os1331-nav-group')).toHaveText(['Řízení','Trh & peníze','Osobní']);
 await expect(page.locator('.os1600-attention')).toBeVisible();
 await expect(page.locator('.os1600-areas .os1600-area')).toHaveCount(9);
 const layout=await page.evaluate(()=>({
   areaColumns:getComputedStyle(document.querySelector('.os1600-areas')).gridTemplateColumns.split(' ').filter(Boolean).length,
   nav:[...document.querySelectorAll('#mainNav [data-view]')].map(x=>x.dataset.view)
 }));
 expect(layout.areaColumns).toBe(3);
 expect(layout.nav).toEqual(['today','inbox','work','tickets','money','property','betting','family','home','more']);
 const diag=await page.evaluate(()=>window.__KAMIL_TODAY_OS2000__);
 expect(diag.productReset).toBe(1331);
 expect(diag.systemRows).toBe(9);
});

test('OS1500 mobile keeps ten direct destinations visible without scrolling',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await boot(page);
 await expect(page.locator('#bottomNav [data-view]')).toHaveCount(10);
 const layout=await page.evaluate(()=>{
  const nav=document.querySelector('#bottomNav');
  const style=getComputedStyle(nav);
  return {
   display:style.display,
   navHeight:nav.getBoundingClientRect().height,
   scrollable:nav.scrollWidth>nav.clientWidth,
   rows:style.gridTemplateRows.split(' ').filter(Boolean).length
  };
 });
 expect(layout.display).toBe('grid');
 expect(layout.navHeight).toBeLessThanOrEqual(100);
 expect(layout.scrollable).toBe(false);
 expect(layout.rows).toBe(2);
});
