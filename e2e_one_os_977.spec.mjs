import {test,expect} from '@playwright/test';

test('OS977 remains reachable under the OS1037 primary Control Plane',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_ONE_OS977__?.version||''),{timeout:20000}).toBe('977.0.0');
 const input=page.locator('#commandInput');
 await input.fill('/health');await input.press('Enter');
 await expect(page.getByText('One OS Control · OS977')).toBeVisible();
 await expect(page.getByText('CONSOLIDATION HEALTH')).toBeVisible();
 await page.getByRole('button',{name:'Zavřít'}).last().click();
 await page.locator('[data-personal-more]:visible').click();
 await expect(page.getByText('Jedna hlavní cesta')).toBeVisible();
 await expect(page.getByRole('button',{name:'Kamil OS Control Plane'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Pokročilé / legacy'})).toBeVisible();
 await expect(page.getByText('Safe Change Plan',{exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Kamil OS Control Plane'}).click();
 await expect(page.getByText('Kamil OS Control Plane · OS1037')).toBeVisible();
 await expect(page.getByRole('button',{name:'One OS Control'})).toBeVisible();
 await page.getByRole('button',{name:'One OS Control'}).click();
 await expect(page.getByText('One OS Control · OS977')).toBeVisible();
});

test('OS977 mobile preference can hide the floating next-action control',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.addInitScript(()=>localStorage.setItem('kamil.oneos.preferences.968',JSON.stringify({legacyToday:false,mobileAction:false})));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_ONE_OS977__?.version||''),{timeout:20000}).toBe('977.0.0');
 await expect(page.locator('[data-oneos-mobile965]')).toBeHidden();
 const input=page.locator('#commandInput');
 await input.fill('/gaps');await input.press('Enter');
 await expect(page.getByText('Data Gaps Resolver · OS973')).toBeVisible();
});
