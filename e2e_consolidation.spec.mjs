import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

async function ready(page){
 await expect(page.locator('#appView')).toBeVisible({timeout:10000});
 await expect.poll(()=>page.evaluate(()=>({core:window.__KAMIL_BOOT_BUDGET343__?.complete,router:window.__KAMIL_COMMAND_ROUTER__?.owner,contracts:window.__KAMIL_STATE_CONTRACTS__?.installed})),{timeout:25000}).toEqual({core:true,router:'central',contracts:true});
}
async function nav(page,view){await page.locator(`#mainNav [data-view="${view}"]`).click();await page.waitForTimeout(150)}

test('consolidated desktop boot has one owner and a small critical path',async({page})=>{
 await page.setViewportSize({width:1440,height:960});const errors=[];page.on('pageerror',e=>errors.push(String(e?.message||e)));await page.goto(BASE,{waitUntil:'domcontentloaded'});await ready(page);
 const x=await page.evaluate(()=>({critical:(window.__KAMIL_BOOT_BUDGET343__?.modules||[]).filter(x=>x.phase==='critical').length,total:(window.__KAMIL_BOOT_BUDGET343__?.modules||[]).length,shell:window.__KAMIL_CONSOLIDATION_RUNTIME__?.shell,router:window.__KAMIL_COMMAND_ROUTER__,views:{inbox:document.querySelectorAll('#view-inbox').length,betting:document.querySelectorAll('#view-betting').length,health:document.querySelectorAll('[data-os-health-1046]').length},resources:performance.getEntriesByType('resource').map(x=>x.name)}));
 expect(x.critical).toBeLessThanOrEqual(7);expect(x.shell?.ok).toBe(true);expect(x.router.owner).toBe('central');expect(x.views).toEqual({inbox:1,betting:1,health:1});expect(x.resources.some(x=>x.includes('bettingBootstrap543.js'))).toBe(false);expect(errors.filter(x=>/SyntaxError|Unexpected token|Cannot access .* before initialization/i.test(x))).toEqual([]);
 await page.screenshot({path:'test-results/consolidation-desktop.png',fullPage:true});
});

test('mobile navigation is canonical six items with no overflow',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto(BASE,{waitUntil:'domcontentloaded'});await ready(page);await page.waitForTimeout(500);
 const x=await page.evaluate(()=>{const nav=document.querySelector('#bottomNav'),buttons=[...nav.querySelectorAll('button')].filter(b=>getComputedStyle(b).display!=='none');return{labels:buttons.map(b=>b.textContent.trim()),count:buttons.length,scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,docs:buttons.some(b=>b.dataset.view==='more'),inbox:buttons.some(b=>b.dataset.view==='inbox'),betting:buttons.some(b=>b.dataset.view==='betting'),more:buttons.some(b=>b.hasAttribute('data-personal-more'))}});
 expect(x.count).toBe(6);for(const label of ['Dnes','Vstupenky','Rodina','Domov','Peníze','Více'])expect(x.labels.some(v=>v.includes(label))).toBe(true);expect(x.docs||x.inbox||x.betting).toBe(false);expect(x.more).toBe(true);expect(x.scroll).toBeLessThanOrEqual(x.client+2);await page.screenshot({path:'test-results/consolidation-mobile.png',fullPage:true});
});

test('tickets and money keep heavy analytics behind explicit user intent',async({page})=>{
 await page.setViewportSize({width:1280,height:900});await page.goto(BASE,{waitUntil:'domcontentloaded'});await ready(page);await nav(page,'tickets');
 await expect(page.locator('[data-ticket-advanced]')).toBeVisible({timeout:20000});await expect(page.locator('[data-source-badge="source-tickets"]')).toBeVisible();
 let x=await page.evaluate(()=>({advanced:window.__KAMIL_TICKET_BOOT466__?.advancedStarted||false,resources:performance.getEntriesByType('resource').map(r=>r.name)}));expect(x.advanced).toBe(false);expect(x.resources.some(v=>v.includes('ticketPriceIntelligence374.js'))).toBe(false);
 await nav(page,'money');await expect(page.locator('[data-money-advanced]')).toBeVisible({timeout:10000});await expect(page.locator('[data-source-badge="source-money"]')).toBeVisible();x=await page.evaluate(()=>({advanced:!!window.__KAMIL_MONEY_ADVANCED__,resources:performance.getEntriesByType('resource').map(r=>r.name)}));expect(x.advanced).toBe(false);expect(x.resources.some(v=>v.includes('xtbLearningPanel394.js'))).toBe(false);
});

