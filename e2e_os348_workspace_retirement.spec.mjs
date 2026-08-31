import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const MAX_CRITICAL_MODULES=38;
const fakeSdk=`(()=>{function q(){const api={select(){return api},order(){return api},limit(){return api},is(){return api},eq(){return api},in(){return api},update(){return api},upsert(){return api},delete(){return api},maybeSingle:async()=>({data:null,error:null}),then(resolve,reject){return Promise.resolve({data:[],error:null}).then(resolve,reject)}};return api}window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'os348-test'}}}})},from:q})}})();`;
async function boot(page){
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',r=>r.fulfill({status:200,contentType:'application/javascript',body:fakeSdk}));
  await page.goto(BASE,{waitUntil:'domcontentloaded'});
  await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
}

test('OS348 removes workspaces305 from the critical path',async({page})=>{
  await boot(page);
  const before=await page.evaluate(()=>({boot:window.__KAMIL_BOOT_BUDGET343__,deferred:window.__KAMIL_DEFERRED345__}));
  const critical=before.boot.modules.map(x=>x.path);
  expect(before.boot.modules.length).toBeLessThanOrEqual(MAX_CRITICAL_MODULES);
  expect(critical).not.toContain('./workspaces305.js');
  await expect.poll(()=>page.evaluate(()=>window.__KAMIL_DEFERRED345__?.complete),{timeout:8000}).toBe(true);
  const after=await page.evaluate(()=>({deferred:window.__KAMIL_DEFERRED345__,workspace:window.__KAMIL_WORKSPACES305__}));
  expect(after.deferred.modules.map(x=>x.path)).toContain('./workspaces305.js');
  expect(after.workspace?.version).toBe(305);
  expect(after.workspace?.observer).toBe('retired-os348');
  console.log('OS348_WORKSPACE_PROFILE',JSON.stringify({criticalMs:before.boot.totalMs,criticalModules:before.boot.modules.length,maxCriticalModules:MAX_CRITICAL_MODULES,deferred:after.deferred.modules}));
});

test('OS348 workspace refresh stays single-owner without DOM ping-pong',async({page})=>{
  await boot(page);
  await expect.poll(()=>page.evaluate(()=>window.__KAMIL_DEFERRED345__?.complete),{timeout:8000}).toBe(true);
  await page.evaluate(()=>window.__KAMIL_NAVIGATION342__.navigate('money',{source:'os348-test'}));
  await expect(page.locator('#view-money')).toHaveClass(/on/);
  await expect.poll(()=>page.locator('#moneyView [data-workspace305-money]').count(),{timeout:4000}).toBe(1);
  await page.waitForTimeout(350);
  const result=await page.evaluate(async()=>{
    const host=document.querySelector('#moneyView');
    let childMutations=0;
    const observer=new MutationObserver(records=>{for(const r of records)if(r.type==='childList')childMutations++});
    observer.observe(host,{childList:true,subtree:false});
    window.dispatchEvent(new CustomEvent('kamil:view-change',{detail:'money'}));
    window.dispatchEvent(new CustomEvent('kamil:view-change',{detail:'money'}));
    await new Promise(r=>setTimeout(r,700));
    observer.disconnect();
    return {count:host.querySelectorAll('[data-workspace305-money]').length,childMutations,observer:window.__KAMIL_WORKSPACES305__?.observer};
  });
  expect(result.count).toBe(1);
  expect(result.observer).toBe('retired-os348');
  expect(result.childMutations).toBeLessThanOrEqual(1);
});
