import {store} from './state.js';
import {modal,formModal,h,money,date,toast} from './utils.js';

export const ONE_OS967_VERSION='967.0.0';
const ACTION_KEY='kamil.oneos.actions.949';
const JOURNAL_KEY='kamil.oneos.journal.956';
const ROUTINE_KEY='kamil.oneos.routine.964';
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','PAYOUT RECEIVED']);
const A=v=>Array.isArray(v)?v:[];
const N=v=>Number.isFinite(Number(v))?Number(v):0;
const U=v=>String(v||'').toUpperCase();
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const open=x=>!CLOSED.has(U(x?.status||x?.workflow));
const parse=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const uid=p=>`${p}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
const nowIso=()=>new Date().toISOString();
const tomorrow=()=>new Date(Date.now()+86400000).toISOString();
const safeDate=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?t:null};
const ageDays=v=>{const t=safeDate(v);return t===null?null:Math.floor((Date.now()-t)/86400000)};
const daysTo=v=>{const t=safeDate(v);return t===null?null:Math.ceil((t-Date.now())/86400000)};
const title=x=>String(x?.title||x?.name||x?.summary||x?.event_name||x?.event||x?.label||'Položka');
const due=x=>x?.due||x?.deadline||x?.followUpAt||x?.event_date||x?.eventDate||x?.expiry||x?.expiresAt||null;
const detail=x=>String(x?.nextAction||x?.note||x?.notes||x?.detail||x?.description||'');
const fmtPct=v=>`${Math.round(N(v)*10)/10} %`;
const escAttr=v=>h(String(v||'')).replace(/`/g,'');

function priorityScore(x,base=40){
 const d=daysTo(due(x));let score=base;
 if(d!==null){if(d<0)score+=45;else if(d===0)score+=38;else if(d<=2)score+=28;else if(d<=7)score+=16;else if(d<=14)score+=7}
 const st=U(x?.status||x?.workflow||x?.lane);
 if(/URGENT|CRITICAL|BLOCK|OVERDUE/.test(st))score+=22;
 if(/WAIT|ČEK|CEK/.test(st)){const a=ageDays(x?.updatedAt||x?.createdAt||x?.at);if(a!==null&&a>=5)score+=Math.min(18,a)}
 if(N(x?.priority)>=80||U(x?.priority)==='HIGH')score+=15;
 return Math.max(0,Math.min(100,score));
}

function actionLog(){return A(parse(ACTION_KEY,[]))}
function lastDisposition(key){return actionLog().filter(x=>x.key===key).at(-1)||null}
function logDisposition(key,action,note=''){
 const rows=actionLog();rows.push({id:uid('a949'),key,action,note,at:nowIso()});save(ACTION_KEY,rows.slice(-600));return rows.at(-1);
}
function actionHidden(key){const x=lastDisposition(key);if(!x)return false;if(x.action==='ignore'||x.action==='done')return true;if(x.action==='snooze'&&Date.now()-Date.parse(x.at)<86400000)return true;return false}

function pushAction(out,area,source,path,x,base=40){
 if(!x||!open(x))return;const id=String(x.id||`${path}:${title(x)}`),key=`${path}:${id}`;if(actionHidden(key))return;
 out.push({key,id,area,source,path,title:title(x),detail:detail(x),due:due(x),score:priorityScore(x,base),raw:x});
}

export function collectActions949(s=store.get()){
 const out=[];
 A(s.tasks).forEach(x=>pushAction(out,'TASKS','Úkol','tasks',x,48));
 A(s.personalAdmin?.items).forEach(x=>pushAction(out,'ADMIN','Administrativa','personalAdmin.items',x,45));
 A(s.personalInbox?.items).forEach(x=>pushAction(out,'INBOX','Osobní inbox','personalInbox.items',x,52));
 A(s.inbox).forEach(x=>pushAction(out,'INBOX','Inbox','inbox',x,54));
 A(s.delegations).forEach(x=>pushAction(out,'WAITING','Čekání','delegations',x,42));
 A(s.projects).filter(open).forEach(x=>pushAction(out,'WORK','Projekt','projects',x,44));
 return out.sort((a,b)=>b.score-a.score||String(a.due||'').localeCompare(String(b.due||'')));
}

function mutateByPath(path,id,fn){
 store.mutate(`OS949 ${path}`,s=>{
  const map={
   'tasks':s.tasks,
   'personalAdmin.items':s.personalAdmin?.items,
   'personalInbox.items':s.personalInbox?.items,
   'inbox':s.inbox,
   'delegations':s.delegations,
   'projects':s.projects
  };
  const arr=map[path];if(!Array.isArray(arr))return;const item=arr.find(x=>String(x.id||'')===String(id));if(item)fn(item);
 });
}
export function applyAction949(item,action){
 logDisposition(item.key,action);
 if(action==='done')mutateByPath(item.path,item.id,x=>{x.status=x.path==='delegations'?'RESOLVED':'DONE';x.completedAt=nowIso()});
 if(action==='snooze')mutateByPath(item.path,item.id,x=>{x.followUpAt=tomorrow();x.updatedAt=nowIso()});
 if(action==='do')mutateByPath(item.path,item.id,x=>{x.priority='HIGH';x.updatedAt=nowIso();x.os949='DO_NOW'});
 window.dispatchEvent(new CustomEvent('kamil:oneos-change',{detail:{feature:949,action,key:item.key}}));
 return true;
}

