import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const fakeSdk=`(()=>{function q(){const api={select(){return api},order(){return api},limit(){return api},is(){return api},eq(){return api},in(){return api},update(){return api},upsert(){return api},delete(){return api},maybeSingle:async()=>({data:null,error:null}),then(resolve,reject){return Promise.resolve({data:[],error:null}).then(resolve,reject)}};return api}window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'os346-test'}}}})},from:q})}})();`;
async function boot(page){
 await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',r=>r.fulfill({status:200,contentType:'application/javascript',body:fakeSdk}));
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_TICKET_ON_DEMAND346__?.version),{timeout:5000}).toBe(346);
}

test('OS346 keeps Ticket Desk out of Today critical boot',async({page})=>{
 await boot(page);
 const s=await page.evaluate(()=>({boot:window.__KAMIL_BOOT_BUDGET343__,loader:window.__KAMIL_TICKET_ON_DEMAND346__,desk:window.__KAMIL_TICKET_DESK331__||null}));
 expect(s.boot.modules.some(x=>x.path==='./ticketDesk331.js')).toBe(false);
 expect(s.boot.modules.some(x=>x.path==='./ticketOnDemand346.js'&&x.ok)).toBe(true);
 expect(s.loader.loaded).toBe(false);
 expect(s.loader.loading).toBe(false);
 expect(s.desk).toBe(null);
 console.log('OS346_TODAY_PROFILE',JSON.stringify({totalMs:s.boot.totalMs,moduleCount:s.boot.modules.length,loader:s.loader}));
});

test('OS346 loads Ticket Desk on first Tickets navigation',async({page})=>{
 await boot(page);
 await page.evaluate(()=>window.__KAMIL_NAVIGATION342__.navigate('tickets',{source:'os346-test'}));
 await expect(page.locator('#view-tickets')).toHaveClass(/on/);
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_TICKET_ON_DEMAND346__?.loaded),{timeout:7000}).toBe(true);
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_TICKET_DESK331__?.version),{timeout:7000}).toBe(331);
 const s=await page.evaluate(()=>({loader:window.__KAMIL_TICKET_ON_DEMAND346__,desk:window.__KAMIL_TICKET_DESK331__}));
 expect(s.loader.failures).toHaveLength(0);
 expect(s.loader.loads).toBe(1);
 expect(s.loader.loadMs).toBeGreaterThanOrEqual(0);
 expect(s.desk.stable).toBe(true);
 console.log('OS346_TICKET_LOAD_PROFILE',JSON.stringify({loadMs:s.loader.loadMs,loads:s.loader.loads,portfolioVersion:s.desk.portfolioVersion}));
});

test('OS346 reuses the same Ticket Desk after returning to Tickets',async({page})=>{
 await boot(page);
 await page.evaluate(()=>window.__KAMIL_NAVIGATION342__.navigate('tickets',{source:'os346-first'}));
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_TICKET_ON_DEMAND346__?.loaded),{timeout:7000}).toBe(true);
 await page.evaluate(()=>window.__KAMIL_NAVIGATION342__.navigate('today',{source:'os346-away'}));
 await page.evaluate(()=>window.__KAMIL_NAVIGATION342__.navigate('tickets',{source:'os346-second'}));
 await expect(page.locator('#view-tickets')).toHaveClass(/on/);
 const s=await page.evaluate(()=>window.__KAMIL_TICKET_ON_DEMAND346__);
 expect(s.loads).toBe(1);
 expect(s.loaded).toBe(true);
});
