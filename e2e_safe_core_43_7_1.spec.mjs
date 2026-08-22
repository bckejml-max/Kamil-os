import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Personal Safe Core starts fast and market cockpit stays lightweight before click',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page).toHaveTitle(/^Kamil OS 43\.7\.1$/);
 await expect(page.locator('#appView')).toBeVisible();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky. Co přesně udělat teď?'})).toBeVisible({timeout:5000});
 const flags=await page.evaluate(()=>({safe:window.__KAMIL_SAFE_CORE__,platform:!!document.querySelector('#platform43'),market:window.__KAMIL_MARKET_TOP3_533_LAST__||null,marketHome:window.__KAMIL_MARKET_HOME_560_LAST__||null,queue:window.__KAMIL_ACTION_QUEUE_559_LAST__||null,final:window.__KAMIL_FINAL_VERDICT_558_LAST__||null}));
 expect(flags.safe).toBe(true);expect(flags.platform).toBe(false);expect(flags.market).not.toBeNull();expect(flags.market.ms).toBeLessThan(200);expect(flags.marketHome).not.toBeNull();expect(flags.marketHome.ms).toBeLessThan(200);expect(flags.queue).toBeNull();expect(flags.final).toBeNull();
 await page.waitForTimeout(3000);
 const ran=await page.evaluate(()=>['__KAMIL_LIFE_446_LAST__','__KAMIL_CASHFLOW_447_LAST__','__KAMIL_WEALTH_448_LAST__','__KAMIL_TICKET_449_LAST__','__KAMIL_INBOX_450_LAST__','__KAMIL_MAINT_451_LAST__','__KAMIL_FAMILY_452_LAST__','__KAMIL_GOALS_453_LAST__','__KAMIL_DECISION_454_LAST__','__KAMIL_LIFE_455_LAST__','__KAMIL_LIFE_PLUS_475_LAST__','__KAMIL_ASSISTANT_530_LAST__','__KAMIL_SUITE_530_LAST__','__KAMIL_DECISION_534_LAST__','__KAMIL_READINESS_555_LAST__','__KAMIL_CONFIDENCE_556_LAST__','__KAMIL_CONFLICT_557_LAST__','__KAMIL_FINAL_VERDICT_558_LAST__','__KAMIL_ACTION_QUEUE_559_LAST__'].some(k=>window[k]));
 expect(ran).toBe(false);
});

test('Safe Core navigation still loads only explicitly opened section',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await page.locator('#mainNav').getByRole('button',{name:'Peníze'}).click();
 await expect(page.locator('#moneyView')).toHaveAttribute('data-view-ready','1',{timeout:5000});
 await page.locator('#mainNav').getByRole('button',{name:'Vstupenky'}).click();
 await expect(page.locator('#ticketsView')).toHaveAttribute('data-view-ready','1',{timeout:5000});
 const runtime=await page.evaluate(async()=>{const m=await import('./js/viewRuntime41.js');return await m.prefetchView41('home')});
 expect(runtime).toBeNull();
});

