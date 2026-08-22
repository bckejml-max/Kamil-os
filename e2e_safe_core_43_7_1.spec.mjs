import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Personal Safe Core starts fast and keeps background intelligence off',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page).toHaveTitle(/^Kamil OS 43\.7\.1$/);
 await expect(page.locator('#appView')).toBeVisible();
 await expect(page.getByRole('heading',{name:'Tvoje soukromá appka pro život, peníze a rozhodnutí.'})).toBeVisible({timeout:5000});
 const flags=await page.evaluate(()=>({safe:window.__KAMIL_SAFE_CORE__,platform:!!document.querySelector('#platform43')}));
 expect(flags.safe).toBe(true);expect(flags.platform).toBe(false);
 await page.waitForTimeout(3000);
 expect(await page.evaluate(()=>window.__KAMIL_PERSONAL_441_LAST__||null)).toBeNull();
 expect(await page.evaluate(()=>window.__KAMIL_DAILY_442_LAST__||null)).toBeNull();
 expect(await page.evaluate(()=>window.__KAMIL_ADMIN_443_LAST__||null)).toBeNull();
 expect(await page.evaluate(()=>window.__KAMIL_HOME_444_LAST__||null)).toBeNull();
 expect(await page.evaluate(()=>window.__KAMIL_WORK_440_LAST__||null)).toBeNull();
});

test('Safe Core navigation loads only the explicitly opened personal section',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await page.locator('#mainNav').getByRole('button',{name:'Peníze'}).click();
 await expect(page.locator('#view-money')).toBeVisible();
 await expect(page.locator('#moneyView')).toHaveAttribute('data-view-ready','1',{timeout:5000});
 await page.locator('#mainNav').getByRole('button',{name:'Vstupenky'}).click();
 await expect(page.locator('#view-tickets')).toBeVisible();
 await expect(page.locator('#ticketsView')).toHaveAttribute('data-view-ready','1',{timeout:5000});
 const runtime=await page.evaluate(async()=>{const m=await import('./js/viewRuntime41.js');return await m.prefetchView41('home')});
 expect(runtime).toBeNull();
});

test('Personal 44.1 excludes work domain and keeps XTB tickets and private priorities',async({page})=>{
 const today=new Date().toISOString().slice(0,10),tomorrow=new Date(Date.now()+86400000).toISOString().slice(0,10),stale=new Date(Date.now()-48*3600000).toISOString();
 await page.addInitScript(({today,tomorrow,stale})=>localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:80},tasks:[{id:'personal-1',title:'Zaplatit osobní pojistku',due:today,status:'OPEN',priority:90},{id:'work-1',title:'Fakturace na dodavatele D4',due:today,status:'OPEN',priority:99,area:'práce'}],delegations:[{id:'wait-personal',title:'Čekám na potvrzení servisu auta',status:'OPEN',due:tomorrow},{id:'wait-work',title:'Čekám na PKS k ZL',status:'OPEN',due:today}],directorBook:{waiting:[{id:'director',title:'Aktualizace karty zakázky',status:'OPEN',due:today}]},projects:[{id:'p1',name:'D4 Test Zakázka',status:'ACTIVE'}],changeOrders:[{id:'zl1',name:'ZL 001 Test',status:'QUOTED',amount:400000}],ticketBook:{items:[{id:'ticket-1',name:'Safe ticket',date:tomorrow,sellBy:tomorrow,workflow:'LISTED',buy:2000,qty:2,listPrice:1800,marketPrice:1400,marketCheckedAt:new Date().toISOString()}],watchlist:[],history:[]},xtbReport:{positionCount:2,czkValue:125000,asOf:stale,positions:[{ticker:'AAA.US',valueCzk:80000,profitCzk:8000,profitPct:10},{ticker:'BBB.US',valueCzk:45000,profitCzk:-2500,profitPct:-5.3}]}})),{today,tomorrow,stale});
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.getByRole('heading',{name:'Co mám teď řešit?'})).toBeVisible({timeout:5000});
 await expect(page.getByRole('button',{name:'Work Command Center'})).toHaveCount(0);
 await expect(page.locator('#todayView')).not.toContainText('D4 Test Zakázka');
 await expect(page.locator('#todayView')).not.toContainText('Fakturace na dodavatele');
 await page.getByRole('button',{name:'Osobní Mission Control'}).click();
 await expect(page.getByRole('heading',{name:'Kamil OS / Osobní Mission Control'})).toBeVisible();
 await expect(page.locator('#modalHost')).toContainText('TOP 3 TEĎ / SOUKROMĚ');
 await expect(page.locator('#modalHost')).toContainText('Zaplatit osobní pojistku');
 await expect(page.locator('#modalHost')).toContainText('Obnovit XTB data');
 await expect(page.locator('#modalHost')).not.toContainText('Fakturace na dodavatele');
 await expect(page.locator('#modalHost')).not.toContainText('D4 Test Zakázka');
 await expect(page.locator('#modalHost')).not.toContainText('ZL 001 Test');
 const personal=await page.evaluate(()=>window.__KAMIL_PERSONAL_441_LAST__);expect(personal.ms).toBeLessThan(500);
 await page.getByRole('button',{name:'Zavřít'}).click();
 await page.getByRole('button',{name:'Peníze + vstupenky'}).click();
 await expect(page.getByRole('heading',{name:'Peníze + vstupenky / Personal 44.1'})).toBeVisible();
 await expect(page.locator('#modalHost')).toContainText('125 000 Kč');
 await expect(page.locator('#modalHost')).toContainText('PROVĚŘIT CENU');
 expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});

