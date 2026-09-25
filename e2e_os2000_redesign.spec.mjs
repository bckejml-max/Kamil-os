import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

async function boot(page){
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await expect(page.locator('[data-os2-today]')).toBeVisible({timeout:10000});
}

async function openView(page,view){
 const primary=page.locator(`#mainNav [data-view="${view}"]`).first();
 if(await primary.count()) await primary.click();
 else await page.evaluate(v=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:v})),view);
 await expect(page.locator(`#view-${view}`)).toHaveClass(/on/);
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
 expect(state.styles).not.toContain('./os2010.css');
 expect(state.styles).not.toContain('./os737.css');
 expect(state.styles).toContain('./productReset1300.css');
 expect(state.styles).toContain('./styles.css');
 expect(state.styles).not.toContain('./ticketDesk353.css');
 expect(state.resources.some(x=>x.includes('bettingBootstrap543.js'))).toBe(false);
 expect(state.resources.some(x=>x.includes('ticketDesk331.js'))).toBe(false);
});

test('OS1500 Today is the canonical action-first screen',async({page})=>{
 await boot(page);
 await expect(page.locator('.os1400-hero h1')).toContainText(/Kamile/i);
 await expect(page.locator('[data-product-home1300]')).toBeVisible();
 await expect(page.locator('.os1400-focus')).toBeVisible();
 await expect(page.locator('.os1400-domains .os1400-domain')).toHaveCount(9);
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
 await openView(page,'property');
 await expect(page.locator('#view-property')).toHaveClass(/on/);
 await expect(page.locator('[data-property-page1300]')).toBeVisible({timeout:10000});
 await expect(page.locator('[data-property-page1300] h1')).toContainText(/Nejlepší kandidát/);
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
 await page.getByRole('button',{name:'Ticket desk'}).last().click();
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

 await openView(page,'betting');
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
  await openView(page,view);
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
 await expect(page.locator('#inboxView [data-tasks-overview] h1')).toContainText(/Co je potřeba vyřídit/i);
 await page.waitForTimeout(300);
 await expect(page.locator('#inboxView [data-inbox-hub660]')).toHaveCount(0);

 await openView(page,'family');
 await expect(page.locator('#view-family')).toHaveClass(/on/);
 await expect(page.locator('#ticketsView [data-family-page1500]')).toBeVisible({timeout:10000});
 await expect(page.locator('#ticketsView [data-family-page1500] .pr1300-kicker').first()).toContainText(/Rodina/i);
 await page.waitForTimeout(500);
 await expect(page.locator('#ticketsView [data-family-hub610]')).toHaveCount(0);

 const cases=[
  ['home','#homeView','[data-home-page1500]','Dům, energie, smlouvy a údržba'],
  ['more','#moreView','[data-documents-page1500]','Smlouvy, pojistky a důležité údaje']
 ];
 for(const [view,host,hero,title] of cases){
  await openView(page,view);
  await expect(page.locator(`#view-${view}`)).toHaveClass(/on/);
  await expect(page.locator(`${host} ${hero}`)).toBeVisible({timeout:10000});
  await expect(page.locator(`${host} ${hero} h1`)).toContainText(title);
  const duplicateVisible=await page.locator(`${host} .view-head:not(.hidden)`).count();
  expect(duplicateVisible).toBe(0);
 }
});

