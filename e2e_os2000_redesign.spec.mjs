import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

async function boot(page){
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await expect(page.locator('[data-os2-today]')).toBeVisible({timeout:10000});
}

test('OS2000 starts as a small on-demand shell',async({page})=>{
 await boot(page);
 const state=await page.evaluate(()=>({
  boot:window.__KAMIL_BOOT_BUDGET343__,
  deferred:window.__KAMIL_DEFERRED345__,
  styles:[...document.querySelectorAll('link[rel="stylesheet"]')].map(x=>x.getAttribute('href')),
  resources:performance.getEntriesByType('resource').map(x=>x.name)
 }));
 expect(state.boot.architecture).toBe('os2-on-demand');
 expect(state.boot.modules.length).toBeLessThanOrEqual(2);
 expect(state.boot.modules.some(x=>x.path==='./app.js'&&x.ok)).toBe(true);
 expect(state.boot.failures).toHaveLength(0);
 expect(state.styles).toContain('./os2.css');
 expect(state.styles).toContain('./os2010.css');
 expect(state.styles).toContain('./os737.css');
 expect(state.styles).toContain('./productReset1300.css');
 expect(state.styles).toContain('./styles.css');
 expect(state.styles).not.toContain('./ticketDesk353.css');
 expect(state.resources.some(x=>x.includes('bettingBootstrap543.js'))).toBe(false);
 expect(state.resources.some(x=>x.includes('ticketDesk331.js'))).toBe(false);
});

test('OS2000 Today is the canonical lightweight dashboard',async({page})=>{
 await boot(page);
 await expect(page.locator('.pr1300-head h1')).toContainText(/Kamile/i);
 await expect(page.locator('[data-product-home1300]')).toBeVisible();
 await expect(page.locator('.pr1300-panel').first()).toContainText(/Potřebuje tvoji pozornost/i);
 await expect(page.locator('.pr1300-domains .pr1300-domain')).toHaveCount(6);
 const today=await page.evaluate(()=>window.__KAMIL_TODAY_OS2000__);
 expect(today?.healthy).toBe(true);
 expect(today?.version).toBe(2000);
});

test('OS1300 makes Work and Reality first-class product views',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="work"]').click();
 await expect(page.locator('#view-work')).toHaveClass(/on/);
 await expect(page.locator('[data-work-page1300]')).toBeVisible({timeout:10000});
 await expect(page.locator('[data-work-page1300] h1')).toContainText(/Zakázky/);
 await page.locator('#mainNav [data-view="property"]').click();
 await expect(page.locator('#view-property')).toHaveClass(/on/);
 await expect(page.locator('[data-property-page1300]')).toBeVisible({timeout:10000});
 await expect(page.locator('[data-property-page1300] h1')).toContainText(/Investiční byty/);
});

test('OS2000 navigation keeps heavy views lazy',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('#view-money')).toHaveClass(/on/);
 await page.waitForTimeout(250);
 await page.locator('#mainNav [data-view="today"]').click();
 await expect(page.locator('#view-today')).toHaveClass(/on/);
 const resources=await page.evaluate(()=>performance.getEntriesByType('resource').map(x=>x.name));
 expect(resources.some(x=>x.includes('ticketDesk331.js'))).toBe(false);
 expect(resources.some(x=>x.includes('bettingBootstrap543.js'))).toBe(false);
});

test('OS1300 keeps the heavy Ticket Desk behind an explicit detail action',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="tickets"]').click();
 await expect(page.locator('#view-tickets')).toHaveClass(/on/);
 await expect(page.locator('#ticketIntelView [data-ticket-overview]')).toBeVisible({timeout:10000});
 let resources=await page.evaluate(()=>performance.getEntriesByType('resource').map(x=>x.name));
 expect(resources.some(x=>x.includes('ticketDesk331.js'))).toBe(false);
 await page.locator('#ticketIntelView [data-ticket-advanced]').click();
 await expect.poll(()=>page.evaluate(()=>performance.getEntriesByType('resource').some(x=>x.name.includes('ticketDesk331.js'))),{timeout:15000}).toBe(true);
 await expect(page.locator('#ticketIntelView .td331')).toBeVisible({timeout:15000});
 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('#moneyView [data-money-overview]')).toBeVisible({timeout:10000});
 await page.locator('#mainNav [data-view="tickets"]').click();
 await expect(page.locator('#ticketIntelView [data-ticket-overview]')).toBeVisible({timeout:10000});
 await expect(page.locator('#ticketIntelView .td331')).toHaveCount(0);
});

