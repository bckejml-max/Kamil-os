import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Personal Priority Router 60.1 makes secondary market priority actionable without eager imports',async({page})=>{
 const today=new Date().toISOString().slice(0,10);
 const state={meta:{schemaVersion:80},tasks:[{title:'Dnešní osobní úkol',status:'OPEN',due:today,priority:1}],xtbReport:{asOf:null,czkValue:100000,czkProfit:10000,positions:[]},ticketBook:{items:[]}};
 await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.locator('#todayView')).toContainText('PERSONAL PRIORITY ROUTER 60.1');
 expect(await page.evaluate(()=>window.__KAMIL_RESOLUTION_LOOP_598_LAST__||null)).toBeNull();
 const row=page.locator('#todayView .row').filter({hasText:'Aktualizovat XTB data'}).first();
 await expect(row).toBeVisible();
 await row.getByRole('button',{name:'Otevřít'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Resolution Loop 59.8'})).toBeVisible();
 expect(await page.evaluate(()=>window.__KAMIL_RESOLUTION_LOOP_598_LAST__||null)).not.toBeNull();
});
