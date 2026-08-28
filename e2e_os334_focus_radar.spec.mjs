import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

async function waitForRadar(page){
 try{await page.locator('[data-focus-radar334]').waitFor({state:'visible',timeout:8000})}
 catch(error){
  const diagnostic=await page.evaluate(async()=>{
   let directImport=null;
   try{const m=await import('./js/focusRadar334.js');directImport={ok:true,exports:Object.keys(m)}}catch(e){directImport={ok:false,error:String(e?.stack||e?.message||e)}}
   return{boot:window.__KAMIL_BOOT_ERRORS__||[],focus:window.__KAMIL_FOCUS_RADAR334__||null,dataset:document.documentElement.dataset.focusRadar334||null,todayChildren:document.querySelector('#todayView')?.children?.length||0,directImport};
  });
  throw new Error(`OS334 Focus Radar missing: ${JSON.stringify(diagnostic)}`);
 }
}

test('OS334 Focus Radar renders and routes actions',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(String(e?.message||e)));
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.locator('#todayView')).toBeVisible({timeout:8000});
 await waitForRadar(page);
 const radar=page.locator('[data-focus-radar334]');
 await expect(radar.getByText('Focus Radar',{exact:true})).toBeVisible();
 await expect(radar.locator('[data-focus334-open]')).toHaveCount(5);
 const state=await page.evaluate(()=>({version:window.__KAMIL_FOCUS_RADAR334__?.version,best:window.__KAMIL_FOCUS_RADAR334__?.model?.best?.key,score:window.__KAMIL_FOCUS_RADAR334__?.model?.best?.score,healthy:window.__KAMIL_FOCUS_RADAR334__?.healthy}));
 expect(state.version).toBe(334);
 expect(state.healthy).toBe(true);
 expect(['manager','tickets','property','money']).toContain(state.best);
 expect(Number(state.score)).toBeGreaterThanOrEqual(0);
 expect(errors.filter(x=>/SyntaxError|Unexpected token|Cannot access .* before initialization/i.test(x))).toEqual([]);
});

test('OS334 Focus Radar stays inside mobile viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await waitForRadar(page);
 const dims=await page.locator('[data-focus-radar334]').evaluate(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,width:document.documentElement.clientWidth}));
 expect(dims.left).toBeGreaterThanOrEqual(-1);
 expect(dims.right).toBeLessThanOrEqual(dims.width+1);
});