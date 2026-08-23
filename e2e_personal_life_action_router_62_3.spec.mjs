import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Personal Life Action Router 62.3 keeps top personal areas actionable and read-only',async({page})=>{
 const now=new Date(),due=new Date(now.getTime()-86400000).toISOString();
 const state={meta:{schemaVersion:80},tasks:[{id:'p1',title:'Servis klimatizace',due,status:'OPEN'}],personalAdmin:{items:[{id:'a1',title:'Obnovit pojištění auta',due,status:'OPEN'}]},personalInbox:{items:[]},assetBook:{items:[]},personalGoals:{items:[]},personalSpending:{transactions:[]},familyHome:{members:[]},delegations:[],projects:[],calendar:{events:[]}};
 await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const result=await page.evaluate(async()=>{const before=localStorage.getItem('kamil-os-state');const m=await import('./js/personalLifeActionRouter623.js');const x=m.personalLifeActionRouter623();return{main:x.main,top:x.top.map(v=>v.key),same:before===localStorage.getItem('kamil-os-state')}});
 expect(result.main.key).toBeTruthy();expect(result.top.length).toBeGreaterThan(0);expect(result.same).toBe(true);
});
