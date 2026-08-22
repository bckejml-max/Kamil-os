import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Market Suite 55.4 exposes all 20 XTB/ticket upgrades and stays click-only',async({page})=>{
 const fresh=new Date().toISOString(),event=new Date(Date.now()+6*86400000).toISOString().slice(0,10),earnings=new Date(Date.now()+2*86400000).toISOString().slice(0,10);
 const state={meta:{schemaVersion:80},financePlan:{plannedInvestment:25000},marketCapital:{available:30000},xtbHub:{asOf:fresh,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:100000,volume:10,net_profit_pct:45,net_profit:31000,currency:'CZK',earningsDate:earnings}]}}},xtbReport:{asOf:fresh,czkValue:100000,czkProfit:31000},xtbStrategy:{theses:{'WDAY.US':{reason:'Růst FCF',mustHold:'Růst tržeb',exitRule:'Zhoršení teze'}},watchlist:[{ticker:'MSFT.US',score:82,price:410,buyBelow:400}]},ticketBook:{items:[{id:'t1',name:'Koncert A',workflow:'LISTED',date:event,sellBy:event,qty:4,buy:8000,listPrice:3000,marketPrice:2800,marketCheckedAt:fresh,marketSourceUrl:'https://example.com/market',floorPrice:2300,transferStatus:'READY',feeRate:.12}],opportunities:[{id:'o1',name:'Presale B',event:'Presale B',buyPrice:1200,expectedResale:2400,score:88,feeRate:.12}]}};
 await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_MARKET_SUITE_554_LAST__||null)).toBeNull();
 const result=await page.evaluate(async()=>{
  const m=await import('./js/marketSuite554.js'),s=JSON.parse(localStorage.getItem('kamil-os-state'));
  const names=['xtbBuyZones','xtbProfitLadder','xtbExactSell','xtbMonthlyAllocation','xtbOpportunityScores','xtbConcentrationGuard','xtbEarningsRisk','xtbThesisTracker','xtbWatchlistRanking','xtbCashDeployment','ticketRepricingLadder','ticketNetProfit','ticketMinimumSafePrice','ticketBestSellTiming','ticketInventoryRisk','ticketCapitalRotation','ticketBuyOpportunities','ticketEventRanking','unifiedCapitalDecision','moneyCommand554'];
  const missing=names.filter(k=>typeof m[k]!=='function'),suite=m.marketSuite554(s);
  return{missing,suite,funcCount:names.length};
 });
 expect(result.missing).toEqual([]);expect(result.funcCount).toBe(20);
 expect(result.suite.buyZones[0].ticker).toBe('WDAY.US');
 expect(result.suite.profitLadder[0].hit.length).toBeGreaterThan(0);
 expect(result.suite.exactSell[0].qty).toBeGreaterThan(0);
 expect(result.suite.earnings[0].risk).toBe('VYSOKÉ');
 expect(result.suite.theses[0].hasThesis).toBe(true);
 expect(result.suite.watchlist[0].ticker).toBe('MSFT.US');
 expect(result.suite.repricing[0].steps.length).toBe(5);
 expect(result.suite.safePrice[0].safePrice).toBeGreaterThan(0);
 expect(result.suite.ticketOpportunities[0].action).toBe('A');
 expect(result.suite.capital.capital).toBe(30000);
 expect(result.suite.command.commands.length).toBeGreaterThan(0);
 const diag=await page.evaluate(()=>window.__KAMIL_MARKET_SUITE_554_LAST__);expect(diag.ms).toBeLessThan(500);
});

test('Market Suite 55.4 opens from Decision 53.4 and never auto-trades',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'Rozhodnutí'}).first().click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Rozhodnutí 53.4'})).toBeVisible({timeout:5000});
 await page.getByRole('button',{name:'Market Suite 55.4'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Market Suite 55.4'})).toBeVisible({timeout:5000});
 const text=page.locator('#modalHost');
 await expect(text).toContainText('ONE-SCREEN MONEY COMMAND');
 await expect(text).toContainText('Žádný obchod');
 expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});
