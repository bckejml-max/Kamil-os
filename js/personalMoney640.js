import {store} from './state.js';
import {h,qs} from './utils.js';
import {ensurePersonalVault640,personalVault640} from './personalVault640.js';
import {openMoneyRecord645,updateMortgageSnapshot645,updateBankSnapshot645,createMoneyTask645} from './personalMoneyActions645.js';
import {personalMoneyPlan650} from './personalAssistant650.js';
import {personalDaysTo650} from './personalDate650.js';

const money=v=>new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(Number(v||0));
const date=v=>v?new Date(v).toLocaleDateString('cs-CZ'):'—';
const daysOld=v=>{const d=personalDaysTo650(v);return d===null?null:-d};
const val=(x,...keys)=>{for(const k of keys){const n=Number(x?.[k]);if(Number.isFinite(n)&&n!==0)return n}return 0};
function wealthSnapshot(s,v){
 const debt=v.records.filter(x=>['mortgage','loan','debt'].includes(x.recordType)).reduce((a,x)=>a+Math.abs(val(x,'balance','debtBalance')),0);
 const property=v.records.filter(x=>x.recordType==='property').reduce((a,x)=>a+val(x,'marketValue','estimatedValue','value'),0);
 const bank=v.records.filter(x=>x.recordType==='bank-data').reduce((a,x)=>a+val(x,'balance','cashBalance','currentBalance'),0);
 const xtbAccounts=Object.values(s.xtbHub?.accounts||{});
 // The hub is the canonical XTB source when present. Legacy s.xtb positions must not be added again.
 const genericPositions=[...(s.investments?.positions||[]),...(s.portfolio?.positions||[]),...(xtbAccounts.length?[]:(s.xtb?.positions||[]))];
 const genericInvest=genericPositions.reduce((a,x)=>a+val(x,'marketValueCzk','valueCzk'),0);
 const xtbAccountCzk=xtbAccounts.reduce((a,x)=>a+val(x,'totalValueCzk','marketValueCzk','valueCzk'),0);
 const xtbPositionsCzk=xtbAccounts.reduce((a,account)=>a+(account?.positions||[]).reduce((b,p)=>b+val(p,'marketValueCzk','valueCzk')+(String(account?.currency||'').toUpperCase()==='CZK'?val(p,'marketValue','currentValue','value'):0),0),0);
 const invest=genericInvest+(xtbAccountCzk||xtbPositionsCzk);
 const tickets=(s.ticketBook?.items||[]).filter(x=>['HOLD','LISTED'].includes(String(x.workflow||'').toUpperCase())).reduce((a,x)=>a+Number(x.buy||x.buyTotalCzk||0),0);
 const knownAssets=property+bank+invest+tickets,netKnown=knownAssets-debt,missing=[];
 if(!property)missing.push('tržní hodnota nemovitostí');if(!bank)missing.push('aktuální hotovost / účty');if(!invest)missing.push('aktuální investiční portfolio');
 return{debt,property,bank,invest,tickets,knownAssets,netKnown,missing,complete:missing.length===0,xtbConnected:xtbAccounts.length>0};
}
const confidenceLine=x=>{const st=x?.status,age=daysOld(x?.asOf);const tone=st?.code==='OK'&&age!==null&&age>=0&&age<=45?'fresh':st?.severity>=85?'bad':'stale',label=st?.effectiveConfidence?`důvěra ${Math.round(st.effectiveConfidence)} %`:age!==null?(age<0?'datum je v budoucnosti':`stav ${age} dní starý`):'zdroj není čerstvě potvrzený';return `<div class="data70-line ${tone}"><i class="data70-dot"></i><span>${h(x?.sourceLabel||'Uložený zdroj')} · ${h(label)}</span></div>`};