test('Personal 44.2 Daily Hub combines today money calendar admin and home only on click',async({page})=>{
 const today=new Date().toISOString().slice(0,10),tomorrow=new Date(Date.now()+86400000).toISOString().slice(0,10),stale=new Date(Date.now()-50*3600000).toISOString();
 await page.addInitScript(({today,tomorrow,stale})=>localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:80},tasks:[{id:'p1',title:'Objednat servis auta',due:today,status:'OPEN'},{id:'w1',title:'Fakturace zakázky D4',due:today,status:'OPEN',area:'práce'}],calendar:{events:[{id:'c1',title:'Rodinná návštěva',start:today},{id:'c2',title:'PKS pracovní porada',start:today,category:'práce'}]},personalAdmin:{items:[{id:'a1',title:'Obnovit pojištění auta',due:tomorrow,status:'OPEN'}]},familyHome:{items:[{id:'h1',title:'Koupit dětské pleny',due:tomorrow,status:'OPEN'}]},ticketBook:{items:[{id:'t1',name:'Koncert',workflow:'LISTED',sellBy:tomorrow,buy:2000,qty:2,listPrice:2500}]},xtbReport:{czkValue:150000,asOf:stale}})),{today,tomorrow,stale});
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.getByRole('button',{name:'Můj dnešek'}).first()).toBeVisible({timeout:5000});
 expect(await page.evaluate(()=>window.__KAMIL_DAILY_442_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Můj dnešek'}).first().click();
 await expect(page.getByRole('heading',{name:'Můj dnešek / Personal 44.2'})).toBeVisible();
 await expect(page.locator('#modalHost')).toContainText('CO DNES ŘEŠIT');
 await expect(page.locator('#modalHost')).toContainText('Objednat servis auta');
 await expect(page.locator('#modalHost')).toContainText('Rodinná návštěva');
 await expect(page.locator('#modalHost')).toContainText('Obnovit pojištění auta');
 await expect(page.locator('#modalHost')).toContainText('Koupit dětské pleny');
 await expect(page.locator('#modalHost')).toContainText('150 000 Kč');
 await expect(page.locator('#modalHost')).not.toContainText('Fakturace zakázky D4');
 await expect(page.locator('#modalHost')).not.toContainText('PKS pracovní porada');
 const daily=await page.evaluate(()=>window.__KAMIL_DAILY_442_LAST__);expect(daily.ms).toBeLessThan(500);
 expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});

