import {test,expect} from '@playwright/test';

const BASE='http://127.0.0.1:4173';

test('Kamil OS 32.4 local-first auth and critical flow',async({page})=>{
  const requests=[];page.on('request',r=>requests.push(r.url()));
  await page.goto(BASE,{waitUntil:'networkidle'});
  await expect(page).toHaveTitle(/Kamil OS 32\.[45]/);
  await expect(page.locator('#appView')).toBeVisible();
  await expect(page.locator('#syncStatus')).toContainText('Jen toto zařízení');
  expect(requests.some(u=>u.includes('@supabase/supabase-js'))).toBeFalsy();

  await expect(page.getByRole('heading',{name:'Tvoje data nejsou na tomto zařízení.'})).toBeVisible();
  await page.getByRole('button',{name:'Připojit moje data'}).click();
  await expect(page.locator('#authView')).toBeVisible();
  await expect(page.getByRole('button',{name:'Poslat přihlašovací odkaz bez hesla'})).toBeVisible();
  expect(requests.some(u=>u.includes('@supabase/supabase-js'))).toBeFalsy();
  await page.evaluate(async()=>{const {store}=await import('./js/state.js');store.setMeta({lastMagicLinkAt:new Date().toISOString()})});
  await page.getByRole('button',{name:'Zpět do Kamil OS bez přihlášení'}).click();
  await expect(page.locator('#appView')).toBeVisible();
  await page.locator('#syncStatus').click();
  await expect(page.locator('#magicLinkBtn')).toContainText('Další odkaz za');
  await page.getByRole('button',{name:'Zpět do Kamil OS bez přihlášení'}).click();

  for(const name of ['Peníze','Vstupenky','Domov','Více','Dnes']){
    await page.locator('#mainNav').getByRole('button',{name}).click();
    await expect(page.locator('.view.on')).toBeVisible();
  }

  await expect(page.locator('#decisionJournal31Button')).toBeVisible();
  await page.locator('#decisionJournal31Button').click();
  await expect(page.getByRole('heading',{name:'Decision Journal 31.1'})).toBeVisible();
  await page.getByRole('button',{name:'Zavřít'}).click();

  const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('kamil-os-state')||'{}').tasks?.length||0);
  await page.locator('#commandInput').fill('naprosto neznámá instrukce xyz 32');
  await page.locator('#commandGo').click();
  await expect(page.getByRole('heading',{name:'Náhled změny'})).toBeVisible();
  await expect(page.locator('#modalHost')).toContainText('Vytvořit osobní úkol');
  await page.getByRole('button',{name:'Zrušit'}).click();
  const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('kamil-os-state')||'{}').tasks?.length||0);
  expect(after).toBe(before);

  await page.locator('#mainNav').getByRole('button',{name:'Více'}).click();
  await page.getByRole('button',{name:/Systém/}).click();
  await expect(page.getByRole('heading',{name:/Health score/})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Source Trust'})).toBeVisible();
  await expect(page.locator('#liveBrain32Host')).toContainText('SOURCE BACKED ONLY');
  await expect(page.getByRole('heading',{name:'History Data Engine'})).toBeVisible();
  await expect(page.locator('#dataEngine31Host')).toContainText('DUAL WRITE');
  await expect(page.locator('#dataEngine31Host')).toContainText('LOCAL ONLY');
  await expect(page.getByRole('heading',{name:'Cloudové recovery snapshoty'})).toBeVisible();
  await expect(page.locator('#recoveryShield32Host')).toContainText('RECOVERY SHIELD 32.4');
  await expect(page.getByRole('heading',{name:'Item-level shadow sync'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Remote Change Inbox'})).toBeVisible();
  await expect(page.locator('#remoteInbox31Host')).toContainText('CONFIRMED MERGE');
  await expect(page.locator('#remoteInbox31Host')).toContainText('Cloud není připojený');
  expect(requests.some(u=>u.includes('@supabase/supabase-js'))).toBeFalsy();
});

test('Kamil OS 32.4 mirrors selected history into IndexedDB',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:80},financePlan:{cashNow:1,expectedIncome:0,reserveFloor:0,plannedInvestment:0},tasks:[],decisionJournal:{items:[{id:'e2e-decision',at:'2026-08-20T10:00:00Z',domain:'money',title:'E2E decision',action:'HOLD',priority:50}]}}));
  });
  await page.goto(BASE,{waitUntil:'networkidle'});
  await expect(page).toHaveTitle(/Kamil OS 32\.[45]/);
  await page.waitForFunction(async()=>{const {readHistory31}=await import('./js/indexedDb31.js');const rows=await readHistory31('decision',{limit:100});return rows.some(x=>x.key==='decision|e2e-decision'&&x.payload?.action==='HOLD')},null,{timeout:10000});
  const record=await page.evaluate(async()=>{const {readHistory31}=await import('./js/indexedDb31.js');return (await readHistory31('decision',{limit:100})).find(x=>x.key==='decision|e2e-decision')});
  expect(record.bucket).toBe('decision');expect(record.payload.action).toBe('HOLD');
});

