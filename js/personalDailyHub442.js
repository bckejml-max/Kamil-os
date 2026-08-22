import {store} from './state.js';
import {h,money,modal} from './utils.js';

const A=v=>Array.isArray(v)?v:[];
const U=v=>String(v||'').toUpperCase();
const N=v=>Number(v||0);
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','PAYOUT RECEIVED']);
const open=x=>!CLOSED.has(U(x?.status||x?.workflow));
const WORK_RE=/zak[aá]zk|faktur|dodavat|cest[aá]k|doch[aá]zk|ředitel|reditel|pks|cpi|zbrojov|\bzl\b|projektov[aá] karta|pracovn/i;
const personal=x=>!WORK_RE.test(`${x?.title||''} ${x?.name||''} ${x?.subject||''} ${x?.area||''} ${x?.category||''} ${x?.project||''}`);
const ms=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?t:null};
const day=v=>{const t=ms(v);if(t===null)return null;const a=new Date();a.setHours(0,0,0,0);const b=new Date(t);b.setHours(0,0,0,0);return Math.round((b-a)/86400000)};
const firstArray=(...rows)=>rows.find(x=>Array.isArray(x)&&x.length)||[];
const measure=fn=>{const t=performance.now(),value=fn(),elapsed=Math.round((performance.now()-t)*10)/10;window.__KAMIL_DAILY_442_LAST__={ms:elapsed,at:Date.now()};return{value,ms:elapsed}};

function taskRows(s){return A(s.tasks).filter(open).filter(personal).map(x=>({title:x.title||x.name||'Úkol',due:x.due||x.dueAt||x.date||null,days:day(x.due||x.dueAt||x.date),priority:N(x.priority)})).sort((a,b)=>(a.days??999)-(b.days??999)||b.priority-a.priority);}
function inboxRows(s){return A(s.inbox).filter(open).filter(personal).map(x=>({title:x.subject||x.title||'Zpráva',important:x.important===true||U(x.priority)==='HIGH'}));}
function calendarRows(s){const src=firstArray(s.calendar?.events,s.calendarEvents,s.events,s.agenda?.events);return A(src).filter(personal).map(x=>({title:x.title||x.name||x.summary||'Událost',at:x.start||x.startAt||x.date||x.when||null,days:day(x.start||x.startAt||x.date||x.when)})).filter(x=>x.days!==null&&x.days>=0&&x.days<=7).sort((a,b)=>(a.days??999)-(b.days??999));}
function adminRows(s){const src=[...A(s.personalAdmin?.items),...A(s.documents),...A(s.personalDocuments),...A(s.expiries),...A(s.documentsExpiry?.items)];return src.filter(open).filter(personal).map(x=>({title:x.title||x.name||x.type||'Administrativa',due:x.due||x.expiry||x.expiresAt||x.date||null,days:day(x.due||x.expiry||x.expiresAt||x.date)})).filter(x=>x.days===null||x.days<=30).sort((a,b)=>(a.days??999)-(b.days??999));}
function homeRows(s){const src=[...A(s.household?.items),...A(s.householdBills?.items),...A(s.home?.tasks),...A(s.familyHome?.items),...A(s.family?.tasks)];return src.filter(open).filter(personal).map(x=>({title:x.title||x.name||'Domov',due:x.due||x.date||null,days:day(x.due||x.date)})).sort((a,b)=>(a.days??999)-(b.days??999));}
function ticketRows(s){return A(s.ticketBook?.items).filter(x=>['HOLD','LISTED'].includes(U(x.workflow||'HOLD'))).map(x=>({title:x.event||x.name||x.title||'Vstupenka',sellBy:x.sellBy||x.sellByAt||x.date||null,days:day(x.sellBy||x.sellByAt||x.date),list:N(x.listPrice),market:N(x.marketPrice)})).sort((a,b)=>(a.days??999)-(b.days??999));}
function moneyRows(s){const value=N(s.xtbReport?.czkValue||s.xtbHub?.valueCzk),asOf=s.xtbReport?.asOf||s.xtbHub?.asOf||null,age=asOf&&ms(asOf)!==null?Math.round((Date.now()-ms(asOf))/3600000):null;return{xtbValue:value,xtbAge:age,stale:age===null||age>36};}

