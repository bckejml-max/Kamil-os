import {store} from './state.js';
import {workCommandCenter440} from './workCommandCenter440.js';
import {buildPropertyHub620} from './propertyHub620.js';
import {familyData140} from './familyPage140.js';
import {moneyData1300} from './moneyOverview.js';
import {bettingData1334} from './bettingOverview.js';
import {ticketData1300} from './ticketOverview.js';
import {localInboxSummary660} from './inboxHub660.js';
import {personalDailyAssistant650,personalHomeTimeline650} from './personalAssistant650.js';
import {personalVault640} from './personalVault640.js';
import {personalDaysTo650} from './personalDate650.js';
import {insuranceCenter} from './insurance25.js';
import {isPersonalScope527} from './personalScope527.js';
import {ownEvent1100,schedule1100} from './runtimeOwnership1100.js';

const OWNER='today.os2000';
const openInsuranceCenter=()=>{window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'more'}));schedule1100(OWNER,'insurance-open',async()=>{const m=await import('./insuranceUi25.js');m.renderInsurance25?.()},140,{pauseWhenHidden:true})};
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
const tomorrowRoute=x=>{const raw=String(`${x?.area||''} ${x?.category||''} ${x?.title||''} ${x?.summary||''} ${x?.subject||''}`).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();if(/dokument|doklad|smlouv/.test(raw))return'more';if(/rodin|dit|dcera|manzel|mam|tat|babi|ded/.test(raw))return'family';if(/domov|dum|home|energie|servis|reviz|udrzb/.test(raw))return'home';if(/peniz|finance|money|bank|platb|faktur|hypot|sporen/.test(raw))return'money';return x?.sourceKind==='calendar'?'today':'inbox'};
const actionAttr=x=>x?.insurance?`data-today1300-insurance="1"`:x?.personalId?`data-today1300-personal="${esc(x.personalId)}"`:x?.taskId?`data-today1300-task="${esc(x.taskId)}"`:`data-today1300-nav="${esc(x?.route||'today')}"`;
const fmtDate=x=>{const t=ts(x);if(!t)return'bez termínu';return new Date(t).toLocaleDateString('cs-CZ',{day:'numeric',month:'short'})};
const money=v=>Number.isFinite(Number(v))?`${Math.round(Number(v)).toLocaleString('cs-CZ')} Kč`:'—';
const vaultArchived=x=>['ARCHIVED','CLOSED','DONE','RESOLVED'].includes(upper(x?.status?.code||x?.status?.label));
const vaultEnding90=x=>{if(vaultArchived(x)||Number(x?.status?.severity||0)>0)return false;const d=personalDaysTo650(x?.noticeBy||x?.validUntil||x?.reviewAt||null);return d!==null&&d>=0&&d<=90};