test('OS1330 Betting does not pretend risk is known without bankroll',async({page})=>{
 await boot(page);
 await openView(page,'betting');
 await expect(page.locator('#bettingView [data-betting-overview]')).toBeVisible();
 await expect(page.locator('#bettingView .pr1320-now p')).toContainText('bankroll není nastavený');
 await expect(page.locator('#bettingView .os1334-mini-grid')).toContainText('Bankroll');
 await expect(page.locator('#bettingView .os1334-mini-grid')).toContainText('nenastaven');
 await expect(page.locator('#bettingView .os1334-mini-grid')).toContainText('Expozice / bankroll');
 const diag=await page.evaluate(()=>window.__KAMIL_BETTING_OVERVIEW__);
 expect(diag.riskUnknown).toBe(true);
 expect(diag.hasBankroll).toBe(false);
 expect(diag.open).toBeGreaterThan(0);
 expect(diag.masterId).toBeTruthy();
});
test('OS1329 Tasks show all buckets and keep far-future documents out of Teď',async({page})=>{
 await page.addInitScript(()=>{
  const due=new Date(Date.now()+183*86400000).toISOString().slice(0,10);
  localStorage.setItem('kamil-os-state',JSON.stringify({
   meta:{schemaVersion:80,createdAt:new Date().toISOString()},
   tasks:[{id:'far-doc',title:'Doložit dokument',status:'OPEN',area:'osobní',category:'Dokumenty',due,notes:'Doklad je potřeba až později.'}]
  }));
 });
 await boot(page);
 await openView(page,'inbox');
 await expect(page.locator('#inboxView [data-tasks-overview]')).toBeVisible();
 await expect(page.locator('#inboxView .pr1320-now h2')).not.toHaveText('Doložit dokument');
 await expect(page.locator('#inboxView [data-task-open="task:far-doc"]')).toBeVisible();
 const chips=await page.locator('#inboxView .pr1329-task-meta span').allTextContents();
 const documentChip=chips.find(x=>x.startsWith('Dokumenty:'))||'Dokumenty: 0';
 expect(Number(documentChip.match(/\d+/)?.[0]||0)).toBeGreaterThanOrEqual(1);
});
test('OS1328 empty Work and Reality stay truthful instead of manufacturing alerts',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);

 await page.evaluate(()=>localStorage.removeItem('kamil_betting_ledger_543'));
 await page.evaluate(async()=>{const {store}=await import('./js/state.js');store.mutate('qa clear work reality',s=>{s.projects=[];s.recurringDuties={};s.propertyBook=s.propertyBook||{};s.propertyBook.candidates=[];},{undo:false,cloud:false,audit:false});});
 await page.waitForTimeout(120);

 await openView(page,'work');
 await expect(page.locator('#workView [data-work-page1300]')).toBeVisible();
 const workDiag=await page.evaluate(()=>window.__KAMIL_WORK_PAGE1300__);
 expect(workDiag.status).toBe('KLID');
 expect(workDiag.projects).toBe(0);
 expect(workDiag.risks).toBe(0);
 await expect(page.locator('#workView .pr1328-work-clear')).toHaveCount(1);

 await openView(page,'property');
 await expect(page.locator('#propertyView [data-property-page1300]')).toBeVisible();
 const propertyDiag=await page.evaluate(()=>window.__KAMIL_PROPERTY_PAGE1300__);
 expect(propertyDiag.candidates).toBe(0);
 await expect(page.locator('#propertyView .pr1328-property-empty')).toHaveCount(1);
 await expect(page.locator('#propertyView .pr1320-meta')).toHaveCount(0);
 await expect(page.locator('#propertyView .pr1300-panel')).toHaveCount(0);
});
test('OS1327 Money prioritizes actions and Tickets collapse empty states',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);

 await openView(page,'money');
 await expect(page.locator('#moneyView [data-money-overview]')).toBeVisible();
 const moneyAttention=page.locator('#moneyView .pr1327-money-attention');
 if(await moneyAttention.count()){
  const attentionBeforeState=await page.evaluate(()=>{
   const host=document.querySelector('#moneyView [data-money-overview]'),attention=host?.querySelector('.pr1327-money-attention'),state=host?.querySelector('.pr1327-money-state');
   if(!attention||!state)return false;
   return [...host.children].indexOf(attention)<[...host.children].indexOf(state);
  });
  expect(attentionBeforeState).toBe(true);
 }

 await openView(page,'tickets');
 await expect(page.locator('#ticketIntelView [data-ticket-overview]')).toBeVisible();
 const diag=await page.evaluate(()=>window.__KAMIL_TICKET_OVERVIEW__);
 if(diag.events===0&&diag.attention===0){
  await expect(page.locator('#ticketIntelView .pr1327-ticket-clear')).toHaveCount(1);
  await expect(page.locator('#ticketIntelView .pr1300-panel')).toHaveCount(1);
 }
});
test('OS1500 Today shows all nine primary areas with live cross-section data',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);
 await expect(page.locator('#todayView .os1331-system-panel')).toBeVisible();
 await expect(page.locator('#todayView .os1400-domains .os1400-domain')).toHaveCount(9);
 const labels=await page.locator('#todayView .os1400-domains .os1400-domain b').allTextContents();
 expect(labels).toEqual(['Úkoly','Práce','Vstupenky','Peníze','Reality','Sázení','Rodina','Domov','Dokumenty']);
 const diag=await page.evaluate(()=>window.__KAMIL_TODAY_OS2000__);
 expect(diag.systemRows).toBe(9);
});
test('OS1324 visual polish keeps the shell compact and consistent',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);
 const desktop=await page.evaluate(()=>{
  const main=document.querySelector('.os2-main');
  const command=document.querySelector('.os2-command');
  const sidebar=document.querySelector('.os2-sidebar');
  const csMain=getComputedStyle(main),csCommand=getComputedStyle(command),csSidebar=getComputedStyle(sidebar);
  return{
   mainWidth:main.getBoundingClientRect().width,
   commandWidth:command.getBoundingClientRect().width,
   sidebarOverflowY:csSidebar.overflowY,
   bodyOverflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth,
   mainBg:csMain.backgroundColor,
   commandBg:csCommand.backgroundColor
  };
 });
 expect(desktop.mainWidth).toBeLessThanOrEqual(1161);
 expect(desktop.commandWidth).toBeLessThanOrEqual(1217);
 expect(desktop.sidebarOverflowY).toBe('auto');
 expect(desktop.bodyOverflow).toBeLessThanOrEqual(2);

 await openView(page,'family');
 const familySurface=await page.locator('#ticketsView .os1500-summary').first().evaluate(el=>({bg:getComputedStyle(el).backgroundColor,border:getComputedStyle(el).borderTopColor}));
 await openView(page,'home');
 const homeSurface=await page.locator('#homeView .os1500-summary').first().evaluate(el=>({bg:getComputedStyle(el).backgroundColor,border:getComputedStyle(el).borderTopColor}));
 expect(familySurface.bg).not.toBe('rgba(0, 0, 0, 0)');
 expect(homeSurface.bg).not.toBe('rgba(0, 0, 0, 0)');
 expect(familySurface.border).not.toBe('rgba(0, 0, 0, 0)');
 expect(homeSurface.border).not.toBe('rgba(0, 0, 0, 0)');

 await page.setViewportSize({width:390,height:844});
 await page.reload({waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 const mobile=await page.evaluate(()=>{
  const nav=document.querySelector('#bottomNav');
  return{height:nav.getBoundingClientRect().height,overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth};
 });
 expect(mobile.height).toBeLessThanOrEqual(100);
 expect(mobile.overflow).toBeLessThanOrEqual(2);
});

