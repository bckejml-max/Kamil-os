import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const tomorrowAt=(h)=>{const d=new Date();d.setDate(d.getDate()+1);d.setHours(h,0,0,0);return d.toISOString()};

test('65.3 Tomorrow Radar includes tasks, admin and calendar in one center',async({page})=>{
 const state={meta:{schemaVersion:80},tasks:[{id:'t-tomorrow',title:'Zavolat do pojišťovny',status:'OPEN',area:'osobní',due:tomorrowAt(9)}],personalAdmin:{items:[{id:'a-tomorrow',title:'Doplnit formulář',status:'OPEN',due:tomorrowAt(10)}]},delegations:[],calendar:{events:[{id:'c-tomorrow',title:'Rodinná návštěva',start:tomorrowAt(14)}]}};
 await page.addInitScript(state=>localStorage.setItem('kamil-os-state',JSON.stringify(state)),state);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const chip=page.getByRole('button',{name:'Zítra'});
 await expect(chip.locator('b')).toHaveText('3',{timeout:5000});
 await chip.click();
 const modal=page.locator('#modalHost');
 await expect(modal.getByText('Zavolat do pojišťovny')).toBeVisible();
 await expect(modal.getByText('Doplnit formulář')).toBeVisible();
 await expect(modal.getByText('Rodinná návštěva')).toBeVisible();
});

test('65.3 next-7 center is separate from Family navigation',async({page})=>{
 const state={meta:{schemaVersion:80},tasks:[{id:'t-week',title:'Osobní kontrola za tři dny',status:'OPEN',area:'osobní',due:(()=>{const d=new Date();d.setDate(d.getDate()+3);d.setHours(9,0,0,0);return d.toISOString()})()}],personalAdmin:{items:[]},delegations:[],calendar:{events:[]}};
 await page.addInitScript(state=>localStorage.setItem('kamil-os-state',JSON.stringify(state)),state);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'Do 7 dní'}).click();
 await expect(page.locator('#modalHost').getByText('Osobní kontrola za tři dny')).toBeVisible();
 await expect(page.locator('#pageTitle')).toHaveText('DNES');
});
