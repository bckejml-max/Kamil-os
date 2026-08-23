import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const day=n=>new Date(Date.now()+n*86400000).toISOString().slice(0,10);
const stale=()=>new Date(Date.now()-90*3600000).toISOString();
const market=()=>({financePlan:{plannedInvestment:25000},xtbReport:{asOf:stale(),czkValue:100000,czkProfit:31000,positions:[{ticker:'WDAY.US',name:'Workday',valueCZK:100000,profitCZK:31000}]},ticketBook:{items:[{id:'t1',name:'Koncert A',workflow:'LISTED',date:day(5),sellBy:day(5),qty:2,buy:4000,listPrice:2800,marketPrice:2700,marketCheckedAt:stale(),marketSourceUrl:'https://example.com/a',floorPrice:2200,transferStatus:'READY',feeRate:.12}]}});
const fingerprint=()=>{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return{last:s.meta?.lastMutationAt||null,audit:JSON.stringify(s.audit||[]),receipts:JSON.stringify(s.marketExecutionHistory?.receipts||[]),tasks:JSON.stringify(s.tasks||[]),xtb:JSON.stringify(s.xtbReport||{}),tickets:JSON.stringify(s.ticketBook?.items||[])}};

test('60.0 ranks an overdue life task above stale market data without loading heavy modules',async({page})=>{
 const state={meta:{schemaVersion:80},...market(),tasks:[{id:'p1',title:'Zaplatit pojistku',status:'OPEN',due:day(-1),priority:3},{id:'w1',title:'PKS videohovor',status:'OPEN',due:day(1),priority:2}],delegations:[{id:'d1',title:'Čekám na reakci',status:'OPEN'}],personalAdmin:{items:[]},personalInbox:{items:[]},calendar:{events:[{id:'c1',title:'Rodinný termín',start:day(2)}]}};
 await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.locator('#todayView')).toContainText('PERSONAL COMMAND CENTER 60.0');
 await expect(page.locator('#todayView')).toContainText('Zaplatit pojistku');
 await expect(page.locator('#todayView')).toContainText('práce 1 · osobní 1');
 const marker=await page.evaluate(()=>window.__KAMIL_PERSONAL_COMMAND_CENTER_600_LAST__||null);expect(marker?.main).toBe('Zaplatit pojistku');expect(marker?.kind).toBe('Osobní');expect(marker?.dueNow).toBe(1);
 expect(await page.evaluate(()=>window.__KAMIL_RESOLUTION_LOOP_598_LAST__||null)).toBeNull();
 expect(await page.evaluate(()=>window.__KAMIL_MARKET_COMMANDER_587_LAST__||null)).toBeNull();
 expect(await page.evaluate(()=>window.__KAMIL_LIFE_455_IMPORTED_AT__||null)).toBeNull();
});

test('60.0 keeps market Resolution Loop as the global primary action when market is truly top priority',async({page})=>{
 const state={meta:{schemaVersion:80},...market(),tasks:[],delegations:[],personalAdmin:{items:[]},personalInbox:{items:[]},calendar:{events:[]}};
 await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const before=await page.evaluate(fingerprint);
 const marker=await page.evaluate(()=>window.__KAMIL_PERSONAL_COMMAND_CENTER_600_LAST__||null);expect(marker?.kind).toBe('XTB');
 const primary=page.getByRole('button',{name:'Co mám udělat teď'}).first();await expect(primary).toBeVisible();await primary.click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Resolution Loop 59.8'})).toBeVisible();
 expect(await page.evaluate(()=>window.__KAMIL_RESOLUTION_LOOP_598_LAST__||null)).not.toBeNull();
 expect(await page.evaluate(fingerprint)).toEqual(before);
});
