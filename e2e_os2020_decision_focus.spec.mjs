import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

async function boot(page){
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await expect(page.locator('#view-today')).toHaveClass(/\bon\b/);
}

async function openView(page,view){
 const button=page.locator(`.os2-sidebar [data-view="${view}"]`).first();
 await expect(button).toBeVisible();
 await button.click();
 await expect(page.locator(`#view-${view}`)).toHaveClass(/\bon\b/);
}

async function expectNoFatalModule(page,host){
 await expect(page.locator(host)).not.toContainText('Modul se nepodařilo načíst');
 await expect(page.locator(host)).not.toContainText('Kamil OS se nepodařilo načíst');
}

test('canonical runtime keeps decision-focus overlays out of the critical path',async({page})=>{
 await boot(page);
 const state=await page.evaluate(()=>({
  focusbar:document.querySelectorAll('[data-os2020-focusbar]').length,
  os2020:document.querySelectorAll('link[data-os2020-css]').length,
  os2040:document.querySelectorAll('link[data-os2040-css]').length,
  os2050:document.querySelectorAll('link[data-os2050-css]').length
 }));
 expect(state).toEqual({focusbar:0,os2020:0,os2040:0,os2050:0});
});

test('Tickets opens as a usable canonical view without a fatal module screen',async({page})=>{
 await boot(page);
 await openView(page,'tickets');
 await expectNoFatalModule(page,'#ticketIntelView');
 await expect(page.locator('#ticketIntelView')).toBeVisible();
});

test('Betting opens immediately and optional enrichment cannot block navigation',async({page})=>{
 await boot(page);
 const started=Date.now();
 await openView(page,'betting');
 expect(Date.now()-started).toBeLessThan(3000);
 await expectNoFatalModule(page,'#bettingView');
 await expect(page.locator('#bettingView')).toBeVisible();
});

test('Money opens from the shell while optional finance modules stay non-fatal',async({page})=>{
 await boot(page);
 const started=Date.now();
 await openView(page,'money');
 expect(Date.now()-started).toBeLessThan(3000);
 await expectNoFatalModule(page,'#moneyView');
 await expect(page.locator('#moneyView')).toBeVisible();
});
