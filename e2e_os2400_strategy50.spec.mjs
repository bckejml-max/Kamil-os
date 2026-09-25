import {test,expect} from '@playwright/test';
test('OS2400 exposes the fifth 50 strategy/horizon modules',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.locator('#mainNav [data-view="more"]').click();
 await expect(page.locator('[data-documents-page1500]')).toBeVisible({timeout:10000});
 await page.locator('[data-doc1500-strategy]').click();
 await expect(page.locator('[data-strategy2400-center]')).toBeVisible({timeout:10000});
 await expect(page.locator('[data-strategy2400]')).toHaveCount(50);
 for(const label of ['North Star Dashboard','Decision Portfolio','KPI Drift Monitor','Search Success Rate','90-Day Strategic Plan'])await expect(page.locator('#moreView')).toContainText(label);
 const diag=await page.evaluate(()=>window.__KAMIL_STRATEGY2400__);
 expect(diag?.healthy).toBe(true);expect(diag?.count).toBe(50);
});
test('OS2400 command opens Strategy & Horizon center',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 const input=page.locator('#commandInput');await input.fill('pátých 50');await input.press('Enter');
 await expect(page.locator('[data-strategy2400-center]')).toBeVisible({timeout:10000});
});
