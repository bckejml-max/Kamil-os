import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const seed=()=>{const fresh=new Date().toISOString(),event=new Date(Date.now()+5*86400000).toISOString().slice(0,10);return{meta:{schemaVersion:80},financePlan:{plannedInvestment:25000},marketCapital:{available:30000},xtbHub:{asOf:fresh,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:100000,volume:10,net_profit_pct:45,net_profit:31000,currency:'CZK'}]}}},xtbReport:{asOf:fresh,czkValue:100000,czkProfit:31000,positions:[{ticker:'WDAY.US',name:'Workday',valueCZK:100000,profitCZK:31000}]},ticketBook:{items:[{id:'t1',name:'Koncert A',workflow:'LISTED',date:event,sellBy:event,qty:2,buy:4000,listPrice:2800,marketPrice:2700,marketCheckedAt:fresh,marketSourceUrl:'https://example.com/a',floorPrice:2200,transferStatus:'READY',feeRate:.12}]}}};

test('Market Home 58.8 opens Market Commander in one click and stays lazy before click',async({page})=>{
 const state=seed();await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.locator('#todayView')).toContainText('MARKET HOME 58.8');
 expect(await page.evaluate(()=>window.__KAMIL_MARKET_COMMANDER_587_LAST__||null)).toBeNull();
 const commander=page.getByRole('button',{name:'Market Commander'}).first();await expect(commander).toBeVisible();await commander.click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Market Commander 58.7'})).toBeVisible();
 await expect(page.locator('#modalHost')).toContainText('MARKET COMMANDER 58.7');
 expect(await page.evaluate(()=>window.__KAMIL_MARKET_COMMANDER_587_LAST__||null)).not.toBeNull();
 expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});

test('Market Home 58.8 treats invalid XTB asOf as missing data',async({page})=>{
 const state=seed();state.xtbReport.asOf='not-a-date';await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.locator('#todayView')).toContainText('data bez data');
 await expect(page.locator('#todayView')).toContainText('Aktualizovat XTB data');
});
