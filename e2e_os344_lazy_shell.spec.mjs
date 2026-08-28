import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const fakeSdk=`(()=>{function q(){const api={select(){return api},order(){return api},limit(){return api},is(){return api},eq(){return api},in(){return api},update(){return api},upsert(){return api},delete(){return api},maybeSingle:async()=>({data:null,error:null}),then(resolve,reject){return Promise.resolve({data:[],error:null}).then(resolve,reject)}};return api}window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'os344-test'}}}})},from:q})}})();`;
async function boot(page){
 await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',r=>r.fulfill({status:200,contentType:'application/javascript',body:fakeSdk}));
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_PERSONAL_SHELL344__?.version),{timeout:5000}).toBe(344);
}
test('OS344 keeps command AI out of the critical personal-shell boot',async({page})=>{
 await boot(page);
 const s=await page.evaluate(()=>({shell:window.__KAMIL_PERSONAL_SHELL344__,boot:window.__KAMIL_BOOT_BUDGET343__}));
 expect(s.shell.healthy).toBe(true);
 expect(s.shell.lazyLoaded).not.toContain('./personalAsk640.js');
 expect(s.shell.lazyLoaded).not.toContain('./lifeOperator298.js');
 const shellTiming=s.boot.modules.find(x=>x.path==='./personalShell640.js');
 expect(shellTiming?.ok).toBe(true);
 console.log('OS344_SHELL_PROFILE',JSON.stringify({totalMs:s.boot.totalMs,personalShellMs:shellTiming?.ms,lazyLoaded:s.shell.lazyLoaded}));
});
test('OS344 loads command AI only when the user actually asks',async({page})=>{
 await boot(page);
 const input=page.locator('#commandInput');
 await input.fill('co dnes řešit');
 await input.press('Enter');
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_PERSONAL_SHELL344__?.lazyLoaded?.includes('./personalAsk640.js')),{timeout:5000}).toBe(true);
 const lazy=await page.evaluate(()=>window.__KAMIL_PERSONAL_SHELL344__.lazyLoaded);
 expect(lazy).toContain('./lifeOperator298.js');
 expect(lazy).toContain('./personalAsk640.js');
});
