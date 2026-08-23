import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('65.5 morning keeps later-today events in today, not tomorrow',async({page})=>{
 await page.addInitScript(()=>{const RealDate=Date,now=new RealDate('2026-08-24T08:00:00').getTime();class FixedDate extends RealDate{constructor(...args){super(...(args.length?args:[now]))}static now(){return now}}window.Date=FixedDate;});
 const state={meta:{schemaVersion:80},tasks:[],personalAdmin:{items:[]},delegations:[{id:'follow-today',title:'Urgovat odpověď',status:'OPEN',followUpAt:'2026-08-24T12:00:00'}],calendar:{events:[{id:'today-evening',title:'Dnešní návštěva',start:'2026-08-24T18:00:00'},{id:'tomorrow-morning',title:'Zítřejší kontrola',start:'2026-08-25T09:00:00'}]}};
 await page.addInitScript(state=>localStorage.setItem('kamil-os-state',JSON.stringify(state)),state);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.locator('.ux65-morning-launch')).toBeVisible({timeout:5000});
 await expect(page.locator('.ux65-morning-launch')).toContainText('Dnes v kalendáři1');
 await expect(page.locator('.ux65-morning-launch')).toContainText('Follow-up dnes / po termínu1');
 await expect(page.getByRole('button',{name:'Zítra'}).locator('b')).toHaveText('1');
 await page.getByRole('button',{name:'Ranní přehled'}).first().click();
 const modal=page.locator('#modalHost');
 await expect(modal.getByText('Dnešní návštěva')).toBeVisible();
 await expect(modal.getByText('Urgovat odpověď')).toBeVisible();
 await expect(modal).not.toContainText('Zítřejší kontrola');
});

test('65.5 date helper uses local calendar days instead of rolling 24h',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const out=await page.evaluate(async()=>{const m=await import('./js/personalDate650.js');const now=new Date('2026-08-24T08:00:00');return{today:m.personalDaysTo650('2026-08-24T23:30:00',now),tomorrow:m.personalDaysTo650('2026-08-25T00:15:00',now),yesterday:m.personalDaysTo650('2026-08-23T23:59:00',now)}});
 expect(out).toEqual({today:0,tomorrow:1,yesterday:-1});
});
