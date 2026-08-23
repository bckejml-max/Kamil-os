import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Legacy Market Home keeps Action Queue directly available and lazy',async({page})=>{
 const fresh=new Date().toISOString(),event=new Date(Date.now()+2*86400000).toISOString().slice(0,10);
 const state={meta:{schemaVersion:80},financePlan:{plannedInvestment:25000},xtbHub:{asOf:fresh,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:100000,volume:10,net_profit_pct:45,net_profit:31000,currency:'CZK'}]}}},xtbReport:{asOf:fresh,czkValue:100000,czkProfit:31000,positions:[{ticker:'WDAY.US',name:'Workday',valueCZK:100000,profitCZK:31000}]},ticketBook:{items:[{id:'t1',name:'Koncert A',workflow:'LISTED',date:event,sellBy:event,qty:4,buy:8000,listPrice:3000,marketPrice:2800,marketCheckedAt:fresh,marketSourceUrl:'https://example.com/market',floorPrice:2300,transferStatus:'READY',feeRate:.12}]}};
 await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.locator('#todayView')).toContainText(/MARKET HOME (56\.0|58\.8)/);
 await expect(page.getByRole('button',{name:'Akční fronta'}).first()).toBeVisible();
 expect(await page.evaluate(()=>window.__KAMIL_ACTION_QUEUE_559_LAST__||null)).toBeNull();
 expect(await page.evaluate(()=>window.__KAMIL_FINAL_VERDICT_558_LAST__||null)).toBeNull();
 const home=await page.evaluate(()=>window.__KAMIL_MARKET_HOME_560_LAST__||null);
 expect(home).not.toBeNull();expect(home.ms).toBeLessThan(200);expect(home.lazyActionQueue).toBe(true);
 await page.getByRole('button',{name:'Akční fronta'}).first().click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Action Queue 55.9'})).toBeVisible({timeout:5000});
 await expect(page.locator('#modalHost')).toContainText('UDĚLEJ TEĎ');
 expect(await page.evaluate(()=>window.__KAMIL_ACTION_QUEUE_559_LAST__||null)).not.toBeNull();
 expect(await page.evaluate(()=>window.__KAMIL_FINAL_VERDICT_558_LAST__||null)).not.toBeNull();
 expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});
