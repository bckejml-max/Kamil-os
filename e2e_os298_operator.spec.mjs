import {test,expect} from '@playwright/test';

test('OS333 replaces legacy operator home while preserving safe execution',async({page})=>{
 await page.setViewportSize({width:1792,height:828});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#appView')).toBeVisible({timeout:20000});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_OS333__?.version),{timeout:20000}).toBe(333);
 await expect(page.locator('[data-os333-exec]')).toBeVisible();
 await expect(page.locator('[data-os80-command]')).toBeHidden();
 expect(await page.evaluate(()=>({life:window.__KAMIL_LIFE_OPERATOR298__,home:window.__KAMIL_OPERATOR_HOME299__}))).toEqual({life:undefined,home:undefined});
 await page.keyboard.press('Control+K');
 await expect(page.locator('.ux238-palette')).toBeVisible();
 await page.keyboard.press('Escape');
 const ticketGuard=await page.evaluate(()=>window.__KAMIL_TICKET_COMMAND268__.build().guardrails);
 expect(ticketGuard.autoExecute).toBe(false);
 expect(ticketGuard.requiresExplicitConfirmation).toBe(true);
 const health=await page.evaluate(()=>window.__KAMIL_OS333__.health());
 expect(health.checks.some(([name])=>name==='Boot errors')).toBe(true);
 const body=await page.evaluate(()=>({client:document.documentElement.clientHeight,scroll:document.documentElement.scrollHeight}));
 expect(body.scroll).toBeLessThanOrEqual(body.client+3);
 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(150);
 await expect(page.locator('[data-os333-exec]')).toBeVisible();
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 expect(overflow).toBeLessThanOrEqual(2);
});
