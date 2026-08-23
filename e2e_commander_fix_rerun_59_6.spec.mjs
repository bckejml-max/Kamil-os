import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const staleState=()=>{const stale=new Date(Date.now()-90*3600000).toISOString(),event=new Date(Date.now()+2*86400000).toISOString().slice(0,10);return{meta:{schemaVersion:80},financePlan:{plannedInvestment:25000},xtbHub:{asOf:stale,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:100000,volume:10,net_profit_pct:55,net_profit:38000,currency:'CZK'}]}}},xtbReport:{asOf:stale,czkValue:100000,czkProfit:38000,positions:[{ticker:'WDAY.US',name:'Workday',valueCZK:100000,profitCZK:38000,weightPct:18}]},ticketBook:{items:[{id:'t1',name:'Koncert A',workflow:'LISTED',date:event,sellBy:event,qty:4,buy:8000,listPrice:3000,marketPrice:2600,marketCheckedAt:stale,marketSourceUrl:'https://example.com/market',floorPrice:2300,transferStatus:'READY',feeRate:.12}]}}};
const waitMigrated=page=>page.waitForFunction(()=>{try{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return s.meta?.migratedFrom===80&&Array.isArray(s.ticketBook?.watchlist)}catch{return false}});

 test('59.6 arms a blocker baseline and reports SAME on unchanged state',async({page})=>{
  await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),staleState());await page.goto(BASE,{waitUntil:'domcontentloaded'});await waitMigrated(page);
  const out=await page.evaluate(async()=>{const m=await import('./js/commanderFixRerun596.js');const before=m.armFixRerun596();const after=m.commanderFixRerun596();return{before,after,stored:JSON.parse(sessionStorage.getItem('kamil-os-commander-rerun-596')||'null')}});
  expect(out.before.blocked).toBe(true);expect(out.stored.signature).toBe(out.before.signature);expect(out.after.status).toBe('SAME');expect(out.after.before.signature).toBe(out.after.current.signature);
 });

 test('59.6 identifies a changed baseline without writing market state',async({page})=>{
  await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),staleState());await page.goto(BASE,{waitUntil:'domcontentloaded'});await waitMigrated(page);
  const out=await page.evaluate(async()=>{const stateBefore=localStorage.getItem('kamil-os-state');const m=await import('./js/commanderFixRerun596.js');const fake={blocked:true,signature:'OLD-BLOCKER',decisionMode:'WAIT',top:{when:'TEĎ',text:'Starý blocker'}};const result=m.commanderFixRerun596(undefined,fake);return{status:result.status,stateSame:stateBefore===localStorage.getItem('kamil-os-state'),diag:window.__KAMIL_FIX_RERUN_596_LAST__}});
  expect(out.status).toBe('CHANGED');expect(out.stateSame).toBe(true);expect(out.diag.status).toBe('CHANGED');
 });
