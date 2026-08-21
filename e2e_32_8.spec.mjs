import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const APP_TITLE=/^Kamil OS \d+\.\d+(?:\.\d+)?$/;
test('Kamil OS 32.8 renders one read-only daily financial brief',async({page})=>{
 const fresh=new Date().toISOString();
 await page.addInitScript(({fresh})=>localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:80},financePlan:{cashNow:40000,reserveFloor:100000,plannedInvestment:25000,expectedIncome:0},tasks:[],debtBook:{items:[]},personalAdmin:{items:[]},personalGoals:{items:[]},netWorthBook:{items:[],history:[]},personalSpending:{transactions:[]},assetBook:{items:[]},personalInbox:{items:[]},wealthProfile:{reserve:{floor:100000,target:214815},cashflow:{history:[{month:'2026-06',income:70000,expenses:50000,surplus:20000,closed:true},{month:'2026-07',income:76000,expenses:56000,surplus:20000,closed:true}]}},xtbHub:{asOf:fresh,source:'XTB TEST',accounts:{}},xtbReport:{asOf:fresh,czkValue:0,eurValue:0,czkProfit:0,eurProfit:0},xtbStrategy:{overrides:{}},tradeJournal:{trades:[{ticker:'WIN.US',name:'Winner',purchaseValue:10000,saleValue:12000,realized:2000,kind:'INVESTMENT',closeDate:'2026-08-10'}]},ticketBook:{items:[],watchlist:[],history:[]}})),{fresh});
 await page.goto(BASE,{waitUntil:'networkidle'});await expect(page).toHaveTitle(APP_TITLE);
 const before=await page.evaluate(()=>localStorage.getItem('kamil-os-state'));
 const host=page.locator('#dailyProfitBrief32Host');await expect(host).toBeVisible();await expect(host).toContainText('DAILY PROFIT BRIEF 32.8');await expect(host).toContainText('Peníze: Doplnit hotovost');await expect(host).toContainText('XTB 0 Kč');await expect(host).toContainText('rezerva 25 000 Kč');await expect(host).toContainText('výdaje 53 000 Kč');await expect(host).toContainText('+2 000 Kč');
 const legacy=page.locator('#profitControlToday32Host');if(await legacy.count())await expect(legacy).toBeHidden();
 const after=await page.evaluate(()=>localStorage.getItem('kamil-os-state'));expect(after).toBe(before);
 await host.locator('[data-daily-target="money"]').first().click();await expect(page.locator('#view-money')).toHaveClass(/on/);
});
