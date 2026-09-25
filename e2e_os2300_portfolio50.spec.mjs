import {test,expect} from '@playwright/test';
test('OS2300 exposes the fourth 50 portfolio/resilience modules',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.locator('#mainNav [data-view="more"]').click();
 await expect(page.locator('[data-documents-page1500]')).toBeVisible({timeout:10000});
 await page.locator('[data-doc1500-portfolio]').click();
 await expect(page.locator('[data-portfolio2300-center]')).toBeVisible({timeout:10000});
 await expect(page.locator('[data-portfolio2300]')).toHaveCount(50);
 for(const label of ['Capital Allocation Board','Operational Resilience Score','Counterparty Exposure Map','Document Expiry Matrix','Continuous Improvement Board'])await expect(page.locator('#moreView')).toContainText(label);
 const diag=await page.evaluate(()=>window.__KAMIL_PORTFOLIO2300__);
 expect(diag?.healthy).toBe(true);expect(diag?.count).toBe(50);
});
test('OS2300 command opens Portfolio & Resilience center',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 const input=page.locator('#commandInput');await input.fill('čtvrtých 50');await input.press('Enter');
 await expect(page.locator('[data-portfolio2300-center]')).toBeVisible({timeout:10000});
});
