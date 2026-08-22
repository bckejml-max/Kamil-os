import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Safe Core starts fast and keeps background intelligence off',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page).toHaveTitle(/^Kamil OS 43\.7\.1$/);
 await expect(page.locator('#appView')).toBeVisible();
 await expect(page.getByRole('heading',{name:'Rychlý základ. Chytré vrstvy jen na kliknutí.'})).toBeVisible({timeout:5000});
 const flags=await page.evaluate(()=>({safe:window.__KAMIL_SAFE_CORE__,platform:!!document.querySelector('#platform43')}));
 expect(flags.safe).toBe(true);expect(flags.platform).toBe(false);
 await page.waitForTimeout(3000);
 await expect(page.locator('#appView')).toBeVisible();
 expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});

test('Safe Core navigation loads only the explicitly opened section',async({page})=>{
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

test('Safe Intelligence 43.9 explains priorities and routes them only after click',async({page})=>{
 const tomorrow=new Date(Date.now()+86400000).toISOString().slice(0,10),stale=new Date(Date.now()-48*3600000).toISOString();
 await page.addInitScript(({tomorrow,stale})=>localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:80},financePlan:{cashNow:100000,reserveFloor:50000,plannedInvestment:25000},tasks:[{id:'safe-task',title:'Safe test úkol',due:tomorrow,status:'OPEN',priority:90}],directorBook:{waiting:[{id:'wait-1',title:'Čekám na odpověď',status:'OPEN',due:tomorrow}]},ticketBook:{items:[{id:'ticket-1',name:'Safe ticket',date:tomorrow,sellBy:tomorrow,workflow:'LISTED',buy:2000,qty:2,listPrice:1800,marketPrice:1400,marketCheckedAt:new Date().toISOString()}],watchlist:[],history:[]},xtbReport:{positionCount:2,czkValue:125000,asOf:stale,positions:[{ticker:'AAA.US',valueCzk:80000,profitCzk:8000,profitPct:10},{ticker:'BBB.US',valueCzk:45000,profitCzk:-2500,profitPct:-5.3}]}})),{tomorrow,stale});
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.getByRole('heading',{name:'Chytré moduly na vyžádání'})).toBeVisible({timeout:5000});
 expect(await page.evaluate(()=>window.__KAMIL_SAFE_INTEL_LAST__||null)).toBeNull();

 await page.getByRole('button',{name:'Mission Control'}).click();
 await expect(page.getByRole('heading',{name:'Mission Control / Safe 43.9'})).toBeVisible();
 await expect(page.locator('#modalHost')).toContainText('TOP 3 TEĎ');
 await expect(page.locator('#modalHost')).toContainText('Proč teď:');
 await expect(page.locator('#modalHost')).toContainText('První krok:');
 await expect(page.locator('#modalHost')).toContainText('CO MŮŽE POČKAT');
 await expect(page.locator('#modalHost')).toContainText('XTB data');
 await expect(page.locator('#modalHost')).toContainText('OBNOVIT');
 await expect(page.locator('#modalHost')).toContainText('Čekám na odpověď');
 await expect(page.getByRole('button',{name:'Otevřít #1'})).toBeVisible();
 const first=await page.evaluate(()=>window.__KAMIL_SAFE_INTEL_LAST__);expect(first.name).toBe('mission438');expect(first.ms).toBeLessThan(500);
 await page.getByRole('button',{name:'Zavřít'}).click();

 await page.getByRole('button',{name:'XTB + vstupenky'}).click();
 await expect(page.getByRole('heading',{name:'Peníze + vstupenky / Safe 43.9'})).toBeVisible();
 await expect(page.locator('#modalHost')).toContainText('125 000 Kč');
 await expect(page.locator('#modalHost')).toContainText('AAA.US');
 await expect(page.locator('#modalHost')).toContainText('XTB data jsou starší než 36 h');
 await expect(page.locator('#modalHost')).toContainText('PROVĚŘIT CENU');
 await page.getByRole('button',{name:'Zavřít'}).click();

 await page.getByRole('button',{name:'Work Command Center'}).click();
 await expect(page.getByRole('heading',{name:'Work Command Center / Safe 43.9'})).toBeVisible();
 await expect(page.locator('#modalHost')).toContainText('Fakturace na dodavatele');
 expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});