export function globalInbox950(s=store.get()){
 const rows=[];const seen=new Set();
 const add=(area,source,x,score=50)=>{if(!x||!open(x))return;const key=`${source}:${x.id||title(x)}`;if(seen.has(key))return;seen.add(key);rows.push({key,area,source,title:title(x),detail:detail(x),due:due(x),score:priorityScore(x,score),raw:x})};
 A(s.inbox).forEach(x=>add('INBOX','Inbox',x,55));A(s.personalInbox?.items).forEach(x=>add('INBOX','Osobní inbox',x,55));A(s.delegations).forEach(x=>add('WAITING','Čekám',x,47));
 A(s.personalAdmin?.items).filter(x=>{const d=daysTo(due(x));return d!==null&&d<=14}).forEach(x=>add('ADMIN','Administrativa',x,48));
 A(s.calendar?.events).filter(x=>{const d=daysTo(x.start||x.date||x.due);return d!==null&&d>=0&&d<=7}).forEach(x=>add('CALENDAR','Kalendář',x,44));
 return rows.sort((a,b)=>b.score-a.score).slice(0,80);
}

function ticketRows(s=store.get()){
 return A(s.ticketBook?.items).map(x=>{
  const buy=N(x.buyPrice||x.purchasePrice||x.cost||x.pricePaid),market=N(x.marketPrice||x.currentPrice||x.askPrice||x.listPrice),fees=N(x.fees||x.fee||x.platformFee),expectedNet=market?market-fees-buy:null;
  const margin=market&&buy>0?expectedNet/buy*100:null;const d=daysTo(x.event_date||x.eventDate||x.date);
  let verdict='HOLD';if(d!==null&&d<=3&&margin!==null&&margin<5)verdict='SELL NOW';else if(d!==null&&d<=10&&margin!==null&&margin<12)verdict='LOWER';
  return{...x,buy,market,fees,expectedNet,margin,days:d,verdict,confidence:market&&buy>0?'MEDIUM':'LOW'};
 });
}
export function ticketPortfolio957(s=store.get()){
 const rows=ticketRows(s),active=rows.filter(x=>!['SOLD','PAYOUT RECEIVED'].includes(U(x.workflow||x.status)));
 return{rows,active,capital:active.reduce((a,x)=>a+N(x.buy),0),expectedNet:active.filter(x=>x.expectedNet!==null).reduce((a,x)=>a+N(x.expectedNet),0),sellNow:active.filter(x=>x.verdict==='SELL NOW'),missingMarket:active.filter(x=>!x.market).length};
}

function betRows(s=store.get()){
 const candidates=[s.bettingBook?.bets,s.betBook?.items,s.bets,s.betLedger?.items].find(Array.isArray)||[];
 return A(candidates).map(x=>{const stake=N(x.stake||x.amount),odds=N(x.odds||x.price),prob=N(x.modelProbability||x.probability||x.modelProb),edge=prob&&odds?prob*odds-1:null;return{...x,stake,odds,prob,edge,clv:x.clv??x.closingLineValue??null}});
}
export function bettingLedger958(s=store.get()){
 const rows=betRows(s),settled=rows.filter(x=>/WIN|LOSS|WON|LOST|VOID|SETTLED/.test(U(x.status))),profit=settled.reduce((a,x)=>a+N(x.profit||x.pnl||x.net),0),staked=settled.reduce((a,x)=>a+N(x.stake),0);
 return{rows,active:rows.filter(x=>!settled.includes(x)),settled,profit,staked,roi:staked?profit/staked*100:null,withClv:rows.filter(x=>x.clv!==null).length};
}

function propertyRows(s=store.get()){
 const rows=A(s.propertyBook?.candidates||s.propertyBook?.items||s.properties);
 return rows.map(x=>{const price=N(x.price||x.purchasePrice||x.askingPrice),rent=N(x.rent||x.monthlyRent||x.expectedRent),monthlyCost=N(x.monthlyCost||x.fund||x.hoa||x.reserve),annualNet=rent?Math.max(0,(rent-monthlyCost)*12):0,yieldPct=price&&annualNet?annualNet/price*100:null;return{...x,price,rent,monthlyCost,annualNet,yieldPct,complete:!!(price&&rent)}});
}
export function propertyCenter959(s=store.get()){
 const rows=propertyRows(s).sort((a,b)=>N(b.yieldPct)-N(a.yieldPct));return{rows,best:rows.find(x=>x.complete)||null,missing:rows.filter(x=>!x.complete).length};
}

