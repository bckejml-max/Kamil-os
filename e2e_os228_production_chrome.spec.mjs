import {test,expect} from '@playwright/test';
test('OS228 keeps production chrome clean and no-scroll',async({page})=>{
 await page.setViewportSize({width:1792,height:828});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#appView')).toBeVisible({timeout:20000});
 await expect(page.locator('[data-today-dashboard213]')).toBeVisible({timeout:20000});
 await expect(page.locator('#syncStatus')).toBeHidden();
 await expect(page.locator('#undoBtn')).toBeHidden();
 await expect(page.locator('#quickAddBtn')).toBeVisible();
 const kicker=page.locator('.page-kicker');
 await expect(kicker).toBeVisible();
 await expect(page.locator('#pageTitle')).toHaveText('DNES');
 const kickerFont=await kicker.evaluate(el=>getComputedStyle(el).fontSize);
 const pageFont=await page.locator('#pageTitle').evaluate(el=>getComputedStyle(el).fontSize);
 expect(kickerFont).toBe('0px');
 expect(pageFont).not.toBe('0px');
 const body=await page.evaluate(()=>({client:document.documentElement.clientHeight,scroll:document.documentElement.scrollHeight}));
 expect(body.scroll).toBeLessThanOrEqual(body.client+3);
});