test('OS1300 keeps Money, Tickets and Betting to one primary workspace',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);

 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('#view-money')).toHaveClass(/on/);
 await expect(page.locator('#moneyView [data-money-overview]')).toBeVisible({timeout:10000});
 await page.waitForTimeout(900);
 await expect(page.locator('#moneyView [data-money-hub680]')).toHaveCount(0);
 await expect(page.locator('#moneyView [data-property-hub620]')).toHaveCount(0);
 await expect(page.locator('#moneyView [data-property-finance610]')).toHaveCount(0);

 await page.locator('#mainNav [data-view="betting"]').click();
 await expect(page.locator('#view-betting')).toHaveClass(/on/);
 await expect(page.locator('#bettingView [data-betting-overview]')).toBeVisible({timeout:10000});
 await page.waitForTimeout(900);
 await expect(page.locator('#bettingView [data-betting-hub630]')).toHaveCount(0);

 await page.locator('#mainNav [data-view="tickets"]').click();
 await expect(page.locator('#view-tickets')).toHaveClass(/on/);
 await expect(page.locator('#ticketIntelView [data-ticket-overview]')).toBeVisible({timeout:10000});
 await page.waitForTimeout(300);
 await expect(page.locator('#ticketIntelView [data-ticket-hub640]')).toHaveCount(0);
});

test('OS2010 keeps primary workspaces contained on desktop',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);
 for(const view of ['inbox','money','tickets','betting']){
  await page.locator(`#mainNav [data-view="${view}"]`).click();
  await expect(page.locator(`#view-${view}`)).toHaveClass(/on/);
  await page.waitForTimeout(view==='tickets'||view==='betting'?800:350);
  const metrics=await page.evaluate(v=>{
   const id={inbox:'inboxView',money:'moneyView',tickets:'ticketIntelView',betting:'bettingView'}[v];
   const host=document.getElementById(id),body=document.body,root=document.documentElement;
   if(!host)return null;
   const rect=host.getBoundingClientRect();
   return{hostWidth:rect.width,viewport:innerWidth,bodyOverflow:Math.max(body.scrollWidth,root.scrollWidth)-innerWidth};
  },view);
  expect(metrics).not.toBeNull();
  expect(metrics.hostWidth).toBeLessThanOrEqual(1362);
  expect(metrics.bodyOverflow).toBeLessThanOrEqual(2);
 }
});

test('OS1300 personal views use one stable visual hierarchy',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);

 await page.locator('#mainNav [data-view="inbox"]').click();
 await expect(page.locator('#view-inbox')).toHaveClass(/on/);
 await expect(page.locator('#inboxView [data-tasks-overview]')).toBeVisible({timeout:10000});
 await expect(page.locator('#inboxView [data-tasks-overview] h1')).toContainText(/Jedna fronta všeho/i);
 await page.waitForTimeout(300);
 await expect(page.locator('#inboxView [data-inbox-hub660]')).toHaveCount(0);

 await page.locator('#mainNav [data-view="family"]').click();
 await expect(page.locator('#view-family')).toHaveClass(/on/);
 await expect(page.locator('#ticketsView .hf140-hero')).toBeVisible({timeout:10000});
 await expect(page.locator('#ticketsView .hf140-hero h1')).toContainText(/Rodina/i);
 await page.waitForTimeout(500);
 await expect(page.locator('#ticketsView [data-family-hub610]')).toHaveCount(0);

 const cases=[
  ['home','#homeView','.hf140-hero','Domov'],
  ['more','#moreView','.id141-hero','Dokumenty pod kontrolou']
 ];
 for(const [view,host,hero,title] of cases){
  await page.locator(`#mainNav [data-view="${view}"]`).click();
  await expect(page.locator(`#view-${view}`)).toHaveClass(/on/);
  await expect(page.locator(`${host} ${hero}`)).toBeVisible({timeout:10000});
  await expect(page.locator(`${host} ${hero} h1`)).toContainText(title);
  const duplicateVisible=await page.locator(`${host} .view-head:not(.hidden)`).count();
  expect(duplicateVisible).toBe(0);
 }
});

test('OS1300 mobile keeps the seven primary workflows one tap away',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await boot(page);
 await expect(page.locator('#bottomNav')).toBeVisible();
 await expect(page.locator('#bottomNav [data-view]')).toHaveCount(7);
 for(const view of ['inbox','work','tickets','money','property','betting']){
  await page.locator(`#bottomNav [data-view="${view}"]`).click();
  await expect(page.locator(`#view-${view}`)).toHaveClass(/on/);
  await page.waitForTimeout(view==='tickets'||view==='betting'?700:250);
  const overflow=await page.evaluate(()=>Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
 }
 await expect(page.locator('body')).toHaveCSS('overflow-x','hidden');
});

