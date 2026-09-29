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
import {ownEvent1100} from './runtimeOwnership1100.js';
import {buildActionTruth741} from './actionTruthEngine.js';
import {modal} from './utils.js';

const OWNER='today.os2000';
const openInsuranceCenter=()=>{window.__KAMIL_PENDING_FOCUS610__={target:'more',focus:'insurance',at:Date.now()};window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'more'}))};
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
 return '<div class="os1400-list os1600-calendar">'+items.slice(0,3).map(x=>{const route=tomorrowRoute(x);return '<button type="button" class="os1400-row os1600-calendar-row" data-today1300-nav="'+esc(route)+'"><div><b>'+esc(titleOf(x))+'</b><small>'+esc(x?.location||x?.calendar||'Kalendář')+'</small></div><div class="os1400-side">'+new Date(ts(x)).toLocaleString('cs-CZ',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+' <span class="os1500-row-arrow">→</span></div></button>'}).join('')+'</div>'
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
const areaIcon1600={inbox:'✓',work:'W',tickets:'T',money:'Kč',property:'R',betting:'S',family:'F',home:'D',more:'▤'};
function systemRows(items){
 return '<div class="os1600-areas">'+items.map(x=>'<button type="button" class="os1600-area '+esc(x.tone||'')+'" data-today1300-nav="'+esc(x.route)+'"><i class="os1600-area-icon" aria-hidden="true">'+esc(areaIcon1600[x.route]||'•')+'</i><span>'+esc(x.title)+'</span><b>'+esc(x.side)+'</b><small>'+esc(x.detail)+'</small></button>').join('')+'</div>'
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

function truthFollowups741(truth){
 const rows=truth.followUps.slice(0,4);if(!rows.length)return'';
 return '<section class="os1600-section os741-waiting"><div class="os1600-section-head"><div><span class="os1400-kicker">Čekám</span><h2>Follow-upy</h2></div><span>'+rows.length+' teď zkontrolovat</span></div><div class="os1400-list">'+rows.map(x=>'<button type="button" class="os1400-row" data-today1300-nav="'+esc(x.route||'inbox')+'"><div><b>'+esc(x.title)+'</b><small>'+esc(x.detail||x.person||'Na tahu je druhá strana.')+'</small></div><div class="os1400-side warn">'+esc(x.dueAt?fmtDate({date:x.dueAt}):x.ageDays!==null?x.ageDays+' d čekání':'follow-up')+' →</div></button>').join('')+'</div></section>';
}
function truthTomorrow741(truth){
 if(!truth.tomorrow.length)return'';
 return '<section class="os1600-section os741-tomorrow"><div class="os1600-section-head"><div><span class="os1400-kicker">Zítra</span><h2>Předání do dalšího dne</h2></div><span>'+truth.tomorrow.length+' položek</span></div><div class="os1400-list">'+truth.tomorrow.slice(0,4).map(x=>'<button type="button" class="os1400-row" data-today1300-nav="'+esc(x.route||'today')+'"><div><b>'+esc(x.title)+'</b><small>'+esc(x.source)+'</small></div><div class="os1400-side">'+esc(fmtDate({date:x.dueAt}))+' →</div></button>').join('')+'</div></section>';
}
function truthIgnore741(truth){
 if(!truth.ignore.length)return'';
 return '<section class="os1600-section os741-ignore"><div class="os1600-section-head"><div><span class="os1400-kicker">Může počkat</span><h2>Dnes nemusíš řešit</h2></div><span>bez zjevného rizika</span></div><div class="os741-ignore-grid">'+truth.ignore.map(x=>'<button type="button" data-today1300-nav="'+esc(x.route)+'"><b>'+esc(x.title)+'</b><small>'+esc(x.reason)+'</small></button>').join('')+'</div></section>';
}
function truthData741(truth){
 if(!truth.staleSources.length&&!truth.conflicts.length)return'';
 const rows=[...truth.conflicts.map(x=>({title:x.title,detail:x.detail,route:x.route,tone:'bad'})),...truth.staleSources.map(x=>({title:x.label+' potřebuje obnovit',detail:x.updatedAt?'Poslední potvrzená aktualizace '+new Date(x.updatedAt).toLocaleDateString('cs-CZ')+'.':'Chybí potvrzený čas aktualizace.',route:x.route,tone:'warn'}))].slice(0,6);
 return '<section class="os1600-section os741-data"><div class="os1600-section-head"><div><span class="os1400-kicker">Datová jistota</span><h2>'+truth.conflicts.length+' konfliktů · '+truth.staleSources.length+' zastaralých zdrojů</h2></div><span>OS nic nedohaduje</span></div><div class="os1400-list">'+rows.map(x=>'<button type="button" class="os1400-row" data-today1300-nav="'+esc(x.route||'today')+'"><div><b>'+esc(x.title)+'</b><small>'+esc(x.detail)+'</small></div><div class="os1400-side '+x.tone+'">zkontrolovat →</div></button>').join('')+'</div></section>';
}
function truthReview741(truth){
 const c=truth.dailyClose,w=truth.weeklyReview,b=truth.backupHealth;
 return '<details class="os741-review"><summary><div><span class="os1400-kicker">Review</span><b>Uzávěrka, týden a stav dat</b></div><span>rozbalit</span></summary><div class="os741-review-grid"><div><span>Dnes změn</span><b>'+c.changes+'</b><small>'+c.completed+' dokončených · '+c.carry+' důležitých přenést</small></div><div><span>7 dní</span><b>'+w.changes+'</b><small>'+w.completed+' dokončených změn</small></div><div><span>Záloha / stav</span><b>'+(b.stateValid?'OK':'ZKONTROLOVAT')+'</b><small>'+b.issues.length+' upozornění · '+b.fatal.length+' fatálních</small></div></div><div class="os741-timeline">'+truth.timeline.slice(0,5).map(x=>'<div><span>'+esc(new Date(x.at).toLocaleString('cs-CZ',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}))+'</span><b>'+esc(x.label)+'</b></div>').join('')+'</div></details>';
}

function render(){
 const host=document.querySelector('#todayView');if(!host)return false;
 const d=baseData(),truth=buildActionTruth741(d.s),ranked=truth.actions,visibleActions=[...ranked.slice(0,5)],insuranceAction=ranked.find(x=>x.insurance===true);
 if(insuranceAction&&!visibleActions.some(x=>x.id===insuranceAction.id)){if(visibleActions.length>=5)visibleActions[visibleActions.length-1]=insuranceAction;else visibleActions.push(insuranceAction);visibleActions.sort((a,b)=>Number(b.score||0)-Number(a.score||0))}
 const items=visibleActions.map(x=>({...x,detail:x.detail||x.why,cta:x.cta||'otevřít'})),toneRank={bad:3,warn:2,good:1,'':0},system=systemState(d).map((x,i)=>({...x,_order:i})).sort((a,b)=>(toneRank[b.tone]||0)-(toneRank[a.tone]||0)||a._order-b._order),today=new Date().toLocaleDateString('cs-CZ',{weekday:'long',day:'numeric',month:'long'});
 const primary=items[0]||null,later=items.slice(1,5),now=Date.now(),due48=[...d.urgentTasks,...d.calendar].filter(x=>{const t=ts(x);return t!==null&&t>=now&&t<=now+2*86400000}).length;
 const severity=primary?.tone==='bad'?'bad':primary?'warn':'good';
 const summary=[
  {label:'Po termínu',value:String(d.overdue.length),tone:d.overdue.length?'bad':'good'},
  {label:'Čekám',value:String(truth.waiting.length),tone:truth.followUps.length?'warn':'good'},
  {label:'Transfery',value:String(d.transfer.length),tone:d.transfer.length?'bad':'good'},
  {label:'Do 48 h',value:String(due48),tone:due48?'warn':'good'}
 ];
 host.innerHTML='<div class="os1600-home" data-os2-today data-product-home1300 data-os1400-home data-os1600-home>'+
  '<header class="os1600-head"><div><div class="os1400-kicker">'+esc(today)+'</div><h1>'+greeting()+', Kamile.</h1><p>Nejdřív další krok. Pak dnešní fronta a přehled oblastí.</p></div><button class="os1400-button primary" type="button" data-today1300-add aria-label="Přidat nový úkol">＋ Přidat</button></header>'+
  '<div class="os1600-summary">'+summary.map(x=>'<div class="os1600-summary-item '+x.tone+'"><span>'+esc(x.label)+'</span><b>'+esc(x.value)+'</b></div>').join('')+'</div>'+
  '<section class="os1600-next '+severity+'" aria-live="polite"><div class="os1600-next-copy"><span class="os1400-kicker">Další krok</span><h2>'+esc(primary?.title||'Nic akutního.')+'</h2><p>'+esc(primary?.detail||'Můžeš pokračovat podle plánu nebo si přidat nový úkol.')+'</p>'+(primary?'<button type="button" class="os741-why" data-today741-explain="'+esc(primary.id)+'">Proč to vidím?</button>':'')+'</div>'+
   (primary?'<button type="button" class="os1600-next-action" '+actionAttr(primary)+'><span>'+esc(primary.cta||'vyřešit')+'</span><b>Otevřít →</b></button>':'<button type="button" class="os1600-next-action quiet" data-today1300-add><span>máš prostor</span><b>＋ Přidat úkol</b></button>')+
  '</section>'+
  (later.length?'<section class="os1600-section os1600-later"><div class="os1600-section-head"><div><span class="os1400-kicker">Dnes ještě</span><h2>Další kroky</h2></div><span>'+later.length+' další</span></div>'+actionRows(later)+'</section>':'')+
  '<section class="os1600-section"><div class="os1600-section-head"><div><span class="os1400-kicker">Přehled</span><h2>Oblasti podle priority</h2></div><span>problémy první · vše na jeden klik</span></div>'+systemRows(system)+'</section>'+
  truthFollowups741(truth)+truthTomorrow741(truth)+truthIgnore741(truth)+truthData741(truth)+
  (d.calendar.length?'<section class="os1600-section"><div class="os1600-section-head"><div><span class="os1400-kicker">Kalendář</span><h2>Nejbližší</h2></div><span>max. 3 události</span></div>'+calendarRows(d.calendar)+'</section>':'')+
  truthReview741(truth)+
 '</div>';
 host.__truth741=truth;
 if(!host.dataset.today1300Bound){
  host.dataset.today1300Bound='1';
  ownEvent1100(OWNER,host,'click',async e=>{
   const explain=e.target.closest('[data-today741-explain]');
   if(explain){const action=host.__truth741?.actions?.find(x=>String(x.id)===String(explain.dataset.today741Explain));if(action){await modal('Proč to vidím?',`<div class="card"><div class="eyebrow">ACTION ENGINE 741</div><h2>${esc(action.title)}</h2><p class="muted">${esc(action.detail||'')}</p><div class="row"><span>Priorita</span><b>${Number(action.score||0)}</b></div><div class="row"><span>Zdroj</span><b>${esc(action.source||action.route||'OS')}</b></div><div class="row"><span>Důvod</span><b>${esc(action.why||'otevřená položka')}</b></div>${action.dueAt?'<div class="row"><span>Termín</span><b>'+esc(new Date(action.dueAt).toLocaleString('cs-CZ'))+'</b></div>':''}${action.moneyImpactCzk?'<div class="row"><span>Finanční dopad</span><b>'+money(action.moneyImpactCzk)+'</b></div>':''}</div>`,[{label:'Otevřít sekci',value:'open',primary:true},{label:'Zavřít',value:null}]).then(choice=>{if(choice==='open')window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:action.route||'today'}))})}return}
   if(e.target.closest('[data-today1300-insurance]')){openInsuranceCenter();return}
   const personalButton=e.target.closest('[data-today1300-personal]');
   if(personalButton){const action=personalDailyAssistant650(store.get()).top.find(x=>String(x.id)===personalButton.dataset.today1300Personal);if(action){const {openPersonalAction641}=await import('./personalActionExecution641.js');await openPersonalAction641(action);render()}return}
   const taskButton=e.target.closest('[data-today1300-task]');
   if(taskButton){const task=(store.get().tasks||[]).find(x=>String(x.id)===taskButton.dataset.today1300Task);if(task){const {openPersonalAction641}=await import('./personalActionExecution641.js');await openPersonalAction641({id:'task:'+task.id,kind:'task',title:titleOf(task),why:'Termín: '+fmtDate(task),next:task.notes||'Dokončit nebo posunout termín.',route:'today'})}return}
   const nav=e.target.closest('[data-today1300-nav]');if(nav){window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:nav.dataset.today1300Nav}));return}
   if(e.target.closest('[data-today1300-add]'))window.dispatchEvent(new CustomEvent('kamil:capture',{detail:'task'}))
  })
 }
 window.__KAMIL_TODAY_OS2000__={healthy:true,version:2000,productReset:1331,usabilityReset:1500,attention:items.length,primary:primary?.title||null,due48,tasks:d.tasks.length,waiting:truth.waiting.length,followUps:truth.followUps.length,staleSources:truth.staleSources.length,dataConflicts:truth.conflicts.length,tomorrow:truth.tomorrow.length,tickets:d.ticketState?.p?.queue?.activePositions||0,ticketQty:d.ticketState?.p?.queue?.activeQty||0,ticketTasks:d.ticketState?.ticketTasks?.length||0,ticketAttention:d.ticketState?.attention?.length||0,work:d.work.status,property:d.property.best?.decision.code||null,cashKnown:d.cash!==null,cash:d.cash,bettingOpen:d.bet.open.length,bettingPositions:d.bet.open.length,bettingTickets:d.bet.openTickets,bettingExposure:d.bet.exposure,overdue:d.overdue.length,inboxLocal:d.inboxState?.counts?.total||0,inboxUrgent:d.inboxState?.counts?.urgent||0,personalPriorities:d.personal?.top?.length||0,systemRows:system.length,at:Date.now()};
 return true;
}
export function renderTodayPage2000(){return render()}