import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Recheck Triggers 56.2 turns stale XTB and ticket data into explicit manual triggers',async({page})=>{
 const stale=new Date(Date.now()-90*3600000).toISOString(),event=new Date(Date.now()+2*86400000).toISOString().slice(0,10);
 const state={meta:{schemaVersion:80},financePlan:{plannedInvestment:25000},xtbHub:{asOf:stale,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:100000,volume:10,net_profit_pct:55,net_profit:38000,currency:'CZK'}]}}},xtbReport:{asOf:stale,czkValue:100000,czkProfit:38000,positions:[{ticker:'WDAY.US',name:'Workday',valueCZK:100000,profitCZK:38000,weightPct:18}]},ticketBook:{items:[{id:'t1',name:'Koncert A',workflow:'LISTED',date:event,sellBy:event,qty:4,buy:8000,listPrice:3000,marketPrice:2600,marketCheckedAt:stale,marketSourceUrl:'https://example.com/market',floorPrice:2300,transferStatus:'READY',feeRate:.12}]}};
 await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_RECHECK_562_LAST__||null)).toBeNull();
 const result=await page.evaluate(async()=>{const m=await import('./js/recheckTriggers562.js'),s=JSON.parse(localStorage.getItem('kamil-os-state'));return m.recheckTriggers562(s)});
 expect(result.items.length).toBeGreaterThan(0);
 expect(result.verifyNow.some(x=>x.domain==='XTB'&&x.triggers.some(t=>/XTB import/i.test(t.text)))).toBe(true);
 expect(result.verifyNow.some(x=>x.domain==='Vstupenky'&&x.triggers.some(t=>/market cenu/i.test(t.text)))).toBe(true);
 expect(result.items.every(x=>Array.isArray(x.triggers)&&x.triggers.length>0)).toBe(true);
 const diag=await page.evaluate(()=>window.__KAMIL_RECHECK_562_LAST__);expect(diag.ms).toBeLessThan(500);
});

test('Recheck Triggers stays lazy and opens only after explicit click',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_RECHECK_562_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Akční fronta'}).first().click();
 await page.getByRole('button',{name:'Exact Today Plan 56.1'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Exact Today Plan 56.1'})).toBeVisible();
 expect(await page.evaluate(()=>window.__KAMIL_RECHECK_562_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Recheck Triggers 56.2'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Recheck Triggers 56.2'})).toBeVisible();
 await expect(page.locator('#modalHost')).toContainText('RECHECK TRIGGERS 56.2');
 await expect(page.locator('#modalHost')).toContainText(/nic nesleduje na pozadí/i);
 expect(await page.evaluate(()=>window.__KAMIL_RECHECK_562_LAST__||null)).not.toBeNull();
 expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});
