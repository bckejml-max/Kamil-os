import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

async function boot(page){
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
}

test('OS2020 keeps Ticket advanced layers hidden until requested',async({page})=>{
 await boot(page);
 await page.evaluate(async()=>{
  const host=document.querySelector('#ticketIntelView');
  host.innerHTML='<div class="ticket640-lowergrid" data-test-advanced>advanced</div><div class="ticket640-note">note</div>';
  const m=await import('./js/decisionFocus2020.js');m.applyDecisionFocus2020('tickets');
 });
 await expect(page.locator('#ticketIntelView [data-os2020-focusbar]')).toBeVisible();
 await expect(page.locator('#ticketIntelView [data-test-advanced]')).toBeHidden();
 const btn=page.locator('#ticketIntelView [data-os2020-toggle]');
 await expect(btn).toHaveText('Pokročilé');
 await btn.click();
 await expect(page.locator('#ticketIntelView [data-test-advanced]')).toBeVisible();
 await expect(btn).toHaveAttribute('aria-expanded','true');
 await btn.click();
 await expect(page.locator('#ticketIntelView [data-test-advanced]')).toBeHidden();
});

test('OS2020 keeps Betting history hidden while action layer remains visible',async({page})=>{
 await boot(page);
 await page.evaluate(async()=>{
  const host=document.querySelector('#bettingView');
  host.innerHTML='<div class="bet630-actions" data-test-primary>primary</div><div class="bet630-performance" data-test-advanced>history</div><div class="bet630-two">admin</div>';
  const m=await import('./js/decisionFocus2020.js');m.applyDecisionFocus2020('betting');
 });
 await expect(page.locator('#bettingView [data-test-primary]')).toBeVisible();
 await expect(page.locator('#bettingView [data-test-advanced]')).toBeHidden();
 await page.locator('#bettingView [data-os2020-toggle]').click();
 await expect(page.locator('#bettingView [data-test-advanced]')).toBeVisible();
 const state=await page.evaluate(()=>window.__KAMIL_DECISION_FOCUS2020__);
 expect(state?.healthy).toBe(true);
 expect(state?.view).toBe('betting');
});
