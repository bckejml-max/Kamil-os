import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
test('62.4 explains why, delay risk and outcome without mutating state',async({page})=>{
 await page.goto(BASE);
 await page.evaluate(()=>{const k=Object.keys(localStorage).find(x=>x.includes('kamil-os')&&!x.includes('undo')&&!x.includes('boot'));if(!k)return;const s=JSON.parse(localStorage.getItem(k)||'{}');s.personalAdmin={items:[{id:'renew-1',title:'Obnovit pojištění auta',due:new Date(Date.now()+2*86400000).toISOString(),status:'OPEN'}]};localStorage.setItem(k,JSON.stringify(s));});
 await page.reload();
 const before=await page.evaluate(()=>JSON.stringify(Object.values(localStorage).map(x=>{try{return JSON.parse(x)}catch{return null}}).find(x=>x?.personalAdmin)?.personalAdmin));
 const result=await page.evaluate(async()=>{const m=await import('./js/personalLifeExplain624.js');return m.personalLifeExplain624();});
 expect(result.main.why).toBeTruthy();expect(result.main.risk).toBeTruthy();expect(result.main.outcome).toBeTruthy();
 const after=await page.evaluate(()=>JSON.stringify(Object.values(localStorage).map(x=>{try{return JSON.parse(x)}catch{return null}}).find(x=>x?.personalAdmin)?.personalAdmin));
 expect(after).toBe(before);
});