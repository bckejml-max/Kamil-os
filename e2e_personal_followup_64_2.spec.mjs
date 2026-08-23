import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('64.2 postpones a personal task and keeps it open',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:80},tasks:[{id:'t1',title:'Ověřit smlouvu',area:'osobní',status:'OPEN',due:new Date().toISOString()}]})));
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const out=await page.evaluate(async()=>{const m=await import('./js/personalFollowup642.js');const ok=m.postponePersonalAction642({id:'task:t1',title:'Ověřit smlouvu'},3);const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return{ok,task:s.tasks[0]}});
 expect(out.ok).toBe(true);expect(out.task.status).toBe('OPEN');expect(Date.parse(out.task.due)).toBeGreaterThan(Date.now()+2*86400000);
});

test('64.2 moves an active task into Waiting without duplicate Today priority',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:80},tasks:[{id:'t1',title:'Čekám na potvrzení pojišťovny',area:'osobní',status:'OPEN'}]})));
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const out=await page.evaluate(async()=>{const f=await import('./js/personalFollowup642.js');const a=await import('./js/personalActions640.js');const p=await import('./js/personalAssistant650.js');f.markPersonalWaiting642({id:'task:t1',title:'Čekám na potvrzení pojišťovny',kind:'task'},3);const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');const actions=a.personalActions640(),waiting=p.personalWaitingCenter650();return{task:s.tasks[0],delegations:s.delegations||[],matching:actions.all.filter(x=>x.title==='Čekám na potvrzení pojišťovny'),waiting:waiting.rows.filter(x=>x.title==='Čekám na potvrzení pojišťovny')}});
 expect(out.task.waitingFor).toBe(true);expect(out.delegations).toHaveLength(1);expect(out.matching).toHaveLength(0);expect(out.waiting).toHaveLength(1);expect(out.waiting[0].days).toBeGreaterThan(0);
});
