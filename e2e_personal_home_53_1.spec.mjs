import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
test('Canonical Personal Home stays personal even when legacy market state exists',async({page})=>{
 const now=new Date().toISOString(),state={meta:{schemaVersion:80},tasks:[{id:'personal-home-test',title:'Objednat servis auta',area:'osobní',status:'OPEN',due:now,estimateMinutes:10}],personalAdmin:{items:[{id:'personal-admin-test',title:'Obnovit pojištění auta',status:'OPEN'}]},delegations:[],calendar:{events:[]},ticketBook:{items:[{name:'Koncert A',workflow:'LISTED',qty:2,buy:2000,marketPrice:3000}]},xtbReport:{czkValue:150000,czkProfit:12000,asOf:now,positions:[{symbol:'AAA',valueCZK:60000,profitCZK:22000}]}};
 await page.addInitScript(state=>localStorage.setItem('kamil-os-state',JSON.stringify(state)),state);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.getByRole('heading',{name:/Dobré ráno\.|Dobré odpoledne\.|Dobrý večer\./})).toBeVisible({timeout:5000});
 await expect(page.getByText('Objednat servis auta').first()).toBeVisible();
 const diag=await page.evaluate(()=>({today:window.__KAMIL_PERSONAL_UX_653_LAST__||window.__KAMIL_PERSONAL_UX_652_LAST__||window.__KAMIL_PERSONAL_UX_651_LAST__||window.__KAMIL_PERSONAL_UX_650_LAST__||null,text:document.querySelector('#todayView')?.textContent||'',marketHome:window.__KAMIL_MARKET_HOME_560_LAST__||null,queue:window.__KAMIL_ACTION_QUEUE_559_LAST__||null}));
 expect(diag.today).not.toBeNull();expect(diag.today.primary).toBeTruthy();
 expect(diag.text).toContain('Objednat servis auta');expect(diag.text).not.toContain('Koncert A');expect(diag.text).not.toContain('AAA');expect(diag.text).not.toContain('XTB + vstupenky');
 expect(diag.marketHome).toBeNull();expect(diag.queue).toBeNull();
 expect(await page.locator('.ux65-primary').count()).toBeLessThanOrEqual(1);
});
