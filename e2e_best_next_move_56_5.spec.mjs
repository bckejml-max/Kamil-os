import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const seed=()=>{const fresh=new Date().toISOString(),event=new Date(Date.now()+2*86400000).toISOString().slice(0,10);return{meta:{schemaVersion:80},financePlan:{plannedInvestment:25000},xtbHub:{asOf:fresh,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:100000,volume:10,net_profit_pct:45,net_profit:31000,currency:'CZK'}]}}},xtbReport:{asOf:fresh,czkValue:100000,czkProfit:31000,positions:[{ticker:'WDAY.US',name:'Workday',valueCZK:100000,profitCZK:31000}]},ticketBook:{items:[{id:'t1',name:'Koncert A',workflow:'LISTED',date:event,sellBy:event,qty:4,buy:8000,listPrice:3000,marketPrice:2800,marketCheckedAt:fresh,marketSourceUrl:'https://example.com/market',floorPrice:2300,transferStatus:'READY',feeRate:.12}]}}};
const mutationFingerprint=()=>{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return{lastMutationAt:s.meta?.lastMutationAt||null,audit:JSON.stringify(s.audit||[]),history:JSON.stringify(s.marketDecisionHistory||null),tickets:JSON.stringify(s.ticketBook?.items||[]),xtb:JSON.stringify({asOf:s.xtbReport?.asOf,czkValue:s.xtbReport?.czkValue,czkProfit:s.xtbReport?.czkProfit,positions:s.xtbReport?.positions||[]})}};

test('Best Next Move 56.5 ranks only executable candidates with grounded urgency and risk',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const result=await page.evaluate(async()=>{const m=await import('./js/bestNextMove565.js');return m.rankBestNextMove565({plan:{now:[{domain:'Vstupenky',id:'t1',name:'Koncert A',verdict:'SELL',instruction:'Prodat 4 ks Koncert A',priority:95,confidence:90,days:2,capitalDirection:'RELEASE',capitalAmount:9856,capitalCurrency:'CZK'},{domain:'XTB',ticker:'WDAY.US',name:'Workday',verdict:'SELL',instruction:'Prodat 2 ks WDAY.US',priority:88,confidence:85,capitalDirection:'RELEASE',capitalAmount:20000,capitalCurrency:'CZK'}]},tickets:[{domain:'Vstupenky',id:'t1',action:'SELL',targetPrice:2800,safePrice:2300,conditionalProfit:1856,conditionalNetRevenue:9856}],xtb:[{domain:'XTB',ticker:'WDAY.US',action:'SELL',canSimulate:true,weightBefore:40,weightAfter:33,concentrationAfter:'VYSOKÁ KONCENTRACE'}]})});
 expect(result.total).toBe(2);expect(result.winner.domain).toBe('Vstupenky');expect(result.winner.score).toBeGreaterThan(result.runnerUp.score);expect(result.winner.reasons.some(x=>/časová urgence/i.test(x))).toBe(true);expect(result.runnerUp.warnings.some(x=>/vysoká koncentrace/i.test(x))).toBe(true);
});

test('Best Next Move 56.5 reads current state without mutating market data',async({page})=>{
 const state=seed();await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>{try{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return s.meta?.migratedFrom===80&&Array.isArray(s.ticketBook?.watchlist)}catch{return false}});
 const before=await page.evaluate(mutationFingerprint);
 const result=await page.evaluate(async()=>{const m=await import('./js/bestNextMove565.js'),s=JSON.parse(localStorage.getItem('kamil-os-state'));return m.bestNextMove565(s)});
 expect(result.total).toBeGreaterThan(0);expect(result.winner).toBeTruthy();expect(result.rows.every(x=>['BUY','SELL','REPRICE'].includes(x.verdict))).toBe(true);
 const after=await page.evaluate(mutationFingerprint);expect(after).toEqual(before);
 const diag=await page.evaluate(()=>window.__KAMIL_BEST_MOVE_565_LAST__);expect(diag.ms).toBeLessThan(500);
});

test('Best Next Move 56.5 stays lazy and opens only after explicit click',async({page})=>{
 const state=seed();await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_BEST_MOVE_565_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Akční fronta'}).first().click();
 await page.getByRole('button',{name:'Exact Today Plan 56.1'}).click();
 await page.getByRole('button',{name:'After Action 56.4'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / After Action 56.4'})).toBeVisible();
 expect(await page.evaluate(()=>window.__KAMIL_BEST_MOVE_565_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Best Next Move 56.5'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Best Next Move 56.5'})).toBeVisible();
 await expect(page.locator('#modalHost')).toContainText('BEST NEXT MOVE 56.5');
 await expect(page.locator('#modalHost')).toContainText(/Score je priorita provedení, ne pravděpodobnost zisku/i);
 expect(await page.evaluate(()=>window.__KAMIL_BEST_MOVE_565_LAST__||null)).not.toBeNull();expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});