test('OS1323 canonical shell has one visual owner per section',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await boot(page);
 const cases=[
  ['today','#todayView','[data-os2-today]'],
  ['inbox','#inboxView','[data-tasks-overview]'],
  ['work','#workView','[data-work-page1300]'],
  ['tickets','#ticketIntelView','[data-ticket-overview]'],
  ['money','#moneyView','[data-money-overview]'],
  ['property','#propertyView','[data-property-page1300]'],
  ['betting','#bettingView','[data-betting-overview]'],
  ['family','#ticketsView','[data-family-page1500]'],
  ['home','#homeView','[data-home-page1500]'],
  ['more','#moreView','[data-documents-page1500]']
 ];
 for(const [view,host,root] of cases){
  if(view!=='today')await openView(page,view);
  await expect(page.locator(`${host} ${root}`)).toBeVisible({timeout:12000});
  await expect(page.locator(`${host} h1:visible`)).toHaveCount(1);
  const legacyVisible=await page.locator(`${host} [data-today-hub650]:visible,${host} [data-os333-exec]:visible,${host} [data-money-hub680]:visible,${host} [data-property-hub620]:visible,${host} [data-property-finance610]:visible,${host} [data-betting-hub630]:visible,${host} [data-ticket-hub640]:visible,${host} [data-family-hub610]:visible`).count();
  expect(legacyVisible,`legacy visual owner visible in ${view}`).toBe(0);
 }
 const globalLegacy=await page.evaluate(()=>[...document.querySelectorAll('link[rel="stylesheet"]')].map(x=>x.getAttribute('href')||'').filter(x=>/os2010\.css|os737\.css/.test(x)));
 expect(globalLegacy).toEqual([]);
});

