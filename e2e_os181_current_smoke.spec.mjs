import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('OS 181 boots and canonical navigation stays usable',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(String(e?.message||e)));
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.locator('#appView')).toBeVisible({timeout:8000});
 await expect(page.locator('#todayView')).toBeVisible();
 await expect(page.getByText('Kamil OS se nepodařilo načíst',{exact:false})).toHaveCount(0);
 await expect(page.getByText('Kamil OS se nepodařilo plně načíst',{exact:false})).toHaveCount(0);
 await expect(page.locator('#mainNav [data-view="today"]')).toHaveAttribute('aria-current','page');
 await page.locator('#mainNav [data-view="home"]').click();
 await expect(page.locator('#view-home')).toHaveClass(/on/);
 await expect(page.locator('#homeView')).toBeVisible();
 await page.locator('#mainNav [data-view="family"]').click();
 await expect(page.locator('#view-family')).toHaveClass(/on/);
 await page.locator('#mainNav [data-view="today"]').click();
 await expect(page.locator('#view-today')).toHaveClass(/on/);
 expect(errors.filter(x=>/SyntaxError|Unexpected token|Cannot access .* before initialization/i.test(x))).toEqual([]);
});

test('OS 181 shell does not overflow mobile viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.locator('#appView')).toBeVisible({timeout:8000});
 const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,bottom:document.querySelector('#bottomNav')?.getBoundingClientRect().width||0}));
 expect(dims.scroll).toBeLessThanOrEqual(dims.client+2);
 expect(dims.bottom).toBeLessThanOrEqual(392);
 await expect(page.locator('#bottomNav')).toBeVisible();
});
