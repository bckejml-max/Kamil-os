import {test,expect} from '@playwright/test';
test('OS213 today is one-screen dashboard',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 const dashboard=page.locator('[data-today-dashboard213]');
 await expect(dashboard).toBeVisible({timeout:20000});
 await expect(page.locator('#todayView [data-app-workspace211]')).toHaveCount(0);
 const actions=dashboard.locator('[data-action213]');
 expect(await actions.count()).toBeGreaterThanOrEqual(5);
 await expect(dashboard.locator('.today213-commander')).toBeVisible();
 const fit=await page.locator('#todayView').evaluate(el=>({client:el.clientHeight,scroll:el.scrollHeight}));
 expect(fit.scroll).toBeLessThanOrEqual(fit.client+3);
 const body=await page.evaluate(()=>({client:document.documentElement.clientHeight,scroll:document.documentElement.scrollHeight}));
 expect(body.scroll).toBeLessThanOrEqual(body.client+3);
});