test('OS1322 desktop keeps every section directly visible',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);
 await expect(page.locator('#mainNav [data-view]')).toHaveCount(10);
 for(const view of ['today','inbox','work','tickets','money','property','betting','family','home','more'])await expect(page.locator(`#mainNav [data-view="${view}"]`)).toBeVisible();
 await expect(page.locator('#allSectionsBtn')).toHaveCount(0);
 await expect(page.locator('#mobileMenuBtn')).toHaveCount(0);
 await page.locator('#mainNav [data-view="property"]').click();
 await expect(page.locator('#propertyView [data-property-page1300]')).toBeVisible({timeout:10000});
 await page.locator('#mainNav [data-view="betting"]').click();
 await expect(page.locator('#bettingView [data-betting-overview]')).toBeVisible({timeout:10000});
});

test('OS1322 mobile keeps all ten sections one tap away',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await boot(page);
 await expect(page.locator('#bottomNav')).toBeVisible();
 await expect(page.locator('#bottomNav [data-view]')).toHaveCount(10);
 for(const view of ['inbox','work','tickets','money','property','betting','family','home','more']){
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

test('OS1322 mobile reaches personal sections directly',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await boot(page);
 await expect(page.locator('#mobileMenuBtn')).toHaveCount(0);
 await page.locator('#bottomNav [data-view="family"]').click();
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
  ['family','#ticketsView','[data-family-page1500]'],
  ['home','#homeView','[data-home-page1500]'],
  ['more','#moreView','[data-documents-page1500]']
 ];
 for(const [view,host,ready] of cases){
  if(view!=='today')await openView(page,view);
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
 await openView(page,'property');
 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('#moneyView [data-money-overview]')).toBeVisible({timeout:12000});
 await expect(page.locator('#moneyView .money-page')).toHaveCount(0);

 await openView(page,'betting');
 await expect(page.locator('#bettingView [data-betting-overview]')).toBeVisible();
 await page.locator('#bettingView [data-betting-advanced]').click();
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BETTING_144__?.coreReady===true),{timeout:12000}).toBe(true);
 await page.locator('#mainNav [data-view="today"]').click();
 await openView(page,'betting');
 await expect(page.locator('#bettingView [data-betting-overview]')).toBeVisible({timeout:12000});
 await expect(page.locator('#bettingView [data-betting-overview]')).toBeVisible({timeout:12000});
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

