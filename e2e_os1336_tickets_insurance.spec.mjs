import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
async function boot(page){
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await expect(page.locator('[data-os2-today]')).toBeVisible({timeout:10000});
}

test('OS745 preserves private ticket inventory and never seeds bundled rows',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('kamil-os-state',JSON.stringify({
  meta:{schemaVersion:80,createdAt:new Date().toISOString()},
  ticketBook:{masterId:'private-ticket-source',masterMeta:{sourceSheets:['Soukromý zdroj']},items:[
   {id:'private-ticket-1',name:'Soukromý testovací event',eventName:'Soukromý testovací event',qty:2,eventDate:'2026-12-01',date:'2026-12-01',buyTotalCzk:2000,buy:2000,workflow:'LISTED',marketStatus:'LISTED',market_status:'LISTED',listPrice:1500}
  ],watchlist:[],history:[],review:[]},
  personalAdmin:{items:[]}
 })));
 await boot(page);
 await page.locator('#mainNav [data-view="tickets"]').click();
 await expect(page.locator('#ticketIntelView')).toContainText('Soukromý testovací event');
 const d=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return{ids:s.ticketBook?.items?.map(x=>x.id),masterId:s.ticketBook?.masterId,diag:window.__KAMIL_TICKET_OVERVIEW__}});
 expect(d.ids).toEqual(['private-ticket-1']);
 expect(d.masterId).toBe('private-ticket-source');
 expect(d.diag.activeQty).toBe(2);
});

test('OS745 blank private domains stay blank instead of receiving public seed data',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('kamil-os-state',JSON.stringify({
  meta:{schemaVersion:80,createdAt:new Date().toISOString()},
  ticketBook:{items:[],watchlist:[],history:[],review:[]},
  bettingLedger:{bets:[],bankrollCzk:0,unitCzk:0},
  personalAdmin:{items:[]}
 })));
 await boot(page);
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('kamil-os-state')||'{}'));
 expect(state.ticketBook.items).toEqual([]);
 expect(state.bettingLedger.bets).toEqual([]);
 expect(state.personalAdmin.items).toEqual([]);
});

test('Insurance Center renders only insurance records supplied by private state',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('kamil-os-state',JSON.stringify({
  meta:{schemaVersion:80,createdAt:new Date().toISOString()},
  personalAdmin:{insuranceMasterId:'private-insurance-source',items:[
   {id:'private-policy-1',title:'Soukromá testovací pojistka',category:'INSURANCE',provider:'Test provider',amount:1200,currency:'CZK',cadence:'YEARLY',status:'ACTIVE',renewalDate:'2027-06-01',updatedAt:'2026-09-30T10:00:00Z',insurance:{kind:'PROPERTY',insured:'Test asset',lifecycle:'ACTIVE',sourceStatus:'CONFIRMED'}},
   {id:'private-offer-1',title:'Soukromá testovací nabídka',category:'INSURANCE',provider:'Test provider',amount:900,currency:'CZK',cadence:'YEARLY',status:'ACTIVE',updatedAt:'2026-09-30T10:00:00Z',insurance:{kind:'PROPERTY',insured:'Test asset',lifecycle:'OFFER',sourceStatus:'OFFER'}}
  ]}
 })));
 await boot(page);
 await page.locator('#mainNav [data-view="more"]').click();
 await expect(page.locator('#insurance25Tile')).toBeVisible({timeout:10000});
 await page.locator('#insurance25Tile').click();
 await expect(page.locator('#moreView')).toContainText('Soukromá testovací pojistka');
 await expect(page.locator('#moreView')).toContainText('Soukromá testovací nabídka');
 const d=await page.evaluate(()=>window.__KAMIL_INSURANCE_CENTER1336__);
 expect(d.active).toBe(1);
 expect(d.offers).toBe(1);
 expect(d.total).toBe(1);
});
