import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
async function boot(page){
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await expect(page.locator('[data-os2-today]')).toBeVisible({timeout:10000});
}

test('OS1333 command palette supports arrow keys and Enter without moving focus',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await boot(page);
 const input=page.locator('#commandInput');
 await input.focus();
 await expect(page.locator('[data-command-home1332]')).toBeVisible();
 await expect(page.locator('[data-command-nav1332="today"]')).toHaveClass(/is-active/);
 await input.press('ArrowRight');
 await expect(page.locator('[data-command-nav1332="inbox"]')).toHaveClass(/is-active/);
 await input.press('Enter');
 await expect(page.locator('#view-inbox')).toHaveClass(/on/);
 await expect(page.locator('#commandResults')).toHaveClass(/hidden/);
});

test('OS1333 navigation shows only actionable overdue, work deadline and ticket transfer signals',async({page})=>{
 await page.addInitScript(()=>{
  const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
  const tomorrow=new Date(Date.now()+86400000).toISOString().slice(0,10);
  localStorage.setItem('kamil-os-state',JSON.stringify({
   meta:{schemaVersion:80,createdAt:new Date().toISOString()},
   tasks:[
    {id:'overdue-personal',title:'Po termínu',status:'OPEN',area:'Osobní',due:yesterday},
    {id:'work-soon',title:'Pracovní termín',status:'OPEN',area:'Práce',due:tomorrow},
    {id:'later-money',title:'Pozdější finance',status:'OPEN',area:'Peníze',due:new Date(Date.now()+8*86400000).toISOString().slice(0,10)}
   ],
   ticketBook:{version:1,updatedAt:new Date().toISOString(),items:[{id:'transfer',name:'Transfer',status:'OPEN',workflow:'TRANSFER_REQUIRED',market_status:'TRANSFER_REQUIRED'}],watchlist:[],history:[],review:[]}
  }));
 });
 await boot(page);
 await expect(page.locator('#mainNav [data-view="inbox"]')).toHaveAttribute('data-nav-badge','1');
 await expect(page.locator('#mainNav [data-view="work"]')).toHaveAttribute('data-nav-badge','1');
 await expect(page.locator('#mainNav [data-view="tickets"]')).toHaveAttribute('data-nav-badge','1');
 await expect(page.locator('#mainNav [data-view="money"]')).not.toHaveAttribute('data-nav-badge',/.+/);
 await expect(page.locator('#bottomNav [data-view="inbox"]')).toHaveAttribute('data-nav-badge','1');
 const diag=await page.evaluate(()=>window.__KAMIL_NAV_SIGNALS1333__);
 expect(diag.inbox.count).toBe(1);
 expect(diag.work.count).toBe(1);
 expect(diag.tickets.count).toBe(1);
});