test('Personal 44.6 through 47.5 engines calculate private life data and exclude work',async({page})=>{
 const today=new Date().toISOString().slice(0,10),d5=new Date(Date.now()+5*86400000).toISOString().slice(0,10),d20=new Date(Date.now()+20*86400000).toISOString().slice(0,10),d60=new Date(Date.now()+60*86400000).toISOString().slice(0,10),stale=new Date(Date.now()-50*3600000).toISOString();
 const state={meta:{schemaVersion:80},financePlan:{cashNow:100000,reserveFloor:40000,plannedInvestment:25000,expectedIncome:50000},householdBills:{items:[{title:'Domácí výdaje',amount:10000,due:d5,status:'OPEN'},{title:'Elektřina',monthlyAmount:3000,due:d5,status:'OPEN'}]},plannedPurchases:[{title:'Nová lednice',amount:15000,targetDate:d20,status:'OPEN'},{title:'Pracovní notebook D4',amount:50000,targetDate:d20,status:'OPEN',area:'práce'}],xtbReport:{czkValue:150000,czkProfit:12000,positionCount:4,asOf:stale,positions:[{name:'A',valueCZK:40000},{name:'B',valueCZK:30000}]},ticketBook:{items:[{name:'Koncert',workflow:'LISTED',buy:2000,qty:2,marketPrice:3000,sellBy:d5}]},inbox:[{title:'Odpovědět pojišťovně',createdAt:new Date(Date.now()-5*86400000).toISOString(),status:'OPEN'},{title:'Fakturace D4',createdAt:new Date(Date.now()-10*86400000).toISOString(),status:'OPEN',area:'práce'}],delegations:[{title:'Čekám na servis auta',createdAt:new Date(Date.now()-9*86400000).toISOString(),due:today,status:'OPEN'}],maintenance:{items:[{title:'Filtr rekuperace',nextService:d5,lastService:'2026-02-01',cost:1200}]},family:{tasks:[{title:'Objednat pleny',due:today,status:'OPEN'}],expenses:[{title:'Rodinný výlet',amount:3000,date:d20,status:'OPEN'}]},calendar:{events:[{title:'Rodinná oslava',start:d20},{title:'PKS pracovní porada',start:d5,category:'práce'}]},personalGoals:[{title:'Dovolená',targetAmount:60000,saved:20000,targetDate:d60,nextStep:'Vybrat hotel',status:'OPEN'}],tasks:[{title:'Zařídit pojištění auta',due:today,priority:95,status:'OPEN'},{title:'Zakázka D4 kontrola',due:today,priority:100,status:'OPEN',area:'práce'}],debtBook:{items:[{person:'Osobní půjčka',amount:10000,status:'OPEN'}]},subscriptions:{items:[{title:'Cloud',amount:1500,renewalDate:d20,status:'OPEN'}]},documents:{items:[{title:'Pas',expiresAt:d60,status:'OPEN'}]},insurance:{items:[{title:'Pojištění auta',premium:6000,expiresAt:d60,status:'OPEN'}]}};
 await page.addInitScript(state=>localStorage.setItem('kamil-os-state',JSON.stringify(state)),state);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const r=await page.evaluate(async()=>{
  const [a,b,c,d,e,f,g,h,i,j,k]=await Promise.all([import('./js/lifePlanner446.js'),import('./js/cashflow447.js'),import('./js/wealth448.js'),import('./js/ticketIntel449.js'),import('./js/inbox450.js'),import('./js/maintenance451.js'),import('./js/family452.js'),import('./js/goals453.js'),import('./js/decision454.js'),import('./js/personalFinance445.js'),import('./js/personalLifePlus475.js')]);
  const s=JSON.parse(localStorage.getItem('kamil-os-state'));
  return {life:a.lifePlanner446(s),cash:b.cashflow447(s),wealth:c.wealth448(s),tickets:d.ticketIntel449(s),inbox:e.inbox450(s),maint:f.maintenance451(s),family:g.family452(s),goals:h.goals453(s),decision:i.decision454(s),finance:j.personalFinance445(s),plus:k.personalLifePlus475(s)};
 });
 expect(r.finance.safeInvestNow).toBeGreaterThanOrEqual(0);expect(r.finance.safeSpendNow).toBeGreaterThanOrEqual(0);
 expect(r.life.d90.some(x=>x.title==='Nová lednice')).toBe(true);expect(r.life.d90.some(x=>x.title.includes('Pracovní'))).toBe(false);
 expect(r.cash.d90.end).toBeGreaterThan(0);expect(r.wealth.net).toBeGreaterThan(0);
 expect(r.tickets.items[0].action).toBe('DRŽET');expect(r.inbox.top.some(x=>x.title==='Fakturace D4')).toBe(false);
 expect(r.maint.soon.length).toBe(1);expect(r.family.upcoming.some(x=>x.title==='PKS pracovní porada')).toBe(false);
 expect(r.goals.rows[0].next).toBe('Vybrat hotel');expect(r.decision.doNow.some(x=>x.title==='Zakázka D4 kontrola')).toBe(false);
 expect(r.plus.renewal.soon.length).toBe(1);expect(r.plus.docs.soon.length).toBe(1);expect(r.plus.ticketExposure.capital).toBe(4000);expect(r.plus.noise.focus.some(x=>x.title.includes('Zakázka D4'))).toBe(false);expect(r.plus.health.score).toBeGreaterThanOrEqual(0);expect(r.plus.health.score).toBeLessThanOrEqual(100);
});

test('Legacy Life Dashboard remains compatible but is not a main-market control',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_LIFE_455_LAST__||null)).toBeNull();expect(await page.evaluate(()=>window.__KAMIL_LIFE_PLUS_475_LAST__||null)).toBeNull();
 const direct=await page.evaluate(async()=>{try{const m=await import('./js/lifeDashboard455.js');const has=typeof m.openLifeDashboard455==='function'&&typeof m.lifeDashboard455==='function';m.openLifeDashboard455();return{ok:true,has}}catch(e){return{ok:false,error:String(e?.stack||e)}}});
 expect(direct.ok,direct.error||'lifeDashboard455 direct import failed').toBe(true);expect(direct.has).toBe(true);
 await page.waitForTimeout(400);
 const diag=await page.evaluate(()=>({ran:window.__KAMIL_LIFE_455_LAST__||null,modal:document.querySelector('#modalHost')?.textContent||'',platform:!!document.querySelector('#platform43')}));
 expect(diag.ran).not.toBeNull();expect(diag.ran.ms).toBeLessThan(500);expect(diag.modal).toContain('TOP 3 DNES');expect(diag.modal).toContain('Life+ 20');expect(diag.platform).toBe(false);
 expect(await page.evaluate(()=>window.__KAMIL_LIFE_PLUS_475_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Life+ 20'}).click();await page.waitForTimeout(300);
 const plus=await page.evaluate(()=>({perf:window.__KAMIL_LIFE_PLUS_475_LAST__||null,text:document.querySelector('#modalHost')?.textContent||''}));
 expect(plus.perf).not.toBeNull();expect(plus.perf.ms).toBeLessThan(500);expect(plus.text).toContain('Life Health');expect(plus.text).toContain('Opportunity budget');expect(plus.text).toContain('47.5 Life Health Score');
});
