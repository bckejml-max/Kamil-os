import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Personal Life Home 62.2 selects a personal commander and stays read-only',async({page})=>{
 const today=new Date().toISOString().slice(0,10),state={meta:{schemaVersion:80},tasks:[{id:'p1',title:'Obnovit pojištění auta',due:today,status:'OPEN',category:'osobní'}],personalAdmin:{items:[]},personalInbox:{items:[]},assetBook:{items:[]},personalGoals:{items:[]},personalSpending:{transactions:[]},familyHome:{members:[]},calendar:{events:[]},delegations:[],projects:[],ticketBook:{items:[]}};
 await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const before=await page.evaluate(()=>localStorage.getItem('kamil-os-state'));
 const out=await page.evaluate(async()=>{const m=await import('./js/personalLifeHome622.js');return m.personalLifeHome622()});
 expect(out.commander.title).toBe('Obnovit pojištění auta');expect(out.score).toBeLessThanOrEqual(100);
 const after=await page.evaluate(()=>localStorage.getItem('kamil-os-state'));expect(after).toBe(before);
});
