import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
test('Kamil OS 42 renders Brain, Universal Inbox and one-click actions',async({page})=>{
 const tomorrow=new Date(Date.now()+86400000).toISOString().slice(0,10);
 await page.addInitScript(({tomorrow})=>localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:80},financePlan:{cashNow:100000,expectedIncome:0,reserveFloor:50000,plannedInvestment:25000},tasks:[{id:'life42-task',title:'Důležitý testovací úkol',due:tomorrow,status:'OPEN',priority:20}],projects:[],calendar:{events:[]},ticketBook:{items:[],watchlist:[],history:[]},personalInbox:{items:[]},personalAdmin:{items:[]},assetBook:{items:[]},personalGoals:{items:[]},personalSpending:{transactions:[]},netWorthBook:{items:[],history:[]},inbox:[],delegations:[],audit:[],undo:[]})),{tomorrow});
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.getByRole('heading',{name:'Co má smysl řešit teď'})).toBeVisible({timeout:10000});
 await expect(page.getByRole('heading',{name:'Jedna fronta pro rozhodnutí'})).toBeVisible();
 await expect(page.locator('#lifeOs42')).toContainText('Důležitý testovací úkol');
 await page.locator('[data-life42-action="done"][data-id="life42-task"]').click();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('kamil-os-state')).tasks.find(x=>x.id==='life42-task')?.status)).toBe('DONE');
 await expect(page.getByRole('heading',{name:'Co s volným kapitálem'})).toBeVisible();
 await expect(page.locator('#lifeOs42')).toContainText('25 000 Kč');
});
