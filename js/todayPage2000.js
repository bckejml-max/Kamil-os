import {store} from './state.js';
import {workCommandCenter440} from './workCommandCenter440.js';
import {buildPropertyHub620} from './propertyHub620.js';
import {personalDailyAssistant650} from './personalAssistant650.js';
import {insuranceCenter} from './insurance25.js';
import {isPersonalScope527} from './personalScope527.js';
import {ownEvent1100,schedule1100} from './runtimeOwnership1100.js';

const OWNER='today.os2000';
const openInsuranceCenter=()=>{window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'more'}));schedule1100(OWNER,'insurance-open',async()=>{const m=await import('./insuranceUi25.js');m.renderInsurance25?.()},140,{pauseWhenHidden:true})};
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','PAYOUT_RECEIVED','PAYOUT RECEIVED','CANCELLED','CANCELED']);
const SOLD_TICKET_STATES=new Set(['SOLD','SOLD_UNDELIVERED','TRANSFER_REQUIRED','SOLD_WAITING_TRANSFER','SOLD_WAITING_PAYMENT','WAITING_PAYOUT','PAYOUT_WAIT','PAYOUT RECEIVED','PAYOUT_RECEIVED','PAID']);
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const upper=v=>String(v||'').toUpperCase();
const open=x=>!CLOSED.has(upper(x?.status||x?.workflow||x?.market_status));
const titleOf=x=>String(x?.title||x?.name||x?.label||x?.eventName||x?.event_name||'Bez názvu').trim();
const dateOf=x=>x?.due||x?.followUpAt||x?.dueAt||x?.due_at||x?.dueDate||x?.due_date||x?.deadline||x?.date||x?.startsAt||x?.start||null;
const ts=x=>{const d=Date.parse(dateOf(x)||'');return Number.isFinite(d)?d:null};
const overdueAt=x=>{const raw=String(dateOf(x)||'');if(!raw)return null;if(/^\d{4}-\d{2}-\d{2}$/.test(raw)){const d=new Date(raw+'T23:59:59.999');return Number.isFinite(d.getTime())?d.getTime():null}return ts(x)};
const isOverdue=x=>{const t=overdueAt(x);return t!==null&&t<Date.now()};
const personalRoute=x=>x?.route==='documents'?'more':['waiting','today'].includes(x?.route)?'inbox':x?.route||'today';
const actionAttr=x=>x?.insurance?`data-today1300-insurance="1"`:x?.personalId?`data-today1300-personal="${esc(x.personalId)}"`:x?.taskId?`data-today1300-task="${esc(x.taskId)}"`:`data-today1300-nav="${esc(x?.route||'today')}"`;
const fmtDate=x=>{const t=ts(x);if(!t)return'bez termínu';return new Date(t).toLocaleDateString('cs-CZ',{day:'numeric',month:'short'})};
const money=v=>Number.isFinite(Number(v))?`${Math.round(Number(v)).toLocaleString('cs-CZ')} Kč`:'—';

