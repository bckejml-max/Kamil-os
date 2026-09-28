import {test,expect} from '@playwright/test';

test.use({viewport:{width:390,height:844}});

test('daily OS stays calm on mobile and advanced tooling stays out of the way',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('[data-os1600-home]')).toBeVisible({timeout:10000});
 const nav=await page.locator('#bottomNav').evaluate(el=>{
  const s=getComputedStyle(el);
  return{display:s.display,height:s.height,columns:s.gridTemplateColumns,rows:s.gridTemplateRows,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth};
 });
 expect(nav.display).toBe('grid');
 expect(parseFloat(nav.height)).toBeLessThanOrEqual(96);
 expect(nav.columns.split(' ').filter(Boolean)).toHaveLength(5);
 expect(nav.rows.split(' ').filter(Boolean)).toHaveLength(2);
 expect(nav.scrollWidth).toBeLessThanOrEqual(nav.clientWidth+1);

 await page.locator('#bottomNav [data-view="more"]').click();
 await expect(page.locator('[data-documents-page1500]')).toBeVisible({timeout:10000});
 await expect(page.locator('#insurance25Tile')).toBeVisible();
 const advanced=page.locator('[data-doc1500-advanced]');
 await expect(advanced).not.toHaveAttribute('open','');
 await advanced.locator('> summary').click();
 await expect(page.locator('[data-doc1500-upgrades]')).toBeVisible();
});

test('Today orders attention areas before healthy areas',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('[data-os1600-home]')).toBeVisible({timeout:10000});
 const tones=await page.locator('.os1600-area').evaluateAll(nodes=>nodes.map(n=>n.classList.contains('bad')?3:n.classList.contains('warn')?2:n.classList.contains('good')?1:0));
 for(let i=1;i<tones.length;i++)expect(tones[i]).toBeLessThanOrEqual(tones[i-1]);
});
