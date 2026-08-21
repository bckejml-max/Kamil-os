import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Kamil OS 41.6 keeps helper UI observers finite and read-only on import',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:80},tasks:[],ticketBook:{items:[],watchlist:[],history:[]},netWorthBook:{items:[],history:[]},personalSpending:{transactions:[]},tradeJournal:{trades:[]},investmentBook:{history:[]},importCenter:{history:[]},inbox:[],delegations:[],calendar:{events:[]}})));
 await page.goto(BASE,{waitUntil:'networkidle'});
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('kamil-os-state')||'{}').directorBook||null);
 await page.evaluate(async()=>{await Promise.all([import('./js/directorUi34.js'),import('./js/followUpUi35.js'),import('./js/deadlineRadarUi35.js')])});
 await expect(page.locator('#directorTop34')).toBeVisible();
 await expect(page.locator('[data-followup35-open]')).toBeVisible();
 await expect(page.locator('[data-radar35-open]')).toBeVisible();
 const afterImport=await page.evaluate(()=>JSON.parse(localStorage.getItem('kamil-os-state')||'{}').directorBook||null);
 expect(afterImport).toEqual(before);
 await page.evaluate(()=>{window.__observerMutations41_6=0;window.__observerTest41_6=new MutationObserver(rows=>window.__observerMutations41_6+=rows.length);window.__observerTest41_6.observe(document.body,{childList:true,subtree:true})});
 await page.locator('#mainNav').getByRole('button',{name:'Více'}).click();
 await expect(page.locator('#moreView')).toHaveAttribute('data-view-ready','1');
 await expect(page.locator('[data-director-open34]')).toBeVisible();
 await expect(page.locator('[data-followup35-tile]')).toBeVisible();
 await expect(page.locator('[data-radar35-tile]')).toBeVisible();
 await page.waitForTimeout(350);
 const settled=await page.evaluate(()=>window.__observerMutations41_6);
 await page.waitForTimeout(500);
 const later=await page.evaluate(()=>window.__observerMutations41_6);
 expect(later-settled).toBeLessThan(8);
 await page.evaluate(()=>window.__observerTest41_6?.disconnect());
});
