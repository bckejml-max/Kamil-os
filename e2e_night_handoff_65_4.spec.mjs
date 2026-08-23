import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const tomorrowAt=(h)=>{const d=new Date('2026-08-23T22:30:00');d.setDate(d.getDate()+1);d.setHours(h,0,0,0);return d.toISOString()};

test('65.4 after 21:00 hands the day off to tomorrow',async({page})=>{
 await page.addInitScript(()=>{
  const RealDate=Date,now=new RealDate('2026-08-23T22:30:00').getTime();
  class FixedDate extends RealDate{constructor(...args){super(...(args.length?args:[now]))}static now(){return now}}
  window.Date=FixedDate;
 });
 const state={meta:{schemaVersion:80},tasks:[{id:'night-tomorrow',title:'Zítra zavolat pojišťovně',status:'OPEN',area:'osobní',due:tomorrowAt(9)}],personalAdmin:{items:[]},delegations:[],calendar:{events:[]}};
 await page.addInitScript(state=>localStorage.setItem('kamil-os-state',JSON.stringify(state)),state);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.locator('.ux65-night-handoff')).toBeVisible({timeout:5000});
 await expect(page.locator('.ux65-night-handoff')).toContainText('Zítra zavolat pojišťovně');
 await expect(page.getByRole('button',{name:'Uzavřít den'}).last()).toBeVisible();
 await expect(page.getByRole('button',{name:'Co dnes řešit?'})).toHaveCount(0);
 await page.locator('.ux65-night-handoff [data-tomorrow-open]').click();
 await expect(page.getByText('Zítra zavolat pojišťovně').last()).toBeVisible();
});
