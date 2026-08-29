import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const FORBIDDEN=['./performance330.js','./ticketQa332.js','./ticketDesk331.js'];
const fakeSdk=`(()=>{function q(){const api={select(){return api},order(){return api},limit(){return api},is(){return api},eq(){return api},in(){return api},update(){return api},upsert(){return api},delete(){return api},maybeSingle:async()=>({data:null,error:null}),then(resolve,reject){return Promise.resolve({data:[],error:null}).then(resolve,reject)}};return api}window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'os347-test'}}}})},from:q})}})();`;

async function boot(page){
  await page.addInitScript(()=>{
    window.__OS347_EVENT_ORDER__=[];
    window.addEventListener('kamil:boot-budget343',()=>window.__OS347_EVENT_ORDER__.push({name:'critical',at:performance.now()}));
    window.addEventListener('kamil:deferred345-complete',()=>window.__OS347_EVENT_ORDER__.push({name:'deferred',at:performance.now()}));
  });
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',r=>r.fulfill({status:200,contentType:'application/javascript',body:fakeSdk}));
  await page.goto(BASE,{waitUntil:'domcontentloaded'});
  await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
}

test('OS347 enforces the interactive critical-path budget',async({page})=>{
  await boot(page);
  const s=await page.evaluate(()=>({
    boot:window.__KAMIL_BOOT_BUDGET343__,
    deferred:window.__KAMIL_DEFERRED345__,
    loader:window.__KAMIL_TICKET_ON_DEMAND346__,
    order:window.__OS347_EVENT_ORDER__
  }));
  const paths=s.boot.modules.map(x=>x.path);
  expect(s.boot.healthy).toBe(true);
  expect(s.boot.failures).toHaveLength(0);
  expect(s.boot.modules.length).toBeLessThanOrEqual(26);
  for(const path of FORBIDDEN)expect(paths).not.toContain(path);
  expect(paths).toContain('./ticketOnDemand346.js');
  expect(s.loader.loaded).toBe(false);
  expect(s.loader.loads).toBe(0);
  expect(s.order[0]?.name).toBe('critical');
  console.log('OS347_CRITICAL_PATH',JSON.stringify({totalMs:s.boot.totalMs,moduleCount:s.boot.modules.length,forbiddenLoaded:FORBIDDEN.filter(x=>paths.includes(x)),order:s.order}));
});

test('OS347 starts deferred diagnostics only after interactive boot',async({page})=>{
  await boot(page);
  await expect.poll(()=>page.evaluate(()=>window.__KAMIL_DEFERRED345__?.complete),{timeout:8000}).toBe(true);
  const s=await page.evaluate(()=>({deferred:window.__KAMIL_DEFERRED345__,order:window.__OS347_EVENT_ORDER__}));
  expect(s.deferred.healthy).toBe(true);
  expect(s.deferred.failures).toHaveLength(0);
  expect(s.deferred.modules.map(x=>x.path).sort()).toEqual(['./performance330.js','./ticketQa332.js'].sort());
  const critical=s.order.find(x=>x.name==='critical'),deferred=s.order.find(x=>x.name==='deferred');
  expect(critical).toBeTruthy();
  expect(deferred).toBeTruthy();
  expect(deferred.at).toBeGreaterThanOrEqual(critical.at);
});

test('OS347 keeps the critical snapshot immutable after Tickets loads',async({page})=>{
  await boot(page);
  const before=await page.evaluate(()=>({count:window.__KAMIL_BOOT_BUDGET343__.modules.length,paths:window.__KAMIL_BOOT_BUDGET343__.modules.map(x=>x.path)}));
  await page.evaluate(()=>window.__KAMIL_NAVIGATION342__.navigate('tickets',{source:'os347-test'}));
  await expect.poll(()=>page.evaluate(()=>window.__KAMIL_TICKET_ON_DEMAND346__?.loaded),{timeout:7000}).toBe(true);
  const after=await page.evaluate(()=>({count:window.__KAMIL_BOOT_BUDGET343__.modules.length,paths:window.__KAMIL_BOOT_BUDGET343__.modules.map(x=>x.path),loads:window.__KAMIL_TICKET_ON_DEMAND346__.loads,desk:window.__KAMIL_TICKET_DESK331__?.version}));
  expect(after.count).toBe(before.count);
  expect(after.paths).toEqual(before.paths);
  expect(after.loads).toBe(1);
  expect(after.desk).toBe(331);
});
