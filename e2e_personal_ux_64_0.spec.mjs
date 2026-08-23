import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('current personal shell opens with a persistent vault and no market leakage',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.locator('#mainNav [data-view="tickets"]')).toBeVisible();
 await expect(page.locator('#mainNav [data-view="more"]')).toBeVisible();
 await expect(page.locator('#todayView')).toContainText(/Dobr|Všechno důležité|stojí za řešení/i);
 await expect(page.locator('#todayView')).not.toContainText('XTB');
 await expect(page.locator('#todayView')).not.toContainText('Vstupenky');
 await expect(page.locator('#commandInput')).toHaveAttribute('placeholder',/Zeptej se nebo hledej/i);
 await expect(page.locator('#commandGo')).toHaveText(/Najít \/ zeptat se/i);
 const out=await page.evaluate(async()=>{const m=await import('./js/personalVault640.js');m.ensurePersonalVault640();const x=m.personalVault640();return{count:x.records.length,coverage:x.coverage,hasInsurance:x.records.some(v=>v.recordType==='insurance'),state:JSON.parse(localStorage.getItem('kamil-os-state')||'{}').personalVault||null}});
 expect(out.count).toBeGreaterThanOrEqual(8);expect(out.coverage).toBeGreaterThan(0);expect(out.hasInsurance).toBe(true);expect(out.state?.items?.length).toBeGreaterThanOrEqual(8);
});

test('personal insurance cost answer includes providers and known amounts',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const answer=await page.evaluate(async()=>{const m=await import('./js/personalAsk640.js');return m.answerPersonalQuestion640('Kolik mě stojí pojistky ročně?')});
 expect(answer.title).toMatch(/pojistky/i);expect(answer.lines.join(' ')).toMatch(/Allianz/i);expect(answer.lines.join(' ')).toMatch(/NN/i);
});

test('documents keep cards simple and technical source details out of the main list',async({page})=>{
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await page.locator('#mainNav [data-view="more"]').click();
 await expect(page.locator('#moreView')).toContainText('Smlouvy, pojistky a důležité údaje');
 await expect(page.locator('#moreView')).toContainText('Pojištění auta');
 await expect(page.locator('#moreView')).toContainText('Co dál:');
 await expect(page.locator('#moreView')).toContainText('+ Přidat dokument / zdroj');
 await expect(page.locator('#moreView')).not.toContainText('Proof');
 await expect(page.locator('#moreView')).not.toContainText('Confidence');
 await expect(page.locator('#moreView')).not.toContainText('Resolver');
});
