import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const seed=()=>{const fresh=new Date().toISOString(),event=new Date(Date.now()+2*86400000).toISOString().slice(0,10);return{meta:{schemaVersion:80},financePlan:{plannedInvestment:25000},xtbHub:{asOf:fresh,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:100000,volume:10,net_profit_pct:45,net_profit:31000,currency:'CZK'}]}}},xtbReport:{asOf:fresh,czkValue:100000,czkProfit:31000,positions:[{ticker:'WDAY.US',name:'Workday',valueCZK:100000,profitCZK:31000}]},ticketBook:{items:[{id:'t1',name:'Koncert A',workflow:'LISTED',date:event,sellBy:event,qty:4,buy:8000,listPrice:3000,marketPrice:2800,marketCheckedAt:fresh,marketSourceUrl:'https://example.com/market',floorPrice:2300,transferStatus:'READY',feeRate:.12}]}}};

test('After Action 56.4 previews XTB weights and ticket inventory without writing',async({page})=>{
 const state=seed();await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const before=await page.evaluate(()=>localStorage.getItem('kamil-os-state'));
 const result=await page.evaluate(async()=>{const m=await import('./js/afterActionPreview564.js'),s=JSON.parse(localStorage.getItem('kamil-os-state'));return m.afterActionPreview564(s)});
 expect(result.total).toBeGreaterThan(0);expect(result.xtb.length).toBeGreaterThan(0);expect(result.tickets.length).toBeGreaterThan(0);
 const xtb=result.xtb[0];expect(xtb.canSimulate).toBe(true);expect(Number.isFinite(xtb.weightBefore)).toBe(true);expect(Number.isFinite(xtb.weightAfter)).toBe(true);expect(xtb.qtyAfter).toBeLessThanOrEqual(xtb.qtyBefore);
 const ticket=result.tickets[0];expect(ticket.qtyBefore).toBe(4);expect(ticket.qtyAfter).toBeLessThanOrEqual(ticket.qtyBefore);expect(Number.isFinite(ticket.conditionalNetRevenue)).toBe(true);expect(Number.isFinite(ticket.conditionalProfit)).toBe(true);
 const after=await page.evaluate(()=>localStorage.getItem('kamil-os-state'));expect(after).toBe(before);
 const diag=await page.evaluate(()=>window.__KAMIL_AFTER_ACTION_564_LAST__);expect(diag.ms).toBeLessThan(500);
});

test('After Action 56.4 stays lazy and opens only after explicit click',async({page})=>{
 const state=seed();await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_AFTER_ACTION_564_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Akční fronta'}).first().click();
 await page.getByRole('button',{name:'Exact Today Plan 56.1'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Exact Today Plan 56.1'})).toBeVisible();
 expect(await page.evaluate(()=>window.__KAMIL_AFTER_ACTION_564_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'After Action 56.4'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / After Action 56.4'})).toBeVisible();
 await expect(page.locator('#modalHost')).toContainText('AFTER ACTION PREVIEW 56.4');
 await expect(page.locator('#modalHost')).toContainText(/nezapisuje změny a nic nenakupuje/i);
 expect(await page.evaluate(()=>window.__KAMIL_AFTER_ACTION_564_LAST__||null)).not.toBeNull();expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});