test('Kamil OS 32.4 cloud history mapper is allowlisted and non-destructive',async({page})=>{
  await page.goto(BASE,{waitUntil:'networkidle'});
  const result=await page.evaluate(async()=>{const {cloudHistoryRows32,cloudHistory32Info}=await import('./js/cloudHistory32.js');return {rows:cloudHistoryRows32([{key:'ticket|1',bucket:'ticket',payload:{profit:1}},{key:'vault|1',bucket:'vault',payload:{secret:'x'}}],'user','32.4.0','2026-08-21T00:00:00Z'),info:cloudHistory32Info}});
  expect(result.rows).toHaveLength(1);expect(result.rows[0].bucket).toBe('ticket');expect(result.info.deleteEnabled).toBe(false);expect(result.info.mode).toBe('DUAL_WRITE');
});

test('Kamil OS 32.4 creates a safe local item-level outbox operation',async({page})=>{
  const requests=[];page.on('request',r=>requests.push(r.url()));
  await page.addInitScript(()=>{
    localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:80},financePlan:{cashNow:1,expectedIncome:0,reserveFloor:0,plannedInvestment:0},tasks:[{id:'smart-task',title:'Před změnou',status:'OPEN',token:'NEULOZIT'}],personalAdmin:{items:[]},ticketBook:{items:[],watchlist:[]},debtBook:{items:[]},personalGoals:{items:[]},netWorthBook:{items:[],history:[]},personalSpending:{transactions:[]},assetBook:{items:[]},personalInbox:{items:[]}}));
  });
  await page.goto(BASE,{waitUntil:'networkidle'});
  await page.waitForFunction(async()=>{const {smartSyncContext31}=await import('./js/indexedDb31.js');return (await smartSyncContext31()).baseline},null,{timeout:10000});
  await page.evaluate(async()=>{const {store}=await import('./js/state.js');store.mutate('E2E Smart Sync',s=>{s.tasks[0].title='Po změně'})});
  const op=await page.evaluate(async()=>{const {pendingSmartSyncOps31}=await import('./js/indexedDb31.js'),deadline=Date.now()+10000;while(Date.now()<deadline){const row=(await pendingSmartSyncOps31(100)).find(x=>x.domain==='tasks'&&x.entityId==='smart-task'&&x.op==='UPSERT'&&x.status==='PENDING'&&x.payload?.title==='Po změně'&&!('token'in(x.payload||{})));if(row)return row;await new Promise(r=>setTimeout(r,50))}return null});
  expect(op).toBeTruthy();expect(op.op).toBe('UPSERT');expect(op.status).toBe('PENDING');expect(op.payload.title).toBe('Po změně');expect(op.payload.token).toBeUndefined();expect(requests.some(u=>u.includes('@supabase/supabase-js'))).toBeFalsy();
});

test('Kamil OS 32.4 confirmed merge engine never auto-applies conflicts or deletes',async({page})=>{
  await page.goto(BASE,{waitUntil:'networkidle'});
  const result=await page.evaluate(async()=>{const {remoteAutoCandidates32,applyRemoteItem32}=await import('./js/remoteMerge32.js');const fresh={id:'n',domain:'tasks',entityId:'n',op:'UPSERT',kind:'REMOTE_NEW',payload:{id:'n',title:'New'},seen:false},conflict={...fresh,id:'c',entityId:'c',kind:'CONFLICT'},del={...fresh,id:'d',entityId:'d',kind:'REMOTE_DELETE',op:'DELETE'};const auto=remoteAutoCandidates32({actionable:[fresh,conflict,del]});const state={tasks:[],personalAdmin:{items:[]},ticketBook:{items:[]},debtBook:{items:[]},personalGoals:{items:[]},netWorthBook:{items:[]},personalSpending:{transactions:[]},assetBook:{items:[]},personalInbox:{items:[]}};applyRemoteItem32(state,fresh);return {auto:auto.map(x=>x.kind),title:state.tasks[0]?.title}});
  expect(result.auto).toEqual(['REMOTE_NEW']);expect(result.title).toBe('New');
});

