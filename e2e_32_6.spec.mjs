import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
test('Kamil OS 32.6+ renders safe repricing and stale-market firewall',async({page})=>{
 const now=Date.now(),day=86400000,fresh=new Date(now).toISOString(),event=new Date(now+20*day).toISOString().slice(0,10),sellBy=new Date(now+12*day).toISOString().slice(0,10),stale=new Date(now-200*3600000).toISOString();
 await page.addInitScript(({fresh,event,sellBy,stale})=>localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:80},financePlan:{cashNow:1,expectedIncome:0,reserveFloor:0,plannedInvestment:0},tasks:[],debtBook:{items:[]},personalAdmin:{items:[]},personalGoals:{items:[]},netWorthBook:{items:[],history:[]},personalSpending:{transactions:[]},assetBook:{items:[]},personalInbox:{items:[]},ticketBook:{items:[{id:'fresh-ticket',name:'Clash Browser - A',date:event,sellBy,workflow:'LISTED',qty:2,buy:2000,buy1:1000,listPrice:2000,marketPrice:1500,marketCheckedAt:fresh,marketSourceUrl:'https://example.com/market',floorPrice:1100,transferStatus:'READY'},{id:'stale-ticket',name:'Concert Browser - A',date:event,sellBy,workflow:'LISTED',qty:2,buy:1800,buy1:900,listPrice:1800,marketPrice:1400,marketCheckedAt:stale,marketSourceUrl:'https://example.com/stale',floorPrice:1000,transferStatus:'READY'}],watchlist:[],history:[]}})),{fresh,event,sellBy,stale});
 await page.goto(BASE,{waitUntil:'networkidle'});await expect(page).toHaveTitle(/Kamil OS \d+\.\d+/);
 const before=await page.evaluate(()=>localStorage.getItem('kamil-os-state'));
 await page.locator('#mainNav').getByRole('button',{name:'Vstupenky'}).click();
 await expect(page.getByRole('heading',{name:'Repricing & Sell-by Intelligence'})).toBeVisible();
 await expect(page.locator('#ticketMarketIntel32Host')).toContainText('PŘECENIT');
 await expect(page.locator('#ticketMarketIntel32Host')).toContainText('OBNOVIT MARKET');
 await expect(page.locator('#ticketMarketIntel32Host')).toContainText('SOURCE-BACKED');
 const staleRow=page.locator('#ticketMarketIntel32Host .trade-plan-row').filter({hasText:'Concert Browser'});await expect(staleRow).toContainText('bez ceny');
 const freshRow=page.locator('#ticketMarketIntel32Host .trade-plan-row').filter({hasText:'Clash Browser'});await expect(freshRow).toContainText('Krok 1:');
 const after=await page.evaluate(()=>localStorage.getItem('kamil-os-state'));expect(after).toBe(before);
});
