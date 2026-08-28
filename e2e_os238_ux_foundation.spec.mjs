import {test,expect} from '@playwright/test';

test('OS238 UX Foundation works on desktop and mobile',async({page})=>{
 await page.setViewportSize({width:1792,height:828});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#appView')).toBeVisible({timeout:20000});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_UX_FOUNDATION238__?.version||0),{timeout:20000}).toBe(238);

 await page.keyboard.press('Control+K');
 await expect(page.locator('.ux238-palette')).toBeVisible();
 await expect(page.getByText('Command Palette')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.locator('.ux238-palette')).toHaveCount(0);

 await page.locator('#quickAddBtn').click();
 await expect(page.locator('.ux238-addmenu')).toBeVisible();
 await expect(page.getByText('Přidat do Kamil OS')).toBeVisible();
 await expect(page.locator('.ux238-add-grid button')).toHaveCount(4);
 await page.keyboard.press('Escape');

 const before=await page.evaluate(()=>document.documentElement.dataset.density238);
 await page.keyboard.press('Shift+D');
 const after=await page.evaluate(()=>document.documentElement.dataset.density238);
 expect(after).not.toBe(before);

 await page.keyboard.press('Alt+5');
 await expect(page.locator('[data-view="money"].on').first()).toBeVisible();
 await page.keyboard.press('Alt+1');
 await expect(page.locator('[data-view="today"].on').first()).toBeVisible();

 const body=await page.evaluate(()=>({client:document.documentElement.clientHeight,scroll:document.documentElement.scrollHeight}));
 expect(body.scroll).toBeLessThanOrEqual(body.client+3);

 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(180);
 const mobileState=await page.locator('#bottomNav button').evaluateAll(btns=>btns.map(b=>({view:b.dataset.view||null,personalMore:b.hasAttribute('data-personal-more'),display:getComputedStyle(b).display,hidden:b.hidden,style:b.getAttribute('style'),ariaHidden:b.getAttribute('aria-hidden'),classes:b.className,text:b.textContent.trim().replace(/\s+/g,' ')})));
 const viewportState=await page.evaluate(()=>({innerWidth:window.innerWidth,clientWidth:document.documentElement.clientWidth,mq850:matchMedia('(max-width:850px)').matches,mq430:matchMedia('(max-width:430px)').matches,debug:window.__KAMIL_MOBILE_NAV238__||null,bottomDisplay:getComputedStyle(document.querySelector('#bottomNav')).display,bottomColumns:getComputedStyle(document.querySelector('#bottomNav')).gridTemplateColumns}));
 console.log('MOBILE_NAV_DIAG',JSON.stringify({mobileState,viewportState}));
 const visibleBottom=mobileState.filter(b=>b.display!=='none').length;
 expect(visibleBottom).toBeLessThanOrEqual(5);
 await expect(page.locator('#bottomNav')).toBeVisible();
});
