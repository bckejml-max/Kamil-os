import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('deep links restore the canonical section and browser history',async({page})=>{
 await page.goto(BASE+'?view=money',{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await expect(page.locator('#view-money')).toHaveClass(/on/);
 await expect(page.locator('#moneyView [data-money-overview]')).toBeVisible({timeout:10000});
 await page.locator('#mainNav [data-view="family"]').click();
 await expect(page).toHaveURL(/\?view=family(?:#|$)/);
 await expect(page.locator('#familyView [data-family-page1500]')).toBeVisible({timeout:10000});
 await page.goBack();
 await expect(page).toHaveURL(/\?view=money(?:#|$)/);
 await expect(page.locator('#view-money')).toHaveClass(/on/);
});

test('canonical shell has one stylesheet and no retired family host',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await expect(page.locator('link[rel="stylesheet"]')).toHaveCount(1);
 await expect(page.locator('link[href="./os-canonical.css"]')).toHaveCount(1);
 await expect(page.locator('#ticketsView')).toHaveCount(0);
 await expect(page.locator('#familyView')).toHaveCount(1);
});

test('runtime diagnostics retain a safe copyable record',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const row=await page.evaluate(async()=>{
  const d=await import('./js/diagnostics.js');
  const r=d.recordDiagnostic('e2e-test',new Error('synthetic renderer failure'),{view:'today'});
  return {id:r.id,text:d.diagnosticText(r.id)};
 });
 expect(row.id).toMatch(/^D/);
 expect(row.text).toContain('synthetic renderer failure');
 expect(row.text).toContain('"release": "740.0.0"');
});
