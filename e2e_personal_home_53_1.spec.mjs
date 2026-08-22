import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
test('Personal Home 53.1 is fast, private and useful on first render',async({page})=>{
 const d1=new Date(Date.now()+86400000).toISOString().slice(0,10),d5=new Date(Date.now()+5*86400000).toISOString().slice(0,10),d12=new Date(Date.now()+12*86400000).toISOString().slice(0,10);
 const state={meta:{schemaVersion:80},financePlan:{cashNow:120000,reserveFloor:50000,plannedInvestment:25000},tasks:[{id:'p1',title:'Objednat servis auta',due:d1,status:'OPEN',priority:5},{id:'w1',title:'PKS pracovní fakturace',due:d1,status:'OPEN',priority:9,category:'práce'}],calendar:{events:[{title:'Rodinná návštěva',date:d5},{title:'PKS pracovní porada',date:d5}]},ticketBook:{items:[{name:'Koncert A',workflow:'LISTED',sellBy:d5}]},personalAdmin:{items:[{title:'Obnovit pojištění auta',due:d12,status:'OPEN'}]},familyHome:{items:[{title:'Koupit dětské pleny',status:'OPEN'}]},xtbReport:{czkValue:150000,czkProfit:12000,asOf:new Date().toISOString()},personalInbox:{items:[]}};
 await page.addInitScript(state=>localStorage.setItem('kamil-os-state',JSON.stringify(state)),state);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.getByText('Můj život na jedné obrazovce.')).toBeVisible({timeout:5000});
 const diag=await page.evaluate(()=>({home:window.__KAMIL_PERSONAL_HOME_531_LAST__||null,suite:window.__KAMIL_SUITE_530_LAST__||null,assistant:window.__KAMIL_ASSISTANT_530_LAST__||null,text:document.querySelector('#todayView')?.textContent||''}));
 expect(diag.home).not.toBeNull();expect(diag.home.ms).toBeLessThan(200);
 expect(diag.suite).toBeNull();expect(diag.assistant).toBeNull();
 expect(diag.text).toContain('Objednat servis auta');expect(diag.text).toContain('Rodinná návštěva');expect(diag.text).toContain('Koncert A');expect(diag.text).toContain('Obnovit pojištění auta');expect(diag.text).toContain('Koupit dětské pleny');expect(diag.text).toContain('150 000');
 expect(diag.text).not.toContain('PKS pracovní fakturace');expect(diag.text).not.toContain('PKS pracovní porada');
 expect(diag.text).toContain('Zeptat se Kamil OS');expect(diag.text).toContain('Rychle přidat');
});
