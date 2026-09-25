import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
async function boot(page){
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await expect(page.locator('[data-os2-today]')).toBeVisible({timeout:10000});
}
async function openView(page,view){
 await page.locator('#mainNav [data-view="'+view+'"]').click();
 await expect(page.locator('#view-'+view)).toHaveClass(/on/);
}
test('OS1334 Money is action-first with a compact financial context',async({page})=>{
 await boot(page); await openView(page,'money');
 await expect(page.locator('#moneyView [data-decision-surface1334]')).toBeVisible();
 await expect(page.locator('#moneyView .os1334-decision-grid')).toBeVisible();
 await expect(page.locator('#moneyView .os1334-money-context')).toBeVisible();
 const d=await page.evaluate(()=>window.__KAMIL_MONEY_OVERVIEW__);
 expect(d?.decisionSurface).toBe(1334);
});
test('OS1334 Betting renders every open bet on the primary screen',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('kamil-os-state',JSON.stringify({
   meta:{schemaVersion:80,createdAt:new Date().toISOString()},
   bettingLedger:{
    bankrollCzk:100000,unitCzk:1000,updatedAt:new Date().toISOString(),
    bets:Array.from({length:11},(_,i)=>({id:'b'+i,status:'OPEN',label:'Sázka '+(i+1),event:'Event '+(i+1),market:'Market',odds:2,stakeCzk:1000+i}))
   }
  }));
 });
 await boot(page); await openView(page,'betting');
 await expect(page.locator('#bettingView [data-betting-overview]')).toBeVisible({timeout:10000});
 await expect.poll(()=>page.evaluate(()=>!!window.__KAMIL_BETTING_OVERVIEW__),{timeout:10000}).toBe(true);
 const d=await page.evaluate(()=>window.__KAMIL_BETTING_OVERVIEW__);
 expect(d.open).toBeGreaterThan(0);
 await expect(page.locator('#bettingView [data-betting-open-row]')).toHaveCount(d.open);
 expect(d.renderedOpen).toBe(d.open); expect(d.decisionSurface).toBe(1334);
});
test('OS1334 Reality keeps the whole shortlist and removes duplicate number-one detail',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('kamil-os-state',JSON.stringify({
   meta:{schemaVersion:80,createdAt:new Date().toISOString()},
   propertyBook:{candidates:Array.from({length:13},(_,i)=>({
    id:'p'+i,name:'Byt '+(i+1),location:'Test',purchasePrice:3000000+i*10000,monthlyRent:16000,
    monthlyFund:1500,areaM2:50,locationScore:70,conditionScore:70,liquidityScore:70
   }))}
  }));
 });
 await boot(page); await openView(page,'property');
 await expect(page.locator('#propertyView [data-property-shortlist-row]')).toHaveCount(13);
 await expect(page.locator('#propertyView details')).toHaveCount(0);
 await expect(page.locator('#propertyView .os1334-property-context')).toBeVisible();
 const d=await page.evaluate(()=>window.__KAMIL_PROPERTY_PAGE1300__);
 expect(d.candidates).toBe(13); expect(d.renderedCandidates).toBe(13); expect(d.decisionSurface).toBe(1334);
});
