import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Daily Personal Assistant Today stays compact on desktop and mobile',async({page})=>{
 const now=new Date().toISOString(),state={meta:{schemaVersion:80},tasks:[{id:'responsive-personal',title:'Osobní úkol dnes',area:'osobní',status:'OPEN',due:now,estimateMinutes:5}],delegations:[],calendar:{events:[]},personalAdmin:{items:[]},ticketBook:{items:[{name:'Koncert A',workflow:'LISTED'}]},xtbReport:{czkValue:150000,asOf:now}};
 await page.addInitScript(state=>localStorage.setItem('kamil-os-state',JSON.stringify(state)),state);
 await page.setViewportSize({width:1440,height:1000});await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.getByText('Osobní úkol dnes').first()).toBeVisible({timeout:5000});
 const desktop=await page.evaluate(()=>({primary:document.querySelectorAll('.ux65-primary').length,secondary:document.querySelectorAll('.ux65-secondary').length,context:document.querySelectorAll('.ux65-chip').length,dataHealth:document.querySelectorAll('.ux64-data-health').length,width:document.querySelector('.ux65-today')?.getBoundingClientRect().width||0,text:document.querySelector('#todayView')?.textContent||''}));
 expect(desktop.primary).toBeLessThanOrEqual(1);expect(desktop.secondary).toBeLessThanOrEqual(2);expect(desktop.context).toBe(3);expect(desktop.dataHealth).toBe(0);expect(desktop.width).toBeLessThanOrEqual(930);expect(desktop.text).not.toContain('Koncert A');
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);
 const mobile=await page.evaluate(()=>({app:document.querySelector('.app')?.getBoundingClientRect().width||0,contextCols:getComputedStyle(document.querySelector('.ux65-context')).gridTemplateColumns,primaryWidth:document.querySelector('.ux65-primary')?.getBoundingClientRect().width||0}));
 expect(mobile.app).toBeLessThanOrEqual(390);expect(mobile.contextCols.split(' ').length).toBe(1);if(mobile.primaryWidth)expect(mobile.primaryWidth).toBeLessThanOrEqual(390);
});
