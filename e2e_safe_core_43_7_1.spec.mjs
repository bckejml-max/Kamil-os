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