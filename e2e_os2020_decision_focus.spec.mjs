import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

async function boot(page){
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
}
async function activate(page,view){
 await page.evaluate(name=>{
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('on'));
  document.querySelector(`#view-${name}`)?.classList.add('on');
 },view);
}

test('OS2040 turns Tickets into a four-KPI action cockpit with progressive detail',async({page})=>{
 await boot(page);await activate(page,'tickets');
 await page.evaluate(async()=>{
  const host=document.querySelector('#ticketIntelView');
  host.innerHTML=`<section class="ticket640">
   <div class="ticket640-head"><div><h2>Ticket Command Center</h2><p>legacy explanation</p></div><span class="ticket640-badge">ONLINE</span></div>
   <div class="ticket640-kpis">
    <div class="ticket640-kpi" data-kpi="1"><span>KOUPIT DNES</span><b>2</b></div>
    <div class="ticket640-kpi" data-kpi="2"><span>ZLEVNIT</span><b>1</b></div>
    <div class="ticket640-kpi" data-kpi="3"><span>PRODAT</span><b>3</b></div>
    <div class="ticket640-kpi" data-kpi="4"><span>VOLNÁ HOTOVOST</span><b>25 000 Kč</b></div>
    <div class="ticket640-kpi" data-kpi="5"><span>AKTIVNÍ TICKET KAPITÁL</span><b>50 000 Kč</b></div>
    <div class="ticket640-kpi" data-kpi="6"><span>ČEKÁ PAYOUT</span><b>10 000 Kč</b></div>
   </div>
   <div class="ticket640-command">Priorita: prodat event A.</div>
   <div class="ticket640-grid">
    <section class="ticket640-col buy"><h3>CO KOUPIT DNES<span>2</span></h3>${Array.from({length:6},(_,i)=>`<div class="ticket640-row" data-row="${i+1}"><b>Buy ${i+1}</b></div>`).join('')}</section>
    <section class="ticket640-col lower"><h3>CO ZLEVNIT<span>0</span></h3><div class="ticket640-empty">Nic</div></section>
    <section class="ticket640-col sell"><h3>CO PRODAT<span>1</span></h3><div class="ticket640-row"><b>Sell 1</b></div></section>
   </div>
   <div class="ticket640-lowergrid" data-test-advanced>advanced</div><div class="ticket640-note">note</div>
  </section>`;
  const m=await import('./js/decisionFocus2020.js');m.applyDecisionFocus2020('tickets');
 });
 await expect(page.locator('#ticketIntelView [data-os2020-focusbar]')).toBeVisible();
 await expect(page.locator('#ticketIntelView [data-os2020-summary]')).toContainText('2 koupit · 1 zlevnit · 3 prodat');
 await expect(page.locator('link[data-os2040-css]')).toHaveCount(1);
 await expect(page.locator('#ticketIntelView .ticket640-head p')).toBeHidden();
 await expect(page.locator('#ticketIntelView [data-test-advanced]')).toBeHidden();
 await expect(page.locator('#ticketIntelView [data-kpi="4"]')).toBeVisible();
 await expect(page.locator('#ticketIntelView [data-kpi="5"]')).toBeHidden();
 await expect(page.locator('#ticketIntelView [data-row="4"]')).toBeVisible();
 await expect(page.locator('#ticketIntelView [data-row="5"]')).toBeHidden();
 const btn=page.locator('#ticketIntelView [data-os2020-toggle]');
 await expect(btn).toHaveText('Pokročilé');
 await btn.click();
 await expect(page.locator('#ticketIntelView [data-test-advanced]')).toBeVisible();
 await expect(page.locator('#ticketIntelView [data-kpi="5"]')).toBeVisible();
 await expect(page.locator('#ticketIntelView [data-row="5"]')).toBeVisible();
 await expect(btn).toHaveAttribute('aria-expanded','true');
});

test('OS2030 keeps Betting history and secondary KPIs hidden while action layer remains visible',async({page})=>{
 await boot(page);await activate(page,'betting');
 await page.evaluate(async()=>{
  const host=document.querySelector('#bettingView');
  host.innerHTML='<div class="bet630-kpis">'+Array.from({length:12},(_,i)=>`<div class="bet630-kpi" data-kpi="${i+1}">KPI ${i+1}</div>`).join('')+'</div><div class="bet630-actions" data-test-primary>primary</div><div class="bet630-performance" data-test-advanced>history</div><div class="bet630-two">admin</div>';
  const m=await import('./js/decisionFocus2020.js');m.applyDecisionFocus2020('betting');
 });
 await expect(page.locator('#bettingView [data-test-primary]')).toBeVisible();
 await expect(page.locator('#bettingView [data-test-advanced]')).toBeHidden();
 await expect(page.locator('#bettingView [data-kpi="4"]')).toBeVisible();
 await expect(page.locator('#bettingView [data-kpi="5"]')).toBeHidden();
 const btn=page.locator('#bettingView [data-os2020-toggle]');
 await btn.click();
 await expect(page.locator('#bettingView [data-test-advanced]')).toBeVisible();
 await expect(page.locator('#bettingView [data-kpi="12"]')).toBeVisible();
 const state=await page.evaluate(()=>window.__KAMIL_DECISION_FOCUS2020__);
 expect(state?.healthy).toBe(true);
 expect(state?.view).toBe('betting');
});
