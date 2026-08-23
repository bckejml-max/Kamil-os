import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('64.5 updates mortgage and bank snapshots through the vault',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const out=await page.evaluate(async()=>{const v=await import('./js/personalVault640.js');const e=await import('./js/personalVaultEdit641.js');v.ensurePersonalVault640();const all=v.personalVault640();const m=all.records.find(x=>x.recordType==='mortgage'),b=all.records.find(x=>x.recordType==='bank-data');e.updateVaultRecord641(m.id,{balance:3333333,asOf:'2026-08-23'});e.updateVaultRecord641(b.id,{asOf:'2026-08-23'});const next=v.personalVault640();return{mortgage:next.records.find(x=>x.id===m.id),bank:next.records.find(x=>x.id===b.id)}});
 expect(out.mortgage.balance).toBe(3333333);expect(out.mortgage.asOf).toBe('2026-08-23');expect(out.bank.asOf).toBe('2026-08-23');
});

test('64.5 money view exposes direct actions',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:/Peníze/i}).first().click();
 await expect(page.locator('#moneyView')).toContainText('Aktualizovat zůstatek');await expect(page.locator('#moneyView')).toContainText('Doplnit stav k datu');await expect(page.locator('#moneyView')).toContainText('Finanční úkol');
});
