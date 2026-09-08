import {test,expect} from '@playwright/test';
test('production chrome stays clean and no-scroll on OS333',async({page})=>{
 await page.setViewportSize({width:1792,height:828});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#appView')).toBeVisible({timeout:20000});
 await expect(page.locator('[data-os333-exec]')).toBeHidden({timeout:20000});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_UX_FOUNDATION238__?.version||0),{timeout:20000}).toBe(238);
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_OS333__?.version||0),{timeout:20000}).toBe(333);
 await expect(page.locator('#syncStatus')).toBeHidden();
 await expect(page.locator('#commandInput')).toHaveAttribute('placeholder',/(hledej|zeptej)/i);
 await expect(page.locator('#commandInput')).toHaveAttribute('aria-label','Hledej nebo se zeptej v Kamil OS');
 await expect(page.locator('#commandGo')).toHaveAttribute('aria-label','Spustit hledání');
 await expect(page.locator('#quickAddBtn')).toBeVisible();
 await expect(page.locator('#quickAddBtn')).toHaveAttribute('aria-label','Rychle přidat');
 await expect(page.locator('#quickAddBtn')).toHaveAttribute('data-ux238-owned','1');
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_PRODUCTION_CHROME228__?.version||0)).toBe(228);
 const diag=await page.evaluate(()=>{
  const label=el=>el.id?`#${el.id}`:el.classList?.length?`${el.tagName.toLowerCase()}.${[...el.classList].slice(0,3).join('.')}`:el.tagName.toLowerCase();
  const snap=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return{el:label(el),top:Math.round(r.top),bottom:Math.round(r.bottom),height:Math.round(r.height),offsetTop:el.offsetTop,display:s.display,position:s.position,topCss:s.top,overflow:s.overflow,overflowY:s.overflowY,boxSizing:s.boxSizing,paddingTop:s.paddingTop,paddingBottom:s.paddingBottom,marginTop:s.marginTop,marginBottom:s.marginBottom,borderTop:s.borderTop,borderTopWidth:s.borderTopWidth,transform:s.transform,translate:s.translate,cssHeight:s.height,minHeight:s.minHeight,maxHeight:s.maxHeight,style:el.getAttribute('style')||''}};
  const core=['html','body','#appView','.workspace','.sidebar','.topbar','.command-wrap','main','#bottomNav','#modalHost','#toastHost'].map(x=>document.querySelector(x)).filter(Boolean).map(snap);
  const offenders=[...document.body.querySelectorAll('*')].filter(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&r.height>0&&r.bottom>innerHeight+3&&s.position!=='fixed'}).map(snap).sort((a,b)=>b.bottom-a.bottom).slice(0,18);
  const html=getComputedStyle(document.documentElement),body=getComputedStyle(document.body),hBefore=getComputedStyle(document.documentElement,'::before'),hAfter=getComputedStyle(document.documentElement,'::after'),bBefore=getComputedStyle(document.body,'::before'),bAfter=getComputedStyle(document.body,'::after');
  const pseudo=s=>({content:s.content,display:s.display,position:s.position,height:s.height,marginTop:s.marginTop,marginBottom:s.marginBottom,paddingTop:s.paddingTop,paddingBottom:s.paddingBottom,borderTop:s.borderTop,top:s.top});
  const direct=[...document.body.children].map(snap);
  return{innerHeight,client:document.documentElement.clientHeight,scroll:document.documentElement.scrollHeight,bodyScroll:document.body.scrollHeight,scrollState:{scrollY:window.scrollY,pageYOffset:window.pageYOffset,htmlScrollTop:document.documentElement.scrollTop,bodyScrollTop:document.body.scrollTop,scrollingElement:document.scrollingElement?.tagName||'',visualViewport:window.visualViewport?{offsetTop:visualViewport.offsetTop,pageTop:visualViewport.pageTop,height:visualViewport.height}:null},root:{htmlPaddingTop:html.paddingTop,htmlMarginTop:html.marginTop,htmlBorderTop:html.borderTop,bodyPaddingTop:body.paddingTop,bodyMarginTop:body.marginTop,bodyBorderTop:body.borderTop,htmlTransform:html.transform,bodyTransform:body.transform,htmlStyle:document.documentElement.getAttribute('style')||'',bodyStyle:document.body.getAttribute('style')||'',bodyOffsetTop:document.body.offsetTop,appOffsetTop:document.querySelector('#appView')?.offsetTop??null},pseudo:{htmlBefore:pseudo(hBefore),htmlAfter:pseudo(hAfter),bodyBefore:pseudo(bBefore),bodyAfter:pseudo(bAfter)},direct,core,offenders};
 });
 console.log('OS228_OVERFLOW_DIAG',JSON.stringify(diag));
 expect(diag.scroll).toBeLessThanOrEqual(diag.client+3);
});
