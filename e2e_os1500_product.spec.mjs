import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

async function boot(page){
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await expect(page.locator('[data-os2-today]')).toBeVisible({timeout:10000});
}

test('OS1500 keeps every primary area direct and canonical',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);
 await expect(page.locator('html[data-os1500="1"]')).toHaveCount(1);
 await expect(page.locator('.os1600-area')).toHaveCount(9);

 await page.locator('#mainNav [data-view="family"]').click();
 await expect(page.locator('[data-family-page1500]')).toBeVisible();
 await expect(page.locator('[data-family-filter]')).toHaveCount(0);

 await page.locator('#mainNav [data-view="home"]').click();
 await expect(page.locator('[data-home-page1500]')).toBeVisible();
 await expect(page.locator('[data-home-filter]')).toHaveCount(0);

 await page.locator('#mainNav [data-view="more"]').click();
 await expect(page.locator('[data-documents-page1500]')).toBeVisible();
 await expect(page.locator('[data-doc-filter]')).toHaveCount(0);
 await expect(page.locator('#insurance25Tile')).toBeVisible();

 const legacyPersonalStyles=await page.locator('link[data-os2-lazy]').evaluateAll(links=>links.map(x=>x.getAttribute('href')).filter(h=>/personal64|family70|home68/.test(h||'')));
 expect(legacyPersonalStyles).toEqual([]);

 await page.locator('#mainNav [data-view="betting"]').click();
 await expect(page.locator('#quickAddBtn')).toBeVisible();
 await expect(page.locator('#quickAddBtn')).toHaveAttribute('title',/sázení/i);
});

test('OS1500 mobile keeps all ten destinations visible in two rows',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await boot(page);
 const nav=page.locator('#bottomNav');
 await expect(nav.locator('[data-view]')).toHaveCount(10);
 const layout=await nav.evaluate(el=>{
  const s=getComputedStyle(el),r=el.getBoundingClientRect();
  const first=el.querySelector('[data-view]'),buttonStyle=first?getComputedStyle(first):null;
  return {display:s.display,height:r.height,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,columns:s.gridTemplateColumns,rows:s.gridTemplateRows,fontSize:buttonStyle?parseFloat(buttonStyle.fontSize):0};
 });
 expect(layout.display).toBe('grid');
 expect(layout.height).toBeLessThanOrEqual(100);
 expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth+2);
 expect(layout.rows.split(' ').length).toBe(2);
 expect(layout.fontSize).toBeGreaterThanOrEqual(8.5);
 const last=nav.locator('[data-view="more"]');
 await expect(last).toBeVisible();
 await last.click();
 await expect(page.locator('[data-documents-page1500]')).toBeVisible();
});

test('OS737.0.25 restores canonical stylesheet order after advanced surfaces',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);
 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('[data-money-overview]')).toBeVisible({timeout:10000});
 await page.locator('[data-money-advanced]').click();
 await expect.poll(()=>page.locator('link[data-product-advanced]').count(),{timeout:10000}).toBeGreaterThan(0);
 await page.locator('#mainNav [data-view="today"]').click();
 await expect(page.locator('[data-os2-today]')).toBeVisible({timeout:10000});
 const order=await page.locator('link[rel="stylesheet"]').evaluateAll(links=>links.map(x=>x.getAttribute('href')));
 const canonical=['./productReset1300.css','./os1400.css','./os1500.css'].map(x=>order.lastIndexOf(x));
 expect(canonical[0]).toBeGreaterThan(-1);
 expect(canonical[0]).toBeLessThan(canonical[1]);
 expect(canonical[1]).toBeLessThan(canonical[2]);
 expect(canonical[2]).toBe(order.length-1);
});

test('OS737.0.26 clicking the active section exits advanced detail',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);
 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('[data-money-overview]')).toBeVisible({timeout:10000});
 await page.locator('[data-money-advanced]').click();
 await expect.poll(()=>page.locator('#moneyView').getAttribute('data-product-advanced'),{timeout:10000}).toBe('1');
 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('[data-money-overview]')).toBeVisible({timeout:10000});
 await expect(page.locator('#moneyView')).not.toHaveAttribute('data-product-advanced','1');
 const order=await page.locator('link[rel="stylesheet"]').evaluateAll(links=>links.map(x=>x.getAttribute('href')));
 expect(order.at(-1)).toBe('./os1500.css');
});

test('OS737.0.27 derived Today ticket counts exclude disputes',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('kamil-os-state',JSON.stringify({
  meta:{schemaVersion:80,createdAt:new Date().toISOString()},
  ticketBook:{items:[
   {id:'active',name:'Česko - Anglie - 115',qty:4,buy:7516,workflow:'LISTED'},
   {id:'issue',name:'Davis Cup - reklamace',qty:3,buy:7590,workflow:'HOLD',issue:'REKLAMACE'}
  ],watchlist:[],history:[],review:[],masterId:'flipovani-2024-2026-2026-09-23'},
  personalAdmin:{items:[]}
 })));
 await boot(page);
 const today=await page.evaluate(()=>window.__KAMIL_TODAY_OS2000__);
 expect(today?.healthy).toBe(true);
 const ticketArea=page.locator('.os1600-area').filter({hasText:'Vstupenky'});
 await expect(ticketArea).toContainText('4 ks');
 await expect(ticketArea).not.toContainText('7 ks');
});

test('OS737.0.29 Home hides archived recovery insurance and shows canonical property insurance',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="home"]').click();
 await expect(page.locator('[data-home-page1500]')).toBeVisible({timeout:10000});
 const records=page.locator('#homeView .os1500-record');
 const canonical=records.filter({hasText:'Dům Vlasatice · pojištění nemovitosti'});
 await expect(canonical).toHaveCount(1);
 await expect(canonical).toContainText('Dům Vlasatice · pojištění nemovitosti');
 await expect(page.locator('#homeView')).not.toContainText('Pojištění domu Vlasatice');
});

