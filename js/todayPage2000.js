import {store} from './state.js';
import {ownEvent1100} from './runtimeOwnership1100.js';

const OWNER='today.os2000';
const VERSION=2060;
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','PAYOUT RECEIVED']);
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const open=x=>!CLOSED.has(String(x?.status||x?.workflow||'').toUpperCase());
const titleOf=x=>String(x?.title||x?.name||x?.label||x?.eventName||x?.event_name||'Bez názvu').trim();
const dateOf=x=>x?.dueAt||x?.due_at||x?.dueDate||x?.due_date||x?.deadline||x?.date||x?.startsAt||x?.start||null;
const ts=x=>{const d=Date.parse(dateOf(x)||'');return Number.isFinite(d)?d:null};
const fmtDate=x=>{const t=ts(x);if(!t)return'bez termínu';try{return new Date(t).toLocaleDateString('cs-CZ',{day:'numeric',month:'short'})}catch{return'bez termínu'}};
const money=v=>Number.isFinite(Number(v))?`${Math.round(Number(v)).toLocaleString('cs-CZ')} Kč`:'—';

function readBetting(){
 try{const x=JSON.parse(localStorage.getItem('kamil_betting_ledger_543')||'{}'),bets=Array.isArray(x?.bets)?x.bets:[],opens=bets.filter(b=>String(b?.status||'OPEN').toUpperCase()==='OPEN'),exposure=opens.reduce((a,b)=>a+Number(b?.stakeCzk||0),0);return{open:opens.length,exposure}}catch{return{open:0,exposure:0}}
}
function data(){
 const s=store.get();
 const tasks=(s.tasks||[]).filter(open);
 const waiting=[...(s.directorBook?.waiting||[]),...(s.delegations||[]),...(s.personalInbox?.items||[]).filter(x=>String(x?.bucket||'').toLowerCase()==='waiting')].filter(open);
 const tickets=(s.ticketBook?.items||[]).filter(x=>['HOLD','LISTED','NOT_LISTED','OPEN'].includes(String(x?.workflow||x?.market_status||'HOLD').toUpperCase()));
 const urgentTasks=[...tasks].sort((a,b)=>{const pa=Number(a?.priority||a?.score||0),pb=Number(b?.priority||b?.score||0);if(pb!==pa)return pb-pa;return(ts(a)||Infinity)-(ts(b)||Infinity)});
 const now=Date.now(),overdue=tasks.filter(x=>ts(x)&&ts(x)<now).length,activeCapital=tickets.reduce((sum,x)=>sum+Number(x?.buy_total_czk||x?.buy||x?.buyTotalCzk||0),0),cash=Number(s.financePlan?.cashNow||0),betting=readBetting();
 return{s,tasks,waiting,tickets,urgentTasks,overdue,activeCapital,cash,betting};
}
function priorityCandidates(d){
 const out=[];
 for(const task of d.urgentTasks){
  const late=ts(task)&&ts(task)<Date.now();
  out.push({title:titleOf(task),meta:late?'Po termínu':fmtDate(task),why:late?'Má prošlý termín.':'Otevřený úkol podle priority a termínu.',action:'inbox',tone:late?'bad':'hot'});
 }
 for(const item of d.waiting)out.push({title:`Čekám na: ${titleOf(item)}`,meta:'follow-up',why:'Blokuje další krok.',action:'inbox',tone:'hot'});
 if(d.tickets.length)out.push({title:'Zkontrolovat vstupenky',meta:`${d.tickets.length} aktivních`,why:d.activeCapital?`${money(d.activeCapital)} aktivního kapitálu.`:'Aktivní portfolio vyžaduje kontrolu.',action:'tickets',tone:'good'});
 if(d.betting.open)out.push({title:'Zkontrolovat otevřené sázky',meta:`${d.betting.open} otevřených`,why:d.betting.exposure?`${money(d.betting.exposure)} expozice.`:'Otevřené pozice čekají na výsledek.',action:'betting',tone:'good'});
 if(!out.length)out.push({title:'Teď není nic kritického',meta:'klid',why:'OS nenašel urgentní otevřený krok.',action:null,tone:'good'});
 return out.slice(0,3);
}
function rows(items,{limit=4,empty='Nikdo tě teď neblokuje.'}={}){if(!items.length)return`<div class="os2-empty">${esc(empty)}</div>`;return items.slice(0,limit).map(x=>`<div class="os2-row"><div class="os2-row-main"><b>${esc(titleOf(x))}</b><small>${esc(x?.category||x?.area||x?.project||x?.source||'')}</small></div><div class="os2-row-side">${esc(fmtDate(x))}</div></div>`).join('')}
function greeting(){const h=new Date().getHours();return h<11?'Dobré ráno':h<18?'Dobré odpoledne':'Dobrý večer'}
function priorityHtml(p,i){return`<article class="os2-now os2060-priority" data-os2060-priority="${i+1}"><div><div class="os2-now-label"><span>${i===0?'Teď':`#${i+1}`}</span><i class="os2-now-dot"></i></div><h2>${esc(p.title)}</h2><p>${esc(p.why)}</p><small>${esc(p.meta||'')}</small></div>${p.action?`<div class="os2-now-actions"><button class="os2-primary" data-os2-nav="${esc(p.action)}">Otevřít</button></div>`:''}</article>`}
function statusRow(label,value,detail,view){return`<div class="os2-row os2060-status"><div class="os2-row-main"><b>${esc(label)}</b><small>${esc(detail)}</small></div><button class="os2-action-link" data-os2-nav="${esc(view)}">${esc(value)}</button></div>`}
function render(){
 const host=document.querySelector('#todayView');if(!host)return false;
 const d=data(),priorities=priorityCandidates(d),today=new Date().toLocaleDateString('cs-CZ',{weekday:'long',day:'numeric',month:'long'});
 host.innerHTML=`<div class="os2-today os2060-today" data-os2-today data-os2060-today>
  <section class="os2-hero os2060-hero"><div><div class="os2-kicker">${esc(today)}</div><h1>${greeting()}, Kamile.</h1><p>Dnes jen to, co opravdu vyžaduje rozhodnutí.</p></div><div class="os2-hero-bottom"><span class="os2-pill ${d.overdue?'bad':'good'}">${d.overdue?`${d.overdue} po termínu`:'bez urgentních průšvihů'}</span><span class="os2-pill">${d.waiting.length} čekání</span></div></section>
  <section class="os2060-priorities" aria-label="Tři priority dne">${priorities.map(priorityHtml).join('')}</section>
  <section class="os2-panel os2060-waiting"><div class="os2-panel-head"><h3>Čekám na</h3><button class="os2-action-link" data-os2-nav="inbox">Inbox</button></div><div class="os2-list">${rows(d.waiting)}</div></section>
  <section class="os2-panel os2060-statuses"><div class="os2-panel-head"><h3>Stav</h3><span>jen rychlý přehled</span></div><div class="os2-list">${statusRow('Peníze',d.cash?money(d.cash):'Otevřít',d.cash?'volná hotovost':'hotovost není zadaná','money')}${statusRow('Vstupenky',String(d.tickets.length),d.activeCapital?`${money(d.activeCapital)} aktivní kapitál`:'aktivní portfolio','tickets')}${statusRow('Sázení',String(d.betting.open),d.betting.exposure?`${money(d.betting.exposure)} otevřená expozice`:'žádná otevřená expozice','betting')}</div></section>
 </div>`;
 if(!host.dataset.os2Bound){host.dataset.os2Bound='1';ownEvent1100(OWNER,host,'click',e=>{const nav=e.target?.closest?.('[data-os2-nav]');if(nav)window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:nav.dataset.os2Nav}))})}
 window.__KAMIL_TODAY_OS2000__={healthy:true,version:VERSION,tasks:d.tasks.length,waiting:d.waiting.length,tickets:d.tickets.length,priorities:priorities.length,at:Date.now()};
 return true;
}
export function renderTodayPage2000(){return render()}
