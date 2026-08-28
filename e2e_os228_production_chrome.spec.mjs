import {test,expect} from '@playwright/test';
test('production chrome stays clean and no-scroll on OS333',async({page})=>{
 await page.setViewportSize({width:1792,height:828});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#appView')).toBeVisible({timeout:20000});
 await expect(page.locator('[data-os333-exec]')).toBeVisible({timeout:20000});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_UX_FOUNDATION238__?.version||0),{timeout:20000}).toBe(238);
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_OS333__?.version||0),{timeout:20000}).toBe(333);
 await expect(page.locator('#syncStatus')).toBeHidden();
 await expect(page.locator('#commandInput')).toHaveAttribute('placeholder','Zeptej se Kamil OS…');
 await expect(page.locator('#commandInput')).toHaveAttribute('aria-label','Hledej nebo se zeptej v Kamil OS');
 await expect(page.locator('#commandGo')).toHaveAttribute('aria-label','Spustit hledání');
 await expect(page.locator('#quickAddBtn')).toBeVisible();
 await expect(page.locator('#quickAddBtn')).toHaveAttribute('aria-label','Rychle přidat');
 await expect(page.locator('#quickAddBtn')).toHaveAttribute('data-ux238-owned','1');
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_PRODUCTION_CHROME228__?.version||0)).toBe(228);
 const body=await page.evaluate(()=>({client:document.documentElement.clientHeight,scroll:document.documentElement.scrollHeight}));
 expect(body.scroll).toBeLessThanOrEqual(body.client+3);
});