export function moneyCockpit954(s=store.get()){
 const cash=N(s.financePlan?.cashNow),income=N(s.financePlan?.expectedIncome),reserve=N(s.financePlan?.reserveFloor),planned=N(s.financePlan?.plannedInvestment),xtb=N(s.xtbReport?.czkValue)+N(s.xtbReport?.eurValue),netItems=A(s.netWorthBook?.items),netWorth=netItems.reduce((a,x)=>a+N(x.value||x.amount||x.currentValue),0),receivables=A(s.debtBook?.items).filter(open).reduce((a,x)=>a+N(x.amount||x.value),0),free=Math.max(0,cash+income-reserve-planned);
 return{cash,income,reserve,planned,xtb,netWorth,receivables,free,asOf:s.financePlan?.asOf||s.meta?.lastMutationAt||null,source:'store'};
}

export function opportunity955(s=store.get()){
 const out=[];
 for(const x of ticketRows(s)){if(x.margin!==null&&x.margin>0)out.push({type:'TICKET',title:title(x),score:Math.min(100,45+x.margin),returnPct:x.margin,risk:x.days!==null&&x.days<=7?70:50,evidence:`market ${money(x.market)} / nákup ${money(x.buy)}`})}
 for(const x of propertyRows(s)){if(x.yieldPct!==null)out.push({type:'PROPERTY',title:title(x),score:Math.min(100,40+x.yieldPct*6),returnPct:x.yieldPct,risk:55,evidence:`čistý hrubý model ${fmtPct(x.yieldPct)}`})}
 for(const x of betRows(s)){if(x.edge!==null&&x.edge>0)out.push({type:'BETTING',title:title(x),score:Math.min(100,45+x.edge*100),returnPct:x.edge*100,risk:80,evidence:`model edge ${fmtPct(x.edge*100)}`})}
 return out.sort((a,b)=>b.score-a.score).slice(0,30);
}

export function decisionJournal956(){return A(parse(JOURNAL_KEY,[]))}
export function recordDecision956(row={}){const rows=decisionJournal956();const x={id:uid('d956'),at:nowIso(),area:U(row.area)||'GENERAL',decision:String(row.decision||''),reason:String(row.reason||''),expected:String(row.expected||''),outcome:String(row.outcome||'OPEN')};rows.push(x);save(JOURNAL_KEY,rows.slice(-500));return x}

export function familyHub960(s=store.get()){
 const members=A(s.familyHome?.members),events=A(s.calendar?.events).filter(x=>/family|rodin|mia|plav|doktor|léka|lekar/i.test(`${x.category||''} ${title(x)} ${detail(x)}`)),tasks=collectActions949(s).filter(x=>x.area==='TASKS'&&/family|rodin|mia|plav|doktor|léka|lekar/i.test(`${x.title} ${x.detail}`));return{members,events,tasks};
}
export function homeAssets961(s=store.get()){
 const assets=[...A(s.assetBook?.items),...A(s.emergencyFile?.assets)];return assets.map(x=>({...x,nextDate:due(x),days:daysTo(due(x)),value:N(x.value||x.purchasePrice||x.amount)})).sort((a,b)=>(a.days??9999)-(b.days??9999));
}
export function documentIntelligence962(s=store.get()){
 const rows=[...A(s.personalAdmin?.items),...A(s.documents?.items),...A(s.documentBook?.items)].filter(x=>/doc|doklad|smlouv|pojist|občan|ridic|řidič|reviz|stk|pas/i.test(`${x.type||''} ${x.category||''} ${title(x)}`)||due(x));
 return rows.map(x=>({id:x.id,title:title(x),type:x.type||x.category||'Dokument',expires:due(x),days:daysTo(due(x)),amount:N(x.amount||x.price||x.premium),counterparty:x.counterparty||x.provider||x.company||'',confidence:due(x)?'MEDIUM':'LOW',source:'structured fields'})).sort((a,b)=>(a.days??9999)-(b.days??9999));
}

export function notificationBrain963(s=store.get()){
 const source=[...collectActions949(s),...globalInbox950(s)],seen=new Set(),out=[];
 for(const x of source){const key=x.key||`${x.source}:${x.title}`;if(seen.has(key))continue;seen.add(key);const d=daysTo(x.due);const urgent=x.score>=75||(d!==null&&d<=2);if(urgent)out.push({...x,urgent:true})}
 return out.sort((a,b)=>b.score-a.score).slice(0,12);
}
export function routine964(s=store.get()){
 const hour=new Date().getHours(),mode=hour<14?'MORNING':'EVENING',actions=collectActions949(s),notifications=notificationBrain963(s),log=parse(ROUTINE_KEY,{}),day=new Date().toISOString().slice(0,10);
 return{mode,day,done:!!log[`${day}:${mode}`],top:actions.slice(0,3),notifications:notifications.slice(0,5),completedToday:A(s.audit).filter(x=>String(x.at||'').startsWith(day)&&/DONE|Hotovo|dokon/i.test(String(x.label||''))).length};
}
export function completeRoutine964(mode){const log=parse(ROUTINE_KEY,{}),day=new Date().toISOString().slice(0,10);log[`${day}:${mode}`]={at:nowIso()};save(ROUTINE_KEY,log);return true}

