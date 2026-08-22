import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Practical 49.0 stays click-only, private and proposal-only',async({page})=>{
 const d20=new Date(Date.now()+20*86400000).toISOString().slice(0,10),d60=new Date(Date.now()+60*86400000).toISOString().slice(0,10);
 const state={meta:{schemaVersion:80},financePlan:{cashNow:120000,reserveFloor:50000,expectedIncome:70000,plannedInvestment:20000},householdBills:{items:[{title:'Elektřina',monthlyAmount:6000,due:d20,status:'OPEN'}]},plannedPurchases:[{title:'Nová pračka',amount:25000,targetDate:d20,status:'OPEN'},{title:'PKS pracovní notebook',amount:50000,targetDate:d20,status:'OPEN',area:'práce'}],personalGoals:[{title:'Dovolená',targetAmount:60000,saved:20000,targetDate:d60,status:'OPEN'}],ticketBook:{items:[{name:'Koncert A',workflow:'LISTED',buy:2000,qty:2,marketPrice:3000,sellBy:d20},{name:'Koncert B',workflow:'HOLD',buy:3000,qty:1,marketPrice:3300,sellBy:d60}]},xtbReport:{czkValue:150000,czkProfit:10000,asOf:new Date().toISOString(),positions:[{symbol:'AAA',valueCZK:70000,profitCZK:-5000},{symbol:'BBB',valueCZK:50000,profitCZK:5000},{symbol:'CCC',valueCZK:30000,profitCZK:10000}]},subscriptions:{items:[{title:'Stream',monthlyAmount:300,usagePerMonth:0,autoRenew:true,status:'OPEN'}]},calendar:{events:[{title:'Rodinná oslava',start:d20,estimatedCost:4000,prep:[{title:'Dárek',done:false}]},{title:'PKS porada',start:d20,category:'práce'}]},vehiclePlan:{replacementBudget:500000,saved:100000,targetDate:new Date(Date.now()+730*86400000).toISOString().slice(0,10)},home:{reserveTarget:120000,reserveSaved:30000}};
 await page.addInitScript(state=>localStorage.setItem('kamil-os-state',JSON.stringify(state)),state);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_PRACTICAL_490_LAST__||null)).toBeNull();
 const r=await page.evaluate(async()=>{const m=await import('./js/personalPractical490.js');const s=JSON.parse(localStorage.getItem('kamil-os-state'));return m.practical490(s)});
 expect(r.purchases.rows.some(x=>x.title.includes('PKS'))).toBe(false);expect(r.tickets.best[0].name).toBe('Koncert A');expect(r.subscriptions.potentialMonthly).toBe(300);expect(r.travelFund.totalGap).toBe(40000);expect(r.familyPrep.needsPrep.some(x=>x.title==='Rodinná oslava')).toBe(true);
 const sell=await page.evaluate(async()=>{const m=await import('./js/personalPractical490.js');const s=JSON.parse(localStorage.getItem('kamil-os-state'));return m.sellToFund484(s,60000)});expect(sell.covered).toBe(60000);expect(sell.shortfall).toBe(0);expect(sell.note).toContain('nic se neprodává');expect(await page.evaluate(()=>window.__KAMIL_PRACTICAL_490_LAST__||null)).toBeNull();
 await page.evaluate(async()=>{const m=await import('./js/personalPractical490.js');m.openPractical490();return true});
 await page.waitForTimeout(300);
 const diag=await page.evaluate(()=>({ran:window.__KAMIL_PRACTICAL_490_LAST__||null,text:document.querySelector('#modalHost')?.textContent||'',platform:!!document.querySelector('#platform43')}));
 expect(diag.ran).not.toBeNull();expect(diag.ran.ms).toBeLessThan(500);expect(diag.text).toContain('Praktické centrum 49.0');expect(diag.text).toContain('CO UDĚLAT TEĎ');expect(diag.platform).toBe(false);
});
