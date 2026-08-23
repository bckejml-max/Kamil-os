import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Personal Life Suite 62.1 exposes 20 personal modules and stays read-only',async({page})=>{
 const yesterday=new Date(Date.now()-86400000).toISOString(),tomorrow=new Date(Date.now()+86400000).toISOString(),nextWeek=new Date(Date.now()+6*86400000).toISOString();
 const state={meta:{schemaVersion:80},tasks:[{id:'p1',title:'Zavolat na pojišťovnu',due:yesterday,status:'OPEN'},{id:'p2',title:'Naplánovat rodinný výlet',due:nextWeek,status:'OPEN'}],projects:[{id:'hp1',title:'Dodělat zahradu',status:'OPEN'}],calendar:{events:[{id:'c1',title:'Rodinná kontrola u doktora',start:tomorrow}]},financePlan:{cashNow:100000,expectedIncome:0,reserveFloor:50000,plannedInvestment:0},personalAdmin:{items:[{id:'a1',title:'Obnovit pojištění auta',due:tomorrow,status:'OPEN'},{id:'a2',title:'Platnost pasu',due:nextWeek,status:'OPEN'}]},familyHome:{members:[{id:'f1',name:'Rodina'}]},personalInbox:{items:[{id:'i1',title:'Čekám na odpověď servisu',followUpAt:yesterday,status:'OPEN'}]},assetBook:{items:[{id:'as1',title:'Servis rekuperace',nextAt:yesterday}]},personalGoals:{items:[{id:'g1',title:'Koupit nový nábytek',status:'OPEN'}]},personalSpending:{transactions:[{id:'t1',title:'Internet předplatné',date:new Date().toISOString(),amount:700}]},delegations:[],ticketBook:{items:[]},xtbReport:{},xtbHub:{},inbox:[],audit:[],undo:[]};
 await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const before=await page.evaluate(()=>localStorage.getItem('kamil-os-state'));
 const result=await page.evaluate(async()=>{const m=await import('./js/personalLifeSuite621.js');const x=m.personalLifeSuite621();return{count:Object.keys(x.features).length,commander:x.commander,score:x.score,renewals:x.features.renewals.count,maintenance:x.features.maintenance.count,expiry:x.features.expiry.count,waiting:x.features.waiting.count}});
 expect(result.count).toBe(20);
 expect(result.commander.title).toContain('pojišťovnu');
 expect(result.renewals).toBeGreaterThan(0);
 expect(result.maintenance).toBeGreaterThan(0);
 expect(result.expiry).toBeGreaterThan(0);
 expect(result.waiting).toBeGreaterThan(0);
 expect(result.score).toBeLessThan(100);
 const after=await page.evaluate(()=>localStorage.getItem('kamil-os-state'));
 expect(after).toBe(before);
});
