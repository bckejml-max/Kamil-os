import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Kamil OS 42 Universal Search and Agent Layer are usable and proposal-only',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(String(e?.message||e)));
 await page.addInitScript(()=>{
  localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:80},financePlan:{cashNow:100000,reserveFloor:50000,plannedInvestment:25000,expectedIncome:0},tasks:[{id:'d4-task',title:'D4 most',status:'OPEN',due:'2026-08-22'}],projects:[{id:'d4-project',name:'D4'}],delegations:[{id:'petr-wait',person:'Petr',title:'Rozpočet D4',status:'WAITING',updatedAt:'2026-08-10T10:00:00Z'}],ticketBook:{items:[],watchlist:[],history:[]},personalAdmin:{items:[]},debtBook:{items:[]},personalGoals:{items:[]},netWorthBook:{items:[],history:[]},personalSpending:{transactions:[]},assetBook:{items:[]},personalInbox:{items:[]},xtbHub:{},xtbReport:{},xtbStrategy:{overrides:{}},tradeJournal:{trades:[]},inbox:[],calendar:{events:[]},goals:[]}));
 });
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page).toHaveTitle(/Kamil OS 42\.0/);
 await expect(page.locator('.version').first()).toHaveText('42.0.0');
 const host=page.locator('#os42Hub');await expect(host).toBeVisible({timeout:10000});
 const before=await page.evaluate(()=>localStorage.getItem('kamil-os-state'));
 const search=page.locator('[data-os42-search]');await search.fill('D4');await search.press('Enter');await expect(page.locator('[data-os42-search-results]')).toContainText('D4 most');
 const agent=page.locator('[data-os42-agent]');await agent.fill('Vyřeš mi zítřek a připrav urgence');await agent.press('Enter');await expect(page.locator('[data-os42-agent-results]')).toContainText('Čeká na potvrzení.');
 const after=await page.evaluate(()=>localStorage.getItem('kamil-os-state'));expect(after).toBe(before);
 const contract=await page.evaluate(async()=>{const os=await import('./js/os42.js');const state={tasks:[],delegations:[],financePlan:{cashNow:1,reserveFloor:0,plannedInvestment:0},ticketBook:{items:[]},xtbHub:{},xtbReport:{},xtbStrategy:{overrides:{}},tradeJournal:{trades:[]},projects:[],inbox:[],calendar:{events:[]}};return {v:os.OS42_VERSION,c:os.OS42_CONTRACT,a:os.agentLayer42(state,'pošli urgence')}});
 expect(contract.v).toBe('42.0');
 for(const key of ['autoSend','autoTrade','autoReprice','autoDelete','autoCalendarWrite'])expect(contract.c[key]).toBe(false);
 expect(contract.c.criticalActionsRequireConfirmation).toBe(true);expect(contract.a.status).toBe('PROPOSAL_ONLY');expect(contract.a.requiresConfirmation).toBe(true);
 expect(errors).toEqual([]);
});

test('Kamil OS 42 PWA cache contains OS42 layer',async({request})=>{
 const sw=await (await request.get(`${BASE}/sw.js`)).text();
 expect(sw).toContain('kamil-os-42.0.0-shell-r1');expect(sw).toContain('./js/os42.js');expect(sw).toContain('./js/os42Ui.js');
});
