import {store} from './state.js';
import {h,qs} from './utils.js';
import {ensurePersonalVault640,personalVault640} from './personalVault640.js';
import {openMoneyRecord645,updateMortgageSnapshot645,updateBankSnapshot645,createMoneyTask645} from './personalMoneyActions645.js';

const money=v=>new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(Number(v||0));
const date=v=>v?new Date(v).toLocaleDateString('cs-CZ'):'—';
const expense=x=>{const n=Number(x?.amount||0),kind=String(x?.type||x?.kind||'').toLowerCase();return kind.includes('expense')||kind.includes('out')||n<0?Math.abs(n):0};

export function renderPersonalMoney640(){
 ensurePersonalVault640();const s=store.get(),v=personalVault640(s),host=qs('#moneyView');if(!host)return;
 const mortgage=v.records.find(x=>x.recordType==='mortgage'),bank=v.records.find(x=>x.recordType==='bank-data');
 const recurring=v.records.filter(x=>x.monthlyAmount||x.annualAmount).sort((a,b)=>(Number(b.monthlyAmount||0)+Number(b.annualAmount||0)/12)-(Number(a.monthlyAmount||0)+Number(a.annualAmount||0)/12));
 const cutoff=Date.now()-31*86400000,recent=(s.personalSpending?.transactions||[]).filter(x=>{const t=Date.parse(x.date||x.at||'');return Number.isFinite(t)&&t>=cutoff}),spend=recent.reduce((a,x)=>a+expense(x),0);
 host.innerHTML=`<div class="ux64-page"><div class="view-head"><div><div class="eyebrow">PENÍZE DOMÁCNOSTI</div><h1>Kolik pravidelně odchází</h1><p>Jen osobní cashflow a závazky domácnosti.</p></div><div class="row-actions"><button class="btn primary" id="moneyTask645">+ Finanční úkol</button></div></div>
 <div class="metric-strip"><div class="metric"><span>Známé pravidelné závazky</span><b>${money(v.monthlyKnown)}/měs.</b></div><div class="metric"><span>Známé pojistky</span><b>${money(v.insuranceAnnual)}/rok</b></div><div class="metric"><span>Hypotéka — jistina</span><b>${mortgage?money(mortgage.balance):'—'}</b></div><div class="metric"><span>Výdaje za 31 dní</span><b>${spend?money(spend):'—'}</b></div></div>
 <section class="card"><div class="eyebrow">PRAVIDELNÉ PLATBY, KTERÉ ZNÁM</div>${recurring.map(x=>`<div class="row ux64-row"><div><b>${h(x.title)}</b><div class="muted">${h(x.provider||'')} ${x.asOf?`· stav ${date(x.asOf)}`:''}</div></div><div class="row-actions"><b>${x.monthlyAmount?`${money(x.monthlyAmount)}/měs.`:`${money(x.annualAmount)}/rok`}</b><button class="btn" data-money-record="${h(x.id)}">Upravit / potvrdit</button></div></div>`).join('')||'<div class="empty">Zatím nemám známé pravidelné částky.</div>'}<div class="decision-note">Součet nezahrnuje položky, u kterých částku spolehlivě neznáme — například aktuální auto pojištění nebo cenu elektřiny, pokud není v datech.</div></section>
 ${mortgage?`<section class="card"><div class="eyebrow">HYPOTÉKA</div><div class="row"><span>Poslední známý zůstatek</span><b>${money(mortgage.balance)}</b></div><div class="row"><span>Měsíční splátka</span><b>${money(mortgage.monthlyAmount)}</b></div><div class="row"><span>Stav k</span><b>${date(mortgage.asOf)}</b></div><p class="muted">${h(mortgage.nextAction)}</p><div class="row-actions"><button class="btn primary" id="mortgageUpdate645">Aktualizovat zůstatek</button><button class="btn" data-money-record="${h(mortgage.id)}">Detail</button></div></section>`:''}
 ${bank?`<section class="card"><div class="eyebrow">BANKOVNÍ DATA</div><div class="row"><span>Kompletní data k</span><b>${date(bank.asOf)}</b></div><p class="muted">${h(bank.nextAction)}</p><button class="btn" id="bankUpdate645">Doplnit stav k datu</button></section>`:''}</div>`;
 host.querySelectorAll('[data-money-record]').forEach(b=>b.addEventListener('click',async()=>{await openMoneyRecord645(b.dataset.moneyRecord);renderPersonalMoney640()}));
 host.querySelector('#mortgageUpdate645')?.addEventListener('click',async()=>{await updateMortgageSnapshot645(mortgage.id);renderPersonalMoney640()});
 host.querySelector('#bankUpdate645')?.addEventListener('click',async()=>{await updateBankSnapshot645(bank.id);renderPersonalMoney640()});
 host.querySelector('#moneyTask645')?.addEventListener('click',async()=>{await createMoneyTask645();renderPersonalMoney640()});
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_UX_640_LAST__={at:Date.now(),view:'money',monthly:v.monthlyKnown,insuranceAnnual:v.insuranceAnnual};
}
