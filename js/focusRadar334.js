import {store} from './state.js';
import {buildDomainOS328} from './domainOS328.js';
import {openFinanceCommand258} from './financeCommand258.js';
import {openTicketCommander660} from './ticketCommander660.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
const num=x=>Number.isFinite(Number(x))?Number(x):0;
const money=x=>`${Math.round(num(x)).toLocaleString('cs-CZ')} Kč`;
const isTicketAction=x=>['BUY','SELL/REPRICE','REVIEW'].includes(String(x?.signal||''));

function injectCss(){
 if(document.querySelector('link[data-focus-radar334]'))return;
 const l=document.createElement('link');l.rel='stylesheet';l.href='./focusRadar334.css';l.dataset.focusRadar334='1';document.head.appendChild(l);
}
function drawer(title,html){window.dispatchEvent(new CustomEvent('kamil:detail-drawer',{detail:{title,html}}))}
function model(){
 const d=buildDomainOS328(store.get()),ticketActions=(d.tickets?.signals||[]).filter(isTicketAction),managerOverdue=d.manager?.overdue||[],propertyUrgent=d.property?.urgent||[],investmentActions=(d.investments?.rows||[]).filter(x=>x.action&&x.action!=='HOLD');
 const candidates=[
  {key:'manager',label:'Práce',score:managerOverdue.length?100+managerOverdue.length:Math.min(70,(d.manager?.rows||[]).length*5),title:managerOverdue.length?`${managerOverdue.length} pracovní věci po termínu`:(d.manager?.rows||[]).length?`${d.manager.rows.length} otevřených pracovních věcí`:'Práce je klidná',reason:managerOverdue.length?'Nejdřív zavři nebo posuň věci po termínu.':'Bez prošlého pracovního termínu.',count:(d.manager?.rows||[]).length},
  {key:'tickets',label:'Vstupenky',score:ticketActions.length?92+ticketActions.length:20,title:ticketActions.length?`${ticketActions.length} ticket rozhodnutí chce akci`:`${d.tickets?.active?.length||0} aktivních ticket pozic`,reason:ticketActions.length?'Commander má BUY / reprice / review signál.':'Ticket portfolio teď nevyžaduje zásah.',count:ticketActions.length},
  {key:'property',label:'Nemovitosti',score:propertyUrgent.length?82+propertyUrgent.length:15,title:propertyUrgent.length?`${propertyUrgent.length} důležité věci kolem nemovitostí`:'Nemovitosti bez urgentní akce',reason:propertyUrgent.length?'Vytáhni právní, rekonstrukční nebo nemovitostní krok.':'Bez nalezené urgentní položky.',count:propertyUrgent.length},
  {key:'money',label:'Peníze',score:investmentActions.length?72+investmentActions.length:num(d.money?.freeCapital)>0?58:18,title:investmentActions.length?`${investmentActions.length} investiční pozice k revizi`:num(d.money?.freeCapital)>0?`${money(d.money.freeCapital)} volného kapitálu`:'Finance bez nutného zásahu',reason:investmentActions.length?'Některá pozice má REVIEW / REDUCE / TAKE PROFIT signál.':num(d.money?.freeCapital)>0?'Je kapitál nad aktuální rezervu.':'Bez silného finančního signálu.',count:investmentActions.length}
 ].sort((a,b)=>b.score-a.score);
 return{version:334,domain:d,candidates,best:candidates[0],ticketActions,managerOverdue,propertyUrgent,investmentActions,at:new Date().toISOString()};
}
function detailRows(rows,empty='Nic urgentního.'){
 if(!rows?.length)return `<div class="os334-empty">${esc(empty)}</div>`;
 return `<div class="os303-list">${rows.slice(0,12).map(x=>`<div class="os303-row"><span><b>${esc(x.title||x.name||'Položka')}</b><small>${esc(x.reason||x.area||x.category||x.signal||'')}</small></span></div>`).join('')}</div>`;
}
function open(key,m=window.__KAMIL_FOCUS_RADAR334__?.model||model()){
 if(key==='money')return openFinanceCommand258();
 if(key==='tickets')return openTicketCommander660();
 if(key==='manager')return drawer('Manager Focus',detailRows(m.managerOverdue.length?m.managerOverdue:m.domain.manager.rows,'Žádná otevřená pracovní věc.'));
 if(key==='property')return drawer('Property Focus',detailRows(m.propertyUrgent.length?m.propertyUrgent:m.domain.property.rows,'Žádná otevřená nemovitostní věc.'));
}
function html(m){
 const b=m.best,domains=m.candidates.map(x=>`<button type="button" class="os334-domain ${x.key===b.key?'active':''}" data-focus334-open="${x.key}"><span>${esc(x.label)}</span><b>${x.count||0}</b></button>`).join('');
 return `<section class="os334-radar" data-focus-radar334><div class="os334-head"><div><small>KAMIL OS · 334</small><h2>Focus Radar</h2></div><span class="os334-score">Priorita ${Math.min(100,b.score)}</span></div><div class="os334-main"><div><span class="os334-kicker">UDĚLEJ TEĎ · ${esc(b.label).toUpperCase()}</span><h3>${esc(b.title)}</h3><p>${esc(b.reason)}</p></div><button type="button" class="os334-primary" data-focus334-open="${b.key}">Otevřít akci</button></div><div class="os334-domains">${domains}</div></section>`;
}
function render(){
 const host=document.querySelector('#todayView');if(!host)return false;
 const m=model();host.querySelector('[data-focus-radar334]')?.remove();
 const core=host.querySelector('[data-kamil-core312]'),markup=html(m);if(core)core.insertAdjacentHTML('beforebegin',markup);else host.insertAdjacentHTML('afterbegin',markup);
 window.__KAMIL_FOCUS_RADAR334__={version:334,model:m,refresh:renderSafe,open,healthy:true,mounted:!!host.querySelector('[data-focus-radar334]'),at:Date.now()};return true;
}
function renderSafe(){
 try{return render()}catch(error){
  console.error('[focusRadar334]',error);
  window.__KAMIL_FOCUS_RADAR334__={version:334,healthy:false,error:String(error?.message||error),refresh:renderSafe,open,at:Date.now()};
  return false;
 }
}
let timer=0,bound=false,observer=null,integrityTimer=0;
const schedule=(delay=120)=>{clearTimeout(timer);timer=setTimeout(renderSafe,delay)};
function ensureMounted(){
 const host=document.querySelector('#todayView');if(!host)return;
 if(!host.querySelector('[data-focus-radar334]'))renderSafe();
}
function watchToday(){
 const host=document.querySelector('#todayView');if(!host)return;
 if(observer)observer.disconnect();
 observer=new MutationObserver(()=>{if(!host.querySelector('[data-focus-radar334]'))schedule(40)});
 observer.observe(host,{childList:true,subtree:true});
 if(!integrityTimer)integrityTimer=window.setInterval(()=>{
  if(document.visibilityState!=='hidden')ensureMounted();
 },350);
}
export function installFocusRadar334(){
 injectCss();document.documentElement.dataset.focusRadar334='1';
 if(!bound){
  bound=true;
  document.addEventListener('click',e=>{const b=e.target.closest?.('[data-focus334-open]');if(!b)return;e.preventDefault();open(b.dataset.focus334Open)});
  window.addEventListener('kamil:view-change',e=>{if(!e.detail||e.detail==='today')schedule()});
  store.subscribe?.(()=>schedule());
 }
 watchToday();schedule(20);setTimeout(()=>{watchToday();ensureMounted()},500);setTimeout(ensureMounted,1600);setTimeout(ensureMounted,3200);
}