test('OS737.0.30 Money separates current and upcoming insurance and excludes disputed tickets',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('[data-money-overview]')).toBeVisible({timeout:10000});
 await page.locator('[data-money-advanced]').click();
 await expect(page.locator('#moneyView')).toContainText('Fixní platby teď');
 const checked=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');const expected=(s.ticketBook?.items||[]).filter(x=>!x.issue&&['HOLD','LISTED'].includes(String(x.workflow||'').toUpperCase())).reduce((a,x)=>a+Number(x.buy||x.buyTotalCzk||0),0);return{diag:window.__KAMIL_WEALTH_700_LAST__,expected}});
 expect(checked.diag.upcomingInsuranceMonthly).toBeGreaterThanOrEqual(2000);
 expect(checked.diag.wealth.tickets).toBeCloseTo(checked.expected,2);
});

test('OS737.0.31 command bar ticket capital excludes disputes',async({page})=>{
 await boot(page);
 const checked=await page.evaluate(async()=>{
  const m=await import('./js/personalQuery29.js');
  const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');
  const expected=(s.ticketBook?.items||[]).filter(x=>!x.issue&&['HOLD','LISTED'].includes(String(x.workflow||'').toUpperCase())).reduce((a,x)=>a+Number(x.buy||x.buyTotalCzk||0),0);
  return {result:m.personalQuery('kolik mám kapitálu ve vstupenkách',s,{}),expected};
 });
 expect(String(checked.result?.title||'').replace(/\D/g,'')).toContain(String(Math.round(checked.expected)));
 expect(checked.result?.lines?.join(' ')).toContain('bez reklamací');
});

test('OS737.0.32 recurring Money list uses canonical insurance and separates upcoming policy',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="money"]').click();
 await page.locator('[data-money-advanced]').click();
 await expect(page.locator('[data-money-group="recurring"]')).toContainText('Kamil · Allianz ŽIVOT');
 await expect(page.locator('[data-money-group="recurring"]')).toContainText('Začne později');
 await expect(page.locator('[data-money-group="recurring"]')).toContainText('Tereza · NN Orange Risk');
 await expect(page.locator('[data-money-group="recurring"]')).not.toContainText('Životní pojištění Kamil');
});

test('OS737.0.33 insurance cards deep-link to Insurance Center',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="home"]').click();
 await expect(page.locator('[data-home-page1500]')).toBeVisible({timeout:10000});
 const homeInsurance=page.locator('#homeView .os1500-record').filter({hasText:'Dům Vlasatice · pojištění nemovitosti'});
 await homeInsurance.click();
 await expect(page.locator('#moreView')).toContainText('INSURANCE CENTER / OS1336',{timeout:10000});
 await page.locator('#mainNav [data-view="money"]').click();
 await page.locator('[data-money-advanced]').click();
 await page.locator('[data-money-insurance]').first().click();
 await expect(page.locator('#moreView')).toContainText('INSURANCE CENTER / OS1336',{timeout:10000});
});

test('OS737.0.34 recurring insurance rows show actual payment cadence',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="money"]').click();
 await page.locator('[data-money-advanced]').click();
 const recurring=page.locator('[data-money-group="recurring"]');
 await expect(recurring).toContainText('Fiat Croma · Auto & pohoda');
 await expect(recurring).toContainText('3 868 Kč/rok');
 await expect(recurring).toContainText('Kamil · Allianz ŽIVOT');
 await expect(recurring).toContainText('915 Kč/měs.');
});

test('OS737.0.36 Home insurance card shows actual yearly cadence',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="home"]').click();
 await expect(page.locator('[data-home-page1500]')).toBeVisible({timeout:10000});
 const card=page.locator('#homeView .os1500-record').filter({hasText:'Dům Vlasatice · pojištění nemovitosti'});
 await expect(card).toContainText('2 600 Kč/rok');
 await expect(card).toContainText('Ověřit');
});

test('OS737.0.37 Today insurance priority deep-links to Insurance Center',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="today"]').click();
 const insurancePriority=page.locator('[data-today1300-insurance]').first();
 await expect(insurancePriority).toBeVisible({timeout:10000});
 await insurancePriority.click();
 await expect(page.locator('#moreView')).toContainText('INSURANCE CENTER / OS1336',{timeout:10000});
});

test('OS737.0.39 Documents top status includes Insurance Center actions',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="more"]').click();
 await expect(page.locator('[data-documents-page1500]')).toBeVisible({timeout:10000});
 const diag=await page.evaluate(()=>window.__KAMIL_DOCUMENTS141__);
 expect(diag.insuranceAction).toBeGreaterThan(0);
 expect(diag.action).toBeGreaterThanOrEqual(diag.insuranceAction);
 await expect(page.locator('#moreView .pr1300-status')).not.toHaveText('klid');
});

test('OS737.0.44 handed-over projects do not remain active in Work',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const out=await page.evaluate(async()=>{
  const {workCommandCenter440}=await import('./js/workCommandCenter440.js');
  return workCommandCenter440({
   projects:[
    {id:'active',name:'Aktivní',status:'OPEN',next:'Další krok',owner:'Kamil'},
    {id:'handover',name:'Předaná',status:'PŘEDÁNO'},
    {id:'done-en',name:'Finished',status:'FINISHED'}
   ],
   tasks:[]
  });
 });
 expect(out.projects.map(x=>x.name)).toEqual(['Aktivní']);
});