test('repeated navigation does not duplicate shell, styles or owned listeners',async({page})=>{
 await page.setViewportSize({width:1280,height:900});await page.goto(BASE,{waitUntil:'domcontentloaded'});await ready(page);for(const v of ['family','home','money','tickets','today'])await nav(page,v);await page.waitForTimeout(300);
 const before=await page.evaluate(()=>({nav:document.querySelectorAll('#mainNav button').length,styles:document.querySelectorAll('link[rel="stylesheet"]').length,listeners:window.__KAMIL_LIFECYCLE__?.stats?.().total||0,views:document.querySelectorAll('main > .view').length}));
 for(let i=0;i<3;i++)for(const v of ['family','home','money','tickets','today'])await nav(page,v);await page.waitForTimeout(300);
 const after=await page.evaluate(()=>({nav:document.querySelectorAll('#mainNav button').length,styles:document.querySelectorAll('link[rel="stylesheet"]').length,listeners:window.__KAMIL_LIFECYCLE__?.stats?.().total||0,views:document.querySelectorAll('main > .view').length,ids:{inbox:document.querySelectorAll('#view-inbox').length,betting:document.querySelectorAll('#view-betting').length,family:document.querySelectorAll('#familyView').length,health:document.querySelectorAll('[data-os-health-1046]').length}}));
 expect(after.nav).toBe(before.nav);expect(after.styles).toBe(before.styles);expect(after.listeners).toBe(before.listeners);expect(after.views).toBe(before.views);expect(after.ids).toEqual({inbox:1,betting:1,family:1,health:1});
});

test('command bar is safe, searchable and unknown text does not silently create a task',async({page})=>{
 await page.setViewportSize({width:1100,height:800});await page.goto(BASE,{waitUntil:'domcontentloaded'});await ready(page);const input=page.locator('#commandInput');await expect(input).toHaveAttribute('role','combobox');await expect(input).toHaveAttribute('aria-controls','commandResults');
 const before=await page.evaluate(async()=>{const m=await import('/js/state.js');return m.store.get().tasks.length});const q=`neznamy-prikaz-${Date.now()}`;await input.fill(q);await input.press('Enter');await expect(page.getByText('Příkazu nerozumím')).toBeVisible();await page.getByRole('button',{name:'Zrušit'}).click();const after=await page.evaluate(async()=>{const m=await import('/js/state.js');return m.store.get().tasks.length});expect(after).toBe(before);
 await input.fill('/ops');await input.press('Enter');await expect(page.getByText('Kamil OS Operations')).toBeVisible({timeout:10000});
});

test('operations dry-runs and state contracts remain non-executing',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});await ready(page);const x=await page.evaluate(async()=>{const op=await import('/js/controlOperations1047.js'),contracts=await import('/js/stateContracts.js'),market=await import('/js/ticketMarketAdapter.js');const rule=op.testAutomation1043({condition:'HEALTH_BELOW',value:101}),badWatch=op.createWatch1041({kind:'MONEY',field:'roi'}),report=contracts.validateEntityContracts(),adapted=market.adaptTicketMarket({id:'x',buyPrice:100});return{rule,badWatch,reportOk:report.ok,market:adapted,contract:market.ticketMarketContract()}});expect(x.rule.ok).toBe(true);expect(x.rule.executed).toBe(false);expect(x.badWatch.ok).toBe(false);expect(x.reportOk).toBe(true);expect(x.market.market).toBeNull();expect(x.contract.noInventedMarketPrice).toBe(true);
});
