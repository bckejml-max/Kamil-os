import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('64.6 stores document references in Personal Vault and creates follow-up tasks',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const out=await page.evaluate(async()=>{
  const v=await import('./js/personalVault640.js');v.ensurePersonalVault640();
  const d=await import('./js/personalDocumentActions646.js');
  const before=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');
  const id=(before.personalVault?.items||[])[0]?.id;
  const ref=d.addDocumentReference646(id,{label:'Test dokument',url:'https://example.com/document.pdf',note:'test'});
  const task=d.createDocumentTask646(id,{title:'Zkontrolovat test dokument'});
  const after=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');
  const rec=(after.personalVault?.items||[]).find(x=>x.id===id);
  return{hasRef:!!rec?.attachments?.some(x=>x.id===ref?.id&&x.url.startsWith('https://')),hasTask:!!after.tasks?.some(x=>x.id===task?.id&&x.sourceRecordId===id)};
 });
 expect(out.hasRef).toBe(true);expect(out.hasTask).toBe(true);
});
