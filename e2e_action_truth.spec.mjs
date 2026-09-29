import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
async function boot(page,path=''){await page.goto(BASE+path,{waitUntil:'domcontentloaded'});await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true)}

test('Action Truth exposes one ranked cross-domain model',async({page})=>{
 await boot(page);
 const result=await page.evaluate(async()=>{const m=await import('./js/actionTruthEngine.js'),x=m.buildActionTruth741();return{version:x.version,counts:x.counts,primary:x.primary?{score:x.primary.score,why:x.primary.why,route:x.primary.route}:null,waiting:x.waiting.length,freshness:x.freshness.length,backup:x.backupHealth}});
 expect(result.version).toBe('741.0.0');
 expect(result.freshness).toBe(8);
 expect(result.counts).toHaveProperty('conflicts');
 expect(result.backup.stateValid).toBe(true);
 if(result.primary){expect(result.primary.score).toBeGreaterThanOrEqual(0);expect(result.primary.why.length).toBeGreaterThan(0);expect(result.primary.route.length).toBeGreaterThan(0)}
});

test('command palette remembers history, contextual hints and global search actions',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('#commandInput')).toHaveAttribute('placeholder',/účet|platbu|pojistku/i);
 await page.evaluate(async()=>{const {store}=await import('./js/state.js');store.mutate('e2e global search project',s=>{s.projects=s.projects||[];s.projects.push({id:'e2e-global-project',name:'Projekt Hvězda 741',status:'ACTIVE'})},{undo:false,cloud:false,audit:false})});
 await page.locator('#commandInput').fill('Projekt Hvězda 741');
 await expect(page.locator('[data-command-task741]').first()).toBeVisible({timeout:10000});
 await page.locator('#commandInput').fill('ukaž práci');
 await page.locator('#commandInput').press('Enter');
 await expect(page.locator('#view-work')).toHaveClass(/on/);
 const hist=await page.evaluate(()=>JSON.parse(localStorage.getItem('kamil-os-command-history-v1')||'[]'));
 expect(hist[0]).toContain('ukaž práci');
});

test('soft delete keeps a reversible 30 day trash record',async({page})=>{
 await boot(page);
 const result=await page.evaluate(async()=>{
  const {store}=await import('./js/state.js');
  let id='';
  store.mutate('e2e property seed',s=>{s.propertyBook=s.propertyBook||{candidates:[],mortgageScenario:{}};id='e2e-property-'+Date.now();s.propertyBook.candidates.push({id,name:'E2E kandidát',status:'REMOVED',url:'https://example.test/e2e'})},{undo:false,cloud:false,audit:false});
  const moved=store.softDelete('e2e trash',{path:'propertyBook.candidates',id}),trash=store.get().trash.items.find(x=>x.sourceId===id),restored=trash?store.restoreTrash(trash.id):false;
  return{moved:!!moved,trash:!!trash,restored,back:store.get().propertyBook.candidates.some(x=>x.id===id)};
 });
 expect(result).toEqual({moved:true,trash:true,restored:true,back:true});
});

test('all ten views keep a mobile visual layout contract',async({page})=>{
 await page.setViewportSize({width:390,height:844});await boot(page);
 const views=['today','inbox','work','tickets','money','property','betting','family','home','more'];
 for(const view of views){
  await page.locator('#bottomNav [data-view="'+view+'"]').click();
  await expect(page.locator('#view-'+view)).toHaveClass(/on/);
  const layout=await page.evaluate(v=>{const el=document.querySelector('#view-'+v),nav=document.querySelector('#bottomNav'),buttons=[...nav.querySelectorAll('[data-view]')],r=el?.getBoundingClientRect();return{docOverflow:document.documentElement.scrollWidth-window.innerWidth,viewWidth:r?.width||0,visible:!!r&&r.width>0&&r.height>0,navCount:buttons.length,navOverflow:nav.scrollWidth-nav.clientWidth}},view);
  expect(layout.visible).toBe(true);expect(layout.navCount).toBe(10);expect(layout.docOverflow).toBeLessThanOrEqual(2);expect(layout.navOverflow).toBeLessThanOrEqual(2);
  const shot=await page.screenshot({fullPage:false});expect(shot.byteLength).toBeGreaterThan(4000);
 }
});

test('canonical shell keyboard and accessible-name audit',async({page})=>{
 await boot(page);
 await page.keyboard.press('Control+K');await expect(page.locator('#commandInput')).toBeFocused();
 const audit=await page.evaluate(()=>{
  const buttons=[...document.querySelectorAll('#appView button')],nameless=buttons.filter(b=>!String(b.getAttribute('aria-label')||b.getAttribute('title')||b.textContent||'').trim()).length,ids=[...document.querySelectorAll('[id]')].map(x=>x.id),duplicates=ids.filter((x,i)=>ids.indexOf(x)!==i);
  return{buttons:buttons.length,nameless,duplicates:[...new Set(duplicates)],current:document.querySelector('#mainNav [aria-current="page"]')?.dataset.view||null};
 });
 expect(audit.buttons).toBeGreaterThan(10);expect(audit.nameless).toBe(0);expect(audit.duplicates).toEqual([]);expect(audit.current).toBe('today');
});
