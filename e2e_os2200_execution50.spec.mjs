import {test,expect} from '@playwright/test';
const boot=async page=>{await boot(page);await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true)};
test('OS2200 exposes the third 50 execution/governance modules',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="more"]').click();
 await expect(page.locator('[data-documents-page1500]')).toBeVisible({timeout:10000});
 await page.locator('[data-doc1500-advanced] > summary').click();
 await page.locator('[data-doc1500-execution]').click();
 await expect(page.locator('[data-execution2200-center]')).toBeVisible({timeout:10000});
 await expect(page.locator('[data-execution2200]')).toHaveCount(50);
 for(const label of ['Action Executor','Critical Path Engine','Personal Knowledge Graph','Email Action Extractor','OS Governor'])await expect(page.locator('#moreView')).toContainText(label);
 await expect(page.locator('[data-exec2200-kill]')).toContainText('ON');
 await expect(page.locator('[data-exec2200-dry]')).toContainText('ON');
 const diag=await page.evaluate(()=>window.__KAMIL_EXECUTION2200__);
 expect(diag?.healthy).toBe(true);expect(diag?.count).toBe(50);expect(diag?.killSwitch).toBe(true);expect(diag?.dryRun).toBe(true);
});
test('OS2200 command opens Execution & Governance center',async({page})=>{
 await boot(page);
 const input=page.locator('#commandInput');await input.fill('třetích 50');await input.press('Enter');
 await expect(page.locator('[data-execution2200-center]')).toBeVisible({timeout:10000});
});