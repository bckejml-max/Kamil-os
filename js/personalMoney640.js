import {store} from './state.js';
import {h,qs} from './utils.js';
import {ensurePersonalVault640,personalVault640} from './personalVault640.js';
import {openMoneyRecord645,updateMortgageSnapshot645,updateBankSnapshot645,createMoneyTask645} from './personalMoneyActions645.js';
import {personalMoneyPlan650} from './personalAssistant650.js';

const money=v=>new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(Number(v||0));
const date=v=>v?new Date(v).toLocaleDateString('cs-CZ'):'—';
const daysOld=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.floor((Date.now()-t)/86400000):null};

export function renderPersonalMoney640(){
 ensurePersonalVault640();const s=store.get(),v=personalVault640(s),plan=personalMoneyPlan650(s),host=qs('#moneyView');if(!host)return;
 const mortgage=v.records.find(x=>x.recordType==='mortgage'),bank=v.records.find(x=>x.recordType==='bank-data');
 const recurring=v.records.filter(x=>x.monthlyAmount||x.annualAmount).sort((a,b)=>(Number(b.monthlyAmount||0)+Number(b.annualAmount||0)/12)-(Number(a.monthlyAmount||0)+Number(a.annualAmount||0)/12));
 const bankAge=daysOld(bank?.asOf),transactions=(s.personalSpending?.transactions||[]),spendComplete=transactions.length>0&&bankAge!==null&&bankAge<=40;
 host.innerHTML=`<div class="ux64-page"><div class="view-head"><div><div class="eyebrow">PENÍZE DOMÁCNOSTI</div><h1>Měsíční plán domácnosti</h1><p>Fixní závazky, poslední známé výdaje a věci, které mají přijít.</p></div><div class="row-actions"><button class="btn primary" id="moneyTask645">+ Finanční úkol</button></div></div>
 <div class="metric-strip"><div class="metric"><span>Známé fixní platby</span><b>${money(plan.fixedMonthly)}/měs.</b></div><div class="metric"><span>Známé pojistky</span><b>${money(plan.insuranceAnnual)}/rok</b></div><div class="metric"><span>Hypotéka — jistina</span><b>${mortgage?money(mortgage.balance):'—'}</b></div><div class="metric"><span>Posledních 31 dní</span><b>${plan.spendLabel||'Neúplná data'}</b></div></div>
 ${!spendComplete?`<div class="decision-note"><b>Výdaje nejsou kompletní.</b> ${bank?.asOf?`Poslední bankovní stav je k ${date(bank.asOf)}.`:'Nemám potvrzený aktuální bankovní snapshot.'} <button class="text-btn" id="moneyDataFix650">Doplnit data</button></div>`:''}
 <div class="ux64-two"><section class="card"><div class="eyebrow">PRAVIDELNĚ ODCHÁZÍ</div>${recurring.map(x=>`<div class="row ux64-row"><div><b>${h(x.title)}</b><div class="muted">${h(x.provider||'')} ${x.asOf?`· stav ${date(x.asOf)}`:''}</div></div><div class="row-actions"><b>${x.monthlyAmount?`${money(x.monthlyAmount)}/měs.`:`${money(x.annualAmount)}/rok`}</b><button class="btn" data-money-record="${h(x.id)}">Upravit</button></div></div>`).join('')||'<div class="empty">Zatím nemám známé pravidelné částky.</div>'}</section>
 <section class="card"><div class="eyebrow">JEDNORÁZOVÉ VĚCI</div>${plan.oneOff.length?plan.oneOff.map(x=>`<div class="row ux64-row"><div><b>${h(x.title||x.name||'Finanční úkol')}</b><div class="muted">${x.due?`termín ${date(x.due)}`:'bez termínu'}</div></div></div>`).join(''):'<div class="empty success-empty">Nemám známý jednorázový finanční úkol.</div>'}</section></div>
 ${mortgage?`<section class="card"><div class="eyebrow">HYPOTÉKA</div><div class="row"><span>Poslední známý zůstatek</span><b>${money(mortgage.balance)}</b></div><div class="row"><span>Měsíční splátka</span><b>${money(mortgage.monthlyAmount)}</b></div><div class="row"><span>Stav k</span><b>${date(mortgage.asOf)}</b></div><div class="row-actions"><button class="btn primary" id="mortgageUpdate645">Aktualizovat zůstatek</button><button class="btn" data-money-record="${h(mortgage.id)}">Detail</button></div></section>`:''}
 ${bank?`<section class="card"><div class="eyebrow">BANKOVNÍ DATA</div><div class="row"><span>Kompletní data k</span><b>${date(bank.asOf)}</b></div><p class="muted">${h(bank.nextAction)}</p><button class="btn" id="bankUpdate645">Doplnit stav k datu</button></section>`:''}</div>`;
 host.querySelectorAll('[data-money-record]').forEach(b=>b.addEventListener('click',async()=>{await openMoneyRecord645(b.dataset.moneyRecord);renderPersonalMoney640()}));
 host.querySelector('#mortgageUpdate645')?.addEventListener('click',async()=>{await updateMortgageSnapshot645(mortgage.id);renderPersonalMoney640()});
 const updateBank=async()=>{if(bank)await updateBankSnapshot645(bank.id);renderPersonalMoney640()};host.querySelector('#bankUpdate645')?.addEventListener('click',updateBank);host.querySelector('#moneyDataFix650')?.addEventListener('click',updateBank);
 host.querySelector('#moneyTask645')?.addEventListener('click',async()=>{await createMoneyTask645();renderPersonalMoney640()});
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_MONEY_650_LAST__={at:Date.now(),monthly:v.monthlyKnown,insuranceAnnual:v.insuranceAnnual,spendComplete,bankAge};
}