test('OS1306 exposes cloud login controls when local mode asks to connect',async({page})=>{
 await boot(page);
 await page.locator('#syncStatus').click();
 await expect(page.locator('#authView')).toBeVisible();
 await expect(page.locator('#loginEmail')).toBeVisible();
 await expect(page.locator('#magicLinkBtn')).toBeVisible();
 await page.locator('summary').filter({hasText:'Přihlásit se heslem'}).click();
 await expect(page.locator('#loginPassword')).toBeVisible();
});

test('OS1306 mobile menu reaches secondary personal sections',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await boot(page);
 await expect(page.locator('#mobileMenuBtn')).toBeVisible();
 await page.locator('#mobileMenuBtn').click();
 await page.getByRole('button',{name:'Rodina',exact:true}).click();
 await expect(page.locator('#view-family')).toHaveClass(/on/);
});


test('OS1307 full desktop audit renders every product surface without crash or overflow',async({page})=>{
 const pageErrors=[],consoleErrors=[];
 page.on('pageerror',e=>pageErrors.push(String(e?.message||e)));
 page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);
 const cases=[
  ['today','#todayView','[data-os2-today]'],
  ['inbox','#inboxView','[data-tasks-overview]'],
  ['work','#workView','[data-work-page1300]'],
  ['tickets','#ticketIntelView','[data-ticket-overview]'],
  ['money','#moneyView','[data-money-overview]'],
  ['property','#propertyView','[data-property-page1300]'],
  ['betting','#bettingView','[data-betting-overview]'],
  ['family','#ticketsView','.hf140-hero'],
  ['home','#homeView','.hf140-hero'],
  ['more','#moreView','.id141-hero']
 ];
 for(const [view,host,ready] of cases){
  if(view!=='today')await page.locator(`#mainNav [data-view="${view}"]`).click();
  await expect(page.locator(`#view-${view}`)).toHaveClass(/on/);
  await expect(page.locator(`${host} ${ready}`)).toBeVisible({timeout:12000});
  await expect(page.locator('.view.on')).toHaveCount(1);
  await expect(page.locator(host)).not.toContainText('Modul se nepodařilo načíst');
  const overflow=await page.evaluate(()=>Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth);
  expect(overflow,`horizontal overflow in ${view}`).toBeLessThanOrEqual(2);
 }
 expect(pageErrors).toEqual([]);
 expect(consoleErrors).toEqual([]);
});

test('OS1307 advanced personal workspaces reset back to their simple overview',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);

 await page.locator('#mainNav [data-view="inbox"]').click();
 await expect(page.locator('#inboxView [data-tasks-overview]')).toBeVisible();
 await page.locator('#inboxView [data-task-advanced]').click();
 await expect(page.locator('#inboxView [data-inbox-hub660]')).toBeVisible({timeout:12000});
 await page.locator('#mainNav [data-view="work"]').click();
 await page.locator('#mainNav [data-view="inbox"]').click();
 await expect(page.locator('#inboxView [data-tasks-overview]')).toBeVisible({timeout:12000});
 await expect(page.locator('#inboxView [data-inbox-hub660]')).toHaveCount(0);

 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('#moneyView [data-money-overview]')).toBeVisible();
 await page.locator('#moneyView [data-money-advanced]').click();
 await expect(page.locator('#moneyView .money-page')).toBeVisible({timeout:12000});
 await page.locator('#mainNav [data-view="property"]').click();
 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('#moneyView [data-money-overview]')).toBeVisible({timeout:12000});
 await expect(page.locator('#moneyView .money-page')).toHaveCount(0);

 await page.locator('#mainNav [data-view="betting"]').click();
 await expect(page.locator('#bettingView [data-betting-overview]')).toBeVisible();
 await page.locator('#bettingView [data-betting-advanced]').click();
 await expect(page.locator('#bettingView .bet144')).toBeVisible({timeout:12000});
 await page.locator('#mainNav [data-view="today"]').click();
 await page.locator('#mainNav [data-view="betting"]').click();
 await expect(page.locator('#bettingView [data-betting-overview]')).toBeVisible({timeout:12000});
 await expect(page.locator('#bettingView .bet144')).toHaveCount(0);
});

test('OS1307 signed-out ticket sync routes to visible cloud login and safely returns',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="tickets"]').click();
 await expect(page.locator('#ticketIntelView [data-ticket-overview]')).toBeVisible();
 await page.locator('#ticketIntelView [data-ticket-sync]').click();
 await expect(page.locator('#authView')).toBeVisible();
 await expect(page.locator('#appView')).toBeHidden();
 await expect(page.locator('#loginEmail')).toBeVisible();
 await page.locator('#skipLoginBtn').click();
 await expect(page.locator('#appView')).toBeVisible();
 await expect(page.locator('#ticketIntelView [data-ticket-overview]')).toBeVisible({timeout:12000});
});

