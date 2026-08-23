import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const staleState=()=>{const stale=new Date(Date.now()-90*3600000).toISOString(),event=new Date(Date.now()+2*86400000).toISOString().slice(0,10);return{meta:{schemaVersion:80},financePlan:{plannedInvestment:25000},xtbHub:{asOf:stale,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:100000,volume:10,net_profit_pct:55,net_profit:38000,currency:'CZK'}]}}},xtbReport:{asOf:stale,czkValue:100000,czkProfit:38000,positions:[{ticker:'WDAY.US',name:'Workday',valueCZK:100000,profitCZK:38000,weightPct:18}]},ticketBook:{items:[{id:'t1',name:'Koncert A',workflow:'LISTED',date:event,sellBy:event,qty:4,buy:8000,listPrice:3000,marketPrice:2600,marketCheckedAt:stale,marketSourceUrl:'https://example.com/market',floorPrice:2300,transferStatus:'READY',feeRate:.12}]}}};
const waitMigrated=page=>page.waitForFunction(()=>{try{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return s.meta?.migratedFrom===80&&Array.isArray(s.ticketBook?.watchlist)}catch{return false}});
const fingerprint=()=>{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return{last:s.meta?.lastMutationAt||null,audit:JSON.stringify(s.audit||[]),receipts:JSON.stringify(s.marketExecutionHistory?.receipts||[]),xtb:JSON.stringify(s.xtbReport||{}),tickets:JSON.stringify(s.ticketBook?.items||[])}};

test('59.4 selects one concrete blocker from existing recheck rules without writes',async({page})=>{
 const state=staleState();await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});await waitMigrated(page);const before=await page.evaluate(fingerprint);
 expect(await page.evaluate(()=>window.__KAMIL_BLOCKER_594_LAST__||null)).toBeNull();
 const out=await page.evaluate(async()=>{const m=await import('./js/commanderBlocker594.js'),s=JSON.parse(localStorage.getItem('kamil-os-state'));return m.commanderBlockerResolver594(s)});
 expect(out.blocked).toBe(true);expect(out.rows.length).toBeGreaterThan(0);expect(out.top.source).toBe('RECHECK');expect(out.top.when).toMatch(/TEĎ|PODMÍNKA|TRIGGER/);expect(out.top.text).toMatch(/XTB import|market cenu|sizing|výsledc/i);
 const after=await page.evaluate(fingerprint);expect(after).toEqual(before);const diag=await page.evaluate(()=>window.__KAMIL_BLOCKER_594_LAST__);expect(diag.blocked).toBe(true);expect(diag.ms).toBeLessThan(1000);
});

test('59.4 stays lazy behind Post-Execution Reality and opens only after explicit click',async({page})=>{
 const state=staleState();await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});await waitMigrated(page);const before=await page.evaluate(fingerprint);
 expect(await page.evaluate(()=>window.__KAMIL_BLOCKER_594_LAST__||null)).toBeNull();
 await page.evaluate(async()=>{const m=await import('./js/postExecutionReality593.js');m.openPostExecutionReality593()});
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Post-Execution Reality Check 59.3'})).toBeVisible();expect(await page.evaluate(()=>window.__KAMIL_BLOCKER_594_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Blockery 59.4'}).click();await expect(page.getByRole('heading',{name:'XTB + vstupenky / Commander Blocker Resolver 59.4'})).toBeVisible();await expect(page.locator('#modalHost')).toContainText('COMMANDER BLOCKER RESOLVER 59.4');await expect(page.locator('#modalHost')).toContainText(/nic nesleduje na pozadí/i);
 expect(await page.evaluate(()=>window.__KAMIL_BLOCKER_594_LAST__||null)).not.toBeNull();expect(await page.evaluate(fingerprint)).toEqual(before);expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});
