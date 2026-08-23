import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const fresh=()=>new Date().toISOString();
const waitMigrated=page=>page.waitForFunction(()=>{try{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return s.meta?.migratedFrom===80&&Array.isArray(s.ticketBook?.watchlist)}catch{return false}});
const mutationFingerprint=()=>{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return{last:s.meta?.lastMutationAt||null,audit:JSON.stringify(s.audit||[]),receipts:JSON.stringify(s.marketExecutionHistory?.receipts||[]),xtb:JSON.stringify(s.xtbReport||{}),tickets:JSON.stringify(s.ticketBook?.items||[])}};

function uiState(){const at=fresh(),s={meta:{schemaVersion:80},financePlan:{plannedInvestment:25000},marketCapital:{available:30000,reserved:10000},xtbHub:{asOf:at,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:100000,volume:10,net_profit_pct:45,net_profit:31000,currency:'CZK'}]}}},xtbReport:{asOf:at,czkValue:100000,czkProfit:31000,positions:[{ticker:'WDAY.US',name:'Workday',valueCZK:100000,profitCZK:31000,net_profit_pct:45}]},ticketBook:{items:[]}};s.marketExecutionHistory={receipts:[{id:'ui-593',at,domain:'XTB',key:'XTB:WDAY.US',ticker:'WDAY.US',verdict:'SELL',instruction:'Prodat část WDAY.US',currency:'CZK',proposedQty:2,proposedPrice:1200,proposedAmount:2400,actualQty:2,actualPrice:1210,fingerprint:JSON.stringify({domain:'XTB',ticker:'WDAY.US',hubAsOf:at,reportAsOf:at,accountCurrency:'CZK',qty:10,hubValue:100000,reportValue:100000,reportProfit:31000,price:null}),source:'MANUAL_CONFIRMATION_59_1'}]};return s}

test('59.3 compares plan, manual receipt and refreshed state without inventing net cash',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const out=await page.evaluate(async()=>{
  const r=await import('./js/executionReceipt591.js'),m=await import('./js/postExecutionReality593.js');
  const old='2026-08-23T10:00:00.000Z',next='2026-08-23T11:00:00.000Z',pre={xtbHub:{asOf:old,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',volume:10,value:100000}]}}},xtbReport:{asOf:old,czkValue:100000,positions:[{ticker:'WDAY.US',valueCZK:100000,profitCZK:30000}]},ticketBook:{items:[]}},fp=r.actionFingerprint591(pre,{domain:'XTB',ticker:'WDAY.US'});
  const receipt={id:'x-ok',at:old,domain:'XTB',key:'XTB:WDAY.US',ticker:'WDAY.US',verdict:'SELL',instruction:'Sell WDAY',currency:'CZK',proposedQty:2,proposedPrice:1200,proposedAmount:2400,actualQty:2,actualPrice:1210,fingerprint:fp};
  const current=structuredClone(pre);current.xtbHub.asOf=next;current.xtbReport.asOf=next;current.xtbHub.accounts.CZK.positions[0].volume=8;current.xtbHub.accounts.CZK.positions[0].value=80000;current.xtbReport.positions[0].valueCZK=80000;current.xtbReport.czkValue=80000;current.marketExecutionHistory={receipts:[receipt]};
  const immutable=JSON.stringify(current),ok=m.postExecutionReality593(current).rows[0];
  const changedReceipt={...receipt,id:'x-diff',proposedQty:2,actualQty:1};const changed=structuredClone(pre);changed.xtbHub.asOf=next;changed.xtbReport.asOf=next;changed.xtbHub.accounts.CZK.positions[0].volume=9;changed.marketExecutionHistory={receipts:[changedReceipt]};const partial=m.postExecutionReality593(changed).rows[0];
  const waitState=structuredClone(pre);waitState.marketExecutionHistory={receipts:[receipt]};const waiting=m.postExecutionReality593(waitState).rows[0];
  const mismatchState=structuredClone(pre);mismatchState.xtbHub.asOf=next;mismatchState.xtbReport.asOf=next;mismatchState.marketExecutionHistory={receipts:[receipt]};const mismatch=m.postExecutionReality593(mismatchState).rows[0];
  return{ok,partial,waiting,mismatch,immutable:immutable===JSON.stringify(current)};
 });
 expect(out.ok.realityCode).toBe('MATCH');expect(out.ok.state.qtyBefore).toBe(10);expect(out.ok.state.qtyAfter).toBe(8);expect(out.ok.comparison.actualGross).toBe(2420);expect(out.ok.comparison.grossDiff).toBe(20);expect(out.ok.unknown.join(' ')).toMatch(/čistý cash/i);
 expect(out.partial.realityCode).toBe('PARTIAL');expect(out.partial.comparison.reasons.join(' ')).toMatch(/množství plán/i);
 expect(out.waiting.realityCode).toBe('UNKNOWN');expect(out.mismatch.realityCode).toBe('MISMATCH');expect(out.immutable).toBe(true);
});

test('59.3 stays lazy behind reconciliation and writes nothing',async({page})=>{
 const state=uiState();await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});await waitMigrated(page);const before=await page.evaluate(mutationFingerprint);
 expect(await page.evaluate(()=>window.__KAMIL_POST_EXECUTION_593_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Market Commander'}).first().click();await expect(page.locator('#modalHost')).toContainText('MARKET COMMANDER 59.0');
 await page.getByRole('button',{name:'Ověřit provedení 59.2'}).click();await expect(page.getByRole('heading',{name:'XTB + vstupenky / Execution Reconciliation 59.2'})).toBeVisible();expect(await page.evaluate(()=>window.__KAMIL_POST_EXECUTION_593_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Reality Check 59.3'}).click();await expect(page.getByRole('heading',{name:'XTB + vstupenky / Post-Execution Reality Check 59.3'})).toBeVisible();await expect(page.locator('#modalHost')).toContainText('POST-EXECUTION REALITY CHECK 59.3');await expect(page.locator('#modalHost')).toContainText(/UNKNOWN znamená/i);await expect(page.locator('#modalHost')).toContainText(/nic se neobchoduje/i);
 const diag=await page.evaluate(()=>window.__KAMIL_POST_EXECUTION_593_LAST__);expect(diag.total).toBe(1);expect(diag.unknown).toBe(1);expect(diag.ms).toBeLessThan(1000);const after=await page.evaluate(mutationFingerprint);expect(after).toEqual(before);expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});
