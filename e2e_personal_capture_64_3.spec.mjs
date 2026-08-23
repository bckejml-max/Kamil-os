import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

const openAdd=page=>page.locator('#quickAddBtn').click();

test('Quick Add creates a personal waiting item',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await openAdd(page);
 const dialog=page.getByRole('dialog');await expect(dialog).toContainText('Přidat osobní věc');
 await dialog.locator('select[name="type"]').selectOption('waiting');await dialog.locator('input[name="title"]').fill('Čekám na potvrzení');await dialog.getByRole('button',{name:'Přidat'}).click();
 const out=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return(s.delegations||[]).find(x=>x.title==='Čekám na potvrzení')||null});
 expect(out).not.toBeNull();expect(out.status).toBe('OPEN');expect(out.followUpAt).toBeTruthy();
});

test('Quick Add can capture a new insurance record into Personal Data Vault',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await openAdd(page);const dialog=page.getByRole('dialog');await dialog.locator('select[name="type"]').selectOption('insurance');await dialog.locator('input[name="title"]').fill('Nové pojištění');await dialog.locator('input[name="provider"]').fill('Test pojišťovna');await dialog.locator('input[name="monthly"]').fill('500');await dialog.getByRole('button',{name:'Přidat'}).click();
 const out=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return(s.personalVault?.items||[]).find(x=>x.title==='Nové pojištění')||null});
 expect(out?.recordType).toBe('insurance');expect(out?.monthlyAmount).toBe(500);expect(out?.sourceLabel).toBe('Zadáno uživatelem');
});