export function universalSearch952(term,s=store.get()){
 const q=norm(term);if(!q)return[];const rows=[];const add=(type,items)=>A(items).forEach(x=>{const text=norm(`${title(x)} ${detail(x)} ${x.type||''} ${x.category||''} ${x.provider||''}`);if(text.includes(q))rows.push({type,title:title(x),detail:detail(x),id:x.id||'',raw:x})});
 add('TASK',s.tasks);add('PROJECT',s.projects);add('TICKET',s.ticketBook?.items);add('PROPERTY',s.propertyBook?.candidates||s.propertyBook?.items);add('ADMIN',s.personalAdmin?.items);add('INBOX',s.personalInbox?.items);add('ASSET',s.assetBook?.items);add('GOAL',s.personalGoals?.items);add('FAMILY',s.familyHome?.members);add('BET',betRows(s));add('CALENDAR',s.calendar?.events);return rows.slice(0,80);
}
export function personalTimeline953(s=store.get()){
 const rows=[];const add=(type,items,getDate=x=>x.at||x.updatedAt||x.createdAt||due(x))=>A(items).forEach(x=>{const t=safeDate(getDate(x));if(t!==null)rows.push({type,at:new Date(t).toISOString(),title:title(x),detail:detail(x)})});
 add('AUDIT',s.audit);add('TASK',s.tasks);add('TICKET',s.ticketBook?.history);add('MONEY',s.netWorthBook?.history);add('IMPORT',s.importCenter?.history);add('CALENDAR',s.calendar?.events,x=>x.start||x.date||x.due);return rows.sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)).slice(0,150);
}

export function performanceCleanup966(){
 const links=[...document.querySelectorAll('link[rel="stylesheet"]')],seen=new Set(),duplicates=[];for(const l of links){const href=l.href;if(seen.has(href)){duplicates.push(href);l.remove()}else seen.add(href)}
 const scripts=[...document.scripts].length;return{stylesheets:seen.size,duplicateStylesRemoved:duplicates.length,scripts,boot:window.__KAMIL_BOOT_BUDGET343__||null,deferred:window.__KAMIL_DEFERRED345__||null};
}

export function autopilot967(s=store.get()){
 const actions=collectActions949(s),opps=opportunity955(s),inbox=globalInbox950(s),waiting=inbox.filter(x=>x.area==='WAITING'),notifications=notificationBrain963(s);
 const doNow=actions[0]?{lane:'UDĚLEJ',area:actions[0].area,title:actions[0].title,detail:actions[0].detail||actions[0].source,score:actions[0].score}:null;
 const decide=opps[0]?{lane:'ROZHODNI',area:opps[0].type,title:opps[0].title,detail:opps[0].evidence,score:opps[0].score}:actions[1]?{lane:'ROZHODNI',area:actions[1].area,title:actions[1].title,detail:actions[1].detail||actions[1].source,score:actions[1].score}:null;
 const watch=waiting[0]||notifications.find(x=>x.title!==doNow?.title);const watchRow=watch?{lane:'HLÍDÁM',area:watch.area,title:watch.title,detail:watch.detail||watch.source,score:watch.score}:null;
 return[doNow,decide,watchRow].filter(Boolean);
}

export async function todaySummary948(){
 let learning=null;try{const m=await import('./selfImproving892.js');learning=await m.buildSelfImproving892()}catch{}
 const s=store.get(),actions=collectActions949(s),moneyModel=moneyCockpit954(s),tickets=ticketPortfolio957(s),property=propertyCenter959(s),autopilot=autopilot967(s),notifications=notificationBrain963(s);
 return{version:ONE_OS967_VERSION,top:actions.slice(0,3),money:moneyModel,tickets,property,autopilot,notifications,health:learning?.health??learning?.strategy?.health??null,missing:A(learning?.missing).length};
}

function actionCard(x,i){const d=daysTo(x.due);return `<article class="oneos967-action"><div class="oneos967-rank">${i+1}</div><div><div class="oneos967-meta">${h(x.area)} · ${h(x.source)}</div><h3>${h(x.title)}</h3><p>${h(x.detail|| (d===null?'Bez pevného termínu':d<0?`${Math.abs(d)} d po termínu`:d===0?'Dnes':`za ${d} d`))}</p></div><b>${Math.round(x.score)}</b></article>`}
function laneCard(x){return `<div class="oneos967-lane"><span>${h(x.lane)}</span><b>${h(x.title)}</b><small>${h(x.detail||x.area)}</small></div>`}

