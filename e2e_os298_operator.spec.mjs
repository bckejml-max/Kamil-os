import {test,expect} from '@playwright/test';

test('OS298 boots AI Operator and preserves execution guardrails',async({page})=>{
 await page.setViewportSize({width:1792,height:828});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#appView')).toBeVisible({timeout:20000});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_LIFE_OPERATOR298__?.version),{timeout:20000}).toBe(298);
 await page.keyboard.press('Control+K');
 await expect(page.locator('.ux238-palette-row').filter({hasText:'Kamil AI Operator'})).toBeVisible();
 await page.keyboard.press('Escape');
 await page.keyboard.press('Alt+O');
 await expect(page.locator('.ux238-drawer')).toBeVisible();
 await expect(page.locator('.ux238-drawer-head').getByText('Kamil AI Operator',{exact:true})).toBeVisible();
 await expect(page.locator('.life298')).toBeVisible();
 const guard=await page.evaluate(()=>window.__KAMIL_LIFE_OPERATOR298__.build().guardrails);
 expect(guard).toEqual({autoFinancialExecution:false,autoTicketExecution:false,explicitConfirmationForWrites:true});
 await page.keyboard.press('Escape');
 const answer=await page.evaluate(()=>window.__KAMIL_LIFE_OPERATOR298__.answer('co dnes řešit'));
 expect(answer).not.toBeNull();
 expect(answer.title.length).toBeGreaterThan(3);
 const body=await page.evaluate(()=>({client:document.documentElement.clientHeight,scroll:document.documentElement.scrollHeight}));
 expect(body.scroll).toBeLessThanOrEqual(body.client+3);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(120);await page.keyboard.press('Alt+O');
 const box=await page.locator('.ux238-drawer').boundingBox();expect(box.width).toBeLessThanOrEqual(390);
});
