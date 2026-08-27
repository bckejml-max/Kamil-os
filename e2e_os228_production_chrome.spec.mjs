import {test,expect} from '@playwright/test';
test('OS238 production chrome stays clean and no-scroll',async({page})=>{
 await page.setViewportSize({width:1792,height:828});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#appView')).toBeVisible({timeout:20000});
 await expect(page.locator('[data-today-dashboard213]')).toBeVisible({timeout:20000});
 await expect(page.locator('#syncStatus')).toBeHidden();
 await expect(page.locator('#commandInput')).toHaveAttribute('placeholder','Hledej nebo se zeptej…');
 await expect(page.locator('#commandGo')).toHaveText('↵');
 await expect(page.locator('#commandGo')).toHaveAttribute('aria-label','Spustit hledání');
 await expect(page.locator('#quickAddBtn')).toBeVisible();
 await expect(page.locator('#quickAddBtn')).toHaveAttribute('aria-label','Přidat');
 await expect(page.locator('#pageTitle')).toHaveText('DNES');
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_PRODUCTION_CHROME228__?.version||0)).toBe(228);
 const body=await page.evaluate(()=>({client:document.documentElement.clientHeight,scroll:document.documentElement.scrollHeight}));
 expect(body.scroll).toBeLessThanOrEqual(body.client+3);
});