test('OS1322 mobile audit reaches every section with no horizontal overflow',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await boot(page);
 for(const view of ['today','inbox','work','tickets','money','property','betting','family','home','more']){
  await page.locator(`#bottomNav [data-view="${view}"]`).click();
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
 const todayAction=page.locator('[data-today1300-task="due-today"]');
 await expect(todayAction).toBeVisible();
 const state=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  const open=(store.get().bettingLedger?.bets||[]).filter(x=>String(x.status||'OPEN').toUpperCase()==='OPEN');
  return {diag:window.__KAMIL_TODAY_OS2000__,expectedOpen:open.length,expectedExposure:open.reduce((sum,x)=>sum+Number(x.stakeCzk||0),0)};
 });
 expect(state.diag.overdue).toBe(0);
 expect(state.diag.bettingOpen).toBe(state.expectedOpen);
 expect(state.diag.bettingExposure).toBe(state.expectedExposure);
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
 let diag=await page.evaluate(()=>window.__KAMIL_TODAY_OS2000__);
 expect(diag.cashKnown).toBe(false);
 expect(diag.cash).toBeNull();

 await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  store.mutate('test explicit zero cash',state=>{state.financePlan.updatedAt=new Date().toISOString()},{undo:false,cloud:false,audit:false});
 });
 await page.locator('#mainNav [data-view="money"]').click();
 await page.locator('#mainNav [data-view="today"]').click();
 await expect(page.locator('#todayView [data-os2-today]')).toBeVisible();
 diag=await page.evaluate(()=>window.__KAMIL_TODAY_OS2000__);
 expect(diag.cashKnown).toBe(true);
 expect(diag.cash).toBe(0);
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
 await openView(page,'betting');
 await expect(page.locator('#bettingView [data-betting-overview]')).toBeVisible();
 await expect(page.locator('#bettingView')).not.toContainText('Stará sázka');
 const state=await page.evaluate(async()=>{const {store}=await import('./js/state.js');return store.get().bettingLedger});
 expect(state.bets.some(x=>x.id==='legacy-open')).toBe(false);
 expect(state.masterId).toBeTruthy();
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
 await openView(page,'betting');
 await expect(page.locator('#bettingView [data-betting-overview]')).toBeVisible();
 await expect(page.locator('#bettingView')).not.toContainText('Legacy zombie');
 await page.locator('#bettingView [data-betting-advanced]').click();
 await expect(page.locator('#bettingView .bet144')).toBeVisible({timeout:15000});
 await page.waitForTimeout(500);
 const state=await page.evaluate(async()=>{const {store}=await import('./js/state.js');return store.get().bettingLedger});
 expect(state.bets.some(x=>x.id==='legacy-zombie')).toBe(false);
 expect(state.masterId).toBeTruthy();
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
   queuePending:queued?.pending===true,
   queueHasPayload:!!queued?.payload,
   persistedTask:JSON.parse(localStorage.getItem('kamil-os-state')||'{}')?.tasks?.some(x=>x.id==='repair-task')===true
  };
 });
 expect(result.dirty).toBe(true);
 expect(result.writes).toBe(1);
 expect(result.lastMutationAt).toBeTruthy();
 expect(result.audit).toBe('integrity-test');
 expect(result.queuePending).toBe(true);
 expect(result.queueHasPayload).toBe(false);
 expect(result.persistedTask).toBe(true);
});


test('OS1308 lazy undo history is actionable immediately after reload',async({page})=>{
 await page.addInitScript(()=>{
  const base={meta:{schemaVersion:80,createdAt:new Date().toISOString()},tasks:[]};
  localStorage.setItem('kamil-os-state',JSON.stringify(base));
  localStorage.setItem('kamil-os-41-undo',JSON.stringify([{label:'Předchozí změna',at:new Date().toISOString(),state:{...base,tasks:[{id:'restored',title:'Obnovený úkol',status:'OPEN'}]}}]));
 });
 await boot(page);
 await expect(page.locator('#undoBtn')).toBeEnabled();
 await page.locator('#undoBtn').click();
 await expect.poll(()=>page.evaluate(async()=>{const {store}=await import('./js/state.js');return store.get().tasks.some(x=>x.id==='restored')})).toBe(true);
});


test('OS1308 explicit zero cash replaces stale personal-vault cash truthfully',async({page})=>{
 await page.addInitScript(()=>{
  const updatedAt=new Date().toISOString();
  localStorage.setItem('kamil-os-state',JSON.stringify({
   meta:{schemaVersion:80,createdAt:new Date().toISOString()},
   financePlan:{cashNow:0,expectedIncome:0,reserveFloor:0,plannedInvestment:0,updatedAt},
   personalVault:{version:1,items:[{id:'manual-cash-20260912',section:'money',recordType:'bank-data',title:'Likvidní hotovost',balance:100000,asOf:'2026-09-12',sourceBasis:'stale'}]}
  }));
 });
 await boot(page);
 const result=await page.evaluate(async()=>{
  const bridge=await import('./js/personalMoneyBridge737.js');
  const {store}=await import('./js/state.js');
  bridge.ensurePersonalMoneyBridge737();
  const item=store.get().personalVault.items.find(x=>x.id==='manual-cash-20260912');
  return {balance:item?.balance,asOf:item?.asOf,sourceBasis:item?.sourceBasis,planAt:store.get().financePlan.updatedAt};
 });
 expect(result.balance).toBe(0);
 expect(result.asOf).toBe(result.planAt.slice(0,10));
 expect(result.sourceBasis).toContain('0 Kč');
 expect(result.sourceBasis).not.toContain('100 000 Kč');
});

