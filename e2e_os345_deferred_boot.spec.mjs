import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
async function boot(page){await page.goto(BASE,{waitUntil:'domcontentloaded'});await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true)}

test('OS345/2000 retires the load-everything-later queue',async({page})=>{
 await boot(page);
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_DEFERRED345__?.complete),{timeout:5000}).toBe(true);
 const s=await page.evaluate(()=>window.__KAMIL_DEFERRED345__);
 expect(s.version).toBe(345);
 expect(s.architecture).toBe('os2-on-demand');
 expect(s.mode).toBe('on-demand');
 expect(s.modules).toHaveLength(0);
 expect(s.failures).toHaveLength(0);
 expect(s.healthy).toBe(true);
});

test('OS2000 does not load legacy analytics just because the app is idle',async({page})=>{
 await boot(page);
 await page.waitForTimeout(3200);
 const resources=await page.evaluate(()=>performance.getEntriesByType('resource').map(x=>x.name));
 for(const name of ['performance330.js','ticketQa332.js','workspaces305.js','todayCockpit363.js'])expect(resources.some(x=>x.includes(name)),`${name} should remain on-demand`).toBe(false);
 await expect(page.locator('[data-os2-today]')).toBeVisible();
});
