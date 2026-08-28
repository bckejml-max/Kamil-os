import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const fakeSdk=`(()=>{function q(){const api={select(){return api},order(){return api},limit(){return api},is(){return api},eq(){return api},in(){return api},update(){return api},upsert(){return api},delete(){return api},maybeSingle:async()=>({data:null,error:null}),then(resolve,reject){return Promise.resolve({data:[],error:null}).then(resolve,reject)}};return api}window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'os342-test'}}}})},from:q})}})();`;

async function boot(page){
 await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',r=>r.fulfill({status:200,contentType:'application/javascript',body:fakeSdk}));
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_NAVIGATION342__?.version),{timeout:10000}).toBe(342);
 await expect(page.locator('#view-today')).toHaveClass(/on/);
}

async function record(page){await page.evaluate(()=>{window.__nav342Events=[];window.addEventListener('kamil:view-change',e=>window.__nav342Events.push(e.detail))})}

function canonicalCount(page,view){return page.evaluate(v=>window.__nav342Events.filter(x=>x===v).length,view)}

test('OS342 emits exactly one canonical transition and does not bounce back',async({page})=>{
 await boot(page);await record(page);
 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('#view-money')).toHaveClass(/on/);
 await expect.poll(()=>canonicalCount(page,'money')).toBe(1);
 await page.waitForTimeout(700);
 await expect(page.locator('#view-money')).toHaveClass(/on/);
 expect(await canonicalCount(page,'money')).toBe(1);
 const state=await page.evaluate(()=>({version:window.__KAMIL_NAVIGATION342__.version,current:window.__KAMIL_NAVIGATION342__.current(),healthy:window.__KAMIL_NAVIGATION342__.healthy}));
 expect(state).toEqual({version:342,current:'money',healthy:true});
});

test('OS342 same-view API call is idempotent',async({page})=>{
 await boot(page);
 await page.evaluate(()=>window.__KAMIL_NAVIGATION342__.navigate('money',{source:'test'}));
 await expect(page.locator('#view-money')).toHaveClass(/on/);
 await record(page);
 const result=await page.evaluate(()=>window.__KAMIL_NAVIGATION342__.navigate('money',{source:'same-view'}));
 expect(result).toBe(false);
 await page.waitForTimeout(150);
 expect(await canonicalCount(page,'money')).toBe(0);
 await expect(page.locator('#view-money')).toHaveClass(/on/);
});

test('OS342 keeps legacy kamil:navigate compatible with one transition',async({page})=>{
 await boot(page);await record(page);
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'tickets'})));
 await expect(page.locator('#view-tickets')).toHaveClass(/on/);
 await expect.poll(()=>canonicalCount(page,'tickets')).toBe(1);
 await page.waitForTimeout(500);
 expect(await canonicalCount(page,'tickets')).toBe(1);
});

test('OS342 routes dynamic Executive buttons through the same owner',async({page})=>{
 await boot(page);await expect(page.locator('#todayView [data-os333-exec]')).toBeVisible({timeout:10000});await record(page);
 await page.locator('#todayView [data-os333-exec] [data-view="tickets"]').click();
 await expect(page.locator('#view-tickets')).toHaveClass(/on/);
 await expect.poll(()=>canonicalCount(page,'tickets')).toBe(1);
});

test('OS342 programmatic navigation works on mobile without visible main nav',async({page})=>{
 await page.setViewportSize({width:390,height:844});await boot(page);await record(page);
 await page.evaluate(()=>window.__KAMIL_NAVIGATION342__.navigate('money',{source:'mobile'}));
 await expect(page.locator('#view-money')).toHaveClass(/on/);
 await expect.poll(()=>canonicalCount(page,'money')).toBe(1);
 const state=await page.evaluate(()=>({current:window.__KAMIL_NAVIGATION342__.current(),active:[...document.querySelectorAll('.view.on')].map(x=>x.id)}));
 expect(state.current).toBe('money');expect(state.active).toEqual(['view-money']);
});
