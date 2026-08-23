import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('64.1 completes one personal task without mutating unrelated rows',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:80},tasks:[{id:'t1',title:'Zaplatit poplatek',area:'osobní',status:'OPEN'},{id:'t2',title:'Jiný osobní úkol',area:'osobní',status:'OPEN'}]})));
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const out=await page.evaluate(async()=>{const m=await import('./js/personalActionExecution641.js');const before=JSON.parse(localStorage.getItem('kamil-os-state'));const ok=m.completePersonalAction641({id:'task:t1',title:'Zaplatit poplatek',kind:'task'});const after=JSON.parse(localStorage.getItem('kamil-os-state'));return{ok,t1:after.tasks.find(x=>x.id==='t1'),t2:after.tasks.find(x=>x.id==='t2'),beforeT2:before.tasks.find(x=>x.id==='t2')}});
 expect(out.ok).toBe(true);expect(out.t1.status).toBe('DONE');expect(out.t1.completedAt).toBeTruthy();expect(out.t2).toEqual(out.beforeT2);
});

test('64.1 edits a vault record through the synced state model',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const out=await page.evaluate(async()=>{const v=await import('./js/personalVault640.js');const e=await import('./js/personalVaultEdit641.js');v.ensurePersonalVault640();const before=v.personalVaultRecord640('recovered-life-tereza-nn');const ok=e.updateVaultRecord641('recovered-life-tereza-nn',{monthlyAmount:600,provider:'NN',nextAction:'Ověřit novou platbu.'});const after=v.personalVaultRecord640('recovered-life-tereza-nn');const state=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return{ok,before:before.monthlyAmount,after:after.monthlyAmount,edited:state.personalVault.items.find(x=>x.id==='recovered-life-tereza-nn')?.userEdited,audit:(state.audit||[]).length}});
 expect(out.ok).toBe(true);expect(out.before).toBe(574);expect(out.after).toBe(600);expect(out.edited).toBe(true);expect(out.audit).toBeGreaterThan(0);
});