test('OS737.0.45 Inbox excludes informational upcoming insurance',async({page})=>{
 await boot(page);
 const out=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const {insuranceCenter}=await import('./js/insurance25.js');
  const {localInboxSummary660}=await import('./js/inboxHub660.js');
  const state=store.get(),center=insuranceCenter(state),inbox=localInboxSummary660(state);
  const upcoming=center.policies.find(x=>x.lifecycle==='UPCOMING'&&!x.needsAction)||null;
  return {
   upcoming:upcoming?{id:upcoming.id,status:upcoming.status,needsAction:upcoming.needsAction}:null,
   inboxHasUpcoming:upcoming?inbox.rows.some(x=>String(x.sourceId)===String(upcoming.id)):false
  };
 });
 expect(out.upcoming).toBeTruthy();
 expect(out.upcoming.status).toBe('SOON');
 expect(out.upcoming.needsAction).toBe(false);
 expect(out.inboxHasUpcoming).toBe(false);
});

test('OS737.0.46 actionable Inbox insurance row opens Insurance Center',async({page})=>{
 await boot(page);
 const row=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const {localInboxSummary660}=await import('./js/inboxHub660.js');
  return localInboxSummary660(store.get()).rows.find(x=>x.insurance)||null;
 });
 expect(row).toBeTruthy();
 await page.locator('#mainNav [data-view="inbox"]').click();
 await page.locator('[data-inbox660-row="'+row.id+'"] [data-inbox660-open]').click();
 await expect(page.locator('#moreView')).toContainText('INSURANCE CENTER / OS1336',{timeout:10000});
});

test('OS737.0.47 personal action engine does not duplicate Insurance Center actions',async({page})=>{
 await boot(page);
 const out=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const {personalActions640}=await import('./js/personalActions640.js');
  const {insuranceCenter}=await import('./js/insurance25.js');
  const state=store.get(),personal=personalActions640(state),insurance=insuranceCenter(state);
  return {
   duplicated:personal.all.filter(x=>String(x.id||'').startsWith('admin:ins-master-')).map(x=>x.id),
   insuranceActions:insurance.actions.map(x=>x.id)
  };
 });
 expect(out.duplicated).toEqual([]);
 expect(out.insuranceActions.length).toBeGreaterThan(0);
});

test('OS737.0.48 Family calendar excludes unrelated personal events',async({page})=>{
 await boot(page);
 await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const tomorrow=new Date(Date.now()+86400000).toISOString();
  store.mutate('test family calendar scope',s=>{
   s.calendar=s.calendar||{events:[]};
   s.calendar.events=[
    {id:'family-scope-test',title:'Rodinný termín',area:'Rodina',start:tomorrow},
    {id:'personal-scope-test',title:'Osobní administrativa',area:'Osobní',start:tomorrow}
   ];
  });
 });
 await page.locator('#mainNav [data-view="family"]').click();
 await expect(page.locator('[data-family-page1500]')).toBeVisible({timeout:10000});
 await expect(page.locator('#ticketsView')).toContainText('Rodinný termín');
 await expect(page.locator('#ticketsView')).not.toContainText('Osobní administrativa');
});

test('OS737.0.50 ticket transfer/payout attention opens Ticket desk instead of sync',async({page})=>{
 await boot(page);
 const out=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  store.mutate('test ticket transfer CTA',s=>{
   s.ticketBook=s.ticketBook||{items:[]};
   s.ticketBook.items=[...(s.ticketBook.items||[]),{
    id:'cta-transfer-test',name:'CTA transfer test',qty:1,buy:1000,buyTotalCzk:1000,
    workflow:'SOLD',market_status:'SOLD_UNDELIVERED',transferStatus:'PENDING'
   }];
  });
  return true;
 });
 await page.locator('#mainNav [data-view="tickets"]').click();
 const row=page.locator('[data-ticket-action="advanced"]').filter({hasText:'čeká na převod'}).first();
 await expect(row).toBeVisible({timeout:10000});
 await row.click();
 await expect(page.locator('#ticketIntelView')).toHaveAttribute('data-product-advanced','1');
});

test('OS737.0.51 Money keeps a confirmed zero bank balance instead of falling back to stale cash',async({page})=>{
 await boot(page);
 await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  store.mutate('test confirmed zero bank balance',s=>{
   s.personalVault={version:1,items:[{
    id:'bank-zero-test',title:'Bankovní test',section:'money',recordType:'bank-data',
    balance:0,confidence:100,asOf:new Date().toISOString().slice(0,10),freshnessDays:365
   }],evidence:[]};
   s.financePlan={...(s.financePlan||{}),cashNow:999999,updatedAt:new Date().toISOString()};
  });
 });
 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('[data-money-overview]')).toBeVisible({timeout:10000});
 await expect(page.locator('#moneyView .os1334-mini-grid')).toContainText('0 Kč');
 await expect(page.locator('#moneyView .os1334-mini-grid')).not.toContainText('999 999');
});

test('OS737.0.52 Money detail shows confirmed zero bank balance as known',async({page})=>{
 await boot(page);
 await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  store.mutate('test detail zero bank balance',s=>{
   s.personalVault={version:1,items:[{
    id:'bank-zero-detail',title:'Bankovní test',section:'money',recordType:'bank-data',
    balance:0,confidence:100,asOf:new Date().toISOString().slice(0,10),freshnessDays:365
   },{
    id:'property-known-detail',title:'Nemovitost',section:'home',recordType:'property',
    marketValue:1000000,confidence:100,asOf:new Date().toISOString().slice(0,10),freshnessDays:365
   }],evidence:[]};
   s.xtbHub={accounts:{test:{currency:'CZK',totalValueCzk:0,positions:[]}}};
  });
 });
 await page.locator('#mainNav [data-view="money"]').click();
 await page.locator('[data-money-advanced]').click();
 await expect(page.locator('#moneyView')).toContainText('PENÍZE + WEALTH',{timeout:10000});
 const wealth=page.locator('#moneyView [data-money-group="wealth"]');
 await expect(wealth).toContainText('Hotovost / účty – známá hodnota');
 await expect(wealth).toContainText('0 Kč');
 await expect(wealth).not.toContainText('Hotovost / účty – známá hodnotachybí');
});

