import {test,expect} from '@playwright/test';

const BASE=process.env.BASE_URL||'http://127.0.0.1:4173';
const fakeSdk=`(()=>{function q(){const api={select(){return api},order(){return api},limit(){return api},is(){return api},eq(){return api},in(){return api},update(){return api},upsert(){return api},delete(){return api},maybeSingle:async()=>({data:null,error:null}),then(resolve,reject){return Promise.resolve({data:[],error:null}).then(resolve,reject)}};return api}window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'os338-test'}}}})},from:q})}})();`;

async function boot(page){
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',r=>r.fulfill({status:200,contentType:'application/javascript',body:fakeSdk}));
  await page.goto(BASE,{waitUntil:'domcontentloaded'});
  await expect(page.locator('#appView')).toBeVisible({timeout:10000});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.ticketDesk331||''),{timeout:10000}).toBe('1');
}

test('tickets have one render owner and do not blink',async({page})=>{
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e?.message||e)));
  await boot(page);

  await page.evaluate(()=>document.querySelector('#mainNav [data-view="tickets"]')?.click());
  const host=page.locator('#ticketIntelView');
  await expect(host).toBeVisible({timeout:10000});
  await expect.poll(()=>page.evaluate(()=>document.querySelector('#ticketIntelView')?.getAttribute('data-ticket-render-owner')||''),{timeout:10000}).toBe('ticketDesk331');
  await expect.poll(()=>page.evaluate(()=>!!document.querySelector('#ticketIntelView .td331')),{timeout:10000}).toBe(true);

  await page.waitForTimeout(2200);
  const probe=await page.evaluate(()=>{
    const el=document.querySelector('#ticketIntelView');
    if(!el)return null;
    window.__ticket338Mutations=0;
    window.__ticket338LoadingFlashes=0;
    const observer=new MutationObserver(()=>{
      window.__ticket338Mutations++;
      if(/Načítám Ticket Trading Desk/i.test(el.textContent||''))window.__ticket338LoadingFlashes++;
    });
    observer.observe(el,{childList:true,subtree:true,characterData:true});
    window.__ticket338Observer=observer;
    return {hasDesk:!!el.querySelector('.td331')};
  });
  expect(probe?.hasDesk).toBe(true);

  // Covers the 12 s OS333 ticket self-heal interval plus margin.
  await page.waitForTimeout(13000);
  const result=await page.evaluate(()=>{
    window.__ticket338Observer?.disconnect();
    const el=document.querySelector('#ticketIntelView');
    return {
      mutations:Number(window.__ticket338Mutations||0),
      loadingFlashes:Number(window.__ticket338LoadingFlashes||0),
      owner:el?.getAttribute('data-ticket-render-owner')||'',
      hasDesk:!!el?.querySelector('.td331'),
      hasLegacyWorkspace:!!el?.querySelector('[data-ticket-workspace210],.ticket-workspace210')
    };
  });

  expect(result.owner).toBe('ticketDesk331');
  expect(result.hasDesk).toBe(true);
  expect(result.hasLegacyWorkspace).toBe(false);
  expect(result.loadingFlashes).toBe(0);
  expect(result.mutations).toBeLessThanOrEqual(2);
  expect(pageErrors.filter(x=>/SyntaxError|Unexpected token|Cannot access .* before initialization/i.test(x))).toEqual([]);
});