function betting(s=store.get()){let legacy={};try{legacy=JSON.parse(localStorage.getItem('kamil_betting_ledger_543')||'{}')}catch{}const canonical=s?.bettingLedger||{},useCanonical=canonical.updatedAt||Number(canonical.bankrollCzk||0)!==0||Number(canonical.unitCzk||0)!==0||(Array.isArray(canonical.bets)&&canonical.bets.length>0),bets=useCanonical?(Array.isArray(canonical.bets)?canonical.bets:[]):(Array.isArray(legacy?.bets)?legacy.bets:[]),active=bets.filter(x=>upper(x.status||'OPEN')==='OPEN'),tickets=active.reduce((a,x)=>a+Math.max(1,Number(x.ticketCount||1)),0);return{open:active.length,positions:active.length,tickets,exposure:active.reduce((a,x)=>a+Number(x.stakeCzk||0),0),bankroll:Number(useCanonical?canonical.bankrollCzk:legacy?.bankrollCzk||0)}}
function baseData(){
 const s=store.get();
 const tasks=(s.tasks||[]).filter(open),personalTasks=tasks.filter(isPersonalScope527),ticketTasks=tasks.filter(x=>['TICKETS','VIAGOGO'].includes(upper(x?.area||x?.category))),waiting=[...(s.directorBook?.waiting||[]),...(s.delegations||[]),...(s.personalInbox?.items||[]).filter(x=>String(x?.bucket||'').toLowerCase()==='waiting')].filter(open),tickets=(s.ticketBook?.items||[]),calendar=(s.calendar?.events||[]).filter(open).filter(x=>{const t=ts(x);return t&&t>Date.now()-6*3600000}).sort((a,b)=>(ts(a)||Infinity)-(ts(b)||Infinity));
 const urgentTasks=[...tasks].sort((a,b)=>{const ao=isOverdue(a),bo=isOverdue(b);if(ao!==bo)return bo-ao;const pa=Number(a?.priority||a?.score||0),pb=Number(b?.priority||b?.score||0);if(pb!==pa)return pb-pa;return(ts(a)||Infinity)-(ts(b)||Infinity)});
 const overdue=personalTasks.filter(isOverdue),transfer=tickets.filter(x=>['SOLD_UNDELIVERED','TRANSFER_REQUIRED','SOLD_WAITING_TRANSFER'].includes(upper(x.market_status||x.workflow))),activeTickets=tickets.filter(x=>!x.issue&&!SOLD_TICKET_STATES.has(upper(x.market_status))&&!SOLD_TICKET_STATES.has(upper(x.workflow))),financePlan=s.financePlan||{},rawCash=financePlan.cashNow,cashPlanTouched=!!financePlan.updatedAt||[financePlan.cashNow,financePlan.expectedIncome,financePlan.reserveFloor,financePlan.plannedInvestment].some(v=>Number(v||0)!==0),cash=cashPlanTouched&&rawCash!==null&&rawCash!==undefined&&String(rawCash).trim()!==''&&Number.isFinite(Number(rawCash))?Number(rawCash):null,work=workCommandCenter440(s),property=buildPropertyHub620(s),bet=betting(s),personal=personalDailyAssistant650(s),insurance=insuranceCenter(s);
 return{s,tasks,personalTasks,ticketTasks,waiting,tickets,activeTickets,transfer,calendar,urgentTasks,overdue,cash,work,property,bet,personal,insurance};
}
function greeting(){const h=new Date().getHours();return h<11?'Dobré ráno':h<18?'Dobré odpoledne':'Dobrý večer'}
function attention(d){
 const out=[],add=(row,score=0)=>out.push({...row,score:Number(score||0)});
 for(const x of d.overdue.slice(0,2))add({title:titleOf(x),detail:`Úkol po termínu · ${fmtDate(x)}`,route:'inbox',taskId:x.id,tone:'bad',cta:'vyřešit'},132);
 const wr=d.work.topRisks[0];if(wr)add({title:wr.title,detail:`${wr.kind} · ${wr.detail}`,route:'work',tone:wr.score>=95?'bad':'warn',cta:'otevřít'},Math.max(90,Number(wr.score||0)+12));
 if(d.transfer.length)add({title:`${d.transfer.length} prodejů čeká na převod`,detail:'Vstupenky jsou prodané, ale předání kupujícímu ještě není dokončené.',route:'tickets',tone:'bad',cta:'převést'},126);
 for(const x of d.personal?.top||[])add({title:x.title,detail:x.why||x.next||'Osobní věc vyžaduje kontrolu.',route:personalRoute(x),personalId:x.id,tone:x.score>=110?'bad':x.score>=90?'warn':'',cta:String(x.cta||'vyřešit').toLowerCase()},x.score);
 for(const x of (d.insurance?.actions||[]).slice(0,2))add({title:x.title,detail:x.issues?.[0]||'Pojistku je potřeba zkontrolovat.',route:'more',insurance:true,tone:x.status==='URGENT'?'bad':'warn',cta:'pojištění'},Number(x.priority||0)+8);
 const dueWait=d.waiting.find(x=>{const t=ts(x);return t&&t<=Date.now()+86400000});if(dueWait)add({title:`Follow-up: ${titleOf(dueWait)}`,detail:isOverdue(dueWait)?'Čekání je po termínu.':'Follow-up je dnes nebo zítra.',route:'inbox',tone:isOverdue(dueWait)?'bad':'warn',cta:'zkontrolovat'},isOverdue(dueWait)?116:84);
 const tomorrow=d.personal?.tomorrow?.[0];if(tomorrow)add({title:tomorrow.title||tomorrow.summary||'Rodinný termín zítra',detail:'Osobní termín je zítra.',route:'family',tone:'',cta:'připravit'},76);
 const seen=new Set();
 return out.sort((a,b)=>b.score-a.score).filter(x=>{const key=String(x.title||'').toLocaleLowerCase('cs-CZ');if(seen.has(key))return false;seen.add(key);return true}).slice(0,4);
}
function actionRows(items){
 if(!items.length)return '<div class="os1400-empty">Teď nic dalšího nevyžaduje tvoji pozornost.</div>';
 return '<div class="os1400-list">'+items.map((x,i)=>'<button type="button" class="os1400-row" '+actionAttr(x)+'><div><b>'+(i+1)+'. '+esc(x.title)+'</b><small>'+esc(x.detail)+'</small></div><div class="os1400-side '+esc(x.tone||'')+'">'+esc(x.cta||'otevřít')+' →</div></button>').join('')+'</div>'
}
function calendarRows(items){
 if(!items.length)return '';
 return '<div class="os1400-list">'+items.slice(0,3).map(x=>'<div class="os1400-row" style="cursor:default"><div><b>'+esc(titleOf(x))+'</b><small>'+esc(x?.location||x?.calendar||'')+'</small></div><div class="os1400-side">'+new Date(ts(x)).toLocaleString('cs-CZ',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+'</div></div>').join('')+'</div>'
}
function systemState(d){
 const workRisk=d.work.topRisks?.[0],best=d.property.best,activeTicketQty=d.activeTickets.reduce((a,x)=>a+Math.max(1,Number(x.qty||1)),0);
 const area=x=>String(x?.area||x?.category||'').toLocaleLowerCase('cs-CZ');
 const familyTasks=d.tasks.filter(x=>/rodin|d[ií]t|dcera|manžel|manzel|mam|tat|babi|děd|ded/.test(area(x)));
 const homeTasks=d.tasks.filter(x=>/domov|d[uů]m|energie|servis|reviz|údržb|udrzb/.test(area(x)+' '+String(x?.title||'').toLocaleLowerCase('cs-CZ')));
 const docIssues=d.insurance?.actionCount||0;
 const familySoon=(d.personal?.tomorrow||[]).length;
 return [
  {route:'inbox',title:'Úkoly',detail:d.overdue.length?d.overdue.length+' po termínu':d.personalTasks.length?d.personalTasks.length+' otevřených položek':'Fronta je prázdná',side:d.overdue.length?d.overdue.length+' po term.':d.personalTasks.length?d.personalTasks.length+' otevř.':'čisto',tone:d.overdue.length?'bad':d.personalTasks.length?'warn':'good'},
  {route:'work',title:'Práce',detail:workRisk?workRisk.title:(d.work.status==='KLID'?'Bez akutního zásahu':'Otevřít pracovní přehled'),side:d.work.status,tone:d.work.status==='ZÁSAH'?'bad':d.work.status==='SLEDOVAT'?'warn':'good'},
  {route:'tickets',title:'Vstupenky',detail:d.transfer.length?d.transfer.length+' čeká na převod':activeTicketQty?activeTicketQty+' aktivních kusů':'Žádný aktivní kus',side:activeTicketQty?activeTicketQty+' ks':'klid',tone:d.transfer.length?'bad':activeTicketQty?'warn':'good'},
  {route:'money',title:'Peníze',detail:d.cash!==null?'Potvrzená volná hotovost':'Hotovost není potvrzená',side:d.cash!==null?money(d.cash):'doplnit',tone:d.cash!==null?'good':'warn'},
  {route:'property',title:'Reality',detail:best?best.name+' · '+best.decision.action:'Žádný kandidát v shortlistu',side:best?best.score+'/100':'—',tone:best?(best.decision.code==='PASS'?'bad':best.decision.code==='NEGOTIATE'?'warn':'good'):''},
  {route:'betting',title:'Sázení',detail:d.bet.positions?d.bet.tickets+' tiketů v '+d.bet.positions+' pozicích':'Žádná otevřená pozice',side:d.bet.positions?d.bet.positions+' pozic':'klid',tone:d.bet.exposure?'warn':'good'},
  {route:'family',title:'Rodina',detail:familySoon?'Nejbližší rodinná věc je zítra':familyTasks[0]?.title||'Žádný akutní rodinný úkol',side:familyTasks.length?familyTasks.length+' úkolů':'klid',tone:familySoon?'warn':familyTasks.length?'warn':'good'},
  {route:'home',title:'Domov',detail:homeTasks[0]?.title||'Žádný akutní servis nebo úkol',side:homeTasks.length?homeTasks.length+' otevř.':'klid',tone:homeTasks.length?'warn':'good'},
  {route:'more',title:'Dokumenty',detail:docIssues?docIssues+' pojistek / smluv k ověření':'Bez akutního problému',side:docIssues?docIssues+' řešit':'klid',tone:docIssues?'warn':'good'}
 ];
}
function systemRows(items){
 return '<div class="os1600-areas">'+items.map(x=>'<button type="button" class="os1600-area '+esc(x.tone||'')+'" data-today1300-nav="'+esc(x.route)+'"><span>'+esc(x.title)+'</span><b>'+esc(x.side)+'</b><small>'+esc(x.detail)+'</small></button>').join('')+'</div>'
}
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
function metric(label,value){return '<div class="os1400-metric"><span>'+esc(label)+'</span><b>'+esc(value)+'</b></div>'}

function render(){
 const host=document.querySelector('#todayView');if(!host)return false;
 const d=baseData(),items=queue(d),system=systemState(d),today=new Date().toLocaleDateString('cs-CZ',{weekday:'long',day:'numeric',month:'long'});
 const severity=items.some(x=>x.tone==='bad')?'bad':items.length?'warn':'good';
 const summary=[
  {label:'Po termínu',value:String(d.overdue.length),tone:d.overdue.length?'bad':'good'},
  {label:'Waiting for',value:String(d.waiting.length),tone:d.waiting.length?'warn':'good'},
  {label:'Transfery',value:String(d.transfer.length),tone:d.transfer.length?'bad':'good'},
  {label:'Práce',value:String(d.work.status||'—'),tone:d.work.status==='ZÁSAH'?'bad':d.work.status==='SLEDOVAT'?'warn':'good'}
 ];
 host.innerHTML='<div class="os1600-home" data-os2-today data-product-home1300 data-os1400-home data-os1600-home>'+
  '<header class="os1600-head"><div><div class="os1400-kicker">'+esc(today)+'</div><h1>'+greeting()+', Kamile.</h1><p>Co dnes vyžaduje tvoji pozornost. Bez diagnostiky a bez zbytečných mezikroků.</p></div><button class="os1400-button primary" type="button" data-today1300-add>＋ Přidat</button></header>'+
  '<div class="os1600-summary">'+summary.map(x=>'<div class="os1600-summary-item '+x.tone+'"><span>'+esc(x.label)+'</span><b>'+esc(x.value)+'</b></div>').join('')+'</div>'+
  '<section class="os1600-attention '+severity+'"><div class="os1600-section-head"><div><span class="os1400-kicker">Teď</span><h2>Co potřebuje vyřešit</h2></div><span>'+(items.length?items.length+' položek':'všechno v klidu')+'</span></div>'+
   (items.length?actionRows(items):'<div class="os1600-clear"><b>Nic akutního.</b><span>Můžeš jet podle plánu nebo přidat další úkol.</span></div>')+
  '</section>'+
  '<section class="os1600-section"><div class="os1600-section-head"><div><span class="os1400-kicker">Přehled OS</span><h2>Všechny oblasti</h2></div><span>9 oblastí · vše na jeden klik</span></div>'+systemRows(system)+'</section>'+
  (d.calendar.length?'<section class="os1600-section"><div class="os1600-section-head"><div><span class="os1400-kicker">Kalendář</span><h2>Nejbližší</h2></div><span>max. 3 události</span></div>'+calendarRows(d.calendar)+'</section>':'')+
 '</div>';
 if(!host.dataset.today1300Bound){
  host.dataset.today1300Bound='1';
  ownEvent1100(OWNER,host,'click',async e=>{
   if(e.target.closest('[data-today1300-insurance]')){openInsuranceCenter();return}
   const personalButton=e.target.closest('[data-today1300-personal]');
   if(personalButton){const action=personalDailyAssistant650(store.get()).top.find(x=>String(x.id)===personalButton.dataset.today1300Personal);if(action){const {openPersonalAction641}=await import('./personalActionExecution641.js');await openPersonalAction641(action);render()}return}
   const taskButton=e.target.closest('[data-today1300-task]');
   if(taskButton){const task=(store.get().tasks||[]).find(x=>String(x.id)===taskButton.dataset.today1300Task);if(task){const {openPersonalAction641}=await import('./personalActionExecution641.js');await openPersonalAction641({id:'task:'+task.id,kind:'task',title:titleOf(task),why:'Termín: '+fmtDate(task),next:task.notes||'Dokončit nebo posunout termín.',route:'today'})}return}
   const nav=e.target.closest('[data-today1300-nav]');if(nav){window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:nav.dataset.today1300Nav}));return}
   if(e.target.closest('[data-today1300-add]'))window.dispatchEvent(new CustomEvent('kamil:capture',{detail:'task'}))
  })
 }
 window.__KAMIL_TODAY_OS2000__={healthy:true,version:2000,productReset:1331,usabilityReset:1500,attention:items.length,tasks:d.tasks.length,waiting:d.waiting.length,tickets:d.activeTickets.length,ticketQty:d.activeTickets.reduce((a,x)=>a+Math.max(1,Number(x.qty||1)),0),ticketTasks:d.ticketTasks.length,work:d.work.status,property:d.property.best?.decision.code||null,cashKnown:d.cash!==null,cash:d.cash,bettingOpen:d.bet.open,bettingPositions:d.bet.positions,bettingTickets:d.bet.tickets,bettingExposure:d.bet.exposure,overdue:d.overdue.length,personalPriorities:d.personal?.top?.length||0,systemRows:system.length,at:Date.now()};
 return true;
}
export function renderTodayPage2000(){return render()}