test('OS737.0.53 Today shows sold-undelivered as transfer but not active inventory',async({page})=>{
 await boot(page);
 await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  store.mutate('test Today ticket lifecycle',s=>{
   s.ticketBook=s.ticketBook||{items:[]};
   s.ticketBook.items=[
    {id:'active-listing',name:'Active listing',qty:2,workflow:'LISTED',market_status:'LISTED',buy:2000},
    {id:'sold-transfer',name:'Sold transfer',qty:3,workflow:'SOLD',market_status:'SOLD_UNDELIVERED',buy:3000},
    {id:'waiting-payout',name:'Waiting payout',qty:4,workflow:'PAYOUT WAIT',market_status:'SOLD_WAITING_PAYMENT',buy:4000}
   ];
  });
 });
 await page.locator('#mainNav [data-view="today"]').click();
 await expect(page.locator('[data-os2-today]')).toBeVisible({timeout:10000});
 await expect(page.locator('#todayView')).toContainText('1 prodejů čeká na převod');
 const diag=await page.evaluate(()=>window.__KAMIL_TODAY_OS2000__);
 expect(diag.ticketQty).toBe(2);
});

test('OS737.0.54 Today Inbox row excludes work tasks from personal task scope',async({page})=>{
 await boot(page);
 await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
  store.mutate('test Today task scope',s=>{
   s.tasks=[
    {id:'personal-overdue',title:'Osobní po termínu',status:'OPEN',area:'Osobní',due:yesterday},
    {id:'work-overdue',title:'Pracovní po termínu',status:'OPEN',area:'Práce',due:yesterday}
   ];
  });
 });
 await page.locator('#mainNav [data-view="today"]').click();
 await expect(page.locator('[data-os2-today]')).toBeVisible({timeout:10000});
 const diag=await page.evaluate(()=>window.__KAMIL_TODAY_OS2000__);
 expect(diag.overdue).toBe(1);
 await expect(page.locator('#todayView')).toContainText('Osobní po termínu');
});

test('OS737.0.50 Inbox calendar rows route by personal area',async({page})=>{
 await boot(page);
 const routes=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const {localInboxSummary660}=await import('./js/inboxHub660.js');
  const tomorrow=new Date(Date.now()+86400000).toISOString();
  const s=structuredClone(store.get());
  s.calendar={events:[
   {id:'cal-family',title:'Rodinný termín',area:'Rodina',start:tomorrow},
   {id:'cal-home',title:'Revize domu',area:'Domov',start:tomorrow},
   {id:'cal-money',title:'Banka schůzka',area:'Peníze',start:tomorrow},
   {id:'cal-personal',title:'Osobní schůzka',area:'Osobní',start:tomorrow}
  ]};
  return Object.fromEntries(localInboxSummary660(s).rows.filter(x=>x.sourceKind==='calendar').map(x=>[x.sourceId,x.route]));
 });
 expect(routes['cal-family']).toBe('family');
 expect(routes['cal-home']).toBe('home');
 expect(routes['cal-money']).toBe('money');
 expect(routes['cal-personal']).toBe('today');
});

test('OS737.0.56 Family hides archived household members',async({page})=>{
 await boot(page);
 await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  store.mutate('test archived family member',s=>{
   s.familyHome={members:[
    {id:'family-active-test',name:'Aktivní člen',status:'ACTIVE',relation:'OTHER'},
    {id:'family-archived-test',name:'Archivovaný člen',status:'ARCHIVED',relation:'OTHER'}
   ]};
  });
 });
 await page.locator('#mainNav [data-view="family"]').click();
 await expect(page.locator('[data-family-page1500]')).toBeVisible({timeout:10000});
 await expect(page.locator('#ticketsView')).toContainText('Aktivní člen');
 await expect(page.locator('#ticketsView')).not.toContainText('Archivovaný člen');
});

test('OS737.0.57 calendar preparation keeps the source area',async({page})=>{
 await boot(page);
 await page.evaluate(async()=>{
  const {openPersonalAction641}=await import('./js/personalActionExecution641.js');
  window.__calendarScopeTestPromise=openPersonalAction641({
   id:'calendar:money-scope-test',
   kind:'calendar',
   title:'Banka schůzka',
   why:'Kalendář · blízký termín',
   next:'Připravit se na událost.',
   route:'money'
  });
 });
 await expect(page.locator('#modalHost')).toContainText('Banka schůzka');
 await page.locator('#modalHost button').filter({hasText:'Připravit'}).click();
 await expect.poll(()=>page.evaluate(()=>{
  const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');
  const x=(s.tasks||[]).find(t=>t.sourceEventId==='money-scope-test');
  return x?x.area:null;
 }),{timeout:10000}).toBe('Peníze');
});

test('OS737.0.58 Home hides cancelled maintenance',async({page})=>{
 await boot(page);
 await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  store.mutate('test cancelled home maintenance',s=>{
   s.tasks=[
    {id:'home-open-maint',title:'Revize komínu',status:'OPEN',area:'Domov'},
    {id:'home-cancelled-maint',title:'Servis rekuperace',status:'CANCELLED',area:'Domov'}
   ];
  });
 });
 await page.locator('#mainNav [data-view="home"]').click();
 await expect(page.locator('[data-home-page1500]')).toBeVisible({timeout:10000});
 await expect(page.locator('#homeView')).toContainText('Revize komínu');
 await expect(page.locator('#homeView')).not.toContainText('Servis rekuperace');
});

