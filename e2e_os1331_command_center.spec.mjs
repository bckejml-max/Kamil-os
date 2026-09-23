import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

async function boot(page){
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await expect(page.locator('[data-os2-today]')).toBeVisible({timeout:10000});
}

test('OS1331 keeps all sections direct and turns Today into a desktop command center',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);
 await expect(page.locator('link[href="./os1331.css"]')).toHaveCount(1);
 await expect(page.locator('#mainNav [data-view]')).toHaveCount(10);
 await expect(page.locator('#mainNav .os1331-nav-group')).toHaveText(['Řízení','Trh & peníze','Osobní']);
 await expect(page.locator('[data-os1331-command-grid]')).toBeVisible();
 const layout=await page.evaluate(()=>{
  const grid=document.querySelector('[data-os1331-command-grid]');
  const focus=grid?.querySelector('.os1331-focus-stack')?.getBoundingClientRect();
  const system=grid?.querySelector('.os1331-system-panel')?.getBoundingClientRect();
  return {
   columns:grid?getComputedStyle(grid).gridTemplateColumns:'',
   sideBySide:!!focus&&!!system&&system.left>focus.left+100,
   nav:[...document.querySelectorAll('#mainNav [data-view]')].map(x=>x.dataset.view)
  };
 });
 expect(layout.sideBySide).toBe(true);
 expect(layout.nav).toEqual(['today','inbox','work','tickets','money','property','betting','family','home','more']);
 const diag=await page.evaluate(()=>window.__KAMIL_TODAY_OS2000__);
 expect(diag.productReset).toBe(1331);
 expect(diag.systemRows).toBe(5);
});

test('OS1331 mobile keeps ten direct destinations in a two-row nav',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await boot(page);
 await expect(page.locator('#bottomNav [data-view]')).toHaveCount(10);
 const layout=await page.evaluate(()=>{
  const nav=document.querySelector('#bottomNav');
  const grid=document.querySelector('[data-os1331-command-grid]');
  const focus=grid?.querySelector('.os1331-focus-stack')?.getBoundingClientRect();
  const system=grid?.querySelector('.os1331-system-panel')?.getBoundingClientRect();
  return {
   navRows:getComputedStyle(nav).gridTemplateRows.split(' ').filter(Boolean).length,
   stacked:!!focus&&!!system&&system.top>=focus.bottom-2
  };
 });
 expect(layout.navRows).toBe(2);
 expect(layout.stacked).toBe(true);
});
