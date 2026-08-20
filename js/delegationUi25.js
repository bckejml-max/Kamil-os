import {store} from './state.js';
import {delegationCenter} from './delegation25.js';
import {h,date,qs,qsa,toast} from './utils.js';

const hostId='delegation25Host';
const tone=x=>x==='OVERDUE'?'bad':x==='DUE'||x==='STALE'?'warn':x==='SOON'?'':'good';
const stateLabel=x=>({OVERDUE:'Po termínu',DUE:'Dnes',STALE:'Bez kontroly',SOON:'Brzy',WAITING:'Čeká'}[x]||x);
const addDays=(days,hour=9)=>{const d=new Date();d.setDate(d.getDate()+days);d.setHours(hour,0,0,0);return d.toISOString()};

function card(){
 const d=delegationCenter(store.get());
 return `<div class="card" id="${hostId}" style="margin-bottom:12px">
  <div class="card-head"><div><div class="eyebrow">DELEGATION CENTER / 25.10</div><h2>Čekám na — bez ztracených follow-upů</h2></div><div class="row-actions"><span class="status ${d.overdue?'bad':d.needsAction?'warn':'good'}">${d.needsAction} k řešení</span><button class="btn" data-delegation-add>＋ Čekám na</button></div></div>
  <div class="metric-strip"><div class="metric"><span>Po termínu</span><b class="${d.overdue?'bad':'good'}">${d.overdue}</b></div><div class="metric"><span>Follow-up dnes</span><b class="${d.due?'warn':''}">${d.due}</b></div><div class="metric"><span>Bez kontroly</span><b class="${d.stale?'warn':''}">${d.stale}</b></div><div class="metric"><span>Kontakt dnes</span><b>${d.contactedToday}</b></div></div>
  <div class="decision-note ${d.overdue?'warn':''}">${h(d.summary)}</div>
  <div class="intel-list">${d.rows.map(x=>`<div class="intel-row"><div class="intel-main"><div><span class="status ${tone(x.state)}">${h(stateLabel(x.state))}</span> <span class="decision-action">${h(x.action)}</span></div><b>${h(x.title)}</b><span>${h(x.reason)}</span><small>${x.person?`Čekám od: ${h(x.person)} · `:''}${x.followUpAt?`kontrola ${h(date(x.followUpAt))} · `:''}${x.ageDays!==null?`stáří ${x.ageDays} dní · `:''}${h(x.source)}</small></div><div class="row-actions"><button class="btn primary" data-delegation-contact="${h(x.id)}">Follow-up zapsán</button><button class="btn" data-delegation-tomorrow="${h(x.id)}">Zítra</button><button class="btn" data-delegation-3d="${h(x.id)}">+3 dny</button><button class="btn quiet-action" data-delegation-done="${h(x.id)}">Vyřešeno</button></div></div>`).join('')||'<div class="empty success-empty">Žádné aktivní položky Čekám na.</div>'}</div>
  <div class="decision-note">${h(d.note)} Tlačítko „Follow-up zapsán“ pouze zaznamená, že jsi kontakt provedl, a nastaví další kontrolu za 3 dny.</div>
 </div>`;
}

function mutate(id,label,fn){
 store.mutate(label,s=>{const w=(s.delegations||[]).find(x=>x.id===id);if(!w)return;fn(w);w.updatedAt=new Date().toISOString()});
}
function bind(view){
 qsa('[data-delegation-add]',view).forEach(b=>b.onclick=()=>window.dispatchEvent(new CustomEvent('kamil:capture',{detail:'wait'})));
 qsa('[data-delegation-contact]',view).forEach(b=>b.onclick=()=>{mutate(b.dataset.delegationContact,'Zapsán follow-up',w=>{w.lastContactAt=new Date().toISOString();w.followUpAt=addDays(3)});toast('Follow-up zapsán · další kontrola za 3 dny')});
 qsa('[data-delegation-tomorrow]',view).forEach(b=>b.onclick=()=>{mutate(b.dataset.delegationTomorrow,'Delegace odložena na zítra',w=>{w.followUpAt=addDays(1)});toast('Kontrola přesunuta na zítra')});
 qsa('[data-delegation-3d]',view).forEach(b=>b.onclick=()=>{mutate(b.dataset.delegation3d,'Delegace odložena o 3 dny',w=>{w.followUpAt=addDays(3)});toast('Kontrola přesunuta o 3 dny')});
 qsa('[data-delegation-done]',view).forEach(b=>b.onclick=()=>{mutate(b.dataset.delegationDone,'Delegace vyřešena',w=>{w.status='DONE';w.resolvedAt=new Date().toISOString()});toast('Položka označena jako vyřešená')});
}
function mount(){
 const view=qs('#workView');if(!view||qs(`#${hostId}`,view)||!view.childElementCount||qs('#projectBack24',view))return;
 const wrap=document.createElement('div');wrap.innerHTML=card();const node=wrap.firstElementChild;
 const director=qs('#director25Host',view),head=view.querySelector('.view-head');
 if(director?.parentNode)director.parentNode.insertBefore(node,director.nextSibling);else if(head?.parentNode)head.parentNode.insertBefore(node,head.nextSibling);else view.prepend(node);
 bind(view);
}
const start=()=>{const view=qs('#workView');if(!view)return;new MutationObserver(()=>{if(!qs(`#${hostId}`,view)&&view.childElementCount&&!qs('#projectBack24',view))queueMicrotask(mount)}).observe(view,{childList:true});if(view.childElementCount)mount()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
