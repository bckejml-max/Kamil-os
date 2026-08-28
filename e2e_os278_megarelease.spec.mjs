import {test,expect} from '@playwright/test';

test('canonical command centers boot and keep app usable on OS333',async({page})=>{
 await page.setViewportSize({width:1792,height:828});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#appView')).toBeVisible({timeout:20000});
 await expect.poll(()=>page.evaluate(()=>({ux:window.__KAMIL_UX_FOUNDATION238__?.version,fin:window.__KAMIL_FINANCE_COMMAND258__?.version,tic:window.__KAMIL_TICKET_COMMAND268__?.version,os:window.__KAMIL_OS333__?.version,res:window.__KAMIL_OS333_RESILIENCE__?.version})),{timeout:20000}).toEqual({ux:238,fin:258,tic:268,os:333,res:333});
 await expect(page.locator('[data-os333-exec]')).toBeVisible();
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('kamil:navigate',{detail:{view:'money'}})));
 await expect(page.locator('#moneyView [data-os333-invest]')).toBeVisible({timeout:10000});
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('kamil:navigate',{detail:{view:'tickets'}})));
 await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.ticketDesk331||''),{timeout:10000}).toBe('1');
 const ticketGuard=await page.evaluate(()=>window.__KAMIL_TICKET_COMMAND268__.build().guardrails);
 expect(ticketGuard.autoExecute).toBe(false);
 expect(ticketGuard.requiresExplicitConfirmation).toBe(true);
 const health=await page.evaluate(()=>window.__KAMIL_OS333__.health());
 expect(Array.isArray(health.checks)).toBe(true);
 expect(health.checks.some(([name])=>name==='Tickets')).toBe(true);
 expect(await page.evaluate(()=>({daily:window.__KAMIL_DAILY_COMMANDER248__,auto:window.__KAMIL_AUTOPILOT278__}))).toEqual({daily:undefined,auto:undefined});
 const body=await page.evaluate(()=>({client:document.documentElement.clientHeight,scroll:document.documentElement.scrollHeight}));
 expect(body.scroll).toBeLessThanOrEqual(body.client+3);
 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(150);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 expect(overflow).toBeLessThanOrEqual(2);
});
