import {test,expect} from '@playwright/test';
test('OS2100 exposes the second 50 automation and learning modules',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.locator('#mainNav [data-view="more"]').click();
 await expect(page.locator('[data-documents-page1500]')).toBeVisible({timeout:10000});
 await page.locator('[data-doc1500-automation]').click();
 await expect(page.locator('[data-automation2100-center]')).toBeVisible({timeout:10000});
 await expect(page.locator('[data-automation2100]')).toHaveCount(50);
 for(const label of ['Personal SLA Engine','Decision Journal','Scenario Lab','Realistic Day Planner','Autonomous Maintenance Mode'])await expect(page.locator('#moreView')).toContainText(label);
 const diag=await page.evaluate(()=>window.__KAMIL_AUTOMATION2100__);
 expect(diag?.healthy).toBe(true);expect(diag?.count).toBe(50);
});
test('OS2100 command opens Automation & Learning center',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 const input=page.locator('#commandInput');await input.fill('dalších 50');await input.press('Enter');
 await expect(page.locator('[data-automation2100-center]')).toBeVisible({timeout:10000});
});
