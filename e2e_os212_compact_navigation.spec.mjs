import {test,expect} from '@playwright/test';

test('OS947 full navigation stays loaded, no-scroll and accessible on OS333',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>!!document.querySelector('link[data-compactnavigation212]')),{timeout:15000}).toBe(true);
 const sidebar=page.locator('.sidebar');
 await expect(sidebar).toBeVisible();
 const width=await sidebar.evaluate(el=>el.getBoundingClientRect().width);
 expect(width).toBeGreaterThanOrEqual(230);
 expect(width).toBeLessThanOrEqual(270);
 const today=page.locator('.main-nav button[data-view="today"]');
 await expect(today).toHaveAttribute('aria-label','Dnes');
 await expect(today).toHaveAttribute('title','Dnes');
 await expect(today.locator('span').nth(1)).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_OS333__?.version||0),{timeout:15000}).toBe(333);
 const overflow=await page.evaluate(()=>({body:getComputedStyle(document.body).overflow,html:getComputedStyle(document.documentElement).overflow,scrollY:window.scrollY}));
 expect(overflow.body).toContain('hidden');
 expect(overflow.html).toContain('hidden');
 expect(overflow.scrollY).toBe(0);
 await page.mouse.move(1200,700);
 await page.mouse.wheel(0,700);
 await page.waitForTimeout(120);
 expect(await page.evaluate(()=>window.scrollY)).toBe(0);
});