export function renderPersonalMoney640(){
 ensurePersonalVault640();const s=store.get(),v=personalVault640(s),plan=personalMoneyPlan650(s),wealth=wealthSnapshot(s,v),host=qs('#moneyView');if(!host)return;
 const mortgage=v.records.find(x=>x.recordType==='mortgage'),bank=v.records.find(x=>x.recordType==='bank-data');
 const recurring=v.records.filter(x=>x.monthlyAmount||x.annualAmount).sort((a,b)=>(Number(b.monthlyAmount||0)+Number(b.annualAmount||0)/12)-(Number(a.monthlyAmount||0)+Number(a.annualAmount||0)/12));
 const bankAge=daysOld(bank?.asOf),transactions=(s.personalSpending?.transactions||[]),spendComplete=transactions.length>0&&bankAge!==null&&bankAge>=0&&bankAge<=40;
 const mortgageAge=daysOld(mortgage?.asOf),issues=[];if(!spendComplete)issues.push({title:'Doplnit aktuální bankovní data',kind:'data'});if(plan.oneOff.length)issues.push(...plan.oneOff.slice(0,2).map(x=>({title:x.title||x.name||'Finanční úkol',kind:'task'})));if(mortgage&&(mortgageAge===null||mortgageAge<0||mortgageAge>60))issues.push({title:mortgageAge<0?'Opravit datum stavu hypotéky':'Aktualizovat zůstatek hypotéky',kind:'mortgage'});
 const nextMoney=wealth.missing.length?`Nejdřív doplň ${wealth.missing[0]}. Bez toho nebudu předstírat přesné čisté jmění.`:wealth.netKnown>0?'Majetek je kompletně zmapovaný. Další volné peníze posuzuj podle rezervy, dluhu a investičního plánu.':'Nejdřív zkontroluj dluhy a rezervu.';
 host.innerHTML=`<div class="ux64-page money-page"><div class="view-head"><div><div class="eyebrow">PENÍZE + WEALTH</div><h1>Rozhodnutí dřív než tabulky.</h1><p>Domácí závazky, majetek, dluhy a investice v jednom pohledu.</p></div><div class="row-actions"><button class="btn primary" id="moneyTask645">+ Finanční úkol</button></div></div>
 <div data-workspace305-anchor-money></div>
 <section class="card wealth69-decision"><div class="eyebrow">DALŠÍ FINANČNÍ KROK</div><b>${h(nextMoney)}</b>${wealth.missing.length?`<p class="muted">Chybí: ${h(wealth.missing.join(' · '))}</p>`:''}</section>
 <section class="wealth69-grid"><div class="metric wealth69-card assets"><span>Známá aktiva</span><b>${money(wealth.knownAssets)}</b></div><div class="metric wealth69-card debt"><span>Známé dluhy</span><b>${money(wealth.debt)}</b></div><div class="metric wealth69-card invest"><span>Investice + vstupenky</span><b>${money(wealth.invest+wealth.tickets)}</b></div><div class="metric wealth69-card cash"><span>${wealth.complete?'Čisté jmění':'Známé netto'}</span><b>${money(wealth.netKnown)}</b></div></section>
 <section class="money-action-summary ${issues.length?'has-issues':'all-clear'}"><div class="eyebrow">TEĎ</div>${issues.length?issues.map((x,i)=>`<div class="money-action-row"><span class="money-action-rank">${i+1}</span><b>${h(x.title)}</b></div>`).join(''):'<div class="money-clear"><b>Nic finančního teď nehoří.</b><span class="muted">Můžeš jen zkontrolovat pravidelné závazky.</span></div>'}</section>
 <section class="metric-strip money-metrics"><div class="metric"><span>Fixní platby</span><b>${money(plan.fixedMonthly)}/měs.</b></div><div class="metric"><span>Pojistky</span><b>${money(plan.insuranceAnnual)}/rok</b></div><div class="metric"><span>Hypotéka</span><b>${mortgage?money(mortgage.balance):'—'}</b></div><div class="metric"><span>31 dní</span><b>${plan.spendLabel||'Neúplná data'}</b></div></section>
 <div class="money-filters" role="tablist" aria-label="Filtr finančního přehledu"><button class="btn primary" data-money-filter="all">Vše</button><button class="btn" data-money-filter="wealth">Majetek</button><button class="btn" data-money-filter="recurring">Pravidelné</button><button class="btn" data-money-filter="oneoff">Jednorázové</button><button class="btn" data-money-filter="mortgage">Hypotéka</button><button class="btn" data-money-filter="data">Data</button></div>
 <section class="card money-section" data-money-group="wealth"><div class="eyebrow">WEALTH COCKPIT</div><div class="row"><span>Nemovitosti – známá hodnota</span><b>${wealth.property?money(wealth.property):'chybí'}</b></div><div class="row"><span>Hotovost / účty – známá hodnota</span><b>${wealth.bank?money(wealth.bank):'chybí'}</b></div><div class="row"><span>Investiční portfolio${wealth.xtbConnected?' · XTB připojeno':''}</span><b>${wealth.invest?money(wealth.invest):'chybí'}</b></div><div class="row"><span>Kapitál ve vstupenkách</span><b>${money(wealth.tickets)}</b></div><div class="row"><span>Dluhy</span><b>${money(wealth.debt)}</b></div><p class="muted">Cizoměnové XTB hodnoty bez uloženého CZK přepočtu nesčítám do čistého jmění. Raději ukážu neúplné číslo než falešnou přesnost.</p></section>
 ${!spendComplete?`<div class="decision-note money-section" data-money-group="data"><b>Výdaje nejsou kompletní.</b> ${bank?.asOf?`Poslední bankovní stav je k ${date(bank.asOf)}.`:'Nemám potvrzený aktuální bankovní snapshot.'} <button class="text-btn" id="moneyDataFix650">Doplnit data</button></div>`:''}
 <div class="ux64-two"><section class="card money-section" data-money-group="recurring"><div class="eyebrow">PRAVIDELNĚ ODCHÁZÍ</div>${recurring.map(x=>`<div class="row ux64-row"><div><b>${h(x.title)}</b><div class="muted">${h(x.provider||'')} ${x.asOf?`· stav ${date(x.asOf)}`:''}${confidenceLine(x)}</div></div><div class="row-actions"><b>${x.monthlyAmount?`${money(x.monthlyAmount)}/měs.`:`${money(x.annualAmount)}/rok`}</b><button class="btn" data-money-record="${h(x.id)}">Upravit</button></div></div>`).join('')||'<div class="empty">Zatím nemám známé pravidelné částky.</div>'}</section>
 <section class="card money-section" data-money-group="oneoff"><div class="eyebrow">JEDNORÁZOVÉ VĚCI</div>${plan.oneOff.length?plan.oneOff.map(x=>`<div class="row ux64-row"><div><b>${h(x.title||x.name||'Finanční úkol')}</b><div class="muted">${x.due?`termín ${date(x.due)}`:'bez termínu'}</div></div></div>`).join(''):'<div class="empty success-empty">Nemám známý jednorázový finanční úkol.</div>'}</section></div>
 ${mortgage?`<section class="card money-section" data-money-group="mortgage"><div class="eyebrow">HYPOTÉKA</div><div class="row"><span>Poslední známý zůstatek</span><b>${money(mortgage.balance)}</b></div><div class="row"><span>Měsíční splátka</span><b>${money(mortgage.monthlyAmount)}</b></div><div class="row"><span>Stav k</span><b>${date(mortgage.asOf)}</b></div>${confidenceLine(mortgage)}<div class="row-actions"><button class="btn primary" id="mortgageUpdate645">Aktualizovat zůstatek</button><button class="btn" data-money-record="${h(mortgage.id)}">Detail</button></div></section>`:''}
 ${bank?`<section class="card money-section" data-money-group="data"><div class="eyebrow">BANKOVNÍ DATA</div><div class="row"><span>Kompletní data k</span><b>${date(bank.asOf)}</b></div>${confidenceLine(bank)}<p class="muted">${h(bank.nextAction)}</p><button class="btn" id="bankUpdate645">Doplnit stav k datu</button></section>`:''}</div>`;
 const setFilter=filter=>{host.querySelectorAll('[data-money-filter]').forEach(b=>b.classList.toggle('primary',b.dataset.moneyFilter===filter));host.querySelectorAll('[data-money-group]').forEach(el=>{el.style.display=filter==='all'||el.dataset.moneyGroup===filter?'':'none'})};
 host.querySelectorAll('[data-money-filter]').forEach(b=>b.addEventListener('click',()=>setFilter(b.dataset.moneyFilter)));
 host.querySelectorAll('[data-money-record]').forEach(b=>b.addEventListener('click',async()=>{await openMoneyRecord645(b.dataset.moneyRecord);renderPersonalMoney640()}));
 host.querySelector('#mortgageUpdate645')?.addEventListener('click',async()=>{await updateMortgageSnapshot645(mortgage.id);renderPersonalMoney640()});
 const updateBank=async()=>{if(bank)await updateBankSnapshot645(bank.id);renderPersonalMoney640()};host.querySelector('#bankUpdate645')?.addEventListener('click',updateBank);host.querySelector('#moneyDataFix650')?.addEventListener('click',updateBank);
 host.querySelector('#moneyTask645')?.addEventListener('click',async()=>{await createMoneyTask645();renderPersonalMoney640()});
 if(typeof window!=='undefined')window.__KAMIL_WEALTH_700_LAST__={at:Date.now(),wealth,monthly:v.monthlyKnown,insuranceAnnual:v.insuranceAnnual,spendComplete,bankAge,mortgageAge,issues:issues.length};
}
