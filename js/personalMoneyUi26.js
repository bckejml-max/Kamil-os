import {store} from './state.js';
import {personalMoney} from './personalMoney26.js';
import {h,qs} from './utils.js';

const id='personalMoney26Host';
function mount(){
 const view=qs('#moneyView');if(!view||qs(`#${id}`,view))return;
 const a=personalMoney(store.get()),rows=Object.entries(a.byCurrency||{}),cats=Object.values(a.byCategory||{});
 const card=document.createElement('div');card.id=id;card.className='card';
 card.innerHTML=`<div class="card-head"><div><div class="eyebrow">PERSONAL MONEY / 26.0</div><h2>Kolik stojí můj život</h2></div><span class="status ${a.cashflow.status==='RISK'?'bad':a.cashflow.status==='TIGHT'?'warn':'good'}">CASHFLOW ${h(a.cashflow.status)}</span></div>
 <div class="metric-strip">${rows.map(([c,v])=>`<div class="metric"><span>${h(c)} / měsíc</span><b>${Number(v.monthly||0).toLocaleString('cs-CZ',{maximumFractionDigits:0})}</b><small>minimum ${Number(v.essentialMonthly||0).toLocaleString('cs-CZ',{maximumFractionDigits:0})}</small></div>`).join('')||'<div class="metric"><span>Opakované náklady</span><b>—</b></div>'}<div class="metric"><span>Bez částky</span><b>${a.recurringMissing}</b></div></div>
 <div class="personal-money-cats">${cats.slice(0,6).map(x=>`<div class="row"><span>${h(x.label)}</span><b>${Object.entries(x.byCurrency).map(([c,v])=>`${h(c)} ${Number(v).toLocaleString('cs-CZ',{maximumFractionDigits:0})}/měs`).join(' · ')}</b></div>`).join('')}</div>
 <div class="decision-note">${h(a.note)} 90denní minimum hotovosti: ${Number(a.cashflow.minBalance||0).toLocaleString('cs-CZ')} Kč.</div>`;
 const head=view.querySelector('.view-head');if(head)head.insertAdjacentElement('afterend',card);else view.prepend(card);
}
const start=()=>{const view=qs('#moneyView');if(!view)return;new MutationObserver(()=>{if(!qs(`#${id}`,view))queueMicrotask(mount)}).observe(view,{childList:true,subtree:false});mount()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
