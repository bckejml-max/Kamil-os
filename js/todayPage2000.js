import {store} from './state.js';
import {workCommandCenter440} from './workCommandCenter440.js';
import {buildPropertyHub620} from './propertyHub620.js';
import {ownEvent1100} from './runtimeOwnership1100.js';

const OWNER='today.os2000';
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','PAYOUT_RECEIVED','PAYOUT RECEIVED','CANCELLED','CANCELED']);
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const upper=v=>String(v||'').toUpperCase();
const open=x=>!CLOSED.has(upper(x?.status||x?.workflow||x?.market_status));
const titleOf=x=>String(x?.title||x?.name||x?.label||x?.eventName||x?.event_name||'Bez názvu').trim();
const dateOf=x=>x?.due||x?.followUpAt||x?.dueAt||x?.due_at||x?.dueDate||x?.due_date||x?.deadline||x?.date||x?.startsAt||x?.start||null;
const ts=x=>{const d=Date.parse(dateOf(x)||'');return Number.isFinite(d)?d:null};
const overdueAt=x=>{const raw=String(dateOf(x)||'');if(!raw)return null;if(/^\d{4}-\d{2}-\d{2}$/.test(raw)){const d=new Date(raw+'T23:59:59.999');return Number.isFinite(d.getTime())?d.getTime():null}return ts(x)};
const isOverdue=x=>{const t=overdueAt(x);return t!==null&&t<Date.now()};
const fmtDate=x=>{const t=ts(x);if(!t)return'bez termínu';return new Date(t).toLocaleDateString('cs-CZ',{day:'numeric',month:'short'})};
const money=v=>Number.isFinite(Number(v))?`${Math.round(Number(v)).toLocaleString('cs-CZ')} Kč`:'—';