export function personalDailyHub442(s=store.get()){
 const tasks=taskRows(s),inbox=inboxRows(s),calendar=calendarRows(s),admin=adminRows(s),home=homeRows(s),tickets=ticketRows(s),finance=moneyRows(s);
 const todayTasks=tasks.filter(x=>x.days!==null&&x.days<=0),nextTasks=tasks.filter(x=>x.days!==null&&x.days>0&&x.days<=3),importantInbox=inbox.filter(x=>x.important),todayCalendar=calendar.filter(x=>x.days===0),soonAdmin=admin.filter(x=>x.days!==null&&x.days<=14),soonTickets=tickets.filter(x=>x.days!==null&&x.days<=7);
 const score=Math.max(0,100-Math.min(45,todayTasks.length*12)-Math.min(15,importantInbox.length*5)-Math.min(15,soonAdmin.length*5)-Math.min(15,soonTickets.length*5)-(finance.stale?10:0));
 return{score,status:score<55?'ŘEŠIT':score<80?'HLÍDAT':'KLID',tasks,todayTasks,nextTasks,inbox,importantInbox,calendar,todayCalendar,admin,soonAdmin,home,tickets,soonTickets,finance};
}

const row=(title,detail='',badge='')=>`<div class="row"><div><b>${h(title)}</b>${detail?`<div class="muted">${h(detail)}</div>`:''}</div>${badge?`<b>${h(badge)}</b>`:''}</div>`;
const due=x=>x.days===null?'bez termínu':x.days<0?`${Math.abs(x.days)} d po termínu`:x.days===0?'dnes':x.days===1?'zítra':`za ${x.days} d`;

export async function openPersonalDailyHub442(){
 const {value:x,ms}=measure(()=>personalDailyHub442());
 const priorities=[...x.todayTasks.slice(0,3).map(v=>({title:v.title,detail:`Úkol · ${due(v)}`})),...x.todayCalendar.slice(0,2).map(v=>({title:v.title,detail:'Kalendář · dnes'})),...x.soonAdmin.slice(0,2).map(v=>({title:v.title,detail:`Administrativa · ${due(v)}`})),...x.soonTickets.slice(0,2).map(v=>({title:v.title,detail:`Vstupenky · ${due(v)}`})),...(x.finance.stale?[{title:'Obnovit XTB data',detail:'Peníze · data starší než 36 h nebo chybí'}]:[])].slice(0,5);
 const body=`<div class="metric-strip"><div class="metric"><span>Dnešní skóre</span><b>${x.score}/100</b></div><div class="metric"><span>Režim</span><b>${h(x.status)}</b></div><div class="metric"><span>Dnes úkoly</span><b>${x.todayTasks.length}</b></div><div class="metric"><span>Kalendář dnes</span><b>${x.todayCalendar.length}</b></div></div><div class="card"><div class="eyebrow">CO DNES ŘEŠIT</div>${priorities.map(v=>row(v.title,v.detail)).join('')||'<div class="empty">Dnes podle uložených osobních dat nic zásadního nehoří.</div>'}</div><div class="card"><div class="eyebrow">PENÍZE</div>${row('XTB hodnota',money(x.finance.xtbValue),x.finance.stale?'OBNOVIT DATA':'OK')} ${row('Aktivní vstupenky',String(x.tickets.length),x.soonTickets.length?`${x.soonTickets.length} brzy`:'OK')}</div><div class="card"><div class="eyebrow">KALENDÁŘ / 7 DNÍ</div>${x.calendar.slice(0,5).map(v=>row(v.title,due(v))).join('')||'<div class="empty">Žádná osobní událost v uložených datech.</div>'}</div><div class="card"><div class="eyebrow">OSOBNÍ ADMINISTRATIVA</div>${x.soonAdmin.slice(0,5).map(v=>row(v.title,due(v))).join('')||'<div class="empty">Nic s termínem do 14 dní.</div>'}</div><div class="card"><div class="eyebrow">DOMOV / RODINA</div>${x.home.slice(0,5).map(v=>row(v.title,due(v))).join('')||'<div class="empty">Žádná otevřená položka v uložených datech.</div>'}</div><div class="decision-note">Personal Daily Hub 44.2 · výpočet ${ms} ms pouze po kliknutí. Používá jen osobní data, která už jsou uložená v Kamil OS; chybějící data si nedoplňuje.</div>`;
 const choice=await modal('Můj dnešek / Personal 44.2',body,[{label:'Peníze',value:'money'},{label:'Vstupenky',value:'tickets'},{label:'Domov',value:'home'},{label:'Zavřít',value:null,primary:true}]);
 if(choice)window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:choice}));
}
