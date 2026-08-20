import {store} from './state.js';
import {capitalActionPlan} from './actionPlan25.js';
import {h,money,qs} from './utils.js';

const hostId='actionPlan25Host';
const stateLabel=x=>x==='DO_NOW'?'UDĚLAT TEĎ':x==='REVIEW'?'PROVĚŘIT':'POČKAT';
const stateClass=x=>x==='DO_NOW'?'bad':x==='REVIEW'?'warn':'';

function renderCard(){
 const p=capitalActionPlan(store.get());
 return `<div class="card" id="${hostId}" style="margin-top:12px">
  <div class="card-head"><div><div class="eyebrow">ACTION PLAN / 25.8</div><h2>Co udělat v jakém pořadí</h2></div><span class="status ${p.doNow?'bad':p.review?'warn':'good'}">${p.doNow} teď · ${p.review} prověřit · ${p.wait} počkat</span></div>
  <div class="decision-note ${p.top.state==='DO_NOW'?'warn':''}"><b>První krok:</b> ${h(p.top.title)}${p.top.amount>0?` · ${money(p.top.amount)}`:''}. ${h(p.top.reason)}</div>
  <div class="intel-list">${p.steps.map((x,i)=>`<div class="intel-row"><div class="intel-main"><b>${i+1}. ${h(x.title)}</b><span>${h(x.reason)}</span></div><div class="row-actions">${x.amount>0?`<b>${money(x.amount)}</b>`:''}${x.qty?`<span class="status">${Number(x.qty).toLocaleString('cs-CZ',{maximumFractionDigits:4})} ks</span>`:''}<span class="status">${h(x.source)}</span><span class="decision-action ${stateClass(x.state)}">${h(stateLabel(x.state))}</span><button class="btn" data-action-plan-nav="${h(x.navigate)}">Otevřít</button></div></div>`).join('')}</div>
  <div class="decision-note">${h(p.note)}</div>
 </div>`;
}

function bind(node){node.querySelectorAll('[data-action-plan-nav]').forEach(b=>b.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:b.dataset.actionPlanNav}))));}
function mount(){
 const view=qs('#moneyView');if(!view||qs(`#${hostId}`,view)||!view.childElementCount)return;
 const wrap=document.createElement('div');wrap.innerHTML=renderCard();const node=wrap.firstElementChild;
 const allocation=qs('#capitalAllocation25Host',view),cashflow=qs('#cashflow90Host',view),metrics=view.querySelector('.metric-strip.money-metrics');
 if(allocation?.parentNode)allocation.parentNode.insertBefore(node,allocation.nextSibling);
 else if(cashflow?.parentNode)cashflow.parentNode.insertBefore(node,cashflow.nextSibling);
 else if(metrics?.parentNode)metrics.parentNode.insertBefore(node,metrics.nextSibling);
 else view.appendChild(node);
 bind(node);
}
const start=()=>{const view=qs('#moneyView');if(!view)return;new MutationObserver(()=>{if(!qs(`#${hostId}`,view)&&view.childElementCount)queueMicrotask(mount)}).observe(view,{childList:true});if(view.childElementCount)mount()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
