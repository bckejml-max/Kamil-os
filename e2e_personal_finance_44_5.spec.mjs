import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Personal 44.5 Finance Center stays explicit, conservative and private',async({page})=>{
 const soon=new Date(Date.now()+7*86400000).toISOString().slice(0,10),fresh=new Date().toISOString();
 await page.addInitScript(({soon,fresh})=>localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:80},financePlan:{cashNow:100000,reserveFloor:40000,plannedInvestment:25000,expectedIncome:50000},householdBills:{items:[{id:'b1',title:'Energie domácnost',amount:10000,status:'OPEN'}]},plannedPurchases:[{id:'p1',title:'Nová pračka',amount:15000,due:soon,status:'OPEN'},{id:'w1',title:'Pracovní nákup na zakázku D4',amount:20000,due:soon,status:'OPEN',area:'práce'}],xtbReport:{czkValue:150000,czkProfit:12000,positionCount:4,asOf:fresh}})),{soon,fresh});
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_FINANCE_445_LAST__||null)).toBeNull();
 const opened=await page.evaluate(async()=>{const m=await import('./js/personalFinance445.js');await m.openPersonalFinance445();return true});expect(opened).toBe(true);
 await expect(page.getByRole('heading',{name:'Moje finance / 44.5'})).toBeVisible();
 await expect(page.locator('#modalHost')).toContainText('100 000 Kč');
 await expect(page.locator('#modalHost')).toContainText('35 000 Kč');
 await expect(page.locator('#modalHost')).toContainText('10 000 Kč');
 await expect(page.locator('#modalHost')).toContainText('Nová pračka');
 await expect(page.locator('#modalHost')).toContainText('150 000 Kč');
 await expect(page.locator('#modalHost')).not.toContainText('Pracovní nákup na zakázku D4');
 const result=await page.evaluate(()=>window.__KAMIL_FINANCE_445_LAST__);expect(result.ms).toBeLessThan(500);
 expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});
