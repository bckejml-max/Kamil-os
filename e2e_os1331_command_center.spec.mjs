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
 await expect(page.locator('.os1600-next')).toBeVisible();
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

test('OS738 mobile keeps ten direct destinations visible in one 5x2 grid',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await boot(page);
 const nav=page.locator('#bottomNav');
 await expect(nav.locator('[data-view]')).toHaveCount(10);
 const layout=await nav.evaluate(el=>{
  const style=getComputedStyle(el);
  return {
   display:style.display,
   navHeight:el.getBoundingClientRect().height,
   columns:style.gridTemplateColumns,
   rows:style.gridTemplateRows,
   scrollable:el.scrollWidth>el.clientWidth
  };
 });
 expect(layout.display).toBe('grid');
 expect(layout.navHeight).toBeLessThanOrEqual(96);
 expect(layout.columns.split(' ').filter(Boolean)).toHaveLength(5);
 expect(layout.rows.split(' ').filter(Boolean)).toHaveLength(2);
 expect(layout.scrollable).toBe(false);
 const last=nav.locator('[data-view="more"]');
 await last.scrollIntoViewIfNeeded();
 await expect(last).toBeVisible();
});
