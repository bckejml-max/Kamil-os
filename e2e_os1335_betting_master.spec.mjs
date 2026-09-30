import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
async function boot(page){
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await expect(page.locator('[data-os2-today]')).toBeVisible({timeout:10000});
}

test('OS745 never seeds or replaces private betting data from public code',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('kamil-os-state',JSON.stringify({
   meta:{schemaVersion:80,createdAt:new Date().toISOString()},
   bettingLedger:{bets:[{id:'private-bet-1',status:'OPEN',label:'Soukromá testovací sázka',stakeCzk:1234,odds:2}],bankrollCzk:10000,unitCzk:1000,updatedAt:'2026-09-30T10:00:00Z',masterId:'private-ledger'}
  }));
  localStorage.setItem('kamil_betting_ledger_543',JSON.stringify({bets:[{id:'legacy',status:'OPEN',label:'LEGACY MUST NOT LOAD',stakeCzk:9999}]}));
 });
 await boot(page);
 await page.locator('#mainNav [data-view="betting"]').click();
 await expect(page.locator('#bettingView [data-betting-open-row]')).toHaveCount(1);
 await expect(page.locator('#bettingView')).toContainText('Soukromá testovací sázka');
 await expect(page.locator('#bettingView')).not.toContainText('LEGACY MUST NOT LOAD');
 const ledger=await page.evaluate(()=>JSON.parse(localStorage.getItem('kamil-os-state')||'{}').bettingLedger);
 expect(ledger.bets).toHaveLength(1);
 expect(ledger.bets[0].id).toBe('private-bet-1');
 expect(ledger.masterId).toBe('private-ledger');
});

test('OS745 empty canonical betting ledger stays empty instead of reviving legacy localStorage',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:80,createdAt:new Date().toISOString()},bettingLedger:{bets:[],bankrollCzk:0,unitCzk:0,updatedAt:null}}));
  localStorage.setItem('kamil_betting_ledger_543',JSON.stringify({bets:[{id:'legacy-only',status:'OPEN',label:'LEGACY ONLY',stakeCzk:5000}]}));
 });
 await boot(page);
 await page.locator('#mainNav [data-view="betting"]').click();
 await expect(page.locator('#bettingView [data-betting-open-row]')).toHaveCount(0);
 await expect(page.locator('#bettingView')).not.toContainText('LEGACY ONLY');
});
