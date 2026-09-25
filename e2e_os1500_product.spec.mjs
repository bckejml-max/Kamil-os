import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

async function boot(page){
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await expect(page.locator('[data-os2-today]')).toBeVisible({timeout:10000});
}

test('OS1500 keeps every primary area direct and canonical',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);
 await expect(page.locator('html[data-os1500="1"]')).toHaveCount(1);
 await expect(page.locator('.os1400-domain')).toHaveCount(9);

 await page.locator('#mainNav [data-view="family"]').click();
 await expect(page.locator('[data-family-page1500]')).toBeVisible();
 await expect(page.locator('[data-family-filter]')).toHaveCount(0);

 await page.locator('#mainNav [data-view="home"]').click();
 await expect(page.locator('[data-home-page1500]')).toBeVisible();
 await expect(page.locator('[data-home-filter]')).toHaveCount(0);

 await page.locator('#mainNav [data-view="more"]').click();
 await expect(page.locator('[data-documents-page1500]')).toBeVisible();
 await expect(page.locator('[data-doc-filter]')).toHaveCount(0);
 await expect(page.locator('#insurance25Tile')).toBeVisible();

 await page.locator('#mainNav [data-view="betting"]').click();
 await expect(page.locator('#quickAddBtn')).toBeVisible();
 await expect(page.locator('#quickAddBtn')).toHaveAttribute('title',/sázení/i);
});

test('OS1500 mobile keeps ten destinations in one scrollable strip',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await boot(page);
 const nav=page.locator('#bottomNav');
 await expect(nav.locator('[data-view]')).toHaveCount(10);
 const layout=await nav.evaluate(el=>{
  const s=getComputedStyle(el),r=el.getBoundingClientRect();
  return {display:s.display,height:r.height,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,rows:s.gridTemplateRows};
 });
 expect(layout.display).toBe('flex');
 expect(layout.height).toBeLessThanOrEqual(72);
 expect(layout.scrollWidth).toBeGreaterThan(layout.clientWidth);
 const last=nav.locator('[data-view="more"]');
 await last.scrollIntoViewIfNeeded();
 await last.click();
 await expect(page.locator('[data-documents-page1500]')).toBeVisible();
});