async function renderToday948(){
 const host=document.querySelector('#todayView');if(!host)return;const model=await todaySummary948();let root=host.querySelector('[data-oneos967]');if(!root){root=document.createElement('section');root.dataset.oneos967='1';root.className='oneos967-home';host.prepend(root)}
 root.innerHTML=`<header class="oneos967-head"><div><div class="eyebrow">ONE OS · 967</div><h1>Dnes</h1><p>Tři věci, které mají smysl řešit. Zbytek OS hlídá na pozadí jen jako data, ne jako autonomní akce.</p></div><div class="oneos967-health"><span>${model.missing?`${model.missing} datových mezer`:'Data bez známé mezery'}</span><b>${model.health===null?'—':Math.round(N(model.health))}</b></div></header><div class="oneos967-lanes">${model.autopilot.map(laneCard).join('')||'<div class="empty">Žádná akční priorita.</div>'}</div><div class="oneos967-top">${model.top.map(actionCard).join('')||'<div class="empty success-empty">Nic urgentního.</div>'}</div><div class="oneos967-strip"><button data-oneos-open="actions">Action Center</button><button data-oneos-open="inbox">Inbox</button><button data-oneos-open="money">Peníze</button><button data-oneos-open="opportunities">Příležitosti</button><button data-oneos-open="search">Hledat</button><button data-oneos-open="timeline">Timeline</button><button data-oneos-open="routine">${routine964().mode==='MORNING'?'Ranní režim':'Večerní režim'}</button><button data-oneos-open="more">Všechna centra</button></div><button class="oneos967-legacy-toggle" data-oneos-legacy>Zobrazit původní detail Dnes</button>`;
 [...host.children].filter(x=>x!==root).forEach(x=>x.dataset.oneosLegacy='1');
}

