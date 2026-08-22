import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Execution Readiness 55.5 blocks stale market actions and stays click-only',async({page})=>{
 const stale=new Date(Date.now()-80*3600000).toISOString(),event=new Date(Date.now()+5*86400000).toISOString().slice(0,10);
 const state={meta:{schemaVersion:80},xtbReport:{asOf:stale,positions:[{ticker:'WDAY.US',name:'Workday',weightPct:14,earningsDate:new Date(Date.now()+2*86400000).toISOString().slice(0,10)}]},xtbHub:{asOf:stale,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:100000,volume:10,weightPct:14,net_profit_pct:45,earningsDate:new Date(Date.now()+2*86400000).toISOString().slice(0,10)}]}}},ticketBook:{items:[{id:'t1',name:'Koncert A',workflow:'LISTED',date:event,sellBy:event,qty:4,buy:8000,listPrice:3000,marketPrice:2800,marketCheckedAt:new Date(Date.now()-30*3600000).toISOString(),marketSourceUrl:'https://example.com',transferStatus:'READY',feeRate:.12}]}};
 await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_READINESS_555_LAST__||null)).toBeNull();
 const x=await page.evaluate(async()=>{const m=await import('./js/executionReadiness555.js'),s=JSON.parse(localStorage.getItem('kamil-os-state'));return m.executionReadiness555(s)});
 expect(x.blocked).toBeGreaterThan(0);
 expect(x.tickets[0].readiness).toBe('NEJDŘÍV OVĚŘIT');
 expect(x.tickets[0].blockers.join(' ')).toContain('market cena');
 const diag=await page.evaluate(()=>window.__KAMIL_READINESS_555_LAST__);expect(diag.ms).toBeLessThan(500);
});

test('Execution Readiness 55.5 opens from Decision without automatic action',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'Rozhodnutí'}).first().click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Rozhodnutí 53.4'})).toBeVisible({timeout:5000});
 await page.getByRole('button',{name:'Execution Readiness 55.5'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Execution Readiness 55.5'})).toBeVisible({timeout:5000});
 await expect(page.locator('#modalHost')).toContainText('READY');
 await expect(page.locator('#modalHost')).toContainText('nic neobchoduje ani nepřecenňuje');
 expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});
