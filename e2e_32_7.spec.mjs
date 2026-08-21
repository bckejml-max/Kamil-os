import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
test('Kamil OS 32.7 surfaces XTB, money routing, outcomes and cashflow',async({page})=>{
 const fresh=new Date().toISOString();
 await page.addInitScript(({fresh})=>localStorage.setItem('kamil-os-state',JSON.stringify({
  meta:{schemaVersion:80},financePlan:{cashNow:40000,expectedIncome:0,reserveFloor:100000,plannedInvestment:25000},tasks:[],debtBook:{items:[]},personalAdmin:{items:[]},personalGoals:{items:[]},netWorthBook:{items:[],history:[]},personalSpending:{transactions:[]},assetBook:{items:[]},personalInbox:{items:[]},ticketBook:{items:[],watchlist:[],history:[]},
  wealthProfile:{reserve:{floor:100000,target:220000},cashflow:{baselineIncome:75000,baselineExpenses:55000,baselineSurplus:20000,history:[{month:'2026-06',income:72000,expenses:52000,surplus:20000,closed:true,source:'BANK'},{month:'2026-07',income:78000,expenses:58000,surplus:20000,closed:true,source:'BANK'}]}},
  xtbHub:{asOf:fresh,source:'XTB TEST',accounts:{czk:{currency:'CZK',value:120000,profit:3000,positions:[{ticker:'CORE.DE',name:'Core World',category:'ETF',value:70000,volume:10,net_profit:2000,net_profit_pct:3},{ticker:'SAT.US',name:'Satellite',category:'STOCK',value:50000,volume:5,net_profit:1000,net_profit_pct:2}]}}},xtbReport:{asOf:fresh,czkValue:120000,czkProfit:3000,eurValue:0,eurProfit:0},xtbStrategy:{overrides:{}},
  tradeJournal:{trades:[{ticker:'WIN.US',name:'Winner',category:'STOCK',purchaseValue:10000,saleValue:12000,realized:2000,openDate:'2026-01-01',closeDate:'2026-07-10',kind:'INVESTMENT'},{ticker:'LOSS.US',name:'Loser',category:'STOCK',purchaseValue:10000,saleValue:9000,realized:-1000,openDate:'2026-02-01',closeDate:'2026-07-11',kind:'INVESTMENT'}]}
 })),{fresh});
 await page.goto(BASE,{waitUntil:'networkidle'});await expect(page).toHaveTitle(/Kamil OS 32\.7/);
 const before=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return JSON.stringify({financePlan:s.financePlan,tradeJournal:s.tradeJournal,wealthProfile:s.wealthProfile,xtbHub:s.xtbHub})});
 await page.locator('#mainNav').getByRole('button',{name:'Peníze'}).click();
 const host=page.locator('#financialCommand32Host');await expect(host).toBeVisible();
 await expect(page.getByRole('heading',{name:'XTB & rozhodovací centrum'})).toBeVisible();
 await expect(host).toContainText('STOP NOVÝ XTB VKLAD');await expect(host).toContainText('Do rezervy');await expect(host).toContainText('25 000 Kč');await expect(host).toContainText('Do XTB');
 await expect(page.getByRole('heading',{name:'XTB je tady'})).toBeVisible();await expect(host).toContainText('CORE.DE');await expect(host).toContainText('SAT.US');
 await expect(page.getByRole('heading',{name:'Jak dopadly moje bývalé prodeje'})).toBeVisible();await expect(host).toContainText('+1 000 Kč');await expect(host).toContainText('50 %');
 await expect(page.getByRole('heading',{name:'Kolik nás reálně stojí měsíc'})).toBeVisible();await expect(host).toContainText('55 000 Kč');await expect(host).toContainText('2 MĚSÍCŮ');
 const after=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return JSON.stringify({financePlan:s.financePlan,tradeJournal:s.tradeJournal,wealthProfile:s.wealthProfile,xtbHub:s.xtbHub})});expect(after).toBe(before);
});
