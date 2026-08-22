import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Personal Home 53.2 uses compact two-column desktop cockpit and keeps Safe Core lazy',async({page})=>{
 const d1=new Date(Date.now()+86400000).toISOString().slice(0,10),d5=new Date(Date.now()+5*86400000).toISOString().slice(0,10);
 const state={meta:{schemaVersion:80},financePlan:{cashNow:120000,reserveFloor:50000,plannedInvestment:25000},tasks:[{title:'Servis auta',due:d1,status:'OPEN'}],calendar:{events:[{title:'Rodinná návštěva',date:d5}]},ticketBook:{items:[{name:'Koncert A',workflow:'LISTED',sellBy:d5}]},familyHome:{items:[{title:'Koupit pleny',status:'OPEN'}]},personalAdmin:{items:[{title:'Pojištění auta',due:d5,status:'OPEN'}]},xtbReport:{czkValue:150000,czkProfit:12000,asOf:new Date().toISOString()}};
 await page.addInitScript(state=>localStorage.setItem('kamil-os-state',JSON.stringify(state)),state);
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.getByRole('heading',{name:'Můj život na jedné obrazovce.'})).toBeVisible({timeout:5000});
 const desktop=await page.evaluate(()=>{const host=document.querySelector('#todayView');const cards=[...host.children].filter(x=>x.classList.contains('card'));const s=getComputedStyle(host);return{cols:s.gridTemplateColumns,home:window.__KAMIL_PERSONAL_HOME_531_LAST__||null,suite:window.__KAMIL_SUITE_530_LAST__||null,assistant:window.__KAMIL_ASSISTANT_530_LAST__||null,cardCount:cards.length,topSpan:getComputedStyle(cards[0]).gridColumn}});
 expect(desktop.cols.split(' ').length).toBeGreaterThanOrEqual(2);
 expect(desktop.cardCount).toBeGreaterThanOrEqual(7);
 expect(desktop.topSpan).not.toBe('auto');
 expect(desktop.home).not.toBeNull();expect(desktop.home.ms).toBeLessThan(200);
 expect(desktop.suite).toBeNull();expect(desktop.assistant).toBeNull();
 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(50);
 const mobile=await page.evaluate(()=>getComputedStyle(document.querySelector('#todayView')).gridTemplateColumns);
 expect(mobile.split(' ').length).toBe(1);
 expect(await page.evaluate(()=>window.__KAMIL_SUITE_530_LAST__||null)).toBeNull();
});