test('OS1307 mobile audit reaches every secondary section with no horizontal overflow',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await boot(page);
 for(const label of ['Rodina','Domov','Dokumenty']){
  await page.locator('#mobileMenuBtn').click();
  await page.getByRole('button',{name:label,exact:true}).click();
  const view={Rodina:'family',Domov:'home',Dokumenty:'more'}[label];
  await expect(page.locator(`#view-${view}`)).toHaveClass(/on/);
  const overflow=await page.evaluate(()=>Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth);
  expect(overflow,`mobile overflow in ${view}`).toBeLessThanOrEqual(2);
 }
 await expect(page.locator('.view.on')).toHaveCount(1);
});


test('OS1307 Today treats date-only today as due today and uses canonical betting ledger',async({page})=>{
 await page.addInitScript(()=>{
  const now=new Date(),today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
  localStorage.setItem('kamil_betting_ledger_543',JSON.stringify({bets:[],bankrollCzk:0}));
  localStorage.setItem('kamil-os-state',JSON.stringify({
   meta:{schemaVersion:80,createdAt:new Date().toISOString()},
   tasks:[{id:'due-today',title:'Úkol splatný dnes',status:'OPEN',due:today,area:'test'}],
   bettingLedger:{bets:[{id:'bet-1',status:'OPEN',stakeCzk:700,label:'Test sázka'}],bankrollCzk:10000,unitCzk:100,updatedAt:new Date().toISOString()}
  }));
 });
 await boot(page);
 const todayRow=page.locator('[data-today1300-task="due-today"]');
 await expect(todayRow).toBeVisible();
 await expect(todayRow.locator('.pr1300-row-side')).not.toHaveClass(/bad/);
 const overdueRow=page.locator('.pr1300-row').filter({hasText:'Úkoly po termínu'});
 await expect(overdueRow.locator('.pr1300-row-side')).toHaveText('0');
 const bettingDomain=page.locator('.pr1300-domain').filter({hasText:'Sázení'});
 await expect(bettingDomain).toContainText('1 otevřených');
 await expect(bettingDomain).toContainText('700 Kč expozice');
});

test('OS1307 Work recognizes followUpAt as the waiting deadline',async({page})=>{
 await page.addInitScript(()=>{
  const now=new Date(),today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
  localStorage.setItem('kamil-os-state',JSON.stringify({
   meta:{schemaVersion:80,createdAt:new Date().toISOString()},
   delegations:[{id:'wait-1',title:'Čekám na potvrzení',status:'OPEN',followUpAt:today,createdAt:new Date().toISOString()}]
  }));
 });
 await boot(page);
 await page.locator('#mainNav [data-view="work"]').click();
 await expect(page.locator('#workView [data-work-page1300]')).toBeVisible();
 await expect(page.locator('#workView')).toContainText('Čekám na potvrzení');
 await expect(page.locator('#workView')).toContainText('dnes');
});

test('OS1307 Money opens the concrete financial task action',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('kamil-os-state',JSON.stringify({
   meta:{schemaVersion:80,createdAt:new Date().toISOString()},
   tasks:[{id:'money-task-1',title:'Zkontrolovat bankovní poplatek',status:'OPEN',category:'finance',area:'personal',notes:'Ověřit poslední výpis'}]
  }));
 });
 await boot(page);
 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('#moneyView [data-money-overview]')).toBeVisible();
 await page.locator('#moneyView [data-money-task="money-task-1"]').click();
 await expect(page.locator('#modalHost')).toContainText('Zkontrolovat bankovní poplatek');
 await expect(page.getByRole('button',{name:'Hotovo',exact:true})).toBeVisible();
});


test('OS1307 untouched zero cash stays unknown while explicit zero remains valid',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('kamil-os-state',JSON.stringify({
   meta:{schemaVersion:80,createdAt:new Date().toISOString()},
   financePlan:{cashNow:0,expectedIncome:0,reserveFloor:0,plannedInvestment:0}
  }));
 });
 await boot(page);
 const moneyDomain=page.locator('.pr1300-domain').filter({hasText:'Peníze'});
 await expect(moneyDomain).toContainText('otevřít finance');
 await expect(moneyDomain).toContainText('hotovost není zadaná');

 await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  store.mutate('test explicit zero cash',state=>{state.financePlan.updatedAt=new Date().toISOString()},{undo:false,cloud:false,audit:false});
 });
 await page.locator('#mainNav [data-view="money"]').click();
 await page.locator('#mainNav [data-view="today"]').click();
 await expect(page.locator('#todayView [data-os2-today]')).toBeVisible();
 const explicit=page.locator('.pr1300-domain').filter({hasText:'Peníze'});
 await expect(explicit).toContainText('0 Kč');
 await expect(explicit).toContainText('zadaná volná hotovost');
});