test('OS737.0.59 calendar preparation is due before the future event',async({page})=>{
 await boot(page);
 const eventAt=new Date(Date.now()+5*86400000).toISOString();
 await page.evaluate(async(eventAt)=>{
  const {openPersonalAction641}=await import('./js/personalActionExecution641.js');
  window.__calendarDueTestPromise=openPersonalAction641({
   id:'calendar:due-scope-test',
   kind:'calendar',
   title:'Budoucí schůzka',
   why:'Kalendář · blízký termín',
   next:'Připravit se na událost.',
   route:'home',
   due:eventAt
  });
 },eventAt);
 await expect(page.locator('#modalHost')).toContainText('Budoucí schůzka');
 await page.locator('#modalHost button').filter({hasText:'Připravit'}).click();
 const task=await expect.poll(()=>page.evaluate(()=>{
  const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');
  const x=(s.tasks||[]).find(t=>t.sourceEventId==='due-scope-test');
  return x?{due:x.due,area:x.area}:null;
 }),{timeout:10000}).not.toBeNull();
 const created=await page.evaluate(()=>{
  const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');
  const x=(s.tasks||[]).find(t=>t.sourceEventId==='due-scope-test');
  return x?{due:x.due,area:x.area}:null;
 });
 expect(created.area).toBe('Domov');
 expect(Math.abs(Date.parse(created.due)-(Date.parse(eventAt)-86400000))).toBeLessThan(2000);
});

test('OS737.0.60 Today personal calendar priorities keep their area',async({page})=>{
 await boot(page);
 const out=await page.evaluate(async()=>{
  const {personalActions640}=await import('./js/personalActions640.js');
  const today=new Date().toISOString();
  const s={
   personalSettings:{},
   tasks:[],
   delegations:[],
   personalAdmin:{items:[]},
   calendar:{events:[
    {id:'today-family',title:'Rodinný termín',area:'Rodina',start:today},
    {id:'today-home',title:'Revize domu',area:'Domov',start:today},
    {id:'today-money',title:'Banka schůzka',area:'Peníze',start:today},
    {id:'today-personal',title:'Osobní schůzka',area:'Osobní',start:today}
   ]}
  };
  return Object.fromEntries(personalActions640(s).all.filter(x=>x.kind==='calendar').map(x=>[x.id,{route:x.route,area:x.area,due:x.due}]));
 });
 expect(out['calendar:today-family']).toMatchObject({route:'family',area:'family'});
 expect(out['calendar:today-home']).toMatchObject({route:'home',area:'home'});
 expect(out['calendar:today-money']).toMatchObject({route:'money',area:'money'});
 expect(out['calendar:today-personal']).toMatchObject({route:'today',area:'admin'});
});

test('OS737.0.61 cancelled calendar events disappear from active personal surfaces',async({page})=>{
 await boot(page);
 const out=await page.evaluate(async()=>{
  const {localInboxSummary660}=await import('./js/inboxHub660.js');
  const {personalActions640}=await import('./js/personalActions640.js');
  const {personalDailyAssistant650}=await import('./js/personalAssistant650.js');
  const today=new Date().toISOString();
  const tomorrow=new Date(Date.now()+86400000).toISOString();
  const s={
   tasks:[],delegations:[],personalAdmin:{items:[]},familyHome:{members:[]},personalSettings:{},
   calendar:{events:[
    {id:'active-cal',title:'Aktivní osobní termín',area:'Osobní',status:'ACTIVE',start:tomorrow},
    {id:'cancelled-cal',title:'Zrušený osobní termín',area:'Osobní',status:'CANCELLED',start:today}
   ]}
  };
  return {
   inbox:localInboxSummary660(s).rows.map(x=>x.sourceId),
   actions:personalActions640(s).all.map(x=>x.id),
   next7:personalDailyAssistant650(s).next7.map(x=>x.id)
  };
 });
 expect(out.inbox).toContain('active-cal');
 expect(out.inbox).not.toContain('cancelled-cal');
 expect(out.actions).not.toContain('calendar:cancelled-cal');
 expect(out.next7).toContain('active-cal');
 expect(out.next7).not.toContain('cancelled-cal');
});

test('OS737.0.62 closed calendar prep does not block a new preparation task',async({page})=>{
 await boot(page);
 const out=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const {prepareFamilyEvent644}=await import('./js/personalFamilyHomeActions644.js');
  store.mutate('test closed family prep',s=>{
   s.tasks=[{id:'old-prep',title:'Old prep',status:'CANCELLED',sourceEventId:'event-reopen-test',area:'Rodina',category:'Rodina'}];
  });
  prepareFamilyEvent644({id:'event-reopen-test',title:'Rodinná událost',start:new Date(Date.now()+3*86400000).toISOString()});
  const tasks=store.get().tasks.filter(x=>x.sourceEventId==='event-reopen-test');
  return tasks.map(x=>({id:x.id,status:x.status}));
 });
 expect(out.length).toBe(2);
 expect(out.some(x=>x.status==='OPEN')).toBe(true);
 expect(out.some(x=>x.status==='CANCELLED')).toBe(true);
});

test('OS737.0.63 Family Home center ignores closed obligations',async({page})=>{
 await boot(page);
 const out=await page.evaluate(async()=>{
  const {familyHome}=await import('./js/familyHome25.js');
  const s={
   familyHome:{members:[{id:'m1',name:'Aktivní člen',status:'ACTIVE'}]},
   personalAdmin:{items:[
    {id:'home-open',title:'Revize domu',category:'HOME',status:'ACTIVE',nextDue:new Date(Date.now()+5*86400000).toISOString()},
    {id:'home-done',title:'Hotová revize',category:'HOME',status:'DONE',nextDue:new Date(Date.now()+5*86400000).toISOString()},
    {id:'home-cancelled',title:'Zrušený servis',category:'HOME',status:'CANCELLED',nextDue:new Date(Date.now()+5*86400000).toISOString()}
   ]}
  };
  return familyHome(s);
 });
 expect(out.obligations.map(x=>x.id)).toEqual(['home-open']);
});

