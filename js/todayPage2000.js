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
function actionRows(items){if(!items.length)return '<div class="pr1300-empty">Teď nic dalšího nevyžaduje tvoji pozornost.</div>';return '<div class="pr1320-queue">'+items.map((x,i)=>'<button type="button" class="pr1300-row pr1300-clickrow" '+(x.taskId?'data-today1300-task="'+esc(x.taskId)+'"':'data-today1300-nav="'+esc(x.route)+'"')+'><div class="pr1300-row-main"><b>'+(i+1)+'. '+esc(x.title)+'</b><small>'+esc(x.detail)+'</small></div><div class="pr1300-row-side '+esc(x.tone||'')+'">'+esc(x.cta||'otevřít')+' →</div></button>').join('')+'</div>'}
function calendarRows(items){if(!items.length)return '';return items.slice(0,3).map(x=>'<div class="pr1300-row"><div class="pr1300-row-main"><b>'+esc(titleOf(x))+'</b><small>'+esc(x?.location||x?.calendar||'')+'</small></div><div class="pr1300-row-side">'+new Date(ts(x)).toLocaleString('cs-CZ',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+'</div></div>').join('')}
function queue(d){
 const seen=new Set(),out=[];
 const add=x=>{const key=x.taskId?'task:'+x.taskId:[x.route,x.title].join(':');if(seen.has(key))return;seen.add(key);out.push(x)};
 attention(d).forEach(add);
 for(const x of d.urgentTasks){
  if(out.length>=6)break;
  const t=ts(x),due=t&&t<=Date.now()+2*86400000;
  if(isOverdue(x)||due)add({title:titleOf(x),detail:(x?.project||x?.area||x?.category||'Úkol')+' · '+fmtDate(x),route:'inbox',taskId:x.id,tone:isOverdue(x)?'bad':'warn',cta:'vyřešit'});
 }
 return out.slice(0,6);
}

function render(){
 const host=document.querySelector('#todayView');if(!host)return false;
 const d=baseData(),items=queue(d),primary=items[0]||null,rest=items.slice(1),today=new Date().toLocaleDateString('cs-CZ',{weekday:'long',day:'numeric',month:'long'});
 host.innerHTML='<div class="pr1320-today" data-os2-today data-product-home1300>' +
  '<div class="pr1300-head"><div><div class="pr1300-kicker">'+esc(today)+'</div><h1>'+greeting()+', Kamile.</h1><p>Dnes ukazuju jen další kroky. Přehledy a analytiku najdeš až uvnitř jednotlivých sekcí.</p></div><span class="pr1300-status '+(items.some(x=>x.tone==='bad')?'bad':items.length?'warn':'good')+'">'+(items.length?items.length+' kroků':'hotovo')+'</span></div>' +
  '<section class="pr1320-now"><div><div class="pr1300-kicker">Teď</div><h2>'+esc(primary?.title||'Nic akutního. Můžeš jet podle plánu.')+'</h2><p>'+esc(primary?.detail||'OS teď nevidí žádný prošlý termín, urgentní převod ani follow-up, který by potřeboval okamžitý zásah.')+'</p></div><div class="pr1320-now-actions">'+(primary?'<button class="pr1300-btn primary" type="button" '+(primary.taskId?'data-today1300-task="'+esc(primary.taskId)+'"':'data-today1300-nav="'+esc(primary.route)+'"')+'>'+esc(primary.cta||'Otevřít')+' →</button>':'<button class="pr1300-btn primary" type="button" data-today1300-add>＋ Přidat úkol</button>')+'</div></section>' +
  (rest.length?'<section class="pr1300-panel"><div class="pr1300-panel-head"><h2>Potom</h2><span>další kroky v pořadí</span></div>'+actionRows(rest)+'</section>':'') +
  '<div class="pr1320-meta"><span>Úkoly po termínu: '+d.overdue.length+'</span><span>Waiting for: '+d.waiting.length+'</span><span>Transfery: '+d.transfer.length+'</span><span>Práce: '+esc(d.work.status)+'</span></div>' +
  (d.calendar.length?'<section class="pr1300-panel pr1320-calendar"><div class="pr1300-panel-head"><h3>Nejbližší v kalendáři</h3><span>max. 3 události</span></div>'+calendarRows(d.calendar)+'</section>':'') +
  '<div class="pr1300-actions"><button class="pr1300-btn" type="button" data-today1300-add>＋ Přidat úkol</button></div>' +
 '</div>';
 if(!host.dataset.today1300Bound){host.dataset.today1300Bound='1';ownEvent1100(OWNER,host,'click',async e=>{const taskButton=e.target.closest('[data-today1300-task]');if(taskButton){const task=(store.get().tasks||[]).find(x=>String(x.id)===taskButton.dataset.today1300Task);if(task){const {openPersonalAction641}=await import('./personalActionExecution641.js');await openPersonalAction641({id:'task:'+task.id,kind:'task',title:titleOf(task),why:'Termín: '+fmtDate(task),next:task.notes||'Dokončit nebo posunout termín.',route:'today'})}return}const nav=e.target.closest('[data-today1300-nav]');if(nav){window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:nav.dataset.today1300Nav}));return}if(e.target.closest('[data-today1300-add]'))window.dispatchEvent(new CustomEvent('kamil:capture',{detail:'task'}))})}
 window.__KAMIL_TODAY_OS2000__={healthy:true,version:2000,productReset:1320,attention:items.length,tasks:d.tasks.length,waiting:d.waiting.length,tickets:d.activeTickets.length,work:d.work.status,property:d.property.best?.decision.code||null,cashKnown:d.cash!==null,cash:d.cash,bettingOpen:d.bet.open,bettingExposure:d.bet.exposure,at:Date.now()};
 return true;
}
export function renderTodayPage2000(){return render()}
