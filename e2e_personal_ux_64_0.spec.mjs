import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('64.0 opens as a personal-only home with a persistent vault',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.getByRole('button',{name:/Rodina/i}).first()).toBeVisible();
 await expect(page.getByRole('button',{name:/Dokumenty/i}).first()).toBeVisible();
 await expect(page.locator('#todayView')).toContainText(/Dobr|Všechno důležité|stojí za řešení/i);
 await expect(page.locator('#todayView')).toContainText('ZEPTEJ SE KAMIL OS');
 await expect(page.locator('#todayView')).not.toContainText('XTB');
 await expect(page.locator('#todayView')).not.toContainText('Vstupenky');
 const out=await page.evaluate(async()=>{const m=await import('./js/personalVault640.js');m.ensurePersonalVault640();const x=m.personalVault640();return{count:x.records.length,coverage:x.coverage,hasInsurance:x.records.some(v=>v.recordType==='insurance'),state:JSON.parse(localStorage.getItem('kamil-os-state')||'{}').personalVault||null}});
 expect(out.count).toBeGreaterThanOrEqual(8);expect(out.coverage).toBeGreaterThan(0);expect(out.hasInsurance).toBe(true);expect(out.state?.items?.length).toBeGreaterThanOrEqual(8);
});

test('64.0 answers personal insurance questions from the vault',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const answer=await page.evaluate(async()=>{const m=await import('./js/personalAsk640.js');return m.answerPersonalQuestion640('Kolik mě stojí pojistky ročně?')});
 expect(answer.title).toMatch(/pojistky/i);expect(answer.lines.join(' ')).toMatch(/Allianz/i);expect(answer.lines.join(' ')).toMatch(/NN/i);
});
