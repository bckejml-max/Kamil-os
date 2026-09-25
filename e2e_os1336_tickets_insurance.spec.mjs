import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
async function boot(page){
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await expect(page.locator('[data-os2-today]')).toBeVisible({timeout:10000});
}
test('OS1336 seeds Flipovani 2024-2026 totals and keeps color statuses authoritative',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:80,createdAt:new Date().toISOString()},ticketBook:{items:[],watchlist:[],history:[],review:[]},personalAdmin:{items:[]}})));
 await boot(page);
 await page.locator('#mainNav [data-view="tickets"]').click();
 await expect(page.locator('#view-tickets')).toHaveClass(/on/);
 await expect(page.locator('#ticketIntelView')).toContainText('Flipování 2024–2026');
 const d=await page.evaluate(()=>{
  const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');
  return {master:s.ticketBook?.masterMeta,items:s.ticketBook?.items,diag:window.__KAMIL_TICKET_OVERVIEW__};
 });
 expect(d.master.ticketQty).toBe(2266);
 expect(d.master.years['2024'].qty).toBe(702);
 expect(d.master.years['2025'].qty).toBe(1293);
 expect(d.master.years['2026'].qty).toBe(271);
 expect(d.master.buyTotalCzk).toBeCloseTo(4382826.31,2);
 expect(d.master.sellTotalCzk).toBeCloseTo(5700287.82,2);
 expect(d.items.length).toBe(109);
 expect(d.items.filter(x=>x.marketStatus==='SOLD_UNDELIVERED').length).toBe(0);
 expect(d.items.filter(x=>x.issue==='REKLAMACE').length).toBe(3);
 expect(d.diag.issues).toBe(3);
 expect(d.diag.activeQty).toBe(34);
 expect(d.diag.capital).toBeCloseTo(45692,2);
 await expect(page.locator('#ticketIntelView')).toContainText('Česko - Chorvatsko');
 await expect(page.locator('#ticketIntelView')).toContainText('Česko - Anglie');
 await expect(page.locator('#ticketIntelView')).not.toContainText('Davis Cup');
});
test('OS1336 Insurance Center separates active upcoming terminating offers and history',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="more"]').click();
 await expect(page.locator('#view-more')).toHaveClass(/on/);
 await expect(page.locator('#insurance25Tile')).toBeVisible({timeout:10000});
 await page.locator('#insurance25Tile').click();
 await expect(page.locator('#moreView')).toContainText('Všechny pojistky na jednom místě');
 await expect(page.locator('#moreView')).toContainText('Tereza · NN Orange Risk');
 await expect(page.locator('#moreView')).toContainText('Fiat Croma');
 await expect(page.locator('#moreView')).toContainText('Pasohlávky 157 · MaxDomov VIP');
 const d=await page.evaluate(()=>window.__KAMIL_INSURANCE_CENTER1336__);
 expect(d.active).toBe(3);
 expect(d.upcoming).toBe(1);
 expect(d.terminating).toBe(2);
 expect(d.review).toBe(2);
 expect(d.offers).toBe(2);
 expect(d.history).toBe(6);
 expect(d.total).toBe(16);
 await page.locator('#insuranceBack25').click();
 await expect(page.locator('#moreView [data-documents-page1500]')).toBeVisible();
 await expect(page.locator('#insurance25Tile')).toBeVisible();
});

test('OS737.0.24 keeps superseded recovery insurance out of active attention',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="more"]').click();
 await expect(page.locator('#view-more')).toHaveClass(/on/);
 const text=await page.locator('#moreView').innerText();
 expect(text).toContain('Nahrazeno registrem');
 expect(text).not.toContain('Najít novější platbu 574 Kč');
 expect(text).not.toContain('Najít aktuální zelenou kartu nebo poslední zaplacené pojistné');
});
