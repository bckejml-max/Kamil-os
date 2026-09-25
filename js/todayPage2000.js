import {store} from './state.js';
import {workCommandCenter440} from './workCommandCenter440.js';
import {buildPropertyHub620} from './propertyHub620.js';
import {personalDailyAssistant650} from './personalAssistant650.js';
import {insuranceCenter} from './insurance25.js';
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
const personalRoute=x=>x?.route==='documents'?'more':['waiting','today'].includes(x?.route)?'inbox':x?.route||'today';
const actionAttr=x=>x?.personalId?`data-today1300-personal="${esc(x.personalId)}"`:x?.taskId?`data-today1300-task="${esc(x.taskId)}"`:`data-today1300-nav="${esc(x?.route||'today')}"`;
const fmtDate=x=>{const t=ts(x);if(!t)return'bez termínu';return new Date(t).toLocaleDateString('cs-CZ',{day:'numeric',month:'short'})};
const money=v=>Number.isFinite(Number(v))?`${Math.round(Number(v)).toLocaleString('cs-CZ')} Kč`:'—';

function betting(s=store.get()){let legacy={};try{legacy=JSON.parse(localStorage.getItem('kamil_betting_ledger_543')||'{}')}catch{}const canonical=s?.bettingLedger||{},useCanonical=canonical.updatedAt||Number(canonical.bankrollCzk||0)!==0||Number(canonical.unitCzk||0)!==0||(Array.isArray(canonical.bets)&&canonical.bets.length>0),bets=useCanonical?(Array.isArray(canonical.bets)?canonical.bets:[]):(Array.isArray(legacy?.bets)?legacy.bets:[]),active=bets.filter(x=>upper(x.status||'OPEN')==='OPEN');return{open:active.length,exposure:active.reduce((a,x)=>a+Number(x.stakeCzk||0),0),bankroll:Number(useCanonical?canonical.bankrollCzk:legacy?.bankrollCzk||0)}}
function baseData(){
 const s=store.get();
 const tasks=(s.tasks||[]).filter(open),ticketTasks=tasks.filter(x=>['TICKETS','VIAGOGO'].includes(upper(x?.area||x?.category))),waiting=[...(s.directorBook?.waiting||[]),...(s.delegations||[]),...(s.personalInbox?.items||[]).filter(x=>String(x?.bucket||'').toLowerCase()==='waiting')].filter(open),tickets=(s.ticketBook?.items||[]).filter(open),calendar=(s.calendar?.events||[]).filter(x=>{const t=ts(x);return t&&t>Date.now()-6*3600000}).sort((a,b)=>(ts(a)||Infinity)-(ts(b)||Infinity));
 const urgentTasks=[...tasks].sort((a,b)=>{const ao=isOverdue(a),bo=isOverdue(b);if(ao!==bo)return bo-ao;const pa=Number(a?.priority||a?.score||0),pb=Number(b?.priority||b?.score||0);if(pb!==pa)return pb-pa;return(ts(a)||Infinity)-(ts(b)||Infinity)});
 const overdue=tasks.filter(isOverdue),transfer=tickets.filter(x=>['SOLD_UNDELIVERED','TRANSFER_REQUIRED','SOLD_WAITING_TRANSFER'].includes(upper(x.market_status||x.workflow))),activeTickets=tickets.filter(x=>!['PAID','PAYOUT_RECEIVED','SOLD'].includes(upper(x.market_status||x.workflow))),financePlan=s.financePlan||{},rawCash=financePlan.cashNow,cashPlanTouched=!!financePlan.updatedAt||[financePlan.cashNow,financePlan.expectedIncome,financePlan.reserveFloor,financePlan.plannedInvestment].some(v=>Number(v||0)!==0),cash=cashPlanTouched&&rawCash!==null&&rawCash!==undefined&&String(rawCash).trim()!==''&&Number.isFinite(Number(rawCash))?Number(rawCash):null,work=workCommandCenter440(s),property=buildPropertyHub620(s),bet=betting(s),personal=personalDailyAssistant650(s),insurance=insuranceCenter(s);
 return{s,tasks,ticketTasks,waiting,tickets,activeTickets,transfer,calendar,urgentTasks,overdue,cash,work,property,bet,personal,insurance};
}
function greeting(){const h=new Date().getHours();return h<11?'Dobré ráno':h<18?'Dobré odpoledne':'Dobrý večer'}
function attention(d){
 const out=[],add=(row,score=0)=>out.push({...row,score:Number(score||0)});
 for(const x of d.overdue.slice(0,2))add({title:titleOf(x),detail:`Úkol po termínu · ${fmtDate(x)}`,route:'inbox',taskId:x.id,tone:'bad',cta:'vyřešit'},132);
 const wr=d.work.topRisks[0];if(wr)add({title:wr.title,detail:`${wr.kind} · ${wr.detail}`,route:'work',tone:wr.score>=95?'bad':'warn',cta:'otevřít'},Math.max(90,Number(wr.score||0)+12));
 if(d.transfer.length)add({title:`${d.transfer.length} prodejů čeká na převod`,detail:'Vstupenky jsou prodané, ale předání kupujícímu ještě není dokončené.',route:'tickets',tone:'bad',cta:'převést'},126);
 for(const x of d.personal?.top||[])add({title:x.title,detail:x.why||x.next||'Osobní věc vyžaduje kontrolu.',route:personalRoute(x),personalId:x.id,tone:x.score>=110?'bad':x.score>=90?'warn':'',cta:String(x.cta||'vyřešit').toLowerCase()},x.score);
 for(const x of (d.insurance?.policies||[]).filter(x=>x.status!=='OK').slice(0,2))add({title:x.title,detail:x.issues?.[0]||'Pojistku je potřeba zkontrolovat.',route:'more',tone:x.status==='URGENT'?'bad':'warn',cta:'pojištění'},Number(x.priority||0)+8);
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
 const workRisk=d.work.topRisks?.[0],best=d.property.best,ticketOpen=d.ticketTasks.length||d.activeTickets.length;
 const area=x=>String(x?.area||x?.category||'').toLocaleLowerCase('cs-CZ');
 const familyTasks=d.tasks.filter(x=>/rodin|d[ií]t|dcera|manžel|manzel|mam|tat|babi|děd|ded/.test(area(x)));
 const homeTasks=d.tasks.filter(x=>/domov|d[uů]m|energie|servis|reviz|údržb|udrzb/.test(area(x)+' '+String(x?.title||'').toLocaleLowerCase('cs-CZ')));
 const docIssues=(d.insurance?.policies||[]).filter(x=>x.status!=='OK').length;
 const familySoon=(d.personal?.tomorrow||[]).length;
 return [
  {route:'inbox',title:'Úkoly',detail:d.overdue.length?d.overdue.length+' po termínu':d.tasks.length?d.tasks.length+' otevřených položek':'Fronta je prázdná',side:d.overdue.length?d.overdue.length+' po term.':d.tasks.length?d.tasks.length+' otevř.':'čisto',tone:d.overdue.length?'bad':d.tasks.length?'warn':'good'},
  {route:'work',title:'Práce',detail:workRisk?workRisk.title:(d.work.status==='KLID'?'Bez akutního zásahu':'Otevřít pracovní přehled'),side:d.work.status,tone:d.work.status==='ZÁSAH'?'bad':d.work.status==='SLEDOVAT'?'warn':'good'},
  {route:'tickets',title:'Vstupenky',detail:d.transfer.length?d.transfer.length+' čeká na převod':d.ticketTasks[0]?.title||'Žádný urgentní transfer',side:ticketOpen?ticketOpen+' otevř.':'klid',tone:d.transfer.length?'bad':ticketOpen?'warn':'good'},
  {route:'money',title:'Peníze',detail:d.cash!==null?'Potvrzená volná hotovost':'Hotovost není potvrzená',side:d.cash!==null?money(d.cash):'doplnit',tone:d.cash!==null?'good':'warn'},
  {route:'property',title:'Reality',detail:best?best.name+' · '+best.decision.action:'Žádný kandidát v shortlistu',side:best?best.score+'/100':'—',tone:best?(best.decision.code==='PASS'?'bad':best.decision.code==='NEGOTIATE'?'warn':'good'):''},
  {route:'betting',title:'Sázení',detail:d.bet.open?d.bet.open+' otevřených sázek':'Žádná otevřená sázka',side:d.bet.exposure?money(d.bet.exposure):'0 Kč',tone:d.bet.exposure?'warn':'good'},
  {route:'family',title:'Rodina',detail:familySoon?'Nejbližší rodinná věc je zítra':familyTasks[0]?.title||'Žádný akutní rodinný úkol',side:familyTasks.length?familyTasks.length+' úkolů':'klid',tone:familySoon?'warn':familyTasks.length?'warn':'good'},
  {route:'home',title:'Domov',detail:homeTasks[0]?.title||'Žádný akutní servis nebo úkol',side:homeTasks.length?homeTasks.length+' otevř.':'klid',tone:homeTasks.length?'warn':'good'},
  {route:'more',title:'Dokumenty',detail:docIssues?docIssues+' pojistek / smluv k ověření':'Bez akutního problému',side:docIssues?docIssues+' řešit':'klid',tone:docIssues?'warn':'good'}
 ];
}
function systemRows(items){
 return '<div class="os1400-domains">'+items.map(x=>'<button type="button" class="os1400-domain" data-today1300-nav="'+esc(x.route)+'"><div><b>'+esc(x.title)+'</b><small>'+esc(x.detail)+'</small></div><div class="os1400-side '+esc(x.tone||'')+'">'+esc(x.side)+' →</div></button>').join('')+'</div>'
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
 const d=baseData(),items=queue(d),primary=items[0]||null,rest=items.slice(1),system=systemState(d),today=new Date().toLocaleDateString('cs-CZ',{weekday:'long',day:'numeric',month:'long'});
 const severity=items.some(x=>x.tone==='bad')?'bad':items.length?'warn':'good';
 host.innerHTML='<div class="os1400-home" data-os2-today data-product-home1300 data-os1400-home>'+
  '<header class="os1400-hero"><div><div class="os1400-kicker">'+esc(today)+'</div><h1>'+greeting()+', Kamile.</h1><p>Jedno místo pro to, co dnes opravdu potřebuje tvoji pozornost.</p></div><span class="os1400-count '+severity+'">'+(items.length?items.length+' k řešení':'bez urgentních věcí')+'</span></header>'+
  '<section class="os1400-focus"><div><div class="os1400-kicker">Teď</div><h2>'+esc(primary?.title||'Nic akutního. Můžeš jet podle plánu.')+'</h2><p>'+esc(primary?.detail||'OS nevidí žádný prošlý termín, urgentní transfer ani follow-up, který by potřeboval okamžitý zásah.')+'</p></div><div class="os1400-focus-actions">'+(primary?'<button class="os1400-button primary" type="button" '+actionAttr(primary)+'>'+esc(primary.cta||'Otevřít')+' →</button>':'<button class="os1400-button primary" type="button" data-today1300-add>＋ Přidat úkol</button>')+'</div></section>'+
  '<div class="os1400-metrics">'+
    metric('Po termínu',String(d.overdue.length))+
    metric('Waiting for',String(d.waiting.length))+
    metric('Transfery',String(d.transfer.length))+
    metric('Práce',String(d.work.status||'—'))+
  '</div>'+
  '<div class="os1400-grid os1331-command-grid" data-os1331-command-grid>'+
   '<section class="os1400-card os1331-focus-stack"><div class="os1400-card-head"><h3>Další kroky</h3><span>podle naléhavosti</span></div>'+actionRows(rest)+'</section>'+
   '<section class="os1400-card os1331-system-panel"><div class="os1400-card-head"><h3>Přehled OS</h3><span>9 oblastí</span></div>'+systemRows(system)+'</section>'+
  '</div>'+
  (d.calendar.length?'<section class="os1400-card os1400-calendar"><div class="os1400-card-head"><h3>Nejbližší v kalendáři</h3><span>max. 3 události</span></div>'+calendarRows(d.calendar)+'</section>':'')+
  '<div style="display:flex;justify-content:flex-start"><button class="os1400-button" type="button" data-today1300-add>＋ Přidat úkol</button></div>'+
 '</div>';
 if(!host.dataset.today1300Bound){
  host.dataset.today1300Bound='1';
  ownEvent1100(OWNER,host,'click',async e=>{
   const personalButton=e.target.closest('[data-today1300-personal]');
   if(personalButton){const action=personalDailyAssistant650(store.get()).top.find(x=>String(x.id)===personalButton.dataset.today1300Personal);if(action){const {openPersonalAction641}=await import('./personalActionExecution641.js');await openPersonalAction641(action);render()}return}
   const taskButton=e.target.closest('[data-today1300-task]');
   if(taskButton){const task=(store.get().tasks||[]).find(x=>String(x.id)===taskButton.dataset.today1300Task);if(task){const {openPersonalAction641}=await import('./personalActionExecution641.js');await openPersonalAction641({id:'task:'+task.id,kind:'task',title:titleOf(task),why:'Termín: '+fmtDate(task),next:task.notes||'Dokončit nebo posunout termín.',route:'today'})}return}
   const nav=e.target.closest('[data-today1300-nav]');if(nav){window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:nav.dataset.today1300Nav}));return}
   if(e.target.closest('[data-today1300-add]'))window.dispatchEvent(new CustomEvent('kamil:capture',{detail:'task'}))
  })
 }
 window.__KAMIL_TODAY_OS2000__={healthy:true,version:2000,productReset:1331,usabilityReset:1500,attention:items.length,tasks:d.tasks.length,waiting:d.waiting.length,tickets:d.activeTickets.length,ticketTasks:d.ticketTasks.length,work:d.work.status,property:d.property.best?.decision.code||null,cashKnown:d.cash!==null,cash:d.cash,bettingOpen:d.bet.open,bettingExposure:d.bet.exposure,overdue:d.overdue.length,personalPriorities:d.personal?.top?.length||0,systemRows:system.length,at:Date.now()};
 return true;
}
export function renderTodayPage2000(){return render()}
