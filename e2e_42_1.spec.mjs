import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173/';
test('Kamil OS 42.1 learns recommendation feedback locally',async({page})=>{
 const tomorrow=new Date(Date.now()+86400000).toISOString().slice(0,10);
 await page.addInitScript(({tomorrow})=>localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:80},financePlan:{cashNow:100000,reserveFloor:50000,plannedInvestment:25000},tasks:[{id:'adaptive-task',title:'Adaptivní test',due:tomorrow,status:'OPEN',priority:20}],projects:[],calendar:{events:[]},ticketBook:{items:[],watchlist:[],history:[]},personalInbox:{items:[]},personalAdmin:{items:[]},assetBook:{items:[]},personalGoals:{items:[]},personalSpending:{transactions:[]},netWorthBook:{items:[],history:[]},inbox:[],delegations:[],audit:[],undo:[]})),{tomorrow});
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.getByRole('heading',{name:'Kamil OS se učí z tvých voleb'})).toBeVisible({timeout:10000});
 const up=page.locator('[data-adapt="up"]').first();await expect(up).toBeVisible();await up.click();
 const adaptive=await page.evaluate(()=>JSON.parse(localStorage.getItem('kamil-os-adaptive-42-1')||'{}'));
 expect(Object.values(adaptive.bias||{}).some(v=>Number(v)>0)).toBeTruthy();
});
