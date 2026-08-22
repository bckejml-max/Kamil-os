import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Assistant 53.0 is private, click-only and action-first',async({page})=>{
 const d7=new Date(Date.now()+7*86400000).toISOString().slice(0,10),d20=new Date(Date.now()+20*86400000).toISOString().slice(0,10);
 const state={meta:{schemaVersion:80},financePlan:{cashNow:120000,reserveFloor:50000,expectedIncome:70000,plannedInvestment:20000},tasks:[{id:'p1',title:'Zaplatit osobní pojistku',due:d7,status:'OPEN',priority:5},{id:'w1',title:'PKS pracovní fakturace',due:d7,status:'OPEN',priority:9,category:'práce'}],householdBills:{items:[{title:'Elektřina',monthlyAmount:10000,due:d20,status:'OPEN'}]},personalSpending:{transactions:[{title:'Nákup A',amount:2000,date:new Date().toISOString()},{title:'Velký osobní nákup',amount:12000,date:new Date().toISOString()}]},plannedPurchases:[{title:'Nová pračka',amount:25000,targetDate:d20,status:'OPEN'}],ticketBook:{items:[{name:'Koncert A',workflow:'LISTED',buy:2000,qty:2,marketPrice:3000,sellBy:d7}]},xtbReport:{positions:[{symbol:'AAA',valueCZK:70000,profitCZK:20000,targetWeight:40},{symbol:'BBB',valueCZK:30000,profitCZK:1000,targetWeight:60}],asOf:new Date().toISOString()},assetBook:{items:[{title:'Pračka',price:20000,warrantyEnd:d20}]}};
 await page.addInitScript(state=>localStorage.setItem('kamil-os-state',JSON.stringify(state)),state);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_SUITE_530_LAST__||null)).toBeNull();
 const r=await page.evaluate(async()=>{const m=await import('./js/personalAssistant530.js');const s=JSON.parse(localStorage.getItem('kamil-os-state'));return{cat:m.categorize502('servis auta'),search:m.search505(s,'pojistku'),safe:m.safePurchase515(s),ticket:m.ticketTimeline521(s),warranty:m.warranty527(s),assistant:m.assistant530(s,'Co mám dnes řešit?'),suite:m.suite530(s)}});
 expect(r.cat).toBe('Auto');expect(r.search.some(x=>x.title.includes('pojistku'))).toBe(true);expect(r.search.some(x=>x.title.includes('PKS'))).toBe(false);expect(r.safe.limit).toBeGreaterThanOrEqual(0);expect(r.ticket[0].name).toBe('Koncert A');expect(r.warranty[0].title).toBe('Pračka');expect(r.assistant.answer).toContain('Teď řeš');expect(JSON.stringify(r.suite)).not.toContain('PKS pracovní fakturace');
 await page.evaluate(async()=>{const m=await import('./js/personalAssistant530.js');m.openAssistant530();return true});
 await page.waitForTimeout(250);
 const diag=await page.evaluate(()=>({perf:window.__KAMIL_SUITE_530_LAST__||null,text:document.querySelector('#modalHost')?.textContent||'',platform:!!document.querySelector('#platform43')}));
 expect(diag.perf).not.toBeNull();expect(diag.perf.ms).toBeLessThan(500);expect(diag.text).toContain('Personal Assistant Suite 53.0');expect(diag.text).toContain('Safe purchase');expect(diag.platform).toBe(false);
});
