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

test('OS2000 loads Ticket assets only when Tickets opens',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="tickets"]').click();
 await expect(page.locator('#view-tickets')).toHaveClass(/on/);
 await expect.poll(()=>page.evaluate(()=>performance.getEntriesByType('resource').some(x=>x.name.includes('ticketDesk331.js'))),{timeout:15000}).toBe(true);
 const styles=await page.evaluate(()=>[...document.querySelectorAll('link[data-os2-lazy]')].map(x=>x.getAttribute('href')));
 expect(styles).toContain('./ticket68.css');
 expect(styles).toContain('./ticketDesk353.css');
});

test('OS1300 keeps Money, Tickets and Betting to one primary workspace',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);

 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('#view-money')).toHaveClass(/on/);
 await expect(page.locator('#moneyView .money-page')).toBeVisible({timeout:10000});
 await page.waitForTimeout(900);
 await expect(page.locator('#moneyView [data-money-hub680]')).toHaveCount(0);
 await expect(page.locator('#moneyView [data-property-hub620]')).toHaveCount(0);
 await expect(page.locator('#moneyView [data-property-finance610]')).toHaveCount(0);

 await page.locator('#mainNav [data-view="betting"]').click();
 await expect(page.locator('#view-betting')).toHaveClass(/on/);
 await expect(page.locator('#bettingView .bet144')).toBeVisible({timeout:10000});
 await page.waitForTimeout(900);
 await expect(page.locator('#bettingView [data-betting-hub630]')).toHaveCount(0);

 await page.locator('#mainNav [data-view="tickets"]').click();
 await expect(page.locator('#view-tickets')).toHaveClass(/on/);
 await expect(page.locator('#ticketIntelView .td331')).toBeVisible({timeout:15000});
 await page.waitForTimeout(900);
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
 await expect(page.locator('#inboxView [data-inbox-hub660]')).toBeVisible({timeout:10000});
 await expect(page.locator('#inboxView [data-inbox-hub660] h1')).toContainText(/Co čeká na tebe/i);
 await page.waitForTimeout(500);
 await expect(page.locator('#inboxView .inbox69-page')).toHaveCount(0);

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

test('OS1300 mobile keeps the six primary domains one tap away',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await boot(page);
 await expect(page.locator('#bottomNav')).toBeVisible();
 await expect(page.locator('#bottomNav [data-view]')).toHaveCount(6);
 for(const view of ['work','tickets','property','money','betting']){
  await page.locator(`#bottomNav [data-view="${view}"]`).click();
  await expect(page.locator(`#view-${view}`)).toHaveClass(/on/);
  await page.waitForTimeout(view==='tickets'||view==='betting'?700:250);
  const overflow=await page.evaluate(()=>Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
 }
 await expect(page.locator('body')).toHaveCSS('overflow-x','hidden');
});