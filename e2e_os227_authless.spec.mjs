import {test,expect} from '@playwright/test';
test('OS227 keeps auth/password UI out of the normal single-user experience',async({page})=>{
 await page.setViewportSize({width:1792,height:828});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#appView')).toBeVisible({timeout:20000});
 await expect(page.locator('#authView')).toBeHidden();
 await expect(page.locator('#resetView')).toBeHidden();
 await expect(page.locator('input[type="password"]:visible')).toHaveCount(0);
 await expect(page.getByText('Připojit heslem')).toHaveCount(0);
 await expect(page.getByText('Obnovit cloudové heslo')).toHaveCount(0);
 const sync=page.locator('#syncStatus');
 await expect(sync).toBeVisible();
 const pointer=await sync.evaluate(el=>getComputedStyle(el).pointerEvents);
 expect(pointer).toBe('none');
 await expect(page.locator('[data-today-dashboard213]')).toBeVisible({timeout:20000});
 const body=await page.evaluate(()=>({client:document.documentElement.clientHeight,scroll:document.documentElement.scrollHeight}));
 expect(body.scroll).toBeLessThanOrEqual(body.client+3);
});
