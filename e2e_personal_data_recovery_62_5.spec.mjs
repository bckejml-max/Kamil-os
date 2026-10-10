import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('62.5 public recovery layer never invents personal records',async({page})=>{
 await page.goto(BASE);
 const result=await page.evaluate(async()=>{
  const {personalDataRecovery625}=await import('./js/personalDataRecovery625.js');
  const state={personalAdmin:{items:[{id:'private-admin',title:'Soukromý záznam'}]},assetBook:{items:[{id:'private-asset',name:'Soukromé aktivum'}]}};
  const before=JSON.stringify(state),x=personalDataRecovery625(state),after=JSON.stringify(state);
  return{before,after,admin:x.admin.map(v=>v.id),assets:x.assets.map(v=>v.id),recovered:x.recovered};
 });
 expect(result.before).toBe(result.after);
 expect(result.admin).toEqual(['private-admin']);
 expect(result.assets).toEqual(['private-asset']);
 expect(result.recovered).toEqual({admin:0,assets:0,gaps:0});
});
