import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const seed=()=>{const fresh=new Date().toISOString(),event=new Date(Date.now()+10*86400000).toISOString().slice(0,10),earn=new Date(Date.now()+2*86400000).toISOString().slice(0,10);return{meta:{schemaVersion:80},financePlan:{plannedInvestment:25000},marketCapital:{available:30000,reserved:10000},xtbStrategy:{earnings:{'WDAY.US':{date:earn}},theses:{'WDAY.US':{reason:'Růst cloud business',exitRule:'Fundamentální zhoršení'}}},xtbHub:{asOf:fresh,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:100000,volume:10,net_profit_pct:45,net_profit:31000,currency:'CZK'}]}}},xtbReport:{asOf:fresh,czkValue:100000,czkProfit:31000,positions:[{ticker:'WDAY.US',name:'Workday',valueCZK:100000,profitCZK:31000,net_profit_pct:45}]},xtbTradeHistory:[{ticker:'WDAY.US',side:'BUY',price:210,buyZoneGood:220,buyZoneIdeal:205,date:'2026-08-01'},{ticker:'WDAY.US',side:'TRIM',price:285,ruleMatched:true,confidenceAtExit:80,date:'2026-08-15'}],ticketBook:{items:[{id:'t1',name:'Koncert A',event:'Koncert A',workflow:'LISTED',date:event,sellBy:event,qty:4,buy:8000,listPrice:3000,marketPrice:2800,marketCheckedAt:fresh,marketSourceUrl:'https://example.com/a',floorPrice:2300,transferStatus:'READY',feeRate:.12,comparableListings:[2700,2800,2850,2900,3000,3100],officialInventory:120,sellout:{previousRemaining:200}}],opportunities:[{id:'o1',name:'Presale B',event:'Presale B',buyPrice:1200,expectedResale:2400,score:88,feeRate:.12}]}}};
const fingerprint=()=>{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return{lastMutationAt:s.meta?.lastMutationAt||null,audit:JSON.stringify(s.audit||[]),tickets:JSON.stringify(s.ticketBook?.items||[]),xtb:JSON.stringify(s.xtbReport||{}),capital:JSON.stringify(s.marketCapital||{})}};
const names=['capitalReusePlanner568','cashWaitingRoom569','buyOrderBuilder570','sellOrderBuilder571','portfolioHeatmap572','portfolioCleanupDetector573','thesisBreakDetector574','earningsPlaybook575','entryQualityTracker576','exitQualityTracker577','ticketMarketDepth578','ticketLiquidityScore579','ticketPriceBands580','ticketUndercutGuard581','ticketSelloutSignal582','presaleOpportunityCalculator583','eventCapitalLimit584','ticketPortfolioCalendar585','crossMarketCapitalRanking586','marketCommander587'];

test('Market Commander 58.7 exposes and computes all 20 upgrades without writes',async({page})=>{
 const state=seed();await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>{try{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return s.meta?.migratedFrom===80&&Array.isArray(s.ticketBook?.watchlist)}catch{return false}});
 const before=await page.evaluate(fingerprint);
 const result=await page.evaluate(async names=>{const m=await import('./js/marketCommander587.js'),s=JSON.parse(localStorage.getItem('kamil-os-state')),out={exports:names.every(n=>typeof m[n]==='function')};for(const n of names)out[n]=m[n](s);return out},names);
 expect(result.exports).toBe(true);
 expect(result.portfolioHeatmap572.length).toBeGreaterThan(0);
 expect(result.earningsPlaybook575[0].risk).toMatch(/VYSOKÉ|ZVÝŠENÉ|BĚŽNÉ/);
 expect(result.entryQualityTracker576[0].grade).toMatch(/A|B|C|NEZNÁMÉ/);
 expect(result.exitQualityTracker577[0].grade).toBe('A');
 expect(result.ticketMarketDepth578[0].count).toBe(6);
 expect(result.ticketLiquidityScore579[0].score).toBeGreaterThanOrEqual(0);
 expect(result.ticketPriceBands580[0].floor).toBeGreaterThan(0);
 expect(result.ticketSelloutSignal582[0].signal).toMatch(/INVENTORY RYCHLE KLESÁ|V PRODEJI|SOLD OUT/);
 expect(result.presaleOpportunityCalculator583[0].maxBuyAtTarget).toBeGreaterThan(0);
 expect(result.eventCapitalLimit584[0].capital).toBeGreaterThan(0);
 expect(result.ticketPortfolioCalendar585.length).toBeGreaterThanOrEqual(6);
 expect(result.crossMarketCapitalRanking586.length).toBeGreaterThan(0);
 expect(['ACT','VERIFY','WAIT']).toContain(result.marketCommander587.next.mode);
 const after=await page.evaluate(fingerprint);expect(after).toEqual(before);
 const diag=await page.evaluate(()=>window.__KAMIL_MARKET_COMMANDER_587_LAST__);expect(diag).not.toBeNull();expect(diag.ms).toBeLessThan(2000);
});

test('Market Commander 58.7 stays lazy and opens only after explicit click',async({page})=>{
 const state=seed();await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_MARKET_COMMANDER_587_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Akční fronta'}).first().click();
 await page.getByRole('button',{name:'Exact Today Plan 56.1'}).click();
 await page.getByRole('button',{name:'After Action 56.4'}).click();
 await page.getByRole('button',{name:'Best Next Move 56.5'}).click();
 await page.getByRole('button',{name:'Action Sequence 56.6'}).click();
 await page.getByRole('button',{name:'Risk Budget 56.7'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Sequence Risk Budget 56.7'})).toBeVisible();
 expect(await page.evaluate(()=>window.__KAMIL_MARKET_COMMANDER_587_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Market Commander 58.7'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Market Commander 58.7'})).toBeVisible();
 await expect(page.locator('#modalHost')).toContainText('MARKET COMMANDER 58.7');
 await expect(page.locator('#modalHost')).toContainText(/Nic automaticky nenakupuje, neprodává, nepřevádí měny ani nepřecenňuje/i);
 expect(await page.evaluate(()=>window.__KAMIL_MARKET_COMMANDER_587_LAST__||null)).not.toBeNull();expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});
