import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Personal Home responsive layout stays compact after Market Home 56.0',async({page})=>{
 const d5=new Date(Date.now()+5*86400000).toISOString().slice(0,10);
 const state={meta:{schemaVersion:80},ticketBook:{items:[{name:'Koncert A',workflow:'LISTED',sellBy:d5,buy:2000,marketPrice:3000}]},xtbReport:{czkValue:150000,czkProfit:12000,asOf:new Date().toISOString(),positions:[{symbol:'AAA',valueCZK:90000,profitCZK:15000},{symbol:'BBB',valueCZK:60000,profitCZK:-3000}]}};
 await page.addInitScript(state=>localStorage.setItem('kamil-os-state',JSON.stringify(state)),state);
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.getByRole('heading',{name:'XTB + vstupenky. Co přesně udělat teď?'})).toBeVisible({timeout:5000});
 const desktop=await page.evaluate(()=>{const host=document.querySelector('#todayView');const cards=[...host.children].filter(x=>x.classList.contains('card'));const s=getComputedStyle(host);return{cols:s.gridTemplateColumns,home:window.__KAMIL_PERSONAL_HOME_531_LAST__||null,market:window.__KAMIL_MARKET_TOP3_533_LAST__||null,marketHome:window.__KAMIL_MARKET_HOME_560_LAST__||null,queue:window.__KAMIL_ACTION_QUEUE_559_LAST__||null,final:window.__KAMIL_FINAL_VERDICT_558_LAST__||null,suite:window.__KAMIL_SUITE_530_LAST__||null,assistant:window.__KAMIL_ASSISTANT_530_LAST__||null,cardCount:cards.length,topSpan:getComputedStyle(cards[0]).gridColumn}});
 expect(desktop.cols.split(' ').length).toBeGreaterThanOrEqual(2);
 expect(desktop.cardCount).toBeGreaterThanOrEqual(5);
 expect(desktop.topSpan).not.toBe('auto');
 expect(desktop.home).not.toBeNull();expect(desktop.home.ms).toBeLessThan(200);expect(desktop.market).not.toBeNull();expect(desktop.marketHome).not.toBeNull();
 expect(desktop.queue).toBeNull();expect(desktop.final).toBeNull();expect(desktop.suite).toBeNull();expect(desktop.assistant).toBeNull();
 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(50);
 const mobile=await page.evaluate(()=>getComputedStyle(document.querySelector('#todayView')).gridTemplateColumns);
 expect(mobile.split(' ').length).toBe(1);
 expect(await page.evaluate(()=>window.__KAMIL_ACTION_QUEUE_559_LAST__||null)).toBeNull();
});
