import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const fakeSdk=`(()=>{function q(){const api={select(){return api},order(){return api},limit(){return api},is(){return api},eq(){return api},in(){return api},update(){return api},upsert(){return api},delete(){return api},maybeSingle:async()=>({data:null,error:null}),then(resolve,reject){return Promise.resolve({data:[],error:null}).then(resolve,reject)}};return api}window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'os345-test'}}}})},from:q})}})();`;
async function boot(page){
 await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',r=>r.fulfill({status:200,contentType:'application/javascript',body:fakeSdk}));
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
}

test('OS345 keeps diagnostics out of interactive boot and Today stays usable',async({page})=>{
 await boot(page);
 const s=await page.evaluate(()=>({boot:window.__KAMIL_BOOT_BUDGET343__,deferred:window.__KAMIL_DEFERRED345__,today:!!document.querySelector('#view-today')}));
 expect(s.deferred.version).toBe(345);
 expect(s.boot.modules.some(x=>x.path==='./performance330.js')).toBe(false);
 expect(s.boot.modules.some(x=>x.path==='./ticketQa332.js')).toBe(false);
 expect(s.today).toBe(true);
 await page.evaluate(()=>window.__KAMIL_NAVIGATION342__.navigate('today',{source:'os345-test'}));
 await expect(page.locator('#view-today')).toHaveClass(/on/);
 console.log('OS345_INTERACTIVE_PROFILE',JSON.stringify({totalMs:s.boot.totalMs,moduleCount:s.boot.modules.length,slowest:s.boot.slowest}));
});

test('OS345 loads deferred diagnostics after interactive boot',async({page})=>{
 await boot(page);
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_DEFERRED345__?.complete),{timeout:6000}).toBe(true);
 const s=await page.evaluate(()=>({deferred:window.__KAMIL_DEFERRED345__,perf:typeof window.__KAMIL_SAMPLE_PERFORMANCE330__==='function'}));
 expect(s.deferred.healthy).toBe(true);
 expect(s.deferred.failures).toHaveLength(0);
 const paths=s.deferred.modules.map(x=>x.path);
 expect(paths).toContain('./performance330.js');
 expect(paths).toContain('./ticketQa332.js');
 expect(s.deferred.modules.every(x=>x.ok)).toBe(true);
 expect(s.perf).toBe(true);
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_TICKET_QA332__?.version),{timeout:3000}).toBe(332);
 console.log('OS345_DEFERRED_PROFILE',JSON.stringify(s.deferred));
});
