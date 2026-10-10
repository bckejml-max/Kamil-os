import {test,expect} from '@playwright/test';
const boot=async page=>{await boot(page);await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true)};
test('OS2050 exposes all 50 intelligence upgrades from Documents',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="more"]').click();
 await expect(page.locator('[data-documents-page1500]')).toBeVisible({timeout:10000});
 await page.locator('[data-doc1500-advanced] > summary').click();
 await page.locator('[data-doc1500-upgrades]').click();
 await expect(page.locator('[data-upgrades2050]')).toBeVisible({timeout:10000});
 await expect(page.locator('[data-upgrade2050]')).toHaveCount(50);
 await expect(page.locator('#moreView')).toContainText('Global Action Queue 2.0');
 await expect(page.locator('#moreView')).toContainText('Cash Parking Optimizer');
 await expect(page.locator('#moreView')).toContainText('Property Deal Room');
 await expect(page.locator('#moreView')).toContainText('Ticket Mistake Guard');
 await expect(page.locator('#moreView')).toContainText('Weekly CEO View');
 const diag=await page.evaluate(()=>window.__KAMIL_UPGRADES2050__);
 expect(diag?.healthy).toBe(true);expect(diag?.count).toBe(50);
});
test('OS2050 command bar opens the 50-upgrade center',async({page})=>{
 await boot(page);
 const input=page.locator('#commandInput');await input.fill('50 upgradeů');await input.press('Enter');
 await expect(page.locator('[data-upgrades2050]')).toBeVisible({timeout:10000});
});