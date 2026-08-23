import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const seed=()=>{const fresh=new Date().toISOString(),event=new Date(Date.now()+8*86400000).toISOString().slice(0,10);return{meta:{schemaVersion:80},financePlan:{plannedInvestment:25000},marketCapital:{available:30000,reserved:10000},xtbHub:{asOf:fresh,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:100000,volume:10,net_profit_pct:45,net_profit:31000,currency:'CZK'}]}}},xtbReport:{asOf:fresh,czkValue:100000,czkProfit:31000,positions:[{ticker:'WDAY.US',name:'Workday',valueCZK:100000,profitCZK:31000,net_profit_pct:45}]},ticketBook:{items:[{id:'p1',name:'Koncert A',workflow:'LISTED',date:event,sellBy:event,qty:4,buy:8000,listPrice:3000,marketPrice:2800,marketCheckedAt:fresh,marketSourceUrl:'https://example.com/a',floorPrice:2300,transferStatus:'READY',feeRate:.12,comparableListings:[2700,2800,2900]},{id:'w1',name:'PKS fakturace zakázky',workflow:'LISTED',date:event,sellBy:event,qty:2,buy:1000,listPrice:1500,marketPrice:1400,marketCheckedAt:fresh,comparableListings:[1300,1400]}]}}};
const fingerprint=()=>{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return{last:s.meta?.lastMutationAt||null,audit:JSON.stringify(s.audit||[]),tickets:JSON.stringify(s.ticketBook?.items||[]),xtb:JSON.stringify(s.xtbReport||{})}};

test('Commander 59.0 shows only CO KOLIK ZA KOLIK PROČ CO POTOM by default',async({page})=>{
 const state=seed();await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const before=await page.evaluate(fingerprint);
 expect(await page.evaluate(()=>window.__KAMIL_COMMANDER_UX_590_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Market Commander'}).first().click();
 await expect(page.locator('#modalHost')).toContainText('MARKET COMMANDER 59.0');
 for(const text of ['CO','KOLIK','ZA KOLIK','PROČ','CO POTOM'])await expect(page.locator('#modalHost')).toContainText(text);
 const detail=page.locator('#modalHost details');await expect(detail).toBeVisible();expect(await detail.getAttribute('open')).toBeNull();
 await expect(page.locator('#modalHost')).toContainText(/nic automaticky nenakupuje, neprodává, nepřevádí měny ani nepřecenňuje/i);
 const after=await page.evaluate(fingerprint);expect(after).toEqual(before);
 expect(await page.evaluate(()=>window.__KAMIL_COMMANDER_UX_590_LAST__||null)).not.toBeNull();
});

test('Commander ticket helpers exclude work-domain rows',async({page})=>{
 const state=seed();await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const out=await page.evaluate(async()=>{const m=await import('./js/marketCommander587.js'),s=JSON.parse(localStorage.getItem('kamil-os-state'));return{depth:m.ticketMarketDepth578(s).map(x=>x.name),calendar:m.ticketPortfolioCalendar585(s).map(x=>x.name),decision:m.commanderDecision590(s)}});
 expect(out.depth).toContain('Koncert A');expect(out.depth).not.toContain('PKS fakturace zakázky');
 expect(out.calendar).not.toContain('PKS fakturace zakázky');
 expect(['ACT','VERIFY','WAIT']).toContain(out.decision.mode);
 expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});