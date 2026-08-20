import {store} from './state.js';
import {capitalAllocation} from './capitalAllocation25.js';
import {h,money,qs} from './utils.js';

const hostId='capitalAllocation25Host';
const statusLabel=x=>x==='PROTECT'?'Chránit hotovost':x==='PARTIAL'?'Část nechat volnou':'Kapitál rozdělen';
const statusClass=x=>x==='PROTECT'?'bad':x==='PARTIAL'?'warn':'good';
const sourceClass=x=>String(x||'').includes('ŽIVĚ')?'good':String(x||'').includes('ZASTARALÝ')?'warn':'';

function renderCard(){
 const a=capitalAllocation(store.get());
 return `<div class="card" id="${hostId}" style="margin-top:12px">
  <div class="card-head"><div><div class="eyebrow">CAPITAL ALLOCATION / 25.7</div><h2>Kam může jít další nový kapitál</h2></div><span class="status ${statusClass(a.status)}">${h(statusLabel(a.status))}</span></div>
  <div class="metric-strip"><div class="metric"><span>Bezpečně nový kapitál</span><b class="${a.newCapital>0?'good':''}">${money(a.newCapital)}</b></div><div class="metric"><span>Už plánováno</span><b>${money(a.fundedPlan)}</b></div><div class="metric"><span>XTB návrh</span><b>${money(a.rows.find(x=>x.key==='xtb')?.amount||0)}</b></div><div class="metric"><span>Ticket limit</span><b>${money(a.rows.find(x=>x.key==='tickets')?.amount||0)}</b></div></div>
  <div class="decision-note ${a.unfundedPlan>0?'warn':''}">Bezpečný prostor před plánovanou investicí: <b>${money(a.safeBeforePlan)}</b>. Po odečtení už naplánované investice zbývá <b>${money(a.newCapital)}</b>. Výpočet používá nižší z dnešního a 90denního rezervního headroomu.</div>
  <div class="intel-list">${a.rows.map(x=>`<div class="intel-row"><div class="intel-main"><b>${h(x.label)}</b><span>${h(x.reason)}</span></div><div class="row-actions"><b class="${x.key==='reserve'?'':Number(x.amount)>0?'good':''}">${money(x.amount)}</b><span class="status ${sourceClass(x.source)}">${h(x.source)}</span><span class="decision-action">${h(x.action)}</span></div></div>`).join('')}</div>
  ${a.blockers.length?`<div class="intel-rules">${a.blockers.map(x=>`<div class="intel-rule"><span>Ochrana</span><b>${h(x)}</b></div>`).join('')}</div>`:''}
  <div class="decision-note">XTB import: <b>${h(a.freshness.xtbImport.label)}</b> · XTB live intelligence: <b>${h(a.freshness.xtbLive.label)}</b> · ticket intelligence: <b>${h(a.freshness.ticketLive.label)}</b>. ${h(a.note)}</div>
 </div>`;
}

function mount(){
 const view=qs('#moneyView');if(!view||qs(`#${hostId}`,view)||!view.childElementCount)return;
 const wrap=document.createElement('div');wrap.innerHTML=renderCard();const node=wrap.firstElementChild;
 const cashflow=qs('#cashflow90Host',view),metrics=view.querySelector('.metric-strip.money-metrics');
 if(cashflow?.parentNode)cashflow.parentNode.insertBefore(node,cashflow.nextSibling);
 else if(metrics?.parentNode)metrics.parentNode.insertBefore(node,metrics.nextSibling);
 else view.appendChild(node);
}

const start=()=>{const view=qs('#moneyView');if(!view)return;new MutationObserver(()=>{if(!qs(`#${hostId}`,view)&&view.childElementCount)queueMicrotask(mount)}).observe(view,{childList:true});if(view.childElementCount)mount()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
