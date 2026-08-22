import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Decision Change 56.3 explains verdict and ticket price changes without writing',async({page})=>{
 const fresh=new Date().toISOString(),old=new Date(Date.now()-48*3600000).toISOString(),event=new Date(Date.now()+2*86400000).toISOString().slice(0,10);
 const state={meta:{schemaVersion:80},financePlan:{plannedInvestment:25000},xtbHub:{asOf:fresh,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:100000,volume:10,net_profit_pct:45,net_profit:31000,currency:'CZK'}]}}},xtbReport:{asOf:fresh,czkValue:100000,czkProfit:31000,positions:[{ticker:'WDAY.US',name:'Workday',valueCZK:100000,profitCZK:31000}]},ticketBook:{items:[{id:'t1',name:'Koncert A',workflow:'LISTED',date:event,sellBy:event,qty:4,buy:8000,listPrice:3000,marketPrice:2800,marketCheckedAt:fresh,marketSourceUrl:'https://example.com/market',floorPrice:2300,transferStatus:'READY',feeRate:.12}]},marketDecisionHistory:{snapshots:[{at:old,rows:[{key:'XTB:WDAY.US',domain:'XTB',name:'Workday',ticker:'WDAY.US',verdict:'HOLD',bucket:'WAIT',confidence:45,readiness:'READY',targetPrice:null,safePrice:null,market:null,xtbAsOf:old},{key:'TICKET:t1',domain:'Vstupenky',name:'Koncert A',id:'t1',verdict:'HOLD',bucket:'WAIT',confidence:50,readiness:'READY',targetPrice:2500,safePrice:2300,market:2400,marketCheckedAt:old}]}]}};
 await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_CHANGE_563_LAST__||null)).toBeNull();
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('kamil-os-state')).marketDecisionHistory.snapshots.length);
 const result=await page.evaluate(async()=>{const m=await import('./js/decisionChange563.js'),s=JSON.parse(localStorage.getItem('kamil-os-state'));return m.decisionChangeTracker563(s)});
 expect(result.previous).toBeTruthy();expect(result.changed.length).toBeGreaterThan(0);
 expect(result.changed.some(x=>x.reasons.some(r=>/Market 2|Target 2|Floor 2/.test(r)))).toBe(true);
 expect(result.changed.some(x=>x.reasons.some(r=>/Verdikt|XTB import je novější/.test(r)))).toBe(true);
 const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('kamil-os-state')).marketDecisionHistory.snapshots.length);expect(after).toBe(before);
 const diag=await page.evaluate(()=>window.__KAMIL_CHANGE_563_LAST__);expect(diag.ms).toBeLessThan(500);expect(diag.hasBaseline).toBe(true);
});

test('Decision Change stays lazy and snapshot needs explicit confirmation',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_CHANGE_563_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Akční fronta'}).first().click();
 await page.getByRole('button',{name:'Exact Today Plan 56.1'}).click();
 await page.getByRole('button',{name:'Recheck Triggers 56.2'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Recheck Triggers 56.2'})).toBeVisible();
 expect(await page.evaluate(()=>window.__KAMIL_CHANGE_563_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Změny 56.3'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Změny 56.3'})).toBeVisible();
 await expect(page.locator('#modalHost')).toContainText('DECISION CHANGE TRACKER 56.3');
 const count=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('kamil-os-state')||'{}').marketDecisionHistory?.snapshots?.length||0);
 const before=await count();
 await page.getByRole('button',{name:'Uložit nový snapshot'}).click();
 await expect(page.getByRole('heading',{name:'Potvrdit market snapshot'})).toBeVisible();
 expect(await count()).toBe(before);
 await page.getByRole('button',{name:'Potvrdit uložení'}).click();
 await expect(page.getByRole('heading',{name:'Snapshot uložen'})).toBeVisible();
 expect(await count()).toBe(before+1);
 expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});