test('OS1308 settled WIN pnl is immutable under integrity guard',async({page})=>{
 await boot(page);
 await expect.poll(()=>page.evaluate(()=>!!window.__KAMIL_DATA_INTEGRITY1130__),{timeout:10000}).toBe(true);
 await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  store.mutate('seed settled integrity bet',s=>{
   s.bettingLedger.bets.push({id:'settled-win',status:'WIN',stakeCzk:1000,odds:1.5,pnlCzk:500,settledAt:new Date().toISOString()});
  },{undo:false,cloud:false,audit:false});
 });
 await expect.poll(()=>page.evaluate(async()=>{const {store}=await import('./js/state.js');return store.get().bettingLedger.bets.some(x=>x.id==='settled-win')}),{timeout:5000}).toBe(true);
 await page.waitForTimeout(120);
 await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  store.mutate('tamper settled pnl',s=>{const bet=s.bettingLedger.bets.find(x=>x.id==='settled-win');bet.pnlCzk=9999;bet.closingOdds=9.99},{undo:false,cloud:false,audit:false});
 });
 await expect.poll(()=>page.evaluate(async()=>{const {store}=await import('./js/state.js');return store.get().bettingLedger.bets.find(x=>x.id==='settled-win')?.pnlCzk}),{timeout:5000}).toBe(500);
 const result=await page.evaluate(async()=>{const {store}=await import('./js/state.js');const bet=store.get().bettingLedger.bets.find(x=>x.id==='settled-win');return{pnlCzk:bet?.pnlCzk??null,closingOdds:bet?.closingOdds??null,recovery:!!localStorage.getItem('kamil-os-recovery-1130')}});
 expect(result.pnlCzk).toBe(500);
 expect(result.closingOdds).toBeNull();
 expect(result.recovery).toBe(true);
});


test('OS1308 invalid primary state recovers from valid staging copy',async({page})=>{
 await page.addInitScript(()=>{
  const staged={
   meta:{schemaVersion:80,createdAt:new Date().toISOString()},
   tasks:[{id:'stage-survivor',title:'Přežil staging',status:'OPEN'}]
  };
  localStorage.setItem('kamil-os-state','[]');
  localStorage.setItem('kamil-os-state-stage-1132',JSON.stringify(staged));
 });
 await boot(page);
 const result=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  let recovery=null;try{recovery=JSON.parse(localStorage.getItem('kamil-os-state-recovery-1131')||'null')}catch{}
  let primary=null;try{primary=JSON.parse(localStorage.getItem('kamil-os-state')||'null')}catch{}
  return {
   hasTask:store.get().tasks.some(x=>x.id==='stage-survivor'),
   primaryIsArray:Array.isArray(primary),
   stageGone:localStorage.getItem('kamil-os-state-stage-1132')===null,
   recoveryReason:recovery?.reason||null
  };
 });
 expect(result.hasTask).toBe(true);
 expect(result.primaryIsArray).toBe(false);
 expect(result.stageGone).toBe(true);
 expect(result.recoveryReason).toBe('invalid-primary-shape');
});