function betting(s=store.get()){let legacy={};try{legacy=JSON.parse(localStorage.getItem('kamil_betting_ledger_543')||'{}')}catch{}const canonical=s?.bettingLedger||{},useCanonical=canonical.updatedAt||Number(canonical.bankrollCzk||0)!==0||Number(canonical.unitCzk||0)!==0||(Array.isArray(canonical.bets)&&canonical.bets.length>0),bets=useCanonical?(Array.isArray(canonical.bets)?canonical.bets:[]):(Array.isArray(legacy?.bets)?legacy.bets:[]),active=bets.filter(x=>upper(x.status||'OPEN')==='OPEN');return{open:active.length,exposure:active.reduce((a,x)=>a+Number(x.stakeCzk||0),0),bankroll:Number(useCanonical?canonical.bankrollCzk:legacy?.bankrollCzk||0)}}
function baseData(){
 const s=store.get();
 const tasks=(s.tasks||[]).filter(open),waiting=[...(s.directorBook?.waiting||[]),...(s.delegations||[]),...(s.personalInbox?.items||[]).filter(x=>String(x?.bucket||'').toLowerCase()==='waiting')].filter(open),tickets=(s.ticketBook?.items||[]).filter(open),calendar=(s.calendar?.events||[]).filter(x=>{const t=ts(x);return t&&t>Date.now()-6*3600000}).sort((a,b)=>(ts(a)||Infinity)-(ts(b)||Infinity));
 const urgentTasks=[...tasks].sort((a,b)=>{const ao=isOverdue(a),bo=isOverdue(b);if(ao!==bo)return bo-ao;const pa=Number(a?.priority||a?.score||0),pb=Number(b?.priority||b?.score||0);if(pb!==pa)return pb-pa;return(ts(a)||Infinity)-(ts(b)||Infinity)});
 const overdue=tasks.filter(isOverdue),transfer=tickets.filter(x=>['SOLD_UNDELIVERED','TRANSFER_REQUIRED','SOLD_WAITING_TRANSFER'].includes(upper(x.market_status||x.workflow))),activeTickets=tickets.filter(x=>!['PAID','PAYOUT_RECEIVED','SOLD'].includes(upper(x.market_status||x.workflow))),financePlan=s.financePlan||{},rawCash=financePlan.cashNow,cashPlanTouched=!!financePlan.updatedAt||[financePlan.cashNow,financePlan.expectedIncome,financePlan.reserveFloor,financePlan.plannedInvestment].some(v=>Number(v||0)!==0),cash=cashPlanTouched&&rawCash!==null&&rawCash!==undefined&&String(rawCash).trim()!==''&&Number.isFinite(Number(rawCash))?Number(rawCash):null,work=workCommandCenter440(s),property=buildPropertyHub620(s),bet=betting(s);
 return{s,tasks,waiting,tickets,activeTickets,transfer,calendar,urgentTasks,overdue,cash,work,property,bet};
}
function greeting(){const h=new Date().getHours();return h<11?'Dobré ráno':h<18?'Dobré odpoledne':'Dobrý večer'}
function attention(d){
 const out=[];
 for(const x of d.overdue.slice(0,2))out.push({title:titleOf(x),detail:`Úkol po termínu · ${fmtDate(x)}`,route:'inbox',taskId:x.id,tone:'bad',cta:'vyřešit'});
 const wr=d.work.topRisks[0];if(wr)out.push({title:wr.title,detail:`${wr.kind} · ${wr.detail}`,route:'work',tone:wr.score>=95?'bad':'warn',cta:'otevřít'});
 if(d.transfer.length)out.push({title:`${d.transfer.length} prodejů čeká na převod`,detail:'Vstupenky jsou prodané, ale ještě nejsou dokončené.',route:'tickets',tone:'bad',cta:'převést'});
 const dueWait=d.waiting.find(x=>{const t=ts(x);return t&&t<=Date.now()+86400000});if(dueWait)out.push({title:`Follow-up: ${titleOf(dueWait)}`,detail:isOverdue(dueWait)?'Čekání je po termínu.':'Follow-up je dnes nebo zítra.',route:'inbox',tone:'warn',cta:'zkontrolovat'});
 return out.slice(0,4);
}
function actionRows(items){if(!items.length)return '<div class="pr1300-empty">Teď nic akutního nevyžaduje tvoji pozornost.</div>';return `<div class="pr1300-attention">${items.map(x=>`<button type="button" ${x.taskId?`data-today1300-task="${esc(x.taskId)}"`:`data-today1300-nav="${esc(x.route)}"`}><i class="pr1300-dot ${esc(x.tone)}"></i><span><b>${esc(x.title)}</b><small>${esc(x.detail)}</small></span><em>${esc(x.cta)} →</em></button>`).join('')}</div>`}
function todayRows(items){if(!items.length)return '<div class="pr1300-empty">Žádné otevřené úkoly.</div>';return items.slice(0,6).map(x=>`<button type="button" class="pr1300-row pr1300-task-row" data-today1300-task="${esc(x.id)}"><div class="pr1300-row-main"><b>${esc(titleOf(x))}</b><small>${esc(x?.project||x?.area||x?.category||'')}</small></div><div class="pr1300-row-side ${isOverdue(x)?'bad':''}">${esc(fmtDate(x))}</div></button>`).join('')}
function calendarRows(items){if(!items.length)return '<div class="pr1300-empty">V kalendáři nic blízkého.</div>';return items.slice(0,5).map(x=>`<div class="pr1300-row"><div class="pr1300-row-main"><b>${esc(titleOf(x))}</b><small>${esc(x?.location||x?.calendar||'')}</small></div><div class="pr1300-row-side">${new Date(ts(x)).toLocaleString('cs-CZ',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div></div>`).join('')}
function domain(route,label,value,detail,tone=''){return `<button type="button" class="pr1300-domain ${tone}" data-today1300-nav="${esc(route)}"><span>${esc(label)}</span><b>${esc(value)}</b><small>${esc(detail)}</small></button>`}

