import {test,expect} from '@playwright/test';

test('OS278 boots all command centers and keeps app usable',async({page})=>{
 await page.setViewportSize({width:1792,height:828});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#appView')).toBeVisible({timeout:20000});
 await expect.poll(()=>page.evaluate(()=>({ux:window.__KAMIL_UX_FOUNDATION238__?.version,daily:window.__KAMIL_DAILY_COMMANDER248__?.version,fin:window.__KAMIL_FINANCE_COMMAND258__?.version,tic:window.__KAMIL_TICKET_COMMAND268__?.version,auto:window.__KAMIL_AUTOPILOT278__?.version})),{timeout:20000}).toEqual({ux:238,daily:248,fin:258,tic:268,auto:278});

 await page.keyboard.press('Control+K');
 await expect(page.getByText('Kamil OS Autopilot')).toBeVisible();
 await expect(page.getByText('Denní briefing')).toBeVisible();
 await expect(page.getByText('Finance Command Center')).toBeVisible();
 await expect(page.getByText('Ticket Intelligence 2.0')).toBeVisible();
 await page.keyboard.press('Escape');

 await page.keyboard.press('Alt+B');
 await expect(page.locator('.ux238-drawer')).toBeVisible();
 await expect(page.getByText('Denní briefing')).toBeVisible();
 await page.keyboard.press('Escape');

 await page.keyboard.press('Alt+F');
 await expect(page.getByText('Finance Command Center')).toBeVisible();
 await page.keyboard.press('Escape');

 await page.keyboard.press('Alt+T');
 await expect(page.getByText('Ticket Intelligence 2.0')).toBeVisible();
 await page.keyboard.press('Escape');

 await page.keyboard.press('Alt+A');
 await expect(page.getByText('Kamil OS Autopilot')).toBeVisible();
 await expect(page.locator('.auto278')).toBeVisible();
 await page.keyboard.press('Escape');

 const guardrails=await page.evaluate(()=>window.__KAMIL_AUTOPILOT278__.build().guardrails);
 expect(guardrails).toEqual({autoMutate:false,financialExecution:false,ticketExecution:false,confirmationRequired:true});
 const ticketGuard=await page.evaluate(()=>window.__KAMIL_TICKET_COMMAND268__.build().guardrails);
 expect(ticketGuard.autoExecute).toBe(false);
 expect(ticketGuard.requiresExplicitConfirmation).toBe(true);

 const body=await page.evaluate(()=>({client:document.documentElement.clientHeight,scroll:document.documentElement.scrollHeight}));
 expect(body.scroll).toBeLessThanOrEqual(body.client+3);

 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(120);
 await page.keyboard.press('Alt+A');
 await expect(page.locator('.ux238-drawer')).toBeVisible();
 const box=await page.locator('.ux238-drawer').boundingBox();
 expect(box.width).toBeLessThanOrEqual(390);
});