test('Kamil OS 32.4 Copilot write waits for explicit confirmation',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:80},financePlan:{cashNow:1,expectedIncome:0,reserveFloor:0,plannedInvestment:0},tasks:[],debtBook:{items:[{id:'debt-e2e',person:'Petr',amount:10000,status:'ACTIVE',payments:[]}]},ticketBook:{items:[],watchlist:[]},personalAdmin:{items:[]},personalGoals:{items:[]},netWorthBook:{items:[],history:[]},personalSpending:{transactions:[]},assetBook:{items:[]},personalInbox:{items:[]}}));
  });
  await page.goto(BASE,{waitUntil:'networkidle'});
  const paid=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('kamil-os-state')||'{}').debtBook?.items?.[0]?.payments?.length||0);
  expect(await paid()).toBe(0);
  await page.locator('#commandInput').fill('Petr splátka 1500');await page.locator('#commandGo').click();
  await expect(page.getByRole('heading',{name:'Náhled změny'})).toBeVisible();await expect(page.locator('#modalHost')).toContainText('Splátka 1 500 Kč');expect(await paid()).toBe(0);
  await page.getByRole('button',{name:'Zrušit'}).click();expect(await paid()).toBe(0);
  await page.locator('#commandInput').fill('Petr splátka 1500');await page.locator('#commandGo').click();await expect(page.getByRole('button',{name:'Potvrdit změnu'})).toBeVisible();expect(await paid()).toBe(0);
  await page.getByRole('button',{name:'Potvrdit změnu'}).click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('kamil-os-state')||'{}').debtBook?.items?.[0]?.payments?.length===1);
  const payment=await page.evaluate(()=>JSON.parse(localStorage.getItem('kamil-os-state')||'{}').debtBook.items[0].payments[0]);expect(payment.amount).toBe(1500);
});

test('Kamil OS 32.4 Live Brain blocks unsourced overrides and accepts sourced signals',async({page})=>{
  await page.goto(BASE,{waitUntil:'networkidle'});
  const result=await page.evaluate(async()=>{const {ticketDecision}=await import('./js/live24.js');const ticket={id:'live-e2e',name:'Live E2E',workflow:'HOLD',date:'2026-10-15',buy:1000},asOf=new Date().toISOString();const unsourced=ticketDecision(ticket,{ticketBook:{intelligence:{asOf,positions:{'live-e2e':{action:'SELL',priority:99,confidence:91}}}}}),sourced=ticketDecision(ticket,{ticketBook:{intelligence:{asOf,positions:{'live-e2e':{action:'SELL',priority:99,confidence:91,sourceUrls:['https://example.com/ticket-market']}}}}});return {unsourced:{action:unsourced.action,source:unsourced.source,live:unsourced.live,trust:unsourced.liveTrust},sourced:{action:sourced.action,source:sourced.source,live:sourced.live,trust:sourced.liveTrust,urls:sourced.sourceUrls}}});
  expect(result.unsourced.live).toBe(false);expect(result.unsourced.trust).toBe('UNSOURCED');expect(result.unsourced.source).not.toBe('ŽIVĚ · OVĚŘENÉ');
  expect(result.sourced.live).toBe(true);expect(result.sourced.trust).toBe('TRUSTED_FRESH');expect(result.sourced.source).toBe('ŽIVĚ · OVĚŘENÉ');expect(result.sourced.urls).toEqual(['https://example.com/ticket-market']);
});