test('OS1307 empty canonical betting ledger does not revive legacy bets',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('kamil_betting_ledger_543',JSON.stringify({bets:[{id:'legacy-open',status:'OPEN',stakeCzk:999,label:'Stará sázka'}],bankrollCzk:5000}));
  localStorage.setItem('kamil-os-state',JSON.stringify({
   meta:{schemaVersion:80,createdAt:new Date().toISOString()},
   bettingLedger:{bets:[],bankrollCzk:0,unitCzk:100,updatedAt:new Date().toISOString()}
  }));
 });
 await boot(page);
 await page.locator('#mainNav [data-view="betting"]').click();
 await expect(page.locator('#bettingView [data-betting-overview]')).toBeVisible();
 await expect(page.locator('#bettingView')).toContainText('0 otevřených');
 await expect(page.locator('#bettingView')).not.toContainText('Stará sázka');
});


test('OS1307 canceled items stay closed across primary dashboards',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('kamil-os-state',JSON.stringify({
   meta:{schemaVersion:80,createdAt:new Date().toISOString()},
   tasks:[
    {id:'cancel-a',title:'Zrušený obecný úkol',status:'CANCELED',due:'2000-01-01'},
    {id:'cancel-b',title:'Zrušený finanční úkol',status:'CANCELLED',category:'finance',area:'personal'}
   ],
   delegations:[{id:'cancel-wait',title:'Zrušené čekání',status:'CANCELED',followUpAt:'2000-01-01'}]
  }));
 });
 await boot(page);
 await expect(page.locator('#todayView')).not.toContainText('Zrušený obecný úkol');
 await page.locator('#mainNav [data-view="work"]').click();
 await expect(page.locator('#workView')).not.toContainText('Zrušené čekání');
 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('#moneyView')).not.toContainText('Zrušený finanční úkol');
});


test('OS1308 advanced betting cannot resurrect stale legacy bets',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('kamil_betting_ledger_543',JSON.stringify({bets:[{id:'legacy-zombie',status:'OPEN',stakeCzk:1234,label:'Legacy zombie'}],bankrollCzk:5000,updatedAt:'2026-01-01T00:00:00.000Z'}));
  localStorage.setItem('kamil-os-state',JSON.stringify({
   meta:{schemaVersion:80,createdAt:new Date().toISOString()},
   bettingLedger:{bets:[],bankrollCzk:0,unitCzk:100,updatedAt:new Date().toISOString()}
  }));
 });
 await boot(page);
 await page.locator('#mainNav [data-view="betting"]').click();
 await expect(page.locator('#bettingView [data-betting-overview]')).toBeVisible();
 await expect(page.locator('#bettingView')).not.toContainText('Legacy zombie');
 await page.locator('#bettingView [data-betting-advanced]').click();
 await expect(page.locator('#bettingView .bet144')).toBeVisible({timeout:15000});
 await page.waitForTimeout(500);
 const state=await page.evaluate(async()=>{const {store}=await import('./js/state.js');return store.get().bettingLedger});
 expect(state.bets).toHaveLength(0);
 expect(state.unitCzk).toBe(100);
});

test('OS1308 store.replace cloud option queues and schedules repaired state',async({page})=>{
 await boot(page);
 const result=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  let writes=0;store.setCloudWriter(()=>{writes+=1});
  const next=structuredClone(store.get());
  next.tasks=[...(next.tasks||[]),{id:'repair-task',title:'Repaired item',status:'OPEN'}];
  store.replace(next,'integrity-test',{cloud:true,audit:true});
  const queued=store.readQueue();
  return {
   dirty:store.dirty,
   writes,
   lastMutationAt:store.get().meta?.lastMutationAt||null,
   audit:store.get().audit?.[0]?.label||null,
   queuedTask:queued?.payload?.tasks?.some(x=>x.id==='repair-task')===true
  };
 });
 expect(result.dirty).toBe(true);
 expect(result.writes).toBe(1);
 expect(result.lastMutationAt).toBeTruthy();
 expect(result.audit).toBe('integrity-test');
 expect(result.queuedTask).toBe(true);
});
