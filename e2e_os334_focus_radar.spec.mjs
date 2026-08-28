import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('OS334 Focus Radar renders and routes actions',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(String(e?.message||e)));
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.locator('#todayView')).toBeVisible({timeout:8000});
 const radar=page.locator('[data-focus-radar334]');
 await expect(radar).toBeVisible({timeout:8000});
 await expect(radar.getByText('Focus Radar',{exact:true})).toBeVisible();
 await expect(radar.locator('[data-focus334-open]')).toHaveCount(5);
 const state=await page.evaluate(()=>({version:window.__KAMIL_FOCUS_RADAR334__?.version,best:window.__KAMIL_FOCUS_RADAR334__?.model?.best?.key,score:window.__KAMIL_FOCUS_RADAR334__?.model?.best?.score}));
 expect(state.version).toBe(334);
 expect(['manager','tickets','property','money']).toContain(state.best);
 expect(Number(state.score)).toBeGreaterThanOrEqual(0);
 expect(errors.filter(x=>/SyntaxError|Unexpected token|Cannot access .* before initialization/i.test(x))).toEqual([]);
});

test('OS334 Focus Radar stays inside mobile viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.locator('[data-focus-radar334]')).toBeVisible({timeout:8000});
 const dims=await page.locator('[data-focus-radar334]').evaluate(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,width:document.documentElement.clientWidth}));
 expect(dims.left).toBeGreaterThanOrEqual(-1);
 expect(dims.right).toBeLessThanOrEqual(dims.width+1);
});