test('Personal 44.3 Admin Center tracks private admin and excludes work only on click',async({page})=>{
 const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10),soon=new Date(Date.now()+7*86400000).toISOString().slice(0,10);
 await page.addInitScript(({yesterday,soon})=>localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:80},insurance:{items:[{id:'i1',title:'Pojištění domu',provider:'Kooperativa',renewalDate:soon,status:'OPEN',amount:4200}]},vehicles:[{id:'v1',title:'STK auta',expiry:yesterday,status:'OPEN'}],personalContracts:[{id:'c1',title:'Smlouva elektřina',renewalDate:soon,status:'OPEN'}],subscriptions:[{id:'s1',title:'Cloud úložiště',nextPaymentAt:soon,status:'OPEN',amount:199}],personalDocuments:[{id:'d1',title:'Pas',expiry:soon,status:'OPEN'}],contracts:[{id:'w1',title:'Pracovní zakázka D4 fakturace',renewalDate:yesterday,status:'OPEN',area:'práce'}]})),{yesterday,soon});
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.getByRole('button',{name:'Osobní administrativa'})).toBeVisible({timeout:5000});
 expect(await page.evaluate(()=>window.__KAMIL_ADMIN_443_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Osobní administrativa'}).click();
 await expect(page.getByRole('heading',{name:'Osobní administrativa / 44.3'})).toBeVisible();
 await expect(page.locator('#modalHost')).toContainText('STK auta');
 await expect(page.locator('#modalHost')).toContainText('Pojištění domu');
 await expect(page.locator('#modalHost')).toContainText('Smlouva elektřina');
 await expect(page.locator('#modalHost')).toContainText('Cloud úložiště');
 await expect(page.locator('#modalHost')).toContainText('Pas');
 await expect(page.locator('#modalHost')).not.toContainText('Pracovní zakázka D4 fakturace');
 const admin=await page.evaluate(()=>window.__KAMIL_ADMIN_443_LAST__);expect(admin.ms).toBeLessThan(500);
 expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});

test('Personal 44.4 Family & Home Center combines family home shopping service costs and dates only on click',async({page})=>{
 const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10),today=new Date().toISOString().slice(0,10),soon=new Date(Date.now()+5*86400000).toISOString().slice(0,10);
 await page.addInitScript(({yesterday,today,soon})=>localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:80},family:{tasks:[{id:'f1',title:'Objednat pleny',due:today,status:'OPEN',owner:'Kamil'}]},home:{tasks:[{id:'h1',title:'Vyměnit filtr rekuperace',due:soon,status:'OPEN'}],service:[{id:'h2',title:'Servis tepelného čerpadla',due:soon,status:'OPEN',amount:3500}]},shopping:{items:[{id:'s1',title:'Koupit dětskou výživu',due:today,status:'OPEN'}]},vehicles:[{id:'v1',title:'Přezutí auta',nextService:yesterday,status:'OPEN'}],householdBills:{items:[{id:'b1',title:'Elektřina domácnost',due:soon,status:'OPEN',amount:4200}]},calendar:{events:[{id:'c1',title:'Rodinná oslava',start:soon},{id:'c2',title:'PKS pracovní porada',start:soon,category:'práce'}]},projects:[{id:'w1',name:'Zakázka D4',status:'ACTIVE'}]})),{yesterday,today,soon});
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.getByRole('button',{name:'Rodina & domov'})).toBeVisible({timeout:5000});
 expect(await page.evaluate(()=>window.__KAMIL_HOME_444_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Rodina & domov'}).click();
 await expect(page.getByRole('heading',{name:'Rodina & domov / 44.4'})).toBeVisible();
 await expect(page.locator('#modalHost')).toContainText('Objednat pleny');
 await expect(page.locator('#modalHost')).toContainText('Vyměnit filtr rekuperace');
 await expect(page.locator('#modalHost')).toContainText('Servis tepelného čerpadla');
 await expect(page.locator('#modalHost')).toContainText('Koupit dětskou výživu');
 await expect(page.locator('#modalHost')).toContainText('Přezutí auta');
 await expect(page.locator('#modalHost')).toContainText('Rodinná oslava');
 await expect(page.locator('#modalHost')).toContainText('4 200 Kč');
 await expect(page.locator('#modalHost')).not.toContainText('PKS pracovní porada');
 await expect(page.locator('#modalHost')).not.toContainText('Zakázka D4');
 const home=await page.evaluate(()=>window.__KAMIL_HOME_444_LAST__);expect(home.ms).toBeLessThan(500);
 expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});
