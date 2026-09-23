import {test,expect} from '@playwright/test';
import fs from 'node:fs';

const BASE='http://127.0.0.1:4173';
const VIEWS=['today','inbox','work','tickets','money','property','betting','family','home','more'];

async function boot(page){
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await expect(page.locator('[data-os2-today]')).toBeVisible({timeout:10000});
}
async function openView(page,view,nav){
 await page.locator(`${nav} [data-view="${view}"]`).click();
 await expect(page.locator(`#view-${view}`)).toHaveClass(/on/);
 await page.waitForTimeout(300);
}

test('capture canonical visual audit',async({page})=>{
 fs.mkdirSync('visual-audit1324',{recursive:true});

 await page.setViewportSize({width:1440,height:1000});
 await boot(page);
 for(const view of VIEWS){
  if(view!=='today')await openView(page,view,'#mainNav');
  await page.screenshot({path:`visual-audit1324/desktop-${view}.png`,fullPage:true});
 }

 await page.setViewportSize({width:390,height:844});
 await page.reload({waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 for(const view of VIEWS){
  if(view!=='today')await openView(page,view,'#bottomNav');
  await page.screenshot({path:`visual-audit1324/mobile-${view}.png`,fullPage:true});
 }
});