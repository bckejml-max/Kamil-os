import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

async function boot(page){
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.locator('[data-os1600-home]')).toBeVisible({timeout:15000});
}

test('OS1600 Today is solve-first instead of dashboard-first',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);
 await expect(page.locator('.os1600-next')).toHaveCount(1);
 await expect(page.locator('.os1600-next-action')).toBeVisible();
 const labels=await page.locator('.os1600-summary-item span').allTextContents();
 expect(labels).toEqual(['Po termínu','Čekám','Transfery','Do 48 h']);
 const later=page.locator('.os1600-later .os1400-row');
 expect(await later.count()).toBeLessThanOrEqual(4);
 await expect(page.locator('.os1600-area')).toHaveCount(9);
 await expect(page.locator('.os1600-area-icon')).toHaveCount(9);
});

test('OS1600 mobile keeps shell compact and action-first',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await boot(page);
 const sync=await page.locator('#syncStatus').evaluate(el=>({width:el.getBoundingClientRect().width,fontSize:getComputedStyle(el).fontSize}));
 expect(sync.width).toBeLessThanOrEqual(32);
 await expect(page.locator('.os2-command-shortcut')).toBeHidden();
 const next=await page.locator('.os1600-next').evaluate(el=>getComputedStyle(el).gridTemplateColumns);
 expect(next.split(' ').filter(Boolean).length).toBe(1);
 const areaHeight=await page.locator('.os1600-area').first().evaluate(el=>el.getBoundingClientRect().height);
 expect(areaHeight).toBeLessThanOrEqual(82);
 const nav=await page.locator('#bottomNav').evaluate(el=>({display:getComputedStyle(el).display,overflowX:getComputedStyle(el).overflowX}));
 expect(nav.display).toBe('flex');
 expect(['auto','scroll']).toContain(nav.overflowX);
});
