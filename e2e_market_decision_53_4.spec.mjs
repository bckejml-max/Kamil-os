import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Decision 53.4 ranks XTB and ticket actions only after click',async({page})=>{
 const event=new Date(Date.now()+2*86400000).toISOString().slice(0,10),fresh=new Date().toISOString();
 const state={meta:{schemaVersion:80},financePlan:{plannedInvestment:25000},xtbHub:{asOf:fresh,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:100000,volume:10,net_profit_pct:45,net_profit:31000,currency:'CZK'}]}}},xtbReport:{asOf:fresh,czkValue:100000,czkProfit:31000},ticketBook:{items:[{id:'t1',name:'Koncert A',workflow:'LISTED',date:event,sellBy:event,qty:4,buy:8000,listPrice:3000,marketPrice:2800,marketUpdatedAt:fresh,feeRate:.12}]}};
 await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_DECISION_534_LAST__||null)).toBeNull();
 await expect(page.getByRole('button',{name:'Rozhodnutí'}).first()).toBeVisible();
 await page.getByRole('button',{name:'Rozhodnutí'}).first().click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Rozhodnutí 53.4'})).toBeVisible({timeout:5000});
 const text=page.locator('#modalHost');
 await expect(text).toContainText('Koncert A');
 await expect(text).toContainText('Workday');
 await expect(text).toContainText('PRODAT');
 await expect(text).toContainText('REDUKOVAT');
 await expect(text).toContainText('Decision Engine 53.4');
 const diag=await page.evaluate(()=>window.__KAMIL_DECISION_534_LAST__);
 expect(diag).not.toBeNull();expect(diag.ms).toBeLessThan(500);expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});
