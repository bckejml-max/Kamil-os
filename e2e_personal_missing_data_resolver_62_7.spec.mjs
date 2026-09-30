import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('62.7 resolver uses private record verification instructions only',async({page})=>{
 await page.goto(BASE);
 const result=await page.evaluate(async()=>{
  const {personalMissingDataResolver627}=await import('./js/personalMissingDataResolver627.js');
  const state={personalAdmin:{items:[{id:'private-check',title:'Soukromý záznam',confidence:50,confidenceLabel:'OVĚŘIT',verificationWhere:'Soukromý zdroj',verificationProof:'Aktuální potvrzení',verificationTarget:97}]},assetBook:{items:[]}};
  const x=personalMissingDataResolver627(state);
  return{open:x.open,main:x.main};
 });
 expect(result.open).toBe(1);
 expect(result.main.id).toBe('private-check');
 expect(result.main.where).toBe('Soukromý zdroj');
 expect(result.main.proof).toBe('Aktuální potvrzení');
 expect(result.main.target).toBe(97);
});
