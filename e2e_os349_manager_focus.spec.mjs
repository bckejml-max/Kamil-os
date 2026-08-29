import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const fakeSdk=`(()=>{function q(){const api={select(){return api},order(){return api},limit(){return api},is(){return api},eq(){return api},in(){return api},update(){return api},upsert(){return api},delete(){return api},maybeSingle:async()=>({data:null,error:null}),then(resolve,reject){return Promise.resolve({data:[],error:null}).then(resolve,reject)}};return api}window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'os349-test'}}}})},from:q})}})();`;
async function boot(page){
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',r=>r.fulfill({status:200,contentType:'application/javascript',body:fakeSdk}));
  await page.goto(BASE,{waitUntil:'domcontentloaded'});
  await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
  await expect.poll(()=>page.evaluate(()=>window.__KAMIL_FOCUS_QUEUE335__?.healthy),{timeout:5000}).toBe(true);
}

test('OS349 promotes urgent monthly manager duties into the global focus queue',async({page})=>{
  await boot(page);
  await page.evaluate(()=>{
    window.__KAMIL_MANAGER_OS341__={
      version:341,
      model:{duties:[{id:'supplier-invoicing',label:'Fakturace na dodavatele',state:'overdue',diff:-4,isDone:false}]},
      open:()=>{window.__OS349_MANAGER_OPENED__=true}
    };
    window.__KAMIL_FOCUS_QUEUE335__.refresh();
  });
  await expect.poll(()=>page.evaluate(()=>window.__KAMIL_FOCUS_QUEUE335__?.model?.queue?.find(x=>x.refType==='manager-duty')?.refId)).toBe('supplier-invoicing');
  const model=await page.evaluate(()=>window.__KAMIL_FOCUS_QUEUE335__.model);
  expect(model.version).toBe(349);
  expect(model.queue[0].title).toBe('Fakturace na dodavatele');
  expect(model.queue[0].reason).toContain('měsíční povinnost');
  await page.locator('[data-focus335-current] button').click();
  await expect.poll(()=>page.evaluate(()=>window.__OS349_MANAGER_OPENED__)).toBe(true);
});

test('OS349 ignores completed monthly duties',async({page})=>{
  await boot(page);
  await page.evaluate(()=>{
    window.__KAMIL_MANAGER_OS341__={version:341,model:{duties:[{id:'month-close',label:'Cestovní příkaz + docházka',state:'done',diff:0,isDone:true}]}};
    window.__KAMIL_FOCUS_QUEUE335__.refresh();
  });
  const duties=await page.evaluate(()=>window.__KAMIL_FOCUS_QUEUE335__.model.queue.filter(x=>x.refType==='manager-duty'));
  expect(duties).toHaveLength(0);
});
