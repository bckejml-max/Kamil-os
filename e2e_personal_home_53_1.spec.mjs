import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
test('Personal Market Home 56.0 is fast and focuses only XTB plus tickets',async({page})=>{
 const d2=new Date(Date.now()+2*86400000).toISOString().slice(0,10),d8=new Date(Date.now()+8*86400000).toISOString().slice(0,10);
 const state={meta:{schemaVersion:80},tasks:[{title:'Objednat servis auta',status:'OPEN'}],calendar:{events:[{title:'Rodinná návštěva',date:d8}]},personalAdmin:{items:[{title:'Obnovit pojištění auta',status:'OPEN'}]},familyHome:{items:[{title:'Koupit dětské pleny',status:'OPEN'}]},ticketBook:{items:[{name:'Koncert A',workflow:'LISTED',sellBy:d2,qty:2,buy:2000,marketPrice:3000},{name:'Koncert B',workflow:'HOLD',sellBy:d8,qty:1,buy:5000,marketPrice:4800}]},xtbReport:{czkValue:150000,czkProfit:12000,asOf:new Date().toISOString(),positions:[{symbol:'AAA',valueCZK:60000,profitCZK:22000},{symbol:'BBB',valueCZK:40000,profitCZK:2000},{symbol:'CCC',valueCZK:50000,profitCZK:-1000}]}};
 await page.addInitScript(state=>localStorage.setItem('kamil-os-state',JSON.stringify(state)),state);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.getByRole('heading',{name:'XTB + vstupenky. Co přesně udělat teď?'})).toBeVisible({timeout:5000});
 const diag=await page.evaluate(()=>({home:window.__KAMIL_PERSONAL_HOME_531_LAST__||null,market:window.__KAMIL_MARKET_TOP3_533_LAST__||null,marketHome:window.__KAMIL_MARKET_HOME_560_LAST__||null,queue:window.__KAMIL_ACTION_QUEUE_559_LAST__||null,final:window.__KAMIL_FINAL_VERDICT_558_LAST__||null,suite:window.__KAMIL_SUITE_530_LAST__||null,assistant:window.__KAMIL_ASSISTANT_530_LAST__||null,text:document.querySelector('#todayView')?.textContent||''}));
 expect(diag.home).not.toBeNull();expect(diag.home.ms).toBeLessThan(200);expect(diag.market).not.toBeNull();expect(diag.market.ms).toBeLessThan(200);expect(diag.marketHome).not.toBeNull();expect(diag.marketHome.ms).toBeLessThan(200);
 expect(diag.queue).toBeNull();expect(diag.final).toBeNull();expect(diag.suite).toBeNull();expect(diag.assistant).toBeNull();
 expect(diag.text).toContain('Koncert A');expect(diag.text).toContain('Koncert B');expect(diag.text).toContain('AAA');expect(diag.text).toContain('150 000');
 expect(diag.text).not.toContain('Objednat servis auta');expect(diag.text).not.toContain('Rodinná návštěva');expect(diag.text).not.toContain('Obnovit pojištění auta');expect(diag.text).not.toContain('Koupit dětské pleny');
 expect(diag.text).toContain('SMART TOP 3');expect(diag.text).toContain('ACTION QUEUE 55.9');expect(diag.text).toContain('XTB');expect(diag.text).toContain('VSTUPENKY');
 await expect(page.getByRole('button',{name:'Akční fronta'}).first()).toBeVisible();
});
