import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
async function boot(page){
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await expect(page.locator('[data-os2-today]')).toBeVisible({timeout:10000});
}
test('OS1335 replaces stale betting data with the final Sep 23 master once',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('kamil-os-state',JSON.stringify({
   meta:{schemaVersion:80,createdAt:new Date().toISOString()},
   bettingLedger:{bets:[{id:'old',status:'OPEN',label:'OLD',stakeCzk:123}],bankrollCzk:0,unitCzk:0,updatedAt:'2026-09-01T00:00:00Z'}
  }));
 });
 await boot(page);
 await page.locator('#mainNav [data-view="betting"]').click();
 await expect(page.locator('#view-betting')).toHaveClass(/on/);
 await expect(page.locator('#bettingView [data-betting-open-row]')).toHaveCount(58);
 const d=await page.evaluate(()=>({
  overview:window.__KAMIL_BETTING_OVERVIEW__,
  ledger:JSON.parse(localStorage.getItem('kamil-os-state')||'{}').bettingLedger
 }));
 expect(d.overview.masterId).toBe('sazky_portfolio_FINAL_2026-09-23');
 expect(d.overview.ticketCount).toBe(140);
 expect(d.overview.positionCount).toBe(58);
 expect(d.overview.openPositions).toBe(58);
 expect(d.overview.openTickets).toBe(140);
 expect(d.overview.exposure).toBe(277000);
 await expect(page.locator('#bettingView')).toContainText('58 pozic');
 await expect(page.locator('#bettingView')).toContainText('140 tiketů');
 expect(d.ledger.masterMeta.totalStakedCzk).toBe(277000);
 expect(d.ledger.masterMeta.potentialPayoutCzk).toBe(1779165);
 expect(d.ledger.masterMeta.remainingToPlaceCzk).toBe(0);
 expect(d.ledger.masterMeta.categoryTotals['Evropské poháry']).toBe(123000);
 expect(d.ledger.masterMeta.categoryTotals['Domácí liga']).toBe(114000);
 expect(d.ledger.masterMeta.categoryTotals['Liga národů']).toBe(40000);
 expect(d.ledger.bets.reduce((a,x)=>a+Number(x.stakeCzk||0),0)).toBe(277000);
});