test('Kamil OS 32.4 Market Edge exposes XTB execution and ticket tuning',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:80},financePlan:{cashNow:100000,expectedIncome:0,reserveFloor:50000,plannedInvestment:25000},tasks:[],debtBook:{items:[]},personalAdmin:{items:[]},personalGoals:{items:[]},netWorthBook:{items:[],history:[]},personalSpending:{transactions:[]},assetBook:{items:[]},personalInbox:{items:[]},ticketBook:{items:[{id:'ticket-edge',name:'Edge Ticket',workflow:'LISTED',qty:2,buy:2000,buy1:1000,date:'2026-09-10',listPrice:0,marketPrice:0,floorPrice:0,transferStatus:'UNKNOWN'}],watchlist:[],history:[]},xtbHub:{asOf:new Date().toISOString(),accounts:{a:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:10000,volume:2,net_profit_pct:45,net_profit:3000}]}}},xtbReport:{asOf:new Date().toISOString(),czkValue:100000,eurValue:0,czkProfit:3000,eurProfit:0},xtbStrategy:{overrides:{}}}));
  });
  await page.goto(BASE,{waitUntil:'networkidle'});
  await page.locator('#mainNav').getByRole('button',{name:'Peníze'}).click();
  await expect(page.getByRole('heading',{name:'Execution, Quote & Filing Radar'})).toBeVisible();
  await expect(page.locator('#marketEdgeXtb32Host')).toContainText('Redukce cca');
  const execution=await page.evaluate(async()=>{const {xtbBoard}=await import('./js/live24.js'),{store}=await import('./js/state.js');return xtbBoard(store.get())[0].d.execution});
  expect(execution.trimPct).toBeGreaterThanOrEqual(30);expect(execution.blocked).toBe(false);
  await page.locator('#mainNav').getByRole('button',{name:'Vstupenky'}).click();
  await expect(page.getByRole('heading',{name:'Pricing & Sell-by Radar'})).toBeVisible();
  await expect(page.locator('#marketEdgeTicket32Host')).toContainText('LISTED bez ceny');
  await page.locator('[data-ticket-tune="ticket-edge"]').click();
  await page.locator('#teList').fill('1450');await page.locator('#teMarket').fill('1400');await page.locator('#teFloor').fill('1100');await page.locator('#teSource').fill('https://example.com/market');await page.locator('#teTransfer').selectOption('READY');
  await page.getByRole('button',{name:'Uložit tuning'}).click();
  await page.waitForFunction(()=>{const x=JSON.parse(localStorage.getItem('kamil-os-state')||'{}').ticketBook?.items?.[0];return x?.listPrice===1450&&x?.marketPrice===1400&&x?.floorPrice===1100&&x?.transferStatus==='READY'&&!!x?.marketCheckedAt});
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('kamil-os-state')||'{}').ticketBook.items[0]);expect(saved.marketSourceUrl).toBe('https://example.com/market');
});

test('Kamil OS 32.5 Profit Control keeps FX and ticket exposure honest',async({page})=>{
  const fresh=new Date().toISOString();
  await page.addInitScript(({fresh})=>{
    localStorage.setItem('kamil-os-market-quotes-32',JSON.stringify({version:2,fetchedAt:fresh,quotes:[{symbol:'EURCZK=X',price:25,currency:'CZK',asOf:fresh,sourceUrl:'https://finance.yahoo.com/quote/EURCZK=X'},{symbol:'VWCE.DE',price:170,currency:'EUR',asOf:fresh,sourceUrl:'https://finance.yahoo.com/quote/VWCE.DE'}]}));
    localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:80},financePlan:{cashNow:100000,expectedIncome:0,reserveFloor:50000,plannedInvestment:25000},tasks:[],debtBook:{items:[]},personalAdmin:{items:[]},personalGoals:{items:[]},netWorthBook:{items:[],history:[]},personalSpending:{transactions:[]},assetBook:{items:[]},personalInbox:{items:[]},ticketBook:{items:[{id:'c1',name:'Clash 17 - A2-1',date:'2026-10-24',workflow:'LISTED',qty:2,buy:2482,listPrice:0,marketPrice:0,transferStatus:'UNKNOWN'},{id:'c2',name:'Clash 17 - A3-2',date:'2026-10-24',workflow:'HOLD',qty:2,buy:2482,listPrice:0,marketPrice:0,transferStatus:'READY'}],watchlist:[],history:[]},xtbHub:{asOf:fresh,accounts:{czk:{currency:'CZK',value:100000,positions:[{ticker:'EUNA.DE',name:'Core Global Aggregate Bond',category:'ETF',value:50000,volume:400,net_profit_pct:0},{ticker:'EXUS.DE',name:'MSCI World ex USA',category:'ETF',value:50000,volume:50,net_profit_pct:0}]},eur:{currency:'EUR',value:1000,positions:[{ticker:'VWCE.DE',name:'FTSE All-World',category:'ETF',value:1000,volume:5.8,net_profit_pct:0}]}}},xtbReport:{asOf:fresh},xtbStrategy:{overrides:{}}}));
  },{fresh});
  await page.goto(BASE,{waitUntil:'networkidle'});
  await expect(page).toHaveTitle(/Kamil OS 32\.5/);
  await page.locator('#mainNav').getByRole('button',{name:'Peníze'}).click();
  await expect(page.getByRole('heading',{name:'Portfolio audit bez míchání měn'})).toBeVisible();
  await expect(page.locator('#profitControlMoney32Host')).toContainText('125 000 Kč');
  await expect(page.locator('#profitControlMoney32Host')).toContainText('Dalších 25 000 Kč');
  await expect(page.locator('.audit-grid')).toBeHidden();
  await page.locator('#mainNav').getByRole('button',{name:'Vstupenky'}).click();
  await expect(page.getByRole('heading',{name:'Event Portfolio & Action Queue'})).toBeVisible();
  await expect(page.locator('#profitControlTickets32Host')).toContainText('Clash 17');
  await expect(page.locator('#profitControlTickets32Host')).toContainText('4 ks');
});
