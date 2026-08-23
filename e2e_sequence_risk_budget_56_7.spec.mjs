import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const seed=()=>{const fresh=new Date().toISOString(),event1=new Date(Date.now()+2*86400000).toISOString().slice(0,10),event2=new Date(Date.now()+3*86400000).toISOString().slice(0,10);return{meta:{schemaVersion:80},financePlan:{plannedInvestment:25000},xtbHub:{asOf:fresh,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:100000,volume:10,net_profit_pct:45,net_profit:31000,currency:'CZK'}]}}},xtbReport:{asOf:fresh,czkValue:100000,czkProfit:31000,positions:[{ticker:'WDAY.US',name:'Workday',valueCZK:100000,profitCZK:31000}]},ticketBook:{items:[{id:'t1',name:'Koncert A',workflow:'LISTED',date:event1,sellBy:event1,qty:4,buy:8000,listPrice:3000,marketPrice:2800,marketCheckedAt:fresh,marketSourceUrl:'https://example.com/a',floorPrice:2300,transferStatus:'READY',feeRate:.12},{id:'t2',name:'Koncert B',workflow:'LISTED',date:event2,sellBy:event2,qty:2,buy:3600,listPrice:2600,marketPrice:2500,marketCheckedAt:fresh,marketSourceUrl:'https://example.com/b',floorPrice:2100,transferStatus:'READY',feeRate:.12}]}}};
const mutationFingerprint=()=>{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return{lastMutationAt:s.meta?.lastMutationAt||null,audit:JSON.stringify(s.audit||[]),history:JSON.stringify(s.marketDecisionHistory||null),tickets:JSON.stringify(s.ticketBook?.items||[]),xtb:JSON.stringify({asOf:s.xtbReport?.asOf,czkValue:s.xtbReport?.czkValue,czkProfit:s.xtbReport?.czkProfit,positions:s.xtbReport?.positions||[]})}};

test('Sequence Risk Budget 56.7 blocks a step that breaches the baseline risk ceiling',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const gate=await page.evaluate(async()=>{const m=await import('./js/sequenceRiskBudget567.js');const base={overall:40,xtb:{known:true,topWeight:8},tickets:{max:30,capital:10000}},before={overall:35,xtb:{known:true,topWeight:7},tickets:{max:25,capital:8000}},after={overall:46,xtb:{known:true,topWeight:13},tickets:{max:25,capital:8000}};return m.riskGate567(base,before,after,0)});
 expect(gate.allowed).toBe(false);expect(gate.ceiling).toBe(40);expect(gate.reasons.join(' ')).toMatch(/koncentrace|budget ceiling/i);
});

test('Sequence Risk Budget 56.7 recalculates accepted steps without mutating stored market data',async({page})=>{
 const state=seed();await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>{try{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return s.meta?.migratedFrom===80&&Array.isArray(s.ticketBook?.watchlist)}catch{return false}});
 const before=await page.evaluate(mutationFingerprint);
 const result=await page.evaluate(async()=>{const m=await import('./js/sequenceRiskBudget567.js'),s=JSON.parse(localStorage.getItem('kamil-os-state'));return m.sequenceRiskBudget567(s,3)});
 expect(result.total).toBeGreaterThan(0);expect(result.steps.length).toBeLessThanOrEqual(3);expect(result.finalRisk.overall).toBeLessThanOrEqual(result.ceiling);
 for(const step of result.steps){expect(step.riskGate.allowed).toBe(true);expect(step.riskAfter.overall).toBeLessThanOrEqual(result.ceiling)}
 const after=await page.evaluate(mutationFingerprint);expect(after).toEqual(before);
 const diag=await page.evaluate(()=>window.__KAMIL_SEQUENCE_RISK_567_LAST__);expect(diag.steps).toBe(result.steps.length);expect(diag.ms).toBeLessThan(1500);
});

test('Sequence Risk Budget 56.7 stays lazy and opens only after explicit click',async({page})=>{
 const state=seed();await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_SEQUENCE_RISK_567_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Akční fronta'}).first().click();
 await page.getByRole('button',{name:'Exact Today Plan 56.1'}).click();
 await page.getByRole('button',{name:'After Action 56.4'}).click();
 await page.getByRole('button',{name:'Best Next Move 56.5'}).click();
 await page.getByRole('button',{name:'Action Sequence 56.6'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Action Sequence 56.6'})).toBeVisible();
 expect(await page.evaluate(()=>window.__KAMIL_SEQUENCE_RISK_567_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Risk Budget 56.7'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Sequence Risk Budget 56.7'})).toBeVisible();
 await expect(page.locator('#modalHost')).toContainText('SEQUENCE RISK BUDGET 56.7');
 await expect(page.locator('#modalHost')).toContainText(/Nic nezapisuje, nenakupuje, neprodává ani nepřecenňuje/i);
 expect(await page.evaluate(()=>window.__KAMIL_SEQUENCE_RISK_567_LAST__||null)).not.toBeNull();expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});
