import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
async function boot(page){await page.goto(BASE,{waitUntil:'domcontentloaded'});await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true)}
const views=['today','inbox','work','tickets','money','property','betting','family','home','more'];

test('OS747 mobile matrix keeps every canonical view usable and readable',async({page})=>{
 const pageErrors=[],consoleErrors=[];
 page.on('pageerror',e=>pageErrors.push(String(e?.message||e)));
 page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
 for(const width of [320,360,390,430]){
  await page.setViewportSize({width,height:844});
  await boot(page);
  for(const view of views){
   await page.locator(`#bottomNav [data-view="${view}"]`).click();
   await expect(page.locator(`#view-${view}`)).toHaveClass(/on/);
   const metrics=await page.evaluate(()=>{
    const nav=[...document.querySelectorAll('#bottomNav button')];
    const visibleButtons=[...document.querySelectorAll('button')].filter(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'});
    const unnamed=visibleButtons.filter(el=>!(el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent||'').trim()).length;
    return{
     overflow:Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth,
     navFont:Math.min(...nav.map(el=>parseFloat(getComputedStyle(el).fontSize)||0)),
     minNavWidth:Math.min(...nav.map(el=>el.getBoundingClientRect().width)),
     minNavHeight:Math.min(...nav.map(el=>el.getBoundingClientRect().height)),
     unnamed
    };
   });
   expect(metrics.overflow,`overflow ${width}px / ${view}`).toBeLessThanOrEqual(2);
   expect(metrics.navFont,`nav font ${width}px`).toBeGreaterThanOrEqual(10);
   expect(metrics.minNavWidth,`nav touch width ${width}px`).toBeGreaterThanOrEqual(32);
   expect(metrics.minNavHeight,`nav touch height ${width}px`).toBeGreaterThanOrEqual(32);
   expect(metrics.unnamed,`unnamed visible button ${width}px / ${view}`).toBe(0);
  }
 }
 expect(pageErrors).toEqual([]);
 expect(consoleErrors).toEqual([]);
});

test('OS747 mobile shell owns safe-area spacing and keyboard focus',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await boot(page);
 const css=await page.evaluate(()=>fetch('./os-canonical.css').then(r=>r.text()));
 expect(css).toContain('env(safe-area-inset-bottom)');
 expect(css).toContain('env(safe-area-inset-left)');
 expect(css).toContain('env(safe-area-inset-right)');
 await page.keyboard.press('Tab');
 const focused=await page.evaluate(()=>{const el=document.activeElement;return !!el&&el!==document.body&&el!==document.documentElement});
 expect(focused).toBe(true);
});