test('OS737.0.64 Today calendar hides closed events',async({page})=>{
 await boot(page);
 await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const tomorrow=new Date(Date.now()+86400000).toISOString();
  store.mutate('test Today closed calendar event',s=>{
   s.calendar={events:[
    {id:'cal-open-64',title:'Otevřený termín 64',status:'OPEN',start:tomorrow},
    {id:'cal-closed-64',title:'Uzavřený termín 64',status:'CLOSED',start:tomorrow}
   ]};
  });
 });
 await page.locator('#mainNav [data-view="today"]').click();
 await expect(page.locator('#todayView')).toContainText('Otevřený termín 64');
 await expect(page.locator('#todayView')).not.toContainText('Uzavřený termín 64');
});

test('OS737.0.65 money event tomorrow does not become a Family priority',async({page})=>{
 await boot(page);
 await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const tomorrow=new Date(Date.now()+86400000).toISOString();
  store.mutate('test Tomorrow scope',s=>{
   s.tasks=[];
   s.personalAdmin={items:[]};
   s.delegations=[];
   s.calendar={events:[{id:'money-tomorrow-65',title:'Banka schůzka zítra',area:'Peníze',status:'OPEN',start:tomorrow}]};
  });
 });
 await page.locator('#mainNav [data-view="today"]').click();
 const bankRow=page.locator('#todayView .os1400-row').filter({hasText:'Banka schůzka zítra'}).first();
 await expect(bankRow).toHaveAttribute('data-today1300-nav','money');
 const familyArea=page.locator('#todayView .os1600-area').filter({hasText:'Rodina'}).first();
 await expect(familyArea).not.toContainText('Nejbližší rodinná věc je zítra');
 await expect(familyArea).toContainText('klid');
});

test('OS737.0.66 Today Documents card matches canonical action total',async({page})=>{
 await boot(page);
 await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const now=new Date().toISOString();
  store.mutate('test Documents action parity',s=>{
   s.personalVault={version:1,evidence:[],items:[{
    id:'doc-action-66',title:'Doklad k ověření 66',section:'documents',recordType:'document',
    confidence:10,confidenceLabel:'OVĚŘIT',sourceLabel:'test',nextAction:'Ověřit doklad',createdAt:now,updatedAt:now
   }]};
  });
 });
 await page.locator('#mainNav [data-view="today"]').click();
 const expected=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const {personalVault640}=await import('./js/personalVault640.js');
  const {insuranceCenter}=await import('./js/insurance25.js');
  const s=store.get();
  return personalVault640(s).action.length+insuranceCenter(s).actionCount;
 });
 expect(expected).toBeGreaterThan(0);
 const card=page.locator('#todayView .os1600-area').filter({hasText:'Dokumenty'}).first();
 await expect(card).toContainText(expected+' řešit');
 await page.locator('#mainNav [data-view="more"]').click();
 const doc=await page.evaluate(()=>window.__KAMIL_DOCUMENTS141__);
 expect(doc.action).toBe(expected);
});

test('OS737.0.67 Today Home card matches canonical 30-day home timeline',async({page})=>{
 await boot(page);
 await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const now=new Date().toISOString(),in10=new Date(Date.now()+10*86400000).toISOString();
  store.mutate('test Today Home parity',s=>{
   s.personalVault={version:1,evidence:[],items:[{
    id:'home-term-67',title:'Domácí smlouva 67',section:'home',recordType:'utility',
    confidence:95,confidenceLabel:'OK',reviewAt:in10,sourceLabel:'test',
    nextAction:'Zkontrolovat smlouvu',createdAt:now,updatedAt:now
   }]};
  });
 });
 await page.locator('#mainNav [data-view="today"]').click();
 const expected=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const {personalHomeTimeline650}=await import('./js/personalAssistant650.js');
  return personalHomeTimeline650(store.get()).filter(x=>x.days!==null&&x.days!==undefined&&x.days<=30).length;
 });
 expect(expected).toBeGreaterThan(0);
 const card=page.locator('#todayView .os1600-area').filter({hasText:'Domov'}).first();
 await expect(card).toContainText(expected+' řešit');
 await expect(card).not.toContainText('klid');
});

test('OS737.0.68 Today Family card matches canonical 7-day Family state',async({page})=>{
 await boot(page);
 await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const in5=new Date(Date.now()+5*86400000).toISOString();
  store.mutate('test Today Family parity',s=>{
   s.tasks=[];
   s.calendar={events:[{id:'family-five-68',title:'Rodinný termín za pět dní',area:'Rodina',status:'OPEN',start:in5}]};
  });
 });
 await page.locator('#mainNav [data-view="today"]').click();
 const expected=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const {familyData140}=await import('./js/familyPage140.js');
  return familyData140(store.get()).due7;
 });
 expect(expected).toBe(1);
 const card=page.locator('#todayView .os1600-area').filter({hasText:'Rodina'}).first();
 await expect(card).toContainText('1 do 7 dní');
 await expect(card).toContainText('Rodinný termín za pět dní');
 await page.locator('#mainNav [data-view="family"]').click();
 await expect(page.locator('[data-family-page1500] .pr1300-status')).toContainText('1 do 7 dní');
});

test('OS737.0.69 Today Money card matches canonical Money bank truth',async({page})=>{
 await boot(page);
 await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const now=new Date().toISOString();
  store.mutate('test Today Money parity',s=>{
   s.financePlan={};
   s.personalVault={version:1,evidence:[],items:[{
    id:'bank-69',title:'Bankovní stav 69',section:'money',recordType:'bank-data',
    balance:123456,confidence:95,confidenceLabel:'OK',sourceLabel:'test',
    asOf:now,freshnessDays:365,nextAction:'Aktualizovat později',createdAt:now,updatedAt:now
   }]};
   s.tasks=[];
  });
 });
 await page.locator('#mainNav [data-view="today"]').click();
 const state=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const {moneyData1300}=await import('./js/moneyOverview.js');
  const d=moneyData1300(store.get());
  return {bank:d.bank,known:d.bankKnown,attention:d.attention.length};
 });
 expect(state.known).toBe(true);
 expect(state.bank).toBe(123456);
 const card=page.locator('#todayView .os1600-area').filter({hasText:'Peníze'}).first();
 await expect(card).toContainText('123');
 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('[data-money-overview]')).toContainText('123');
});