function render(){
 const host=document.querySelector('#todayView');if(!host)return false;
 const d=baseData(),att=attention(d),best=d.property.best,today=new Date().toLocaleDateString('cs-CZ',{weekday:'long',day:'numeric',month:'long'}),workRisk=d.work.topRisks.length,propValue=best?best.decision.action:'bez kandidáta';
 host.innerHTML=`<div class="pr1300-shell" data-os2-today data-product-home1300>
  <div class="pr1300-head"><div><div class="pr1300-kicker">${esc(today)}</div><h1>${greeting()}, Kamile.</h1><p>OS má jednu práci: rychle ukázat, co potřebuje tvoji pozornost a dovést tě rovnou k akci.</p></div><span class="pr1300-status ${att.some(x=>x.tone==='bad')?'bad':att.length?'warn':'good'}">${att.length?`${att.length} k řešení`:'klid'}</span></div>
  <section class="pr1300-panel"><div class="pr1300-panel-head"><h2>Potřebuje tvoji pozornost</h2><span>jen věci, které mají další krok</span></div>${actionRows(att)}</section>
  <div class="pr1300-domains">${domain('work','Práce',`${d.work.projects.length} zakázek`,workRisk?`${workRisk} rizik / termínů ke kontrole`:'bez akutního rizika',workRisk?'warn':'good')}${domain('tickets','Vstupenky',`${d.activeTickets.length} aktivních`,d.transfer.length?`${d.transfer.length} čeká na převod`:'portfolio bez transfer urgencu',d.transfer.length?'bad':'')}${domain('property','Reality',propValue,best?`${best.name} · ${best.score}/100`:`${d.property.rows.length} kandidátů`,best?.decision.code==='BUY'?'good':best?.decision.code==='NEGOTIATE'?'warn':'')}${domain('money','Peníze',d.cash!==null?money(d.cash):'otevřít finance',d.cash!==null?'zadaná volná hotovost':'hotovost není zadaná')}${domain('betting','Sázení',`${d.bet.open} otevřených`,d.bet.exposure?`${money(d.bet.exposure)} expozice`:'bez otevřené expozice')}${domain('inbox','Úkoly',`${d.waiting.length} čekání`,'úkoly, follow-upy a věci k vyřízení',d.waiting.length?'warn':'')}</div>
  <div class="pr1300-grid"><div class="pr1300-stack"><section class="pr1300-panel"><div class="pr1300-panel-head"><h2>Dnes</h2><button class="pr1300-btn primary" type="button" data-today1300-add>＋ Přidat</button></div>${todayRows(d.urgentTasks)}</section></div><div class="pr1300-stack"><section class="pr1300-panel"><div class="pr1300-panel-head"><h3>Nejbližší kalendář</h3><span>${d.calendar.length} událostí</span></div>${calendarRows(d.calendar)}</section><section class="pr1300-panel"><div class="pr1300-panel-head"><h3>Rychlý stav</h3><span>bez diagnostického balastu</span></div><div class="pr1300-row"><div class="pr1300-row-main"><b>Úkoly po termínu</b><small>otevřené položky s prošlým datem</small></div><div class="pr1300-row-side ${d.overdue.length?'bad':'good'}">${d.overdue.length}</div></div><div class="pr1300-row"><div class="pr1300-row-main"><b>Waiting For</b><small>čekání a follow-upy</small></div><div class="pr1300-row-side ${d.waiting.length?'warn':'good'}">${d.waiting.length}</div></div><div class="pr1300-row"><div class="pr1300-row-main"><b>Pracovní režim</b><small>výsledek Work Command Centeru</small></div><div class="pr1300-row-side ${d.work.status==='ZÁSAH'?'bad':d.work.status==='SLEDOVAT'?'warn':'good'}">${esc(d.work.status)}</div></div></section></div></div>
 </div>`;
 if(!host.dataset.today1300Bound){host.dataset.today1300Bound='1';ownEvent1100(OWNER,host,'click',async e=>{const taskButton=e.target.closest('[data-today1300-task]');if(taskButton){const task=(store.get().tasks||[]).find(x=>String(x.id)===taskButton.dataset.today1300Task);if(task){const {openPersonalAction641}=await import('./personalActionExecution641.js');await openPersonalAction641({id:`task:${task.id}`,kind:'task',title:titleOf(task),why:`Termín: ${fmtDate(task)}`,next:task.notes||'Dokončit nebo posunout termín.',route:'today'})}return}const nav=e.target.closest('[data-today1300-nav]');if(nav){window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:nav.dataset.today1300Nav}));return}if(e.target.closest('[data-today1300-add]'))window.dispatchEvent(new CustomEvent('kamil:capture',{detail:'task'}))})}
 window.__KAMIL_TODAY_OS2000__={healthy:true,version:2000,productReset:1300,attention:att.length,tasks:d.tasks.length,waiting:d.waiting.length,tickets:d.activeTickets.length,work:d.work.status,property:best?.decision.code||null,at:Date.now()};
 return true;
}
export function renderTodayPage2000(){return render()}
