import {test,expect} from '@playwright/test';

test('compact navigation stays loaded, no-scroll and accessible on OS333',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>!!document.querySelector('link[data-compactnavigation212]')),{timeout:15000}).toBe(true);
 const sidebar=page.locator('.sidebar');
 await expect(sidebar).toBeVisible();
 const width=await sidebar.evaluate(el=>el.getBoundingClientRect().width);
 expect(width).toBeLessThanOrEqual(90);
 const today=page.locator('.main-nav button[data-view="today"]');
 await expect(today).toHaveAttribute('aria-label','Dnes');
 await expect(today).toHaveAttribute('title','Dnes');
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_OS333__?.version||0),{timeout:15000}).toBe(333);
 const overflow=await page.evaluate(()=>({body:getComputedStyle(document.body).overflow,html:getComputedStyle(document.documentElement).overflow,scrollHeight:document.documentElement.scrollHeight,clientHeight:document.documentElement.clientHeight}));
 expect(overflow.body).toContain('hidden');
 expect(overflow.html).toContain('hidden');
 expect(overflow.scrollHeight).toBeLessThanOrEqual(overflow.clientHeight+3);
});
