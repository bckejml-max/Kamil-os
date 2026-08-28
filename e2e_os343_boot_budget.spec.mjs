import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const fakeSdk=`(()=>{function q(){const api={select(){return api},order(){return api},limit(){return api},is(){return api},eq(){return api},in(){return api},update(){return api},upsert(){return api},delete(){return api},maybeSingle:async()=>({data:null,error:null}),then(resolve,reject){return Promise.resolve({data:[],error:null}).then(resolve,reject)}};return api}window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'os343-test'}}}})},from:q})}})();`;

async function boot(page){
 await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',r=>r.fulfill({status:200,contentType:'application/javascript',body:fakeSdk}));
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
}

test('OS343 publishes complete boot timing data',async({page})=>{
 await boot(page);
 const b=await page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__);
 expect(b.version).toBe(343);
 expect(b.complete).toBe(true);
 expect(b.totalMs).toBeGreaterThan(0);
 expect(b.modules.length).toBeGreaterThan(20);
 expect(b.modules.some(x=>x.path==='./app.js'&&x.ok)).toBe(true);
 expect(b.modules.every(x=>Number.isFinite(x.ms)&&x.ms>=0)).toBe(true);
 expect(b.slowest.length).toBeGreaterThan(0);
 for(let i=1;i<b.slowest.length;i++)expect(b.slowest[i-1].ms).toBeGreaterThanOrEqual(b.slowest[i].ms);
 expect(b.failures.length).toBe(0);
 expect(b.healthy).toBe(true);
});

test('OS343 instrumentation does not break navigation',async({page})=>{
 await boot(page);
 await page.evaluate(()=>window.__KAMIL_NAVIGATION342__.navigate('money',{source:'os343-test'}));
 await expect(page.locator('#view-money')).toHaveClass(/on/);
 await page.waitForTimeout(700);
 await expect(page.locator('#view-money')).toHaveClass(/on/);
 const s=await page.evaluate(()=>({nav:window.__KAMIL_NAVIGATION342__.current(),boot:window.__KAMIL_BOOT_BUDGET343__.complete}));
 expect(s.nav).toBe('money');expect(s.boot).toBe(true);
});
