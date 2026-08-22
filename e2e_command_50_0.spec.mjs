import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Command 50.0 stays click-only, personal and action-first',async({page})=>{
 const d2=new Date(Date.now()+2*86400000).toISOString().slice(0,10),d20=new Date(Date.now()+20*86400000).toISOString().slice(0,10);
 const state={meta:{schemaVersion:80},financePlan:{cashNow:120000,reserveFloor:50000,expectedIncome:70000,plannedInvestment:20000},householdBills:{items:[{title:'Elektřina',monthlyAmount:6000,due:d20,status:'OPEN'}]},tasks:[{title:'Zaplatit osobní pojistku',due:d2,priority:20,status:'OPEN'},{title:'D4 fakturace',due:d2,priority:99,status:'OPEN',area:'práce'}],plannedPurchases:[{title:'Nová pračka',amount:25000,targetDate:d20,status:'OPEN'}],ticketBook:{items:[{name:'Koncert A',workflow:'LISTED',buy:2000,qty:2,marketPrice:3000,sellBy:d20}]},xtbReport:{czkValue:150000,czkProfit:10000,asOf:new Date().toISOString(),positions:[{symbol:'AAA',valueCZK:70000,profitCZK:-5000},{symbol:'BBB',valueCZK:50000,profitCZK:5000}]},subscriptions:{items:[{title:'Stream',monthlyAmount:300,usagePerMonth:0,autoRenew:true,status:'OPEN'}]},calendar:{events:[{title:'Rodinná oslava',start:d20},{title:'PKS porada',start:d2,category:'práce'}]}};
 await page.addInitScript(state=>localStorage.setItem('kamil-os-state',JSON.stringify(state)),state);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_COMMAND_500_LAST__||null)).toBeNull();
 const r=await page.evaluate(async()=>{const m=await import('./js/personalCommand500.js');const s=JSON.parse(localStorage.getItem('kamil-os-state'));return m.command500(s)});
 expect(r.week.focus.some(x=>x.title.includes('D4'))).toBe(false);
 expect(r.calendar.events.some(x=>x.title.includes('PKS'))).toBe(false);
 expect(r.next.main).not.toBeNull();
 expect(r.data.coverage).toBeGreaterThanOrEqual(0);
 expect(r.portfolio.note).toContain('Žádný prodej se automaticky neprovede');
 expect(await page.evaluate(()=>window.__KAMIL_COMMAND_500_LAST__||null)).toBeNull();
 await page.locator('[data-life-dashboard]').first().click();
 await expect(page.getByRole('button',{name:'Udělej teď'})).toBeVisible({timeout:5000});
 await page.getByRole('button',{name:'Udělej teď'}).click();
 await page.waitForTimeout(250);
 const diag=await page.evaluate(()=>({ran:window.__KAMIL_COMMAND_500_LAST__||null,text:document.querySelector('#modalHost')?.textContent||'',platform:!!document.querySelector('#platform43')}));
 expect(diag.ran).not.toBeNull();expect(diag.ran.ms).toBeLessThan(500);expect(diag.text).toContain('Udělej teď');expect(diag.text).toContain('CO MŮŽE POČKAT');expect(diag.text).not.toContain('D4 fakturace');expect(diag.platform).toBe(false);
});
