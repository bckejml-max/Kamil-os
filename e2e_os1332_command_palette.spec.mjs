import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
async function boot(page){
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await expect(page.locator('[data-os2-today]')).toBeVisible({timeout:10000});
}
test('OS1332 empty command bar exposes all ten destinations without adding shell clutter',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);
 const input=page.locator('#commandInput');
 await input.focus();
 await expect(page.locator('[data-command-home1332]')).toBeVisible();
 await expect(page.locator('[data-command-nav1332]')).toHaveCount(10);
 const labels=await page.locator('[data-command-nav1332] span').allTextContents();
 expect(labels).toEqual(['Dnes','Úkoly','Práce','Vstupenky','Peníze','Reality','Sázení','Rodina','Domov','Dokumenty']);
 await page.locator('[data-command-nav1332="work"]').click();
 await expect(page.locator('#view-work')).toHaveClass(/on/);
 await expect(page.locator('#commandResults')).toHaveClass(/hidden/);
});
test('OS1332 command understands work and reality navigation explicitly',async({page})=>{
 await boot(page);
 const input=page.locator('#commandInput');
 await input.fill('ukaž práci');
 await input.press('Enter');
 await expect(page.locator('#view-work')).toHaveClass(/on/);
 await input.fill('ukaž reality');
 await input.press('Enter');
 await expect(page.locator('#view-property')).toHaveClass(/on/);
});
test('OS1332 insurance command opens the canonical Insurance Center',async({page})=>{
 await boot(page);
 const input=page.locator('#commandInput');
 await input.fill('ukaž pojištění');
 await input.press('Enter');
 await expect(page.locator('#view-more')).toHaveClass(/on/);
 await expect(page.locator('#moreView')).toContainText('Všechny pojistky na jednom místě',{timeout:10000});
 await expect(page.locator('#moreView')).toContainText('Fiat Croma');
});

test('OS1332 command search routes domain tasks to their domain instead of Today',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('kamil-os-state',JSON.stringify({
   meta:{schemaVersion:80,createdAt:new Date().toISOString()},
   tasks:[
    {id:'work-search',title:'Trafo Týniště',status:'OPEN',area:'Práce'},
    {id:'property-search',title:'Mikulov byt',status:'OPEN',area:'Reality'}
   ]
  }));
 });
 await boot(page);
 const input=page.locator('#commandInput');
 await input.fill('Trafo Týniště');
 await expect(page.locator('#commandResults')).toBeVisible();
 await page.locator('#commandResults [data-search="0"]').click();
 await expect(page.locator('#view-work')).toHaveClass(/on/);
 await input.fill('Mikulov byt');
 await expect(page.locator('#commandResults')).toBeVisible();
 await page.locator('#commandResults [data-search="0"]').click();
 await expect(page.locator('#view-property')).toHaveClass(/on/);
});
