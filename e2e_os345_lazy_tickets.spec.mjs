import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const fakeSdk=`(()=>{function q(){const api={select(){return api},order(){return api},limit(){return api},is(){return api},eq(){return api},in(){return api},update(){return api},upsert(){return api},delete(){return api},maybeSingle:async()=>({data:null,error:null}),then(resolve,reject){return Promise.resolve({data:[],error:null}).then(resolve,reject)}};return api}window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'os345-test'}}}})},from:q})}})();`;
async function boot(page){await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',r=>r.fulfill({status:200,contentType:'application/javascript',body:fakeSdk}));await page.goto(BASE,{waitUntil:'domcontentloaded'});await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:10000}).toBe(true)}

test('OS345 keeps ticket desk and QA out of critical boot',async({page})=>{
 await boot(page);
 const before=await page.evaluate(()=>({modules:(window.__KAMIL_BOOT_BUDGET343__?.modules||[]).map(x=>x.path),boot:window.__KAMIL_TICKET_BOOT345__,desk:!!window.__KAMIL_TICKET_DESK331__,qa:!!window.__KAMIL_TICKET_QA332__}));
 expect(before.modules).toContain('./ticketBoot345.js');
 expect(before.modules).not.toContain('./ticketDesk331.js');
 expect(before.modules).not.toContain('./ticketQa332.js');
 expect(before.boot?.version).toBe(345);
 expect(before.boot?.loaded).toBe(false);
 expect(before.desk).toBe(false);
 expect(before.qa).toBe(false);
});

test('OS345 loads ticket desk and QA on first Tickets visit',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="tickets"]').click();
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_TICKET_BOOT345__?.loaded),{timeout:10000}).toBe(true);
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_TICKET_DESK331__?.stable),{timeout:10000}).toBe(true);
 await expect(page.locator('#ticketIntelView .td331')).toBeVisible();
 const after=await page.evaluate(()=>({boot:window.__KAMIL_TICKET_BOOT345__,desk:window.__KAMIL_TICKET_DESK331__,qa:window.__KAMIL_TICKET_QA332__}));
 expect(after.boot?.loaded).toBe(true);
 expect(after.boot?.error).toBe(null);
 expect(after.desk?.stable).toBe(true);
 expect(after.qa?.version).toBe(332);
 console.log('OS345_TICKET_BOOT',JSON.stringify({loadMs:after.boot?.loadMs,desk:after.desk?.version,qa:after.qa?.version}));
});
