import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const seed=()=>{const fresh=new Date().toISOString();return{meta:{schemaVersion:80},financePlan:{plannedInvestment:25000},marketCapital:{available:30000,reserved:10000},xtbHub:{asOf:fresh,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:100000,volume:10,net_profit_pct:45,net_profit:31000,currency:'CZK'}]}}},xtbReport:{asOf:fresh,czkValue:100000,czkProfit:31000,positions:[{ticker:'WDAY.US',name:'Workday',valueCZK:100000,profitCZK:31000,net_profit_pct:45}]},ticketBook:{items:[]}}};
const waitMigrated=page=>page.waitForFunction(()=>{try{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return s.meta?.migratedFrom===80&&Array.isArray(s.ticketBook?.watchlist)}catch{return false}});
const fingerprint=()=>{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return{last:s.meta?.lastMutationAt||null,audit:JSON.stringify(s.audit||[]),receipts:JSON.stringify(s.marketExecutionHistory?.receipts||[]),xtb:JSON.stringify(s.xtbReport||{}),tickets:JSON.stringify(s.ticketBook?.items||[])}};

test('Commander 59.1 writes only after explicit execution confirmation and then blocks repeat action on unchanged data',async({page})=>{
 const state=seed();await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});await waitMigrated(page);
 const before=await page.evaluate(fingerprint);expect(await page.evaluate(()=>window.__KAMIL_EXECUTION_RECEIPT_591_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Market Commander'}).first().click();
 await expect(page.locator('#modalHost')).toContainText('MARKET COMMANDER 59.0');
 const checkin=page.getByRole('button',{name:'Provedl jsem to ručně'});await expect(checkin).toBeVisible();await checkin.click();
 await expect(page.getByRole('heading',{name:'Ručně provedená akce 59.1'})).toBeVisible();expect(await page.evaluate(fingerprint)).toEqual(before);
 await page.locator('input[name="actualQty"]').fill('2');await page.locator('input[name="actualPrice"]').fill('1234.5');
 await page.getByRole('button',{name:'Pokračovat k potvrzení'}).click();await expect(page.getByRole('heading',{name:'Potvrdit execution receipt'})).toBeVisible();expect(await page.evaluate(fingerprint)).toEqual(before);
 await page.getByRole('button',{name:'Potvrdit záznam'}).click();await expect(page.getByRole('heading',{name:'Execution receipt uložen'})).toBeVisible();
 const after=await page.evaluate(fingerprint);expect(JSON.parse(after.receipts)).toHaveLength(1);expect(after.last).not.toBe(before.last);expect(after.xtb).toBe(before.xtb);expect(after.tickets).toBe(before.tickets);expect(after.audit).toContain('Market execution receipt 59.1');
 const diag=await page.evaluate(()=>window.__KAMIL_EXECUTION_RECEIPT_591_LAST__);expect(diag.key).toBe('XTB:WDAY.US');expect(diag.actualQty).toBe(2);expect(diag.actualPrice).toBe(1234.5);
 await page.getByRole('button',{name:'Hotovo'}).click();await page.getByRole('button',{name:'Market Commander'}).first().click();
 await expect(page.locator('#modalHost')).toContainText(/Obnov data po ruční akci/i);await expect(page.getByRole('button',{name:'Provedl jsem to ručně'})).toHaveCount(0);
 expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});

test('59.1 receipt lock releases after relevant XTB source data changes',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const out=await page.evaluate(async()=>{const m=await import('./js/executionReceipt591.js'),fresh=new Date().toISOString(),s={xtbHub:{asOf:fresh,accounts:{CZK:{currency:'CZK',positions:[{ticker:'WDAY.US',volume:10,value:100000}]}}},xtbReport:{asOf:fresh,positions:[{ticker:'WDAY.US',valueCZK:100000,profitCZK:30000}]},ticketBook:{items:[]}},action={domain:'XTB',ticker:'WDAY.US'},fingerprint=m.actionFingerprint591(s,action);s.marketExecutionHistory={receipts:[{key:'XTB:WDAY.US',fingerprint,at:fresh}]};const locked=!!m.pendingExecutionReceipt591(s,action);s.xtbReport.asOf=new Date(Date.now()+60000).toISOString();const released=!m.pendingExecutionReceipt591(s,action);return{locked,released}});
 expect(out.locked).toBe(true);expect(out.released).toBe(true);
});