test('OS1308 accepting cloud conflict checkpoints the accepted cloud version',async({page})=>{
 await boot(page);
 const acceptedAt='2026-09-21T18:30:00.000Z';
 const result=await page.evaluate(async acceptedAt=>{
  const [{store},{resolveConflict}]=await Promise.all([import('./js/state.js'),import('./js/cloud.js')]);
  const cloud={
   meta:{schemaVersion:80,createdAt:'2026-09-01T00:00:00.000Z'},
   tasks:[{id:'cloud-task',title:'Cloud truth',status:'OPEN'}]
  };
  store.dirty=true;store.queueSync(store.get());
  const resolved=await resolveConflict('cloud',cloud,acceptedAt);
  return {
   ok:resolved?.ok===true,
   stateLastCloudAt:store.get().meta?.lastCloudAt||null,
   metaLastCloudAt:store.meta().lastCloudAt||null,
   dirty:store.dirty,
   queue:store.readQueue(),
   cloudTask:store.get().tasks.some(x=>x.id==='cloud-task')
  };
 },acceptedAt);
 expect(result.ok).toBe(true);
 expect(result.stateLastCloudAt).toBe(acceptedAt);
 expect(result.metaLastCloudAt).toBe(acceptedAt);
 expect(result.dirty).toBe(false);
 expect(result.queue).toBeNull();
 expect(result.cloudTask).toBe(true);
});


test('OS1309 frame and idle schedulers cancel stale callbacks by key',async({page})=>{
 await boot(page);
 const result=await page.evaluate(async()=>{
  const {scheduleFrame1110,scheduleIdle1110}=await import('./js/osHardening1110.js');
  const calls=[];
  scheduleFrame1110('same-key',()=>calls.push('frame-old'));
  scheduleFrame1110('same-key',()=>calls.push('frame-new'));
  scheduleIdle1110('same-idle',()=>calls.push('idle-old'),100);
  scheduleIdle1110('same-idle',()=>calls.push('idle-new'),100);
  await new Promise(resolve=>setTimeout(resolve,180));
  return calls;
 });
 expect(result.filter(x=>x.startsWith('frame'))).toEqual(['frame-new']);
 expect(result.filter(x=>x.startsWith('idle'))).toEqual(['idle-new']);
});

test('OS1309 service worker excludes auth and query URLs from cache surface',async({page})=>{
 await boot(page);
 const result=await page.evaluate(async()=>{
  const reg=await navigator.serviceWorker.ready;
  const cacheNames=await caches.keys();
  const requests=[];
  for(const name of cacheNames){const cache=await caches.open(name);for(const req of await cache.keys())requests.push(req.url)}
  return {
   controlled:!!reg,
   queryCached:requests.some(url=>new URL(url).search),
   authCached:requests.some(url=>{const u=new URL(url);return u.searchParams.has('code')||u.searchParams.has('token_hash')||u.searchParams.has('access_token')||u.searchParams.has('refresh_token')||u.searchParams.get('type')==='recovery'})
  };
 });
 expect(result.controlled).toBe(true);
 expect(result.queryCached).toBe(false);
 expect(result.authCached).toBe(false);
});


