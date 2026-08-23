import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const seed=()=>{const stale=new Date(Date.now()-90*3600000).toISOString(),event=new Date(Date.now()+5*86400000).toISOString().slice(0,10);return{meta:{schemaVersion:80},financePlan:{plannedInvestment:25000},marketCapital:{available:30000},xtbHub:{asOf:stale,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:100000,volume:10,net_profit_pct:45,net_profit:31000,currency:'CZK'}]}}},xtbReport:{asOf:stale,czkValue:100000,czkProfit:31000,positions:[{ticker:'WDAY.US',name:'Workday',valueCZK:100000,profitCZK:31000,weightPct:18}]},ticketBook:{items:[{id:'t1',name:'Koncert A',workflow:'LISTED',date:event,sellBy:event,qty:2,buy:4000,listPrice:2800,marketPrice:2700,marketCheckedAt:stale,marketSourceUrl:'https://example.com/a',floorPrice:2200,transferStatus:'READY',feeRate:.12}]}}};
const fingerprint=()=>{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return{last:s.meta?.lastMutationAt||null,audit:JSON.stringify(s.audit||[]),receipts:JSON.stringify(s.marketExecutionHistory?.receipts||[]),xtb:JSON.stringify(s.xtbReport||{}),tickets:JSON.stringify(s.ticketBook?.items||[])}};

test('59.9 promotes Resolution Loop to Home while keeping it lazy and read-only',async({page})=>{
 const state=seed();await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.locator('#todayView')).toContainText('COMMANDER HOME LOOP 59.9');
 const before=await page.evaluate(fingerprint);
 expect(await page.evaluate(()=>window.__KAMIL_RESOLUTION_LOOP_598_LAST__||null)).toBeNull();
 expect(await page.evaluate(()=>window.__KAMIL_MARKET_COMMANDER_587_LAST__||null)).toBeNull();
 const primary=page.getByRole('button',{name:'Co mám udělat teď'}).first();await expect(primary).toBeVisible();await primary.click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Resolution Loop 59.8'})).toBeVisible();
 await expect(page.locator('#modalHost')).toContainText('RESOLUTION LOOP 59.8');
 expect(await page.evaluate(()=>window.__KAMIL_RESOLUTION_LOOP_598_LAST__||null)).not.toBeNull();
 expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
 expect(await page.evaluate(fingerprint)).toEqual(before);
});

test('59.9 keeps legacy Commander available only as secondary diagnostics',async({page})=>{
 const state=seed();await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.getByRole('button',{name:'Commander diagnostika'}).first()).toBeVisible();
 expect(await page.evaluate(()=>window.__KAMIL_MARKET_COMMANDER_587_LAST__||null)).toBeNull();
});
