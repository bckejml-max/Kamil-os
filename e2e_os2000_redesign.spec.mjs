import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

async function boot(page){
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await expect(page.locator('[data-os2-today]')).toBeVisible({timeout:10000});
}

test('OS2000 starts as a small on-demand shell',async({page})=>{
 await boot(page);
 const state=await page.evaluate(()=>({
  boot:window.__KAMIL_BOOT_BUDGET343__,
  deferred:window.__KAMIL_DEFERRED345__,
  styles:[...document.querySelectorAll('link[rel="stylesheet"]')].map(x=>x.getAttribute('href')),
  resources:performance.getEntriesByType('resource').map(x=>x.name)
 }));
 expect(state.boot.architecture).toBe('os2-on-demand');
 expect(state.boot.modules.length).toBeLessThanOrEqual(2);
 expect(state.boot.modules.some(x=>x.path==='./app.js'&&x.ok)).toBe(true);
 expect(state.boot.failures).toHaveLength(0);
 expect(state.styles).toContain('./os2.css');
 expect(state.styles).toContain('./styles.css');
 expect(state.styles).not.toContain('./ticketDesk353.css');
 expect(state.resources.some(x=>x.includes('bettingBootstrap543.js'))).toBe(false);
 expect(state.resources.some(x=>x.includes('ticketDesk331.js'))).toBe(false);
});

test('OS2000 Today is the canonical lightweight dashboard',async({page})=>{
 await boot(page);
 await expect(page.locator('.os2-hero h1')).toContainText(/Kamile/i);
 await expect(page.locator('.os2-now')).toBeVisible();
 await expect(page.locator('.os2-kpis .os2-kpi')).toHaveCount(4);
 const today=await page.evaluate(()=>window.__KAMIL_TODAY_OS2000__);
 expect(today?.healthy).toBe(true);
 expect(today?.version).toBe(2000);
});

test('OS2000 navigation keeps heavy views lazy',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('#view-money')).toHaveClass(/on/);
 await page.waitForTimeout(250);
 await page.locator('#mainNav [data-view="today"]').click();
 await expect(page.locator('#view-today')).toHaveClass(/on/);
 const resources=await page.evaluate(()=>performance.getEntriesByType('resource').map(x=>x.name));
 expect(resources.some(x=>x.includes('ticketDesk331.js'))).toBe(false);
 expect(resources.some(x=>x.includes('bettingBootstrap543.js'))).toBe(false);
});

test('OS2000 loads Ticket assets only when Tickets opens',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="tickets"]').click();
 await expect(page.locator('#view-tickets')).toHaveClass(/on/);
 await expect.poll(()=>page.evaluate(()=>performance.getEntriesByType('resource').some(x=>x.name.includes('ticketDesk331.js'))),{timeout:15000}).toBe(true);
 const styles=await page.evaluate(()=>[...document.querySelectorAll('link[data-os2-lazy]')].map(x=>x.getAttribute('href')));
 expect(styles).toContain('./ticket68.css');
 expect(styles).toContain('./ticketDesk353.css');
});

test('OS2000 mobile keeps the five primary domains one tap away',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await boot(page);
 await expect(page.locator('#bottomNav')).toBeVisible();
 await expect(page.locator('#bottomNav [data-view]')).toHaveCount(5);
 await page.locator('#bottomNav [data-view="inbox"]').click();
 await expect(page.locator('#view-inbox')).toHaveClass(/on/);
 await expect(page.locator('body')).toHaveCSS('overflow-x','hidden');
});