test('OS1310 cold partition compacts hot state and hydrates Money on demand',async({page})=>{
 await page.addInitScript(()=>{
  if(sessionStorage.getItem('os1310-seeded'))return;
  sessionStorage.setItem('os1310-seeded','1');
  const history=[{id:'tx-cold-1',date:'2026-09-20',amount:-1234,merchant:'Cold test'}];
  localStorage.setItem('kamil-os-state',JSON.stringify({
   meta:{schemaVersion:80,createdAt:new Date().toISOString()},
   personalSpending:{transactions:history},
   importCenter:{history:[{id:'imp-cold-1',at:new Date().toISOString()}]},
   netWorthBook:{items:[],history:[{id:'nw-cold-1',asOf:'2026-09-20',netKnown:123456}]},
   tradeJournal:{trades:[{id:'trade-cold-1',at:'2026-09-20'}]}
  }));
 });
 await boot(page);
 await page.waitForTimeout(500);
 const compacted=await page.evaluate(()=>{
  const main=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');
  const cold=JSON.parse(localStorage.getItem('kamil-os-41-2-cold-v1')||'{}');
  return {
   hotTransactions:main.personalSpending?.transactions?.length||0,
   coldTransactions:cold.money?.['personalSpending.transactions']?.length||0,
   coldNetWorth:cold.money?.['netWorthBook.history']?.length||0,
   layout:JSON.parse(localStorage.getItem('kamil-os-41-boot-summary')||'{}')?.storage?.layoutVersion||0
  };
 });
 expect(compacted.hotTransactions).toBe(0);
 expect(compacted.coldTransactions).toBe(1);
 expect(compacted.coldNetWorth).toBe(1);
 expect(compacted.layout).toBe(4);

 await page.reload({waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 const before=await page.evaluate(async()=>{const {store}=await import('./js/state.js');return store.get().personalSpending?.transactions?.length||0});
 expect(before).toBe(0);
 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('#moneyView [data-money-overview]')).toBeVisible();
 const after=await page.evaluate(async()=>{const {store}=await import('./js/state.js');return store.get().personalSpending?.transactions?.map(x=>x.id)||[]});
 expect(after).toContain('tx-cold-1');
});

test('OS1310 canonical backup includes cold history before Money hydration',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('kamil-os-state',JSON.stringify({
   meta:{schemaVersion:80,createdAt:new Date().toISOString()},
   personalSpending:{transactions:[]},
   netWorthBook:{items:[],history:[]}
  }));
  localStorage.setItem('kamil-os-41-2-cold-v1',JSON.stringify({money:{
   'personalSpending.transactions':[{id:'cold-backup-tx',date:'2026-09-20',amount:-55}],
   'netWorthBook.history':[{id:'cold-backup-nw',asOf:'2026-09-20',netKnown:555}]
  }}));
  localStorage.setItem('kamil-os-41-boot-summary',JSON.stringify({storage:{partitioned:true,layoutVersion:4}}));
 });
 await boot(page);
 const result=await page.evaluate(async()=>{
  const [{store},{createBackupEnvelope}]=await Promise.all([import('./js/state.js'),import('./js/backupGuard26.js')]);
  const env=createBackupEnvelope(store.get());
  return {
   hot:store.get().personalSpending?.transactions?.length||0,
   backupTx:env.payload.personalSpending?.transactions?.map(x=>x.id)||[],
   backupNw:env.payload.netWorthBook?.history?.map(x=>x.id)||[]
  };
 });
 expect(result.hot).toBe(0);
 expect(result.backupTx).toContain('cold-backup-tx');
 expect(result.backupNw).toContain('cold-backup-nw');
});

test('OS1310 accepted empty cloud history clears stale cold data',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('kamil-os-state',JSON.stringify({
   meta:{schemaVersion:80,createdAt:new Date().toISOString()},
   personalSpending:{transactions:[]},
   netWorthBook:{items:[],history:[]}
  }));
  localStorage.setItem('kamil-os-41-2-cold-v1',JSON.stringify({money:{
   'personalSpending.transactions':[{id:'stale-cold-tx'}],
   'netWorthBook.history':[{id:'stale-cold-nw'}]
  }}));
  localStorage.setItem('kamil-os-41-boot-summary',JSON.stringify({storage:{partitioned:true,layoutVersion:4}}));
 });
 await boot(page);
 const result=await page.evaluate(async()=>{
  const [{store},{resolveConflict},{mergeColdState42}]=await Promise.all([import('./js/state.js'),import('./js/cloud.js'),import('./js/coldPartition42.js')]);
  const cloud={
   meta:{schemaVersion:80,createdAt:'2026-09-01T00:00:00.000Z'},
   personalSpending:{transactions:[]},
   netWorthBook:{items:[],history:[]}
  };
  await resolveConflict('cloud',cloud,'2026-09-21T20:00:00.000Z');
  const merged=mergeColdState42(store.get());
  const cold=JSON.parse(localStorage.getItem('kamil-os-41-2-cold-v1')||'{}');
  return {
   mergedTx:merged.personalSpending?.transactions?.length||0,
   mergedNw:merged.netWorthBook?.history?.length||0,
   coldTx:cold.money?.['personalSpending.transactions']?.length||0,
   coldNw:cold.money?.['netWorthBook.history']?.length||0
  };
 });
 expect(result.mergedTx).toBe(0);
 expect(result.mergedNw).toBe(0);
 expect(result.coldTx).toBe(0);
 expect(result.coldNw).toBe(0);
});