async function openActionCenter949(){
 const rows=collectActions949().slice(0,18),body=`<div class="oneos967-modal-list">${rows.length?rows.map((x,i)=>`<div class="oneos967-modal-row" data-a949="${escAttr(x.key)}"><div><div class="eyebrow">${h(x.area)} · ${Math.round(x.score)}</div><b>${h(x.title)}</b><small>${h(x.detail||x.source)}</small></div><div class="oneos967-inline"><button class="btn" data-act="do">Udělám</button><button class="btn" data-act="snooze">Odložit</button><button class="btn" data-act="ignore">Ignorovat</button><button class="btn primary" data-act="done">Hotovo</button></div></div>`).join(''):'<div class="empty success-empty">Action Center je prázdný.</div>'}</div>`;
 const p=modal('Universal Action Center · OS949',body,[{label:'Zavřít',value:null}]);requestAnimationFrame(()=>{document.querySelectorAll('[data-a949] [data-act]').forEach(b=>b.addEventListener('click',()=>{const key=b.closest('[data-a949]')?.dataset.a949,item=rows.find(x=>x.key===key);if(!item)return;applyAction949(item,b.dataset.act);b.closest('[data-a949]')?.remove();toast('Action Center aktualizován')}))});return p;
}
async function openInbox950(){const rows=globalInbox950();return modal('Globální Inbox · OS950',`<div class="oneos967-modal-list">${rows.length?rows.slice(0,30).map(x=>`<div class="oneos967-modal-row"><div><div class="eyebrow">${h(x.area)} · ${h(x.source)}</div><b>${h(x.title)}</b><small>${h(x.detail||'')}</small></div><strong>${Math.round(x.score)}</strong></div>`).join(''):'<div class="empty success-empty">Inbox je čistý.</div>'}</div>`,[{label:'Action Center',value:'actions',primary:true},{label:'Zavřít',value:null}]).then(v=>v==='actions'?openActionCenter949():v)}
async function openSearch952(seed=''){const form=await formModal('Universal Search · OS952',`<label>Hledat napříč celým OS<input name="q" value="${h(seed)}" autofocus placeholder="byt, pojistka, ticket, projekt…"></label>`,{submitLabel:'Hledat'});if(!form?.q)return null;const rows=universalSearch952(form.q);return modal(`Výsledky: ${form.q}`,`<div class="oneos967-modal-list">${rows.length?rows.map(x=>`<div class="oneos967-modal-row"><div><div class="eyebrow">${h(x.type)}</div><b>${h(x.title)}</b><small>${h(x.detail)}</small></div></div>`).join(''):'<div class="empty">Nic nenalezeno.</div>'}</div>`,[{label:'Nové hledání',value:'again',primary:true},{label:'Zavřít',value:null}]).then(v=>v==='again'?openSearch952():v)}
async function openTimeline953(){const rows=personalTimeline953().slice(0,40);return modal('Personal Timeline · OS953',`<div class="oneos967-timeline">${rows.map(x=>`<div><time>${h(date(x.at))}</time><span>${h(x.type)}</span><b>${h(x.title)}</b><small>${h(x.detail)}</small></div>`).join('')||'<div class="empty">Zatím bez historie.</div>'}</div>`,[{label:'Zavřít',value:null,primary:true}])}
async function openMoney954(){const x=moneyCockpit954();return modal('Money Cockpit 2.0 · OS954',`<div class="metric-strip"><div class="metric"><span>Cash</span><b>${money(x.cash)}</b></div><div class="metric"><span>Volné k rozhodnutí</span><b>${money(x.free)}</b></div><div class="metric"><span>XTB</span><b>${money(x.xtb)}</b></div><div class="metric"><span>Pohledávky</span><b>${money(x.receivables)}</b></div></div><div class="card"><div class="row"><span>Rezervní minimum</span><b>${money(x.reserve)}</b></div><div class="row"><span>Plánovaná investice</span><b>${money(x.planned)}</b></div><div class="row"><span>Aktualizace</span><b>${h(x.asOf?date(x.asOf):'neuvedena')}</b></div></div>`,[{label:'Zavřít',value:null,primary:true}])}
async function openOpportunities955(){const rows=opportunity955();return modal('Opportunity Engine · OS955',`<div class="oneos967-modal-list">${rows.length?rows.map(x=>`<div class="oneos967-modal-row"><div><div class="eyebrow">${h(x.type)} · score ${Math.round(x.score)}</div><b>${h(x.title)}</b><small>${h(x.evidence)}</small></div><strong>${fmtPct(x.returnPct)}</strong></div>`).join(''):'<div class="empty">Žádná příležitost nemá dost ověřených dat pro skórování.</div>'}</div>`,[{label:'Zavřít',value:null,primary:true}])}
async function openJournal956(){const rows=decisionJournal956().slice(-20).reverse();const v=await modal('Decision Journal · OS956',`${rows.length?rows.map(x=>`<div class="row"><div><b>${h(x.decision)}</b><div class="muted">${h(x.area)} · ${h(date(x.at))} · ${h(x.reason)}</div></div><span>${h(x.outcome)}</span></div>`).join(''):'<div class="empty">Žádná velká rozhodnutí zatím nejsou zapsaná.</div>'}`,[{label:'Zapsat rozhodnutí',value:'add',primary:true},{label:'Zavřít',value:null}]);if(v!=='add')return v;const f=await formModal('Nové rozhodnutí',`<label>Oblast<input name="area" placeholder="PROPERTY / TICKET / MONEY…"></label><label>Rozhodnutí<input name="decision" required></label><label>Proč<textarea name="reason"></textarea></label><label>Co očekávám<textarea name="expected"></textarea></label>`,{submitLabel:'Uložit'});if(f){recordDecision956(f);toast('Rozhodnutí uloženo')}return f}
async function openTickets957(){const x=ticketPortfolio957();return modal('Ticket Portfolio 3.0 · OS957',`<div class="metric-strip"><div class="metric"><span>Kapitál</span><b>${money(x.capital)}</b></div><div class="metric"><span>Oček. net</span><b>${money(x.expectedNet)}</b></div><div class="metric"><span>SELL NOW</span><b>${x.sellNow.length}</b></div><div class="metric"><span>Bez market ceny</span><b>${x.missingMarket}</b></div></div>${x.active.slice(0,25).map(r=>`<div class="row"><div><b>${h(title(r))}</b><div class="muted">${r.margin===null?'marže neověřená':fmtPct(r.margin)} · ${h(r.confidence)}</div></div><span class="status ${r.verdict==='SELL NOW'?'bad':r.verdict==='LOWER'?'warn':''}">${h(r.verdict)}</span></div>`).join('')}`, [{label:'Zavřít',value:null,primary:true}])}
async function openBetting958(){const x=bettingLedger958();return modal('Betting Ledger 2.0 · OS958',`<div class="metric-strip"><div class="metric"><span>Sázek</span><b>${x.rows.length}</b></div><div class="metric"><span>Aktivních</span><b>${x.active.length}</b></div><div class="metric"><span>ROI</span><b>${x.roi===null?'—':fmtPct(x.roi)}</b></div><div class="metric"><span>CLV data</span><b>${x.withClv}</b></div></div>${x.rows.length?x.rows.slice(0,25).map(r=>`<div class="row"><div><b>${h(title(r))}</b><div class="muted">stake ${money(r.stake)} · kurz ${r.odds||'—'} · ${r.edge===null?'edge neověřen':`edge ${fmtPct(r.edge*100)}`}</div></div><span>${h(r.status||'OPEN')}</span></div>`).join(''):'<div class="empty">V canonical state nejsou betting záznamy.</div>'}`, [{label:'Zavřít',value:null,primary:true}])}
async function openProperty959(){const x=propertyCenter959();return modal('Property Investment Center · OS959',`${x.best?`<div class="hero"><div class="eyebrow">NEJLEPŠÍ Z OVĚŘENÝCH DAT</div><h2>${h(title(x.best))}</h2><p>${fmtPct(x.best.yieldPct)} · ${money(x.best.price)} · nájem ${money(x.best.rent)}</p></div>`:''}${x.rows.map(r=>`<div class="row"><div><b>${h(title(r))}</b><div class="muted">cena ${r.price?money(r.price):'chybí'} · nájem ${r.rent?money(r.rent):'chybí'}</div></div><strong>${r.yieldPct===null?'NEROZHODOVAT':fmtPct(r.yieldPct)}</strong></div>`).join('')||'<div class="empty">Žádní kandidáti.</div>'}`, [{label:'Zavřít',value:null,primary:true}])}
async function openFamily960(){const x=familyHub960();return modal('Family Hub 2.0 · OS960',`<div class="metric-strip"><div class="metric"><span>Členové</span><b>${x.members.length}</b></div><div class="metric"><span>Rodinné termíny</span><b>${x.events.length}</b></div><div class="metric"><span>Úkoly</span><b>${x.tasks.length}</b></div></div>${x.events.slice(0,12).map(e=>`<div class="row"><span>${h(title(e))}</span><b>${h(date(e.start||e.date||e.due))}</b></div>`).join('')||'<div class="empty">Žádný blízký rodinný termín.</div>'}`, [{label:'Otevřít Rodinu',value:'family',primary:true},{label:'Zavřít',value:null}]).then(v=>{if(v==='family')window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'family'}));return v})}
async function openAssets961(){const rows=homeAssets961();return modal('Home & Assets Registry · OS961',`${rows.length?rows.slice(0,30).map(r=>`<div class="row"><div><b>${h(title(r))}</b><div class="muted">${r.value?money(r.value):''}</div></div><span>${r.days===null?'bez termínu':r.days<0?`${Math.abs(r.days)} d po`:r.days===0?'dnes':`za ${r.days} d`}</span></div>`).join(''):'<div class="empty">Asset registry je prázdný.</div>'}`, [{label:'Otevřít Domov',value:'home',primary:true},{label:'Zavřít',value:null}]).then(v=>{if(v==='home')window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'home'}));return v})}
async function openDocs962(){const rows=documentIntelligence962();return modal('Document Intelligence · OS962',`${rows.length?rows.slice(0,30).map(r=>`<div class="row"><div><b>${h(r.title)}</b><div class="muted">${h(r.type)}${r.counterparty?` · ${h(r.counterparty)}`:''}</div></div><span>${r.days===null?'datum chybí':r.days<0?'EXPIROVÁNO':r.days<=30?`za ${r.days} d`:date(r.expires)}</span></div>`).join(''):'<div class="empty">Žádná strukturovaná dokumentová data.</div>'}`, [{label:'Zavřít',value:null,primary:true}])}
async function openRoutine964(){const x=routine964();const v=await modal(`${x.mode==='MORNING'?'Ranní':'Večerní'} režim · OS964`,`<div class="card"><div class="eyebrow">TOP 3</div>${x.top.map((r,i)=>`<div class="row"><span>${i+1}. ${h(r.title)}</span><b>${Math.round(r.score)}</b></div>`).join('')||'<div class="empty">Nic urgentního.</div>'}</div><div class="card"><div class="row"><span>Dnešní dokončené položky</span><b>${x.completedToday}</b></div><div class="row"><span>Urgentní upozornění</span><b>${x.notifications.length}</b></div></div>`,[{label:x.done?'Dokončeno':'Uzavřít rutinu',value:'done',primary:true},{label:'Zavřít',value:null}]);if(v==='done'){completeRoutine964(x.mode);toast('Rutina uzavřena')}return v}
async function openAutopilot967(){const rows=autopilot967();return modal('Kamil OS Autopilot · OS967',`<div class="oneos967-lanes modal-lanes">${rows.map(laneCard).join('')||'<div class="empty">Není co řešit.</div>'}</div><div class="decision-note">Autopilot pouze skládá priority a hlídá stav. Nic nekupuje, neprodává, nesází ani neposílá peníze.</div>`,[{label:'Action Center',value:'actions',primary:true},{label:'Zavřít',value:null}]).then(v=>v==='actions'?openActionCenter949():v)}
async function openPerformance966(){const x=performanceCleanup966();return modal('Performance Cleanup · OS966',`<div class="card"><div class="row"><span>Stylesheets</span><b>${x.stylesheets}</b></div><div class="row"><span>Duplicitní CSS odstraněno</span><b>${x.duplicateStylesRemoved}</b></div><div class="row"><span>Script tagy</span><b>${x.scripts}</b></div><div class="row"><span>Boot health</span><b>${x.boot?.healthy===false?'PROBLÉM':'OK'}</b></div><div class="row"><span>Deferred health</span><b>${x.deferred?.healthy===false?'PROBLÉM':'OK'}</b></div></div>`,[{label:'Zavřít',value:null,primary:true}])}
async function openAllCenters967(){const v=await modal('One OS · OS948–967',`<div class="card"><div class="eyebrow">JEDEN OS, NE 20 MODULŮ</div><h2>Vyber pracovní centrum</h2><p class="muted">Všechny pohledy čtou canonical data. Když chybí klíčový vstup, výsledek zůstane neověřený.</p></div>`,[{label:'Autopilot',value:'autopilot',primary:true},{label:'Action Center',value:'actions'},{label:'Globální Inbox',value:'inbox'},{label:'Universal Search',value:'search'},{label:'Timeline',value:'timeline'},{label:'Money Cockpit',value:'money'},{label:'Opportunity Engine',value:'opportunities'},{label:'Decision Journal',value:'journal'},{label:'Ticket Portfolio 3.0',value:'tickets'},{label:'Betting Ledger 2.0',value:'betting'},{label:'Property Center',value:'property'},{label:'Family Hub',value:'family'},{label:'Home & Assets',value:'assets'},{label:'Document Intelligence',value:'docs'},{label:'Morning / Evening',value:'routine'},{label:'Performance Cleanup',value:'performance'},{label:'Zavřít',value:null}]);return openFeature(v)}

