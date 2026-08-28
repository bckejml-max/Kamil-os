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
    window.__ticket338Trace={};
    const keyFor=node=>{
      const el=node?.nodeType===1?node:node?.parentElement;
      if(!el)return String(node?.nodeName||'unknown');
      const cls=String(el.className||'').trim().split(/\s+/).slice(0,2).join('.');
      return `${el.tagName.toLowerCase()}${el.id?'#'+el.id:''}${cls?'.'+cls:''}`;
    };
    const observer=new MutationObserver(records=>{
      window.__ticket338Mutations+=records.length;
      for(const r of records){
        const k=`${r.type}:${keyFor(r.target)}`;
        window.__ticket338Trace[k]=(window.__ticket338Trace[k]||0)+1;
      }
      if(/Načítám Ticket Trading Desk/i.test(el.textContent||''))window.__ticket338LoadingFlashes++;
    });
    observer.observe(el,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style']});
    window.__ticket338Observer=observer;
    return {hasDesk:!!el.querySelector('.td331')};
  });
  expect(probe?.hasDesk).toBe(true);

  await page.waitForTimeout(13000);
  const result=await page.evaluate(()=>{
    window.__ticket338Observer?.disconnect();
    const el=document.querySelector('#ticketIntelView');
    const trace=Object.entries(window.__ticket338Trace||{}).sort((a,b)=>b[1]-a[1]).slice(0,20);
    return {
      mutations:Number(window.__ticket338Mutations||0),
      loadingFlashes:Number(window.__ticket338LoadingFlashes||0),
      owner:el?.getAttribute('data-ticket-render-owner')||'',
      hasDesk:!!el?.querySelector('.td331'),
      hasLegacyWorkspace:!!el?.querySelector('[data-ticket-workspace210],.ticket-workspace210'),
      trace
    };
  });

  console.log('OS338 mutation trace',JSON.stringify(result));
  expect(result.owner).toBe('ticketDesk331');
  expect(result.hasDesk).toBe(true);
  expect(result.hasLegacyWorkspace).toBe(false);
  expect(result.loadingFlashes).toBe(0);
  expect(result.mutations).toBeLessThanOrEqual(2);
  expect(pageErrors.filter(x=>/SyntaxError|Unexpected token|Cannot access .* before initialization/i.test(x))).toEqual([]);
});
