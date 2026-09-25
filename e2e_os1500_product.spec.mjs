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
 await expect(page.locator('.os1600-area')).toHaveCount(9);

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

 const legacyPersonalStyles=await page.locator('link[data-os2-lazy]').evaluateAll(links=>links.map(x=>x.getAttribute('href')).filter(h=>/personal64|family70|home68/.test(h||'')));
 expect(legacyPersonalStyles).toEqual([]);

 await page.locator('#mainNav [data-view="betting"]').click();
 await expect(page.locator('#quickAddBtn')).toBeVisible();
 await expect(page.locator('#quickAddBtn')).toHaveAttribute('title',/sázení/i);
});

test('OS1500 mobile keeps all ten destinations visible in two rows',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await boot(page);
 const nav=page.locator('#bottomNav');
 await expect(nav.locator('[data-view]')).toHaveCount(10);
 const layout=await nav.evaluate(el=>{
  const s=getComputedStyle(el),r=el.getBoundingClientRect();
  const first=el.querySelector('[data-view]'),buttonStyle=first?getComputedStyle(first):null;
  return {display:s.display,height:r.height,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,columns:s.gridTemplateColumns,rows:s.gridTemplateRows,fontSize:buttonStyle?parseFloat(buttonStyle.fontSize):0};
 });
 expect(layout.display).toBe('grid');
 expect(layout.height).toBeLessThanOrEqual(100);
 expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth+2);
 expect(layout.rows.split(' ').length).toBe(2);
 expect(layout.fontSize).toBeGreaterThanOrEqual(8.5);
 const last=nav.locator('[data-view="more"]');
 await expect(last).toBeVisible();
 await last.click();
 await expect(page.locator('[data-documents-page1500]')).toBeVisible();
});

test('OS737.0.25 restores canonical stylesheet order after advanced surfaces',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);
 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('[data-money-overview]')).toBeVisible({timeout:10000});
 await page.locator('[data-money-advanced]').click();
 await expect.poll(()=>page.locator('link[data-product-advanced]').count(),{timeout:10000}).toBeGreaterThan(0);
 await page.locator('#mainNav [data-view="today"]').click();
 await expect(page.locator('[data-os2-today]')).toBeVisible({timeout:10000});
 const order=await page.locator('link[rel="stylesheet"]').evaluateAll(links=>links.map(x=>x.getAttribute('href')));
 const canonical=['./productReset1300.css','./os1400.css','./os1500.css'].map(x=>order.lastIndexOf(x));
 expect(canonical[0]).toBeGreaterThan(-1);
 expect(canonical[0]).toBeLessThan(canonical[1]);
 expect(canonical[1]).toBeLessThan(canonical[2]);
 expect(canonical[2]).toBe(order.length-1);
});

test('OS737.0.26 clicking the active section exits advanced detail',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);
 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('[data-money-overview]')).toBeVisible({timeout:10000});
 await page.locator('[data-money-advanced]').click();
 await expect.poll(()=>page.locator('#moneyView').getAttribute('data-product-advanced'),{timeout:10000}).toBe('1');
 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('[data-money-overview]')).toBeVisible({timeout:10000});
 await expect(page.locator('#moneyView')).not.toHaveAttribute('data-product-advanced','1');
 const order=await page.locator('link[rel="stylesheet"]').evaluateAll(links=>links.map(x=>x.getAttribute('href')));
 expect(order.at(-1)).toBe('./os1500.css');
});
