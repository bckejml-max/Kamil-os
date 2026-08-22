import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Action Queue 55.9 turns final verdicts into concrete manual steps',async({page})=>{
 const fresh=new Date().toISOString(),event=new Date(Date.now()+2*86400000).toISOString().slice(0,10);
 const state={meta:{schemaVersion:80},financePlan:{plannedInvestment:25000},xtbHub:{asOf:fresh,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:100000,volume:10,net_profit_pct:45,net_profit:31000,currency:'CZK'}]}}},xtbReport:{asOf:fresh,czkValue:100000,czkProfit:31000},ticketBook:{items:[{id:'t1',name:'Koncert A',workflow:'LISTED',date:event,sellBy:event,qty:4,buy:8000,listPrice:3000,marketPrice:2800,marketCheckedAt:fresh,marketSourceUrl:'https://example.com/market',floorPrice:2300,transferStatus:'READY',feeRate:.12}]}};
 await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_ACTION_QUEUE_559_LAST__||null)).toBeNull();
 const result=await page.evaluate(async()=>{const m=await import('./js/actionQueue559.js'),s=JSON.parse(localStorage.getItem('kamil-os-state'));return m.actionQueue559(s)});
 expect(result.total).toBeGreaterThan(0);
 expect(result.doNow.length).toBeGreaterThan(0);
 expect(result.rows.every(x=>x.instruction&&x.detail!==undefined)).toBe(true);
 expect(result.doNow.some(x=>x.domain==='XTB'&&/WDAY/i.test(x.instruction))).toBe(true);
 expect(result.doNow.some(x=>x.domain==='Vstupenky'&&/4 ks/.test(x.instruction))).toBe(true);
 const diag=await page.evaluate(()=>window.__KAMIL_ACTION_QUEUE_559_LAST__);expect(diag.ms).toBeLessThan(500);
});

test('Action Queue opens only after explicit click from Final Verdict',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_ACTION_QUEUE_559_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Rozhodnutí'}).first().click();
 await page.getByRole('button',{name:'Execution Readiness'}).click();
 await page.getByRole('button',{name:'Confidence 55.6'}).click();
 await page.getByRole('button',{name:'Konflikty 55.7'}).click();
 await page.getByRole('button',{name:'Final Verdict 55.8'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Final Verdict 55.8'})).toBeVisible();
 expect(await page.evaluate(()=>window.__KAMIL_ACTION_QUEUE_559_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Action Queue 55.9'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Action Queue 55.9'})).toBeVisible();
 await expect(page.locator('#modalHost')).toContainText('ACTION QUEUE 55.9');
 await expect(page.locator('#modalHost')).toContainText('UDĚLEJ TEĎ');
 await expect(page.locator('#modalHost')).toContainText(/nic automaticky nenakupuje/i);
 expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});
