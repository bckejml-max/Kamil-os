import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('current personal shell has no legacy UI leakage',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__KAMIL_PERSONAL_HARDENING_650__?.bound===true);
 const out=await page.evaluate(async()=>{
  const hardening=await import('./js/personalHardening650.js');
  const runtime=await import('./js/viewRuntime41.js');
  const release=await import('./js/releaseMeta.js');
  const first=hardening.personalReleasePreflight650();
  const pf=await runtime.runPreflight41();
  return{version:release.APP_VERSION,release:release.APP_RELEASE,first,pf,body:document.body.innerText,pageTitle:document.querySelector('#pageTitle')?.textContent,sub:document.querySelector('.sidebar-sub')?.textContent};
 });
 expect(out.version).toBe('66.0.0');expect(out.release).toBe('66.0');
 expect(out.first.ok).toBe(true);expect(out.pf.ok).toBe(true);expect(out.pf.personalUx).toBe(out.release);
 expect(out.body).not.toContain('VSTUPENKY');expect(out.body).not.toContain('Pohledávka');expect(out.body).not.toContain('Personal Home');
 expect(out.pageTitle).toBe('DNES');expect(out.sub).toBe('Osobní asistent');
});

test('current navigation keeps plain-language personal labels',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__KAMIL_PERSONAL_HARDENING_650__?.bound===true);
 for(const [view,label] of [['tickets','RODINA'],['home','DOMOV'],['money','PENÍZE'],['more','DOKUMENTY']]){
  await page.evaluate(v=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:v})),view);
  await expect(page.locator('#pageTitle')).toHaveText(label);
 }
});
