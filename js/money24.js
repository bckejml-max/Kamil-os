import {store} from './state.js';
import {money,date,qs,modal} from './utils.js';
import {netWorth,debtRemaining} from './intelligence.js';

export function renderMoney(){
 const s=store.get(),nw=netWorth(s),f=s.financePlan||{};
 const debts=(s.debtBook?.items||[]).filter(x=>x.status!=='PAID');
 const debtTotal=debts.reduce((n,x)=>n+debtRemaining(x),0);
 const expected=Number(f.expectedIncome||0),reserve=Number(f.reserveFloor||0),cash=Number(f.cashNow||0),planned=Number(f.plannedInvestment||0);
 const free=cash-reserve,afterPlanned=free-planned,invested=nw.xtb;
 const totalRaw=Math.max(1,cash+invested+nw.tickets+debtTotal);
 const pct=v=>Math.max(0,Math.min(100,Math.round(Number(v||0)/totalRaw*100)));
 qs('#moneyView').innerHTML=`
  <div class="view-head"><div><div class="eyebrow">PENÍZE / OVERVIEW</div><h1>Majetek a likvidita</h1><p>Co máš, co je dostupné hned a co je ještě na cestě.</p></div><div class="view-head-stat"><b>${money(nw.adjusted)}</b><span>opatrný odhad majetku</span></div></div>
  <div class="metric-strip money-metrics">
   <div class="metric"><span>Hotovost</span><b>${money(cash)}</b></div>
   <div class="metric"><span>XTB</span><b>${money(invested)}</b></div>
   <div class="metric"><span>Pohledávky</span><b>${money(debtTotal)}</b></div>
   <div class="metric"><span>Vstupenky</span><b>${money(nw.tickets)}</b></div>
  </div>
  <div class="money-layout">
   <div class="card money-main">
    <div class="card-head"><div><div class="eyebrow">STRUKTURA</div><h2>Kde jsou peníze</h2></div><button class="btn" id="editFinance24">Upravit plán</button></div>
    ${bar('Hotovost',cash,pct(cash))}${bar('XTB',invested,pct(invested))}${bar('Pohledávky',debtTotal,pct(debtTotal))}${bar('Vstupenky',nw.tickets,pct(nw.tickets))}
   </div>
   <div class="card liquidity-card">
    <div class="eyebrow">LIKVIDITA</div><div class="liquidity-number ${free<0?'bad':''}">${money(free)}</div><div class="muted">nad rezervním minimem</div>
    <div class="row"><span>Rezervní minimum</span><b>${money(reserve)}</b></div>
    <div class="row"><span>Plánovaná investice</span><b>${money(planned)}</b></div>
    <div class="row"><span>Po plánované investici</span><b class="${afterPlanned>=0?'good':'bad'}">${money(afterPlanned)}</b></div>
    <div class="row"><span>Očekávané příjmy</span><b>${money(expected)}</b></div>
   </div>
  </div>
  <div class="grid two">
   <div class="card"><div class="card-head"><div><div class="eyebrow">XTB</div><h2>Investice</h2></div><span class="status">${s.xtbHub?.positionCount||0} pozic</span></div>
    <div class="row"><span>CZK účet</span><b>${money(s.xtbReport?.czkValue)}</b></div>
    <div class="row"><span>CZK P/L</span><b class="${Number(s.xtbReport?.czkProfit||0)>=0?'good':'bad'}">${money(s.xtbReport?.czkProfit)}</b></div>
    <div class="row"><span>EUR účet</span><b>${Number(s.xtbReport?.eurValue||0).toLocaleString('cs-CZ')} €</b></div>
    <div class="row"><span>Aktualizováno</span><b>${date(s.xtbReport?.asOf)}</b></div>
   </div>
   <div class="card"><div class="card-head"><div><div class="eyebrow">POHLEDÁVKY</div><h2>Co ti dluží</h2></div><div class="row-actions"><span class="status">${debts.length} aktivních</span><button class="btn" data-capture-money>＋ Přidat</button></div></div>
    ${debts.slice(0,6).map(x=>`<div class="row"><div><b>${x.person||'Neznámý'}</b><div class="muted">${x.reason||'Pohledávka'}</div></div><b>${money(debtRemaining(x))}</b></div>`).join('')||'<div class="empty">Žádné aktivní pohledávky.</div>'}
   </div>
  </div>`;
 qs('#editFinance24').onclick=editFinance;
 qs('[data-capture-money]',qs('#moneyView'))?.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('kamil:capture')));
}

const bar=(label,value,pct)=>`<div class="money-bar"><div class="money-bar-head"><span>${label}</span><b>${money(value)}</b></div><div class="money-track"><i style="width:${pct}%"></i></div><span class="money-pct">${pct} %</span></div>`;

async function editFinance(){
 const f=store.get().financePlan||{};
 const body=`<div class="form-grid"><label>Hotovost<input id="cash24" type="number" value="${Number(f.cashNow)||0}"></label><label>Očekávané příjmy<input id="income24" type="number" value="${Number(f.expectedIncome)||0}"></label><label>Rezervní minimum<input id="reserve24" type="number" value="${Number(f.reserveFloor)||0}"></label><label>Plánovaná investice<input id="invest24" type="number" value="${Number(f.plannedInvestment)||0}"></label></div>`;
 const ok=await modal('Finanční plán',body,[{label:'Zrušit',value:false},{label:'Uložit',value:true,primary:true}]);if(!ok)return;
 store.mutate('Upraven finanční plán',s=>Object.assign(s.financePlan,{cashNow:Number(qs('#cash24')?.value||0),expectedIncome:Number(qs('#income24')?.value||0),reserveFloor:Number(qs('#reserve24')?.value||0),plannedInvestment:Number(qs('#invest24')?.value||0)}));
}