export async function openFeature(name,payload){switch(name){case'actions':return openActionCenter949();case'inbox':return openInbox950();case'search':return openSearch952(payload||'');case'timeline':return openTimeline953();case'money':return openMoney954();case'opportunities':return openOpportunities955();case'journal':return openJournal956();case'tickets':return openTickets957();case'betting':return openBetting958();case'property':return openProperty959();case'family':return openFamily960();case'assets':return openAssets961();case'docs':return openDocs962();case'routine':return openRoutine964();case'performance':return openPerformance966();case'autopilot':return openAutopilot967();case'more':return openAllCenters967();default:return null}}

function normalizeCommand(q){const n=norm(q);if(/^\/os|^\/one/.test(n))return['autopilot'];if(/^\/inbox/.test(n))return['inbox'];if(/^\/cash|^\/money/.test(n))return['money'];if(/^\/tickets/.test(n))return['tickets'];if(/^\/bets|^\/betting/.test(n))return['betting'];if(/^\/property|^\/byt/.test(n))return['property'];if(/^\/family/.test(n))return['family'];if(/^\/home/.test(n))return['assets'];if(/^\/docs/.test(n))return['docs'];if(/^\/timeline/.test(n))return['timeline'];if(/^\/opportunities/.test(n))return['opportunities'];if(/^\/find\s+/.test(n))return['search',q.replace(/^\/find\s+/i,'')];if(/co mam dnes|co mam ted|co resit dnes|co mám dnes|co mám teď/.test(n))return['autopilot'];if(/kolik.*cash|voln.*pen/.test(n))return['money'];if(/^najdi\s+/.test(n))return['search',q.replace(/^najdi\s+/i,'')];return null}
function handleCommand(e){const input=document.querySelector('#commandInput');if(!input)return false;const hit=normalizeCommand(input.value||'');if(!hit)return false;e?.preventDefault?.();e?.stopImmediatePropagation?.();openFeature(hit[0],hit[1]);return true}
function bindCommand951(){document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target?.id==='commandInput')handleCommand(e)},true);document.addEventListener('click',e=>{if(e.target?.closest?.('#commandGo'))handleCommand(e)},true)}
function bindTodayActions(){document.addEventListener('click',e=>{const b=e.target.closest?.('[data-oneos-open]');if(b){e.preventDefault();openFeature(b.dataset.oneosOpen);return}if(e.target.closest?.('[data-oneos-legacy]'))document.querySelector('#todayView')?.classList.toggle('oneos967-show-legacy')},true)}
function installMobile965(){if(document.querySelector('[data-oneos-mobile965]'))return;const b=document.createElement('button');b.type='button';b.dataset.oneosMobile965='1';b.className='oneos967-mobile-action';b.textContent='Co teď';b.setAttribute('aria-label','Otevřít další nejlepší akci');b.addEventListener('click',()=>openAutopilot967());document.body.appendChild(b)}

export function installOneOS967(){
 if(window.__KAMIL_ONE_OS967__?.installed)return;
 ensureCss();bindCommand951();bindTodayActions();installMobile965();performanceCleanup966();renderToday948();
 const unsub=store.subscribe(()=>renderToday948());window.addEventListener('kamil:view-change',e=>{if(e.detail==='today')renderToday948()});window.addEventListener('kamil:oneos-change',()=>renderToday948());
 window.__KAMIL_ONE_OS967__={version:ONE_OS967_VERSION,installed:true,features:[948,949,950,951,952,953,954,955,956,957,958,959,960,961,962,963,964,965,966,967],open:openAllCenters967,autopilot:()=>autopilot967(),search:universalSearch952,dispose:unsub};
}
function ensureCss(){if(document.querySelector('link[data-oneos967]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./oneOS967.css';l.dataset.oneos967='1';document.head.appendChild(l)}