function baseData(){
 const s=store.get();
 const tasks=(s.tasks||[]).filter(open),personalTasks=tasks.filter(isPersonalScope527),waiting=[...(s.directorBook?.waiting||[]),...(s.delegations||[]),...(s.personalInbox?.items||[]).filter(x=>String(x?.bucket||'').toLowerCase()==='waiting')].filter(open),calendar=(s.calendar?.events||[]).filter(open).filter(x=>{const t=ts(x);return t&&t>Date.now()-6*3600000}).sort((a,b)=>(ts(a)||Infinity)-(ts(b)||Infinity));
 const urgentTasks=[...tasks].sort((a,b)=>{const ao=isOverdue(a),bo=isOverdue(b);if(ao!==bo)return bo-ao;const pa=Number(a?.priority||a?.score||0),pb=Number(b?.priority||b?.score||0);if(pb!==pa)return pb-pa;return(ts(a)||Infinity)-(ts(b)||Infinity)});
 const overdue=personalTasks.filter(isOverdue),inboxState=localInboxSummary660(s),ticketState=ticketData1300(s),tickets=ticketState.items,activeTickets=ticketState.p.queue.rows,transfer=ticketState.transfer,ticketTasks=ticketState.ticketTasks,moneyState=moneyData1300(s),cash=moneyState.bankKnown?moneyState.bank:null,work=workCommandCenter440(s),property=buildPropertyHub620(s),bet=bettingData1334(s),family=familyData140(s),personal=personalDailyAssistant650(s),homeTimeline=personalHomeTimeline650(s),insurance=insuranceCenter(s),vault=personalVault640(s);
 return{s,tasks,personalTasks,ticketTasks,waiting,tickets,activeTickets,transfer,ticketState,inboxState,calendar,urgentTasks,overdue,cash,moneyState,work,property,bet,family,personal,homeTimeline,insurance,vault};
}
function greeting(){const h=new Date().getHours();return h<11?'Dobré ráno':h<18?'Dobré odpoledne':'Dobrý večer'}
function attention(d){
 const out=[],add=(row,score=0)=>out.push({...row,score:Number(score||0)});
 for(const x of d.overdue.slice(0,2))add({title:titleOf(x),detail:`Úkol po termínu · ${fmtDate(x)}`,route:'inbox',taskId:x.id,sourceKey:`task:${x.id}`,tone:'bad',cta:'vyřešit'},132);
 const wr=d.work.topRisks[0];if(wr)add({title:wr.title,detail:`${wr.kind} · ${wr.detail}`,route:'work',sourceKey:`work:${wr.id||wr.title}`,tone:wr.score>=95?'bad':'warn',cta:'otevřít'},Math.max(90,Number(wr.score||0)+12));
 const ticketAlert=d.ticketState?.attention?.[0];if(ticketAlert)add({title:ticketAlert.title,detail:ticketAlert.detail,route:'tickets',sourceKey:`ticket:${ticketAlert.id||ticketAlert.title}`,tone:ticketAlert.tone||'warn',cta:'otevřít'},ticketAlert.tone==='bad'?126:84);
 for(const x of d.personal?.top||[]){const taskId=x.kind==='task'&&String(x.id||'').startsWith('task:')?String(x.id).slice(5):null;add({title:x.title,detail:x.why||x.next||'Osobní věc vyžaduje kontrolu.',route:personalRoute(x),personalId:taskId?null:x.id,taskId,sourceKey:String(x.id||''),tone:x.score>=110?'bad':x.score>=90?'warn':'',cta:String(x.cta||'vyřešit').toLowerCase()},x.score)}
 for(const x of (d.insurance?.actions||[]).slice(0,2))add({title:x.title,detail:x.issues?.[0]||'Pojistku je potřeba zkontrolovat.',route:'more',insurance:true,sourceKey:`insurance:${x.id||x.title}`,tone:x.status==='URGENT'?'bad':'warn',cta:'pojištění'},Number(x.priority||0)+8);
 const dueWait=d.waiting.find(x=>{const t=ts(x);return t&&t<=Date.now()+86400000});if(dueWait)add({title:`Follow-up: ${titleOf(dueWait)}`,detail:isOverdue(dueWait)?'Čekání je po termínu.':'Follow-up je dnes nebo zítra.',route:'inbox',sourceKey:`waiting:${dueWait.id||dueWait.title||titleOf(dueWait)}`,tone:isOverdue(dueWait)?'bad':'warn',cta:'zkontrolovat'},isOverdue(dueWait)?116:84);
 const tomorrow=d.personal?.tomorrow?.[0];if(tomorrow)add({title:tomorrow.title||tomorrow.summary||'Osobní termín zítra',detail:'Osobní termín je zítra.',route:tomorrowRoute(tomorrow),sourceKey:`calendar:${tomorrow.id||tomorrow.title||tomorrow.summary||'tomorrow'}`,tone:'',cta:'připravit'},76);
 const seen=new Set();
 return out.sort((a,b)=>b.score-a.score).filter(x=>{const key=String(x.sourceKey||x.title||'').toLocaleLowerCase('cs-CZ');if(seen.has(key))return false;seen.add(key);return true}).slice(0,4);
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
 const workRisk=d.work.topRisks?.[0],best=d.property.best,activeTicketQty=d.ticketState?.p?.queue?.activeQty||0,ticketAttention=d.ticketState?.attention||[],ticketTop=ticketAttention[0]||null;
 const family=d.family||{overdue:0,due7:0,tasks:[],events:[]},familyTomorrow=(d.personal?.tomorrow||[]).filter(x=>tomorrowRoute(x)==='family'),familyOverdue=(family.tasks||[]).find(x=>x.d!==null&&x.d<0),familyNext=[...(family.events||[]).filter(x=>x.d<=7),...(family.tasks||[]).filter(x=>x.d!==null&&x.d>=0&&x.d<=7),...familyTomorrow.map(x=>({...x,d:1}))].sort((a,b)=>(a.d??999)-(b.d??999))[0]||null,familyDue7=family.due7||familyTomorrow.length;
 const homeUrgent=(d.homeTimeline||[]).filter(x=>x.days!==null&&x.days!==undefined&&x.days<=30).sort((a,b)=>a.days-b.days),homePrimary=homeUrgent[0]||null,homeOverdue=homeUrgent.filter(x=>x.days<0).length;
 const docIssues=(d.vault?.action?.length||0)+(d.insurance?.actionCount||0),docEnding=(d.vault?.records||[]).filter(vaultEnding90).length;
 return [
  {route:'inbox',title:'Úkoly',detail:d.inboxState?.top?.title||'Fronta je prázdná',side:d.inboxState?.counts?.urgent?d.inboxState.counts.urgent+' urgent.':d.inboxState?.counts?.total?d.inboxState.counts.total+' položek':'čisto',tone:d.inboxState?.counts?.urgent?'bad':d.inboxState?.counts?.total?'warn':'good'},
  {route:'work',title:'Práce',detail:workRisk?workRisk.title:(d.work.status==='KLID'?'Bez akutního zásahu':'Otevřít pracovní přehled'),side:d.work.status,tone:d.work.status==='ZÁSAH'?'bad':d.work.status==='SLEDOVAT'?'warn':'good'},
  {route:'tickets',title:'Vstupenky',detail:ticketTop?.title||(activeTicketQty?activeTicketQty+' aktivních kusů':'Žádný aktivní kus'),side:ticketAttention.length?ticketAttention.length+' řešit':activeTicketQty?activeTicketQty+' ks':'klid',tone:d.ticketState?.issues?.length||d.ticketState?.transfer?.length?'bad':ticketAttention.length?'warn':'good'},
  {route:'money',title:'Peníze',detail:d.moneyState?.bankKnown?'Známý bankovní stav · '+money(d.moneyState.bank):'Bankovní stav není potvrzený',side:d.moneyState?.attention?.length?d.moneyState.attention.length+' řešit':d.moneyState?.bankKnown?money(d.moneyState.bank):'doplnit',tone:d.moneyState?.attention?.length?'warn':d.moneyState?.bankKnown?'good':'warn'},
  {route:'property',title:'Reality',detail:best?best.name+' · '+best.decision.action:'Žádný kandidát v shortlistu',side:best?best.score+'/100':'—',tone:best?(best.decision.code==='PASS'?'bad':best.decision.code==='NEGOTIATE'?'warn':'good'):''},
  {route:'betting',title:'Sázení',detail:d.bet.open.length?d.bet.openTickets+' tiketů v '+d.bet.open.length+' pozicích':'Žádná otevřená pozice',side:d.bet.open.length?d.bet.open.length+' pozic':'klid',tone:d.bet.risk||d.bet.unknownRisk?'warn':'good'},
  {route:'family',title:'Rodina',detail:familyOverdue?.title||familyNext?.title||familyNext?.summary||'Bez rodinného termínu do 7 dní',side:family.overdue?family.overdue+' po term.':familyDue7?familyDue7+' do 7 dní':'klid',tone:family.overdue?'bad':familyDue7?'warn':'good'},
  {route:'home',title:'Domov',detail:homePrimary?`${homePrimary.title} · ${homePrimary.days<0?Math.abs(homePrimary.days)+' d po termínu':homePrimary.days===0?'dnes':homePrimary.days===1?'zítra':'za '+homePrimary.days+' d'}`:'Žádný akutní servis nebo termín',side:homeUrgent.length?homeUrgent.length+' řešit':'klid',tone:homeOverdue?'bad':homeUrgent.length?'warn':'good'},
  {route:'more',title:'Dokumenty',detail:docIssues?docIssues+' dokumentů / pojistek k řešení':docEnding?docEnding+' dokumentů končí do 90 dní':'Bez akutního problému',side:docIssues?docIssues+' řešit':docEnding?docEnding+' končí':'klid',tone:docIssues?'bad':docEnding?'warn':'good'}
 ];
}
function systemRows(items){
 return '<div class="os1600-areas">'+items.map(x=>'<button type="button" class="os1600-area '+esc(x.tone||'')+'" data-today1300-nav="'+esc(x.route)+'"><span>'+esc(x.title)+'</span><b>'+esc(x.side)+'</b><small>'+esc(x.detail)+'</small></button>').join('')+'</div>'
}
function queue(d){
 const seen=new Set(),out=[];
 const add=x=>{const key=String(x.sourceKey||x.personalId||(x.taskId?'task:'+x.taskId:'')||[x.route,x.title].join(':')).toLocaleLowerCase('cs-CZ');if(seen.has(key))return;seen.add(key);out.push(x)};
 attention(d).forEach(add);
 for(const x of d.urgentTasks){
  if(out.length>=6)break;
  const t=ts(x),due=t&&t<=Date.now()+2*86400000;
  if(isOverdue(x)||due)add({title:titleOf(x),detail:(x?.project||x?.area||x?.category||'Úkol')+' · '+fmtDate(x),route:'inbox',taskId:x.id,sourceKey:`task:${x.id}`,tone:isOverdue(x)?'bad':'warn',cta:'vyřešit'});
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
 window.__KAMIL_TODAY_OS2000__={healthy:true,version:2000,productReset:1331,usabilityReset:1500,attention:items.length,tasks:d.tasks.length,waiting:d.waiting.length,tickets:d.ticketState?.p?.queue?.activePositions||0,ticketQty:d.ticketState?.p?.queue?.activeQty||0,ticketTasks:d.ticketState?.ticketTasks?.length||0,ticketAttention:d.ticketState?.attention?.length||0,work:d.work.status,property:d.property.best?.decision.code||null,cashKnown:d.cash!==null,cash:d.cash,bettingOpen:d.bet.open.length,bettingPositions:d.bet.open.length,bettingTickets:d.bet.openTickets,bettingExposure:d.bet.exposure,overdue:d.overdue.length,inboxLocal:d.inboxState?.counts?.total||0,inboxUrgent:d.inboxState?.counts?.urgent||0,personalPriorities:d.personal?.top?.length||0,systemRows:system.length,at:Date.now()};
 return true;
}
export function renderTodayPage2000(){return render()}