test('OS737.0.70 Today Betting tone matches canonical risk model',async({page})=>{
 await boot(page);
 await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  store.mutate('test Today Betting parity',s=>{
   s.bettingLedger={
    updatedAt:new Date().toISOString(),bankrollCzk:100000,unitCzk:1000,
    bets:[{id:'bet-70',label:'Test bet 70',status:'OPEN',stakeCzk:10000,ticketCount:2,odds:2}]
   };
  });
 });
 await page.locator('#mainNav [data-view="today"]').click();
 const model=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const {bettingData1334}=await import('./js/bettingOverview.js');
  const d=bettingData1334(store.get());
  return {risk:d.risk,unknown:d.unknownRisk,positions:d.open.length,tickets:d.openTickets};
 });
 expect(model).toEqual({risk:false,unknown:false,positions:1,tickets:2});
 const card=page.locator('#todayView .os1600-area').filter({hasText:'Sázení'}).first();
 await expect(card).toHaveClass(/good/);
 await expect(card).toContainText('2 tiketů v 1 pozicích');
 await page.locator('#mainNav [data-view="betting"]').click();
 await expect(page.locator('[data-betting-overview] .pr1300-status')).toHaveClass(/good/);
});

test('OS737.0.71 Today Tickets matches canonical Ticket Overview state',async({page})=>{
 await boot(page);
 const expected=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const {ticketData1300}=await import('./js/ticketOverview.js');
  const d=ticketData1300(store.get());
  return {
   actions:d.attention.length,
   qty:d.p.queue.activeQty,
   positions:d.p.queue.activePositions,
   bad:!!(d.issues.length||d.transfer.length),
   top:d.attention[0]?.title||null
  };
 });
 await page.locator('#mainNav [data-view="today"]').click();
 const card=page.locator('#todayView .os1600-area').filter({hasText:'Vstupenky'}).first();
 if(expected.actions){
  await expect(card).toContainText(expected.actions+' řešit');
  if(expected.top)await expect(card).toContainText(expected.top);
  await expect(card).toHaveClass(expected.bad?/bad/:/warn/);
 }else{
  await expect(card).toHaveClass(/good/);
  await expect(card).toContainText(expected.qty?expected.qty+' ks':'klid');
 }
 const today=await page.evaluate(()=>window.__KAMIL_TODAY_OS2000__);
 expect(today.tickets).toBe(expected.positions);
 expect(today.ticketQty).toBe(expected.qty);
 expect(today.ticketAttention).toBe(expected.actions);
 await page.locator('#mainNav [data-view="tickets"]').click();
 const overview=await page.evaluate(()=>window.__KAMIL_TICKET_OVERVIEW__);
 expect(overview.activeQty).toBe(expected.qty);
 expect(overview.attention).toBe(expected.actions);
});

test('OS737.0.71 sold lifecycle variants stay out of active Ticket portfolio',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const out=await page.evaluate(async()=>{
  const {ticketActionQueue32}=await import('./js/ticketPortfolio32.js');
  return ticketActionQueue32({ticketBook:{items:[
   {id:'active',name:'Active',qty:2,buy:1000,workflow:'LISTED',market_status:'LISTED'},
   {id:'sold-transfer',name:'Sold transfer',qty:3,buy:2000,workflow:'HOLD',market_status:'SOLD_UNDELIVERED'},
   {id:'payout',name:'Payout',qty:4,buy:3000,workflow:'HOLD',market_status:'SOLD_WAITING_PAYMENT'},
   {id:'paid',name:'Paid',qty:5,buy:4000,workflow:'HOLD',market_status:'PAID'}
  ]}});
 });
 expect(out.activePositions).toBe(1);
 expect(out.activeQty).toBe(2);
});

test('OS737.0.72 Today Tasks card matches local Inbox state',async({page})=>{
 await boot(page);
 const expected=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const {localInboxSummary660}=await import('./js/inboxHub660.js');
  return localInboxSummary660(store.get());
 });
 await page.locator('#mainNav [data-view="today"]').click();
 const card=page.locator('#todayView .os1600-area').filter({hasText:'Úkoly'}).first();
 if(expected.counts.total){
  await expect(card).toContainText(expected.counts.urgent?expected.counts.urgent+' urgent.':expected.counts.total+' položek');
  await expect(card).toContainText(expected.top.title);
  await expect(card).toHaveClass(expected.counts.urgent?/bad/:/warn/);
 }else{
  await expect(card).toContainText('čisto');
  await expect(card).toHaveClass(/good/);
 }
 const today=await page.evaluate(()=>window.__KAMIL_TODAY_OS2000__);
 expect(today.inboxLocal).toBe(expected.counts.total);
 expect(today.inboxUrgent).toBe(expected.counts.urgent);
});

