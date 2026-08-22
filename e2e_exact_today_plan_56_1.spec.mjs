import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Exact Today Plan 56.1 adds capital impact without inventing cross-currency totals',async({page})=>{
 const fresh=new Date().toISOString(),event=new Date(Date.now()+2*86400000).toISOString().slice(0,10);
 const state={meta:{schemaVersion:80},financePlan:{plannedInvestment:25000},xtbHub:{asOf:fresh,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:100000,volume:10,net_profit_pct:45,net_profit:31000,currency:'CZK'}]}}},xtbReport:{asOf:fresh,czkValue:100000,czkProfit:31000,positions:[{ticker:'WDAY.US',name:'Workday',valueCZK:100000,profitCZK:31000}]},ticketBook:{items:[{id:'t1',name:'Koncert A',workflow:'LISTED',date:event,sellBy:event,qty:4,buy:8000,listPrice:3000,marketPrice:2800,marketCheckedAt:fresh,marketSourceUrl:'https://example.com/market',floorPrice:2300,transferStatus:'READY',feeRate:.12}]}};
 await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_EXACT_TODAY_561_LAST__||null)).toBeNull();
 const result=await page.evaluate(async()=>{const m=await import('./js/exactTodayPlan561.js'),s=JSON.parse(localStorage.getItem('kamil-os-state'));return m.exactTodayPlan561(s)});
 expect(result.now.length).toBeGreaterThan(0);
 expect(result.now.every(x=>typeof x.capitalEffect==='string'&&x.capitalEffect.length>0)).toBe(true);
 const ticket=result.now.find(x=>x.domain==='Vstupenky');
 expect(ticket).toBeTruthy();expect(ticket.exactQty).toBe(4);expect(ticket.safePrice).toBeGreaterThan(0);expect(ticket.conditionalNetRevenue).toBeGreaterThan(0);expect(Number.isFinite(ticket.conditionalProfit)).toBe(true);
 const xtb=result.now.find(x=>x.domain==='XTB');expect(xtb).toBeTruthy();expect(xtb.capitalEffect).toMatch(/Uvolní|Použije|nelze přesně/i);
 const diag=await page.evaluate(()=>window.__KAMIL_EXACT_TODAY_561_LAST__);expect(diag.ms).toBeLessThan(500);
});

test('Exact Today Plan stays lazy and opens only after explicit click',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_EXACT_TODAY_561_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Akční fronta'}).first().click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Action Queue 55.9'})).toBeVisible();
 expect(await page.evaluate(()=>window.__KAMIL_EXACT_TODAY_561_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Exact Today Plan 56.1'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Exact Today Plan 56.1'})).toBeVisible();
 await expect(page.locator('#modalHost')).toContainText('EXACT TODAY PLAN 56.1');
 await expect(page.locator('#modalHost')).toContainText('Uvolní kapitál');
 await expect(page.locator('#modalHost')).toContainText(/Neprovádí nákup, prodej, převod ani repricing/i);
 expect(await page.evaluate(()=>window.__KAMIL_EXACT_TODAY_561_LAST__||null)).not.toBeNull();
 expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});
