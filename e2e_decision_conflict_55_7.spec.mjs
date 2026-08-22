import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Decision Conflict 55.7 exposes disagreements and stays click-only',async({page})=>{
 const stale=new Date(Date.now()-90*3600000).toISOString(),event=new Date(Date.now()+2*86400000).toISOString().slice(0,10);
 const state={meta:{schemaVersion:80},xtbHub:{asOf:stale,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:100000,volume:10,net_profit_pct:55,net_profit:38000,currency:'CZK'}]}}},xtbReport:{asOf:stale,czkValue:100000,czkProfit:38000,positions:[{ticker:'WDAY.US',name:'Workday',weightPct:18}]},ticketBook:{items:[{id:'t1',name:'Koncert A',workflow:'LISTED',date:event,sellBy:event,qty:4,buy:8000,listPrice:3000,marketPrice:2600,marketCheckedAt:stale,marketSourceUrl:'https://example.com/market',floorPrice:2300,transferStatus:'READY',feeRate:.12}]}};
 await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_CONFLICT_557_LAST__||null)).toBeNull();
 const result=await page.evaluate(async()=>{const m=await import('./js/decisionConflict557.js'),s=JSON.parse(localStorage.getItem('kamil-os-state'));return m.decisionConflict557(s)});
 expect(result.total).toBeGreaterThan(0);
 expect(result.conflicts.length).toBeGreaterThan(0);
 expect(result.rows.some(x=>x.severity==='KONFLIKT'||x.severity==='KRITICKÝ')).toBe(true);
 const diag=await page.evaluate(()=>window.__KAMIL_CONFLICT_557_LAST__);expect(diag.ms).toBeLessThan(500);
});

test('Conflict detector opens only after explicit click from Confidence',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_CONFLICT_557_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Rozhodnutí'}).first().click();
 await page.getByRole('button',{name:'Execution Readiness'}).click();
 await page.getByRole('button',{name:'Confidence 55.6'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Confidence 55.6'})).toBeVisible();
 expect(await page.evaluate(()=>window.__KAMIL_CONFLICT_557_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Konflikty 55.7'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Konflikty 55.7'})).toBeVisible();
 await expect(page.locator('#modalHost')).toContainText('DECISION CONFLICT DETECTOR 55.7');
 await expect(page.locator('#modalHost')).toContainText('nic automaticky neobchoduje');
 expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});
