import {store} from './state.js';
import {ownEvent1100} from './runtimeOwnership1100.js';

const OWNER='today.os2000';
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','PAYOUT RECEIVED']);
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const open=x=>!CLOSED.has(String(x?.status||x?.workflow||'').toUpperCase());
const titleOf=x=>String(x?.title||x?.name||x?.label||x?.eventName||x?.event_name||'Bez názvu').trim();
const dateOf=x=>x?.dueAt||x?.due_at||x?.dueDate||x?.due_date||x?.deadline||x?.date||x?.startsAt||x?.start||null;
const ts=x=>{const d=Date.parse(dateOf(x)||'');return Number.isFinite(d)?d:null};
const fmtDate=x=>{const t=ts(x);if(!t)return'bez termínu';try{return new Date(t).toLocaleDateString('cs-CZ',{day:'numeric',month:'short'})}catch{return'bez termínu'}};
const money=v=>Number.isFinite(Number(v))?`${Math.round(Number(v)).toLocaleString('cs-CZ')} Kč`:'—';

function data(){
 const s=store.get();
 const tasks=(s.tasks||[]).filter(open);
 const waiting=[...(s.directorBook?.waiting||[]),...(s.delegations||[]),...(s.personalInbox?.items||[]).filter(x=>String(x?.bucket||'').toLowerCase()==='waiting')].filter(open);
 const tickets=(s.ticketBook?.items||[]).filter(x=>['HOLD','LISTED','NOT_LISTED','OPEN'].includes(String(x?.workflow||x?.market_status||'HOLD').toUpperCase()));
 const inbox=[...(s.inbox||[]),...(s.personalInbox?.items||[])].filter(open);
 const calendar=(s.calendar?.events||[]).filter(x=>{const t=ts(x);return t&&t>Date.now()-6*3600000}).sort((a,b)=>(ts(a)||Infinity)-(ts(b)||Infinity));
 const urgentTasks=[...tasks].sort((a,b)=>{
  const pa=Number(a?.priority||a?.score||0),pb=Number(b?.priority||b?.score||0);if(pb!==pa)return pb-pa;
  return (ts(a)||Infinity)-(ts(b)||Infinity);
 });
 const now=Date.now();
 const overdue=tasks.filter(x=>ts(x)&&ts(x)<now).length;
 const activeCapital=tickets.reduce((sum,x)=>sum+Number(x?.buy_total_czk||x?.buy||x?.buyTotalCzk||0),0);
 const cash=Number(s.financePlan?.cashNow||0);
 return{s,tasks,waiting,tickets,inbox,calendar,urgentTasks,overdue,activeCapital,cash};
}

function nextPriority(d){
 const overdue=d.urgentTasks.find(x=>ts(x)&&ts(x)<Date.now());
 if(overdue)return{title:titleOf(overdue),why:'Má prošlý termín. Vyřešení sníží okamžité riziko.',action:'today',tone:'bad'};
 if(d.urgentTasks[0])return{title:titleOf(d.urgentTasks[0]),why:ts(d.urgentTasks[0])?`Nejbližší termín ${fmtDate(d.urgentTasks[0])}.`:'Nejvýše postavený otevřený úkol.',action:'today',tone:'hot'};
 if(d.waiting[0])return{title:`Prověřit: ${titleOf(d.waiting[0])}`,why:'Čeká na odpověď nebo další krok.',action:'inbox',tone:'hot'};
 if(d.tickets.length)return{title:'Zkontrolovat aktivní vstupenky',why:`V portfoliu je ${d.tickets.length} aktivních položek.`,action:'tickets',tone:'good'};
 return{title:'Teď není nic kritického',why:'OS nenašel urgentní otevřený krok.',action:null,tone:'good'};
}

function rows(items,{limit=5,side=fmtDate,empty='Nic otevřeného.'}={}){
 if(!items.length)return`<div class="os2-empty">${esc(empty)}</div>`;
 return items.slice(0,limit).map(x=>`<div class="os2-row"><div class="os2-row-main"><b>${esc(titleOf(x))}</b><small>${esc(x?.category||x?.area||x?.project||x?.source||'')}</small></div><div class="os2-row-side">${esc(side(x))}</div></div>`).join('');
}

function greeting(){const h=new Date().getHours();return h<11?'Dobré ráno':h<18?'Dobré odpoledne':'Dobrý večer'}

