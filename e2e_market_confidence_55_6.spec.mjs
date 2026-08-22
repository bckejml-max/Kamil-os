import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Market Confidence 55.6 scores freshness and quality without background execution',async({page})=>{
 const fresh=new Date().toISOString(),stale=new Date(Date.now()-80*3600000).toISOString(),event=new Date(Date.now()+5*86400000).toISOString().slice(0,10);
 const state={meta:{schemaVersion:80},xtbHub:{asOf:stale,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:100000,volume:10,net_profit_pct:45,net_profit:31000,currency:'CZK'}]}}},xtbReport:{asOf:stale,czkValue:100000,czkProfit:31000,positions:[{ticker:'WDAY.US',name:'Workday',weightPct:18}]},ticketBook:{items:[{id:'t1',name:'Koncert A',workflow:'LISTED',date:event,sellBy:event,qty:4,buy:8000,listPrice:3000,marketPrice:2800,marketCheckedAt:fresh,marketSourceUrl:'https://example.com/market',floorPrice:2300,transferStatus:'READY',feeRate:.12}]}};
 await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_CONFIDENCE_556_LAST__||null)).toBeNull();
 const result=await page.evaluate(async()=>{const m=await import('./js/marketConfidence556.js'),s=JSON.parse(localStorage.getItem('kamil-os-state'));return m.marketConfidence556(s)});
 expect(result.total).toBeGreaterThan(0);
 expect(result.xtb[0].confidence).toBeLessThan(65);
 expect(result.tickets[0].confidence).toBeGreaterThan(result.xtb[0].confidence);
 expect(result.average).toBeGreaterThanOrEqual(0);expect(result.average).toBeLessThanOrEqual(100);
 const diag=await page.evaluate(()=>window.__KAMIL_CONFIDENCE_556_LAST__);expect(diag.ms).toBeLessThan(500);
});

test('Confidence 55.6 opens only after explicit click from readiness',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_CONFIDENCE_556_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Rozhodnutí'}).first().click();
 await page.getByRole('button',{name:'Execution Readiness'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Execution Readiness 55.5'})).toBeVisible();
 expect(await page.evaluate(()=>window.__KAMIL_CONFIDENCE_556_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Confidence 55.6'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Confidence 55.6'})).toBeVisible();
 await expect(page.locator('#modalHost')).toContainText('Confidence měří kvalitu uložených dat');
 await expect(page.locator('#modalHost')).toContainText('nic automaticky neobchoduje');
 expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});
