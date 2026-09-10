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
 expect(state.styles).toContain('./os2010.css');
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

test('OS2010 keeps primary workspaces contained on desktop',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);
 for(const view of ['inbox','money','tickets','betting']){
  await page.locator(`#mainNav [data-view="${view}"]`).click();
  await expect(page.locator(`#view-${view}`)).toHaveClass(/on/);
  await page.waitForTimeout(view==='tickets'||view==='betting'?800:350);
  const metrics=await page.evaluate(v=>{
   const id={inbox:'inboxView',money:'moneyView',tickets:'ticketIntelView',betting:'bettingView'}[v];
   const host=document.getElementById(id),body=document.body,root=document.documentElement;
   if(!host)return null;
   const rect=host.getBoundingClientRect();
   return{hostWidth:rect.width,viewport:innerWidth,bodyOverflow:Math.max(body.scrollWidth,root.scrollWidth)-innerWidth};
  },view);
  expect(metrics).not.toBeNull();
  expect(metrics.hostWidth).toBeLessThanOrEqual(1362);
  expect(metrics.bodyOverflow).toBeLessThanOrEqual(2);
 }
});

test('OS2000 mobile keeps the five primary domains one tap away',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await boot(page);
 await expect(page.locator('#bottomNav')).toBeVisible();
 await expect(page.locator('#bottomNav [data-view]')).toHaveCount(5);
 for(const view of ['inbox','tickets','betting','money']){
  await page.locator(`#bottomNav [data-view="${view}"]`).click();
  await expect(page.locator(`#view-${view}`)).toHaveClass(/on/);
  await page.waitForTimeout(view==='tickets'||view==='betting'?700:250);
  const overflow=await page.evaluate(()=>Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
 }
 await expect(page.locator('body')).toHaveCSS('overflow-x','hidden');
});
