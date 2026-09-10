import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
async function boot(page){await page.goto(BASE,{waitUntil:'domcontentloaded'});await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true)}

test('OS343/2000 publishes a minimal complete boot profile',async({page})=>{
 await boot(page);
 const b=await page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__);
 console.log('OS2000_BOOT_PROFILE',JSON.stringify({totalMs:b.totalMs,moduleCount:b.modules.length,slowest:b.slowest,failures:b.failures,architecture:b.architecture}));
 expect(b.version).toBe(343);
 expect(b.architecture).toBe('os2-on-demand');
 expect(b.complete).toBe(true);
 expect(b.totalMs).toBeGreaterThanOrEqual(0);
 expect(b.modules.length).toBeLessThanOrEqual(2);
 expect(b.modules.some(x=>x.path==='./app.js'&&x.ok)).toBe(true);
 expect(b.failures).toHaveLength(0);
 expect(b.healthy).toBe(true);
});

test('OS2000 minimal boot keeps navigation usable',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('#view-money')).toHaveClass(/on/);
 await page.locator('#mainNav [data-view="today"]').click();
 await expect(page.locator('#view-today')).toHaveClass(/on/);
 expect(await page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__.complete)).toBe(true);
});