function render(){
 const host=document.querySelector('#todayView');if(!host)return false;
 const d=data(),priority=nextPriority(d),today=new Date().toLocaleDateString('cs-CZ',{weekday:'long',day:'numeric',month:'long'});
 const nextCalendar=d.calendar.slice(0,4);
 host.innerHTML=`<div class="os2-today" data-os2-today>
  <div class="os2-welcome">
   <section class="os2-hero">
    <div><div class="os2-kicker">${esc(today)}</div><h1>${greeting()}, Kamile.</h1><p>Jedna obrazovka pro to důležité. Ostatní analýzy se načtou až ve chvíli, kdy je otevřeš.</p></div>
    <div class="os2-hero-bottom"><span class="os2-pill good">● rychlý režim</span><span class="os2-pill">${d.tasks.length} otevřených úkolů</span><span class="os2-pill">${d.waiting.length} čekání</span></div>
   </section>
   <section class="os2-now">
    <div><div class="os2-now-label"><span>Teď</span><i class="os2-now-dot"></i></div><h2>${esc(priority.title)}</h2><p>${esc(priority.why)}</p></div>
    <div class="os2-now-actions">${priority.action?`<button class="os2-primary" data-os2-nav="${esc(priority.action)}">Otevřít</button>`:''}<button class="os2-icon-btn" data-os2-add>＋ Přidat</button></div>
   </section>
  </div>
  <div class="os2-kpis">
   <div class="os2-kpi"><span>Otevřené</span><b>${d.tasks.length}</b><small>${d.overdue?`${d.overdue} po termínu`:'bez prošlých termínů'}</small></div>
   <div class="os2-kpi"><span>Čekám na</span><b>${d.waiting.length}</b><small>odpovědi a follow-upy</small></div>
   <div class="os2-kpi"><span>Vstupenky</span><b>${d.tickets.length}</b><small>${d.activeCapital?money(d.activeCapital)+' kapitál':'aktivní portfolio'}</small></div>
   <div class="os2-kpi"><span>Hotovost</span><b>${d.cash?money(d.cash):'—'}</b><small>financePlan.cashNow</small></div>
  </div>
  <div class="os2-grid">
   <div class="os2-stack">
    <section class="os2-panel"><div class="os2-panel-head"><h3>Co řešit</h3><button class="os2-action-link" data-os2-nav="inbox">Otevřít Inbox</button></div><div class="os2-list">${rows(d.urgentTasks,{limit:6,empty:'Žádné otevřené úkoly.'})}</div></section>
    <section class="os2-panel"><div class="os2-panel-head"><h3>Čekám na</h3><button class="os2-action-link" data-os2-nav="inbox">Všechna čekání</button></div><div class="os2-list">${rows(d.waiting,{limit:5,empty:'Nikdo tě teď neblokuje.'})}</div></section>
   </div>
   <div class="os2-stack">
    <section class="os2-panel"><div class="os2-panel-head"><h3>Kalendář</h3><span>nejbližší</span></div><div class="os2-list">${rows(nextCalendar,{limit:4,side:x=>{const t=ts(x);return t?new Date(t).toLocaleString('cs-CZ',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'—'},empty:'V kalendáři nic blízkého.'})}</div></section>
    <section class="os2-panel"><div class="os2-panel-head"><h3>Rychlý přístup</h3><span>bez čekání</span></div><div class="os2-list"><div class="os2-row"><div class="os2-row-main"><b>Vstupenky</b><small>portfolio, ceny a prodej</small></div><button class="os2-action-link" data-os2-nav="tickets">Otevřít</button></div><div class="os2-row"><div class="os2-row-main"><b>Peníze</b><small>hotovost a rozhodnutí</small></div><button class="os2-action-link" data-os2-nav="money">Otevřít</button></div><div class="os2-row"><div class="os2-row-main"><b>Sázení</b><small>ledger a value</small></div><button class="os2-action-link" data-os2-nav="betting">Otevřít</button></div></div></section>
   </div>
  </div>
 </div>`;
 if(!host.dataset.os2Bound){host.dataset.os2Bound='1';ownEvent1100(OWNER,host,'click',e=>{const nav=e.target?.closest?.('[data-os2-nav]');if(nav){window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:nav.dataset.os2Nav}));return}if(e.target?.closest?.('[data-os2-add]'))window.dispatchEvent(new CustomEvent('kamil:capture',{detail:'task'}))})}
 window.__KAMIL_TODAY_OS2000__={healthy:true,version:2000,tasks:d.tasks.length,waiting:d.waiting.length,tickets:d.tickets.length,at:Date.now()};
 return true;
}

export function renderTodayPage2000(){return render()}