test('OS737.0.73 command search hides closed lifecycle rows and opens Insurance Center',async({page})=>{
 await boot(page);
 const out=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const {searchExtended610}=await import('./js/commandSearch610.js');
  store.mutate('test command lifecycle',s=>{
   s.propertyBook=s.propertyBook||{};
   s.propertyBook.candidates=[
    {id:'prop-active',name:'Aktivní byt test',status:'ACTIVE',purchasePrice:3000000},
    {id:'prop-dropped',name:'Vyřazený byt test',status:'DROPPED',purchasePrice:2500000}
   ];
   s.personalInbox={items:[
    {id:'inbox-open-test',title:'Aktivní inbox test',status:'OPEN'},
    {id:'inbox-done-test',title:'Uzavřený inbox test',status:'DONE'}
   ]};
   s.delegations=[
    {id:'wait-open-test',title:'Aktivní čekání test',status:'OPEN'},
    {id:'wait-done-test',title:'Uzavřené čekání test',status:'RESOLVED'}
   ];
  });
  return {
   activeProperty:searchExtended610('aktivní byt test').map(x=>x.id),
   droppedProperty:searchExtended610('vyřazený byt test').map(x=>x.id),
   openInbox:searchExtended610('aktivní inbox test').map(x=>x.id),
   closedInbox:searchExtended610('uzavřený inbox test').map(x=>x.id),
   openWaiting:searchExtended610('aktivní čekání test').map(x=>x.id),
   closedWaiting:searchExtended610('uzavřené čekání test').map(x=>x.id)
  };
 });
 expect(out.activeProperty).toContain('prop-active');
 expect(out.droppedProperty).not.toContain('prop-dropped');
 expect(out.openInbox).toContain('inbox-open-test');
 expect(out.closedInbox).not.toContain('inbox-done-test');
 expect(out.openWaiting).toContain('wait-open-test');
 expect(out.closedWaiting).not.toContain('wait-done-test');

 await page.evaluate(async()=>{
  const {executeExtendedCommand610}=await import('./js/commandSearch610.js');
  executeExtendedCommand610('pojištění');
 });
 await expect(page.locator('#moreView')).toContainText('INSURANCE CENTER / OS1336',{timeout:10000});
});

test('OS737.0.74 Today priority queue deduplicates the same source',async({page})=>{
 await boot(page);
 await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const old=new Date(Date.now()-12*86400000).toISOString().slice(0,10);
  store.mutate('test today source dedup',s=>{
   s.tasks=[
    {id:'dedup-task',title:'Duplicitní úkol test',status:'OPEN',area:'Osobní',due:old}
   ];
   s.delegations=[
    {id:'dedup-wait',title:'Duplicitní čekání test',status:'OPEN',area:'Osobní',followUpAt:old}
   ];
  });
 });
 await page.locator('#mainNav [data-view="today"]').click();
 await expect(page.locator('[data-os2-today]')).toBeVisible({timeout:10000});
 expect(await page.locator('#todayView .os1400-row').filter({hasText:'Duplicitní úkol test'}).count()).toBe(1);
 expect(await page.locator('#todayView .os1400-row').filter({hasText:'Duplicitní čekání test'}).count()).toBe(1);
});

test('OS737.0.75 Betting header and diagnostics show current open state, not master total',async({page})=>{
 await boot(page);
 await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  store.mutate('test betting open truth',s=>{
   s.bettingLedger={
    masterId:'sazky_portfolio_FINAL_2026-09-23',
    masterMeta:{ticketCount:140,positionCount:58,totalStakedCzk:1500,potentialPayoutCzk:4500,remainingToPlaceCzk:0},
    bankrollCzk:10000,unitCzk:500,updatedAt:new Date().toISOString(),
    bets:[
     {id:'bet-open-test',label:'Open test',status:'OPEN',stakeCzk:1000,ticketCount:2,odds:2},
     {id:'bet-win-test',label:'Settled test',status:'WIN',stakeCzk:500,ticketCount:1,pnlCzk:500,odds:2}
    ]
   };
  });
 });
 await page.locator('#mainNav [data-view="betting"]').click();
 await expect(page.locator('[data-betting-overview]')).toBeVisible({timeout:10000});
 await expect(page.locator('#bettingView .pr1300-status')).toHaveText('1 otevřených');
 const d=await page.evaluate(()=>window.__KAMIL_BETTING_OVERVIEW__);
 expect(d.openPositions).toBe(1);
 expect(d.positionCount).toBe(1);
 expect(d.openTickets).toBe(2);
 expect(d.ticketCount).toBe(2);
 expect(d.masterPositionCount).toBe(58);
 expect(d.masterTicketCount).toBe(140);
});

test('OS737.0.78 Property search result opens the exact candidate detail',async({page})=>{
 await boot(page);
 const result=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const {searchExtended610}=await import('./js/commandSearch610.js');
  store.mutate('test property search deep link',s=>{
   s.propertyBook={candidates:[
    {id:'search-prop-a',name:'První byt search',status:'ACTIVE',purchasePrice:3000000,monthlyRent:15000},
    {id:'search-prop-b',name:'Druhý byt search',status:'ACTIVE',purchasePrice:3500000,monthlyRent:17000}
   ]};
  });
  return searchExtended610('druhý byt search')[0]||null;
 });
 expect(result?.focus).toBe('property:1');
 await page.locator('#mainNav [data-view="property"]').click();
 await page.evaluate(focus=>window.dispatchEvent(new CustomEvent('kamil:focus610',{detail:{target:'property',focus}})),result.focus);
 await expect(page.locator('#propertyHub620Drawer')).toHaveClass(/open/,{timeout:10000});
 await expect(page.locator('#propertyHub620Drawer')).toContainText('Druhý byt search');
});

test('OS737.0.79 transaction search opens exact Money detail',async({page})=>{
 await boot(page);
 const result=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const {searchExtended610}=await import('./js/commandSearch610.js');
  store.mutate('test transaction search detail',s=>{
   s.personalSpending={transactions:[
    {id:'tx-search-test',merchant:'Test obchod',category:'JÍDLO',amount:-1234.5,currency:'CZK',date:'2026-09-24'}
   ]};
  });
  return searchExtended610('test obchod')[0]||null;
 });
 expect(result?.focus).toBe('transaction:0');
 await page.locator('#mainNav [data-view="money"]').click();
 await page.evaluate(focus=>window.dispatchEvent(new CustomEvent('kamil:focus610',{detail:{target:'money',focus}})),result.focus);
 await expect(page.locator('#modalHost')).toContainText('Test obchod',{timeout:10000});
 await expect(page.locator('#modalHost')).toContainText('JÍDLO');
 await expect(page.locator('#modalHost')).toContainText('1');
});
