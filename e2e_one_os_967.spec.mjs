import {test,expect} from '@playwright/test';

test('OS967 One OS replaces Today surface and opens core centers',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_ONE_OS967__?.version||''),{timeout:20000}).toBe('967.0.0');
 const one=page.locator('[data-oneos967]');
 await expect(one).toBeVisible();
 await expect(one.getByRole('heading',{name:'Dnes'})).toBeVisible();
 await expect(one.getByRole('button',{name:'Action Center'})).toBeVisible();
 await one.getByRole('button',{name:'Peníze'}).click();
 await expect(page.getByText('Money Cockpit 2.0 · OS954')).toBeVisible();
 await page.getByRole('button',{name:'Zavřít'}).last().click();
 const input=page.locator('#commandInput');
 await input.fill('/os');
 await input.press('Enter');
 await expect(page.getByText('Kamil OS Autopilot · OS967')).toBeVisible();
 await page.getByRole('button',{name:'Zavřít'}).last().click();
});

test('OS967 mobile exposes one dominant next-action control',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_ONE_OS967__?.version||''),{timeout:20000}).toBe('967.0.0');
 await expect(page.locator('[data-oneos967]')).toBeVisible();
 const mobile=page.locator('[data-oneos-mobile965]');
 await expect(mobile).toBeVisible();
 const visibleNav=await page.locator('#bottomNav button').evaluateAll(btns=>btns.filter(b=>getComputedStyle(b).display!=='none').length);
 expect(visibleNav).toBe(6);
 await mobile.click();
 await expect(page.getByText('Kamil OS Autopilot · OS967')).toBeVisible();
});
