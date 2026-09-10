import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const FORBIDDEN=['performance330.js','ticketQa332.js','ticketDesk331.js','bettingBootstrap543.js','runtimeCoordinator1050.js'];
const MAX_CRITICAL_MODULES=2,MAX_CRITICAL_MS=1500,MAX_SINGLE_CRITICAL_MS=3000,SAMPLE_COUNT=3;

async function boot(page){
 await page.addInitScript(()=>{window.__OS347_EVENT_ORDER__=[];window.addEventListener('kamil:boot-budget343',()=>window.__OS347_EVENT_ORDER__.push({name:'critical',at:performance.now()}));window.addEventListener('kamil:deferred345-complete',()=>window.__OS347_EVENT_ORDER__.push({name:'deferred',at:performance.now()}))});
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await expect(page.locator('[data-os2-today]')).toBeVisible({timeout:10000});
}
async function snapshot(page){return page.evaluate(()=>({boot:window.__KAMIL_BOOT_BUDGET343__,deferred:window.__KAMIL_DEFERRED345__,order:window.__OS347_EVENT_ORDER__,resources:performance.getEntriesByType('resource').map(x=>x.name)}))}
function assertCritical(s){expect(s.boot.architecture).toBe('os2-on-demand');expect(s.boot.healthy).toBe(true);expect(s.boot.failures).toHaveLength(0);expect(s.boot.modules.length).toBeLessThanOrEqual(MAX_CRITICAL_MODULES);expect(s.boot.modules.map(x=>x.path)).toContain('./app.js');for(const path of FORBIDDEN)expect(s.resources.some(x=>x.includes(path)),`${path} must stay off critical path`).toBe(false);expect(s.order[0]?.name).toBe('critical')}

test('OS2000 enforces a tiny interactive critical path',async({browser})=>{
 const samples=[];let last=null;
 for(let i=0;i<SAMPLE_COUNT;i++){const page=await browser.newPage();try{await boot(page);last=await snapshot(page);assertCritical(last);samples.push(last.boot.totalMs)}finally{await page.close()}}
 const sorted=[...samples].sort((a,b)=>a-b),median=sorted[Math.floor(sorted.length/2)],worst=Math.max(...samples);
 expect(median).toBeLessThanOrEqual(MAX_CRITICAL_MS);expect(worst).toBeLessThanOrEqual(MAX_SINGLE_CRITICAL_MS);
 console.log('OS2000_CRITICAL_PATH',JSON.stringify({samples,median,worst,moduleCount:last?.boot.modules.length,targetMs:MAX_CRITICAL_MS}));
});

test('OS2000 idle phase does not revive old analytics',async({page})=>{
 await boot(page);await expect.poll(()=>page.evaluate(()=>window.__KAMIL_DEFERRED345__?.complete),{timeout:5000}).toBe(true);await page.waitForTimeout(1200);
 const s=await snapshot(page);expect(s.deferred.mode).toBe('on-demand');expect(s.deferred.modules).toHaveLength(0);for(const path of FORBIDDEN)expect(s.resources.some(x=>x.includes(path))).toBe(false);
 const critical=s.order.find(x=>x.name==='critical'),deferred=s.order.find(x=>x.name==='deferred');expect(critical).toBeTruthy();expect(deferred).toBeTruthy();expect(deferred.at).toBeGreaterThanOrEqual(critical.at);
});

test('OS2000 critical snapshot stays immutable after Tickets loads',async({page})=>{
 await boot(page);const before=await page.evaluate(()=>({count:window.__KAMIL_BOOT_BUDGET343__.modules.length,paths:window.__KAMIL_BOOT_BUDGET343__.modules.map(x=>x.path)}));
 await page.locator('#mainNav [data-view="tickets"]').click();await expect(page.locator('#view-tickets')).toHaveClass(/on/);await expect.poll(()=>page.evaluate(()=>performance.getEntriesByType('resource').some(x=>x.name.includes('ticketDesk331.js'))),{timeout:15000}).toBe(true);
 const after=await page.evaluate(()=>({count:window.__KAMIL_BOOT_BUDGET343__.modules.length,paths:window.__KAMIL_BOOT_BUDGET343__.modules.map(x=>x.path)}));expect(after).toEqual(before);
});
