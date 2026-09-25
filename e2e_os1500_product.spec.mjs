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
