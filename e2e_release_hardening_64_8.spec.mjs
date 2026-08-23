import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('64.8 personal shell has no legacy UI leakage',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__KAMIL_PERSONAL_HARDENING_648__?.bound===true);
 const out=await page.evaluate(async()=>{
  const hardening=await import('./js/personalHardening648.js');
  const runtime=await import('./js/viewRuntime41.js');
  const release=await import('./js/releaseMeta.js');
  const first=hardening.personalReleasePreflight648();
  const pf=await runtime.runPreflight41();
  return{version:release.APP_VERSION,first,pf,body:document.body.innerText,pageTitle:document.querySelector('#pageTitle')?.textContent,sub:document.querySelector('.sidebar-sub')?.textContent};
 });
 expect(out.version).toBe('64.8.0');
 expect(out.first.ok).toBe(true);expect(out.pf.ok).toBe(true);expect(out.pf.personalUx).toBe('64.8');
 expect(out.body).not.toContain('VSTUPENKY');expect(out.body).not.toContain('Pohledávka');expect(out.body).not.toContain('Personal Home');
 expect(out.pageTitle).toBe('DNES');expect(out.sub).toBe('Osobní přehled');
});

test('64.8 navigation keeps plain-language personal labels',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__KAMIL_PERSONAL_HARDENING_648__?.bound===true);
 for(const [view,label] of [['tickets','RODINA'],['home','DOMOV'],['money','PENÍZE'],['more','DOKUMENTY']]){
  await page.evaluate(v=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:v})),view);
  await expect(page.locator('#pageTitle')).toHaveText(label);
 }
});
