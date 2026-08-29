import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const fakeSdk=`(()=>{function q(){const api={select(){return api},order(){return api},limit(){return api},is(){return api},eq(){return api},in(){return api},update(){return api},upsert(){return api},delete(){return api},maybeSingle:async()=>({data:null,error:null}),then(resolve,reject){return Promise.resolve({data:[],error:null}).then(resolve,reject)}};return api}window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'os345-test'}}}})},from:q})}})();`;

async function boot(page){
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',r=>r.fulfill({status:200,contentType:'application/javascript',body:fakeSdk}));
  await page.goto(BASE,{waitUntil:'domcontentloaded'});
  await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:12000}).toBe(true);
  await expect.poll(()=>page.evaluate(()=>window.__KAMIL_TICKET_LAZY345__?.version),{timeout:5000}).toBe(345);
}

test('OS345 keeps ticket desk and QA out of the critical boot',async({page})=>{
  await boot(page);
  const state=await page.evaluate(()=>({
    lazy:window.__KAMIL_TICKET_LAZY345__,
    desk:!!window.__KAMIL_TICKET_DESK331__,
    qa:!!window.__KAMIL_TICKET_QA332__,
    paths:(window.__KAMIL_BOOT_BUDGET343__?.modules||[]).map(x=>x.path)
  }));
  expect(state.lazy.loaded).toBe(false);
  expect(state.desk).toBe(false);
  expect(state.qa).toBe(false);
  expect(state.paths).not.toContain('./ticketDesk331.js');
  expect(state.paths).not.toContain('./ticketQa332.js');
  expect(state.paths).toContain('./ticketLazy345.js');
});

test('OS345 loads Tickets once on demand and remains flicker safe',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(String(e?.message||e)));
  await boot(page);
  await page.evaluate(()=>window.__KAMIL_NAV342__.navigate('tickets','os345-test'));
  await expect.poll(()=>page.evaluate(()=>window.__KAMIL_TICKET_LAZY345__?.loaded),{timeout:10000}).toBe(true);
  await expect.poll(()=>page.evaluate(()=>!!window.__KAMIL_TICKET_DESK331__),{timeout:5000}).toBe(true);
  await expect.poll(()=>page.evaluate(()=>!!window.__KAMIL_TICKET_QA332__),{timeout:5000}).toBe(true);
  await expect(page.locator('#view-tickets')).toHaveClass(/on/);
  await expect(page.locator('#ticketIntelView .td331')).toBeVisible();
  await page.waitForTimeout(1400);
  const result=await page.evaluate(async()=>{
    const host=document.querySelector('#ticketIntelView');
    let childMutations=0,htmlChanges=0,last=host?.innerHTML||'';
    const observer=new MutationObserver(records=>{
      for(const r of records)if(r.type==='childList')childMutations++;
      if(host?.innerHTML!==last){htmlChanges++;last=host?.innerHTML||''}
    });
    if(host)observer.observe(host,{childList:true,subtree:false});
    await new Promise(r=>setTimeout(r,1800));
    observer.disconnect();
    return {
      childMutations,htmlChanges,
      loaded:window.__KAMIL_TICKET_LAZY345__?.loaded,
      loading:window.__KAMIL_TICKET_LAZY345__?.loading,
      desk:!!host?.querySelector('.td331'),
      legacy:!!host?.querySelector('[data-ticket-workspace210],.ticket-page-687,.ticket-workspace210')
    };
  });
  expect(result.loaded).toBe(true);
  expect(result.loading).toBe(false);
  expect(result.desk).toBe(true);
  expect(result.legacy).toBe(false);
  if(result.childMutations>1||result.htmlChanges>1)throw new Error(`OS345 ticket root unstable: ${JSON.stringify(result)}`);
  expect(errors.filter(x=>/SyntaxError|Unexpected token/i.test(x))).toEqual([]);
});
