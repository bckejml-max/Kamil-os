import {APP_VERSION} from './releaseMeta.js';
import {store} from './state.js';
import {h,qs,toast} from './utils.js';

let fullModule=null,fullPromise=null,seq=0,dailyPromise=null,adminPromise=null,homePromise=null,financePromise=null,lifePromise=null,assistantPromise=null;
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','PAYOUT RECEIVED']);
const A=v=>Array.isArray(v)?v:[],N=v=>Number(v||0),U=v=>String(v||'').toUpperCase();
const open=x=>!CLOSED.has(U(x?.status||x?.workflow));
const activeTicket=x=>['HOLD','LISTED'].includes(U(x?.workflow||'HOLD'));
const WORK_RE=/zak[aá]zk|faktur|dodavat|cest[aá]k|doch[aá]zk|ředitel|reditel|pks|cpi|zbrojov|\bzl\b|projektov[aá] karta|pracovn/i;
const personal=x=>!WORK_RE.test(`${x?.title||''} ${x?.name||''} ${x?.subject||''} ${x?.area||''} ${x?.category||''} ${x?.project||''}`);
const dateMs=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?t:null};
const fmt=v=>{const t=dateMs(v);return t===null?'—':new Date(t).toLocaleDateString('cs-CZ',{day:'numeric',month:'short'})};
const money=v=>Number.isFinite(Number(v))?new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(Number(v)):'—';
const dueOf=x=>x?.due||x?.dueAt||x?.date||x?.when||x?.expiry||x?.expiresAt||x?.renewalDate||x?.nextPayment||x?.sellBy||x?.eventDate||null;
const titleOf=x=>x?.title||x?.name||x?.subject||'Položka';
const todayVisible=()=>document.visibilityState!=='hidden'&&!!qs('#view-today')?.classList.contains('on');
const daysTo=v=>{const t=dateMs(v);if(t===null)return null;return Math.ceil((t-Date.now())/86400000)};
const soon=(rows,days=30)=>A(rows).filter(open).filter(personal).map(x=>({...x,__days:daysTo(dueOf(x))})).filter(x=>x.__days!==null&&x.__days<=days).sort((a,b)=>a.__days-b.__days);
function personalCalendar(s={}){const rows=[...A(s.calendar?.events),...A(s.calendarEvents),...A(s.events),...A(s.agenda?.events),...A(s.family?.events)];return rows.filter(personal).map(x=>({...x,__days:daysTo(x.start||x.date||x.when)})).filter(x=>x.__days!==null&&x.__days>=0&&x.__days<=7).sort((a,b)=>a.__days-b.__days)}
function personalHomeRows(s={}){return [...A(s.familyHome?.items),...A(s.household?.items),...A(s.householdBills?.items),...A(s.home?.tasks),...A(s.family?.tasks)].filter(open).filter(personal)}
function adminRows(s={}){return [...A(s.personalAdmin?.items),...A(s.documents),...A(s.personalDocuments),...A(s.expiries),...A(s.documentsExpiry?.items)].filter(open).filter(personal)}
function nextTask(s={}){const rows=A(s.tasks).filter(open).filter(personal).map(x=>({title:titleOf(x),due:dueOf(x),priority:N(x.priority),raw:x}));return rows.sort((a,b)=>{const ad=dateMs(a.due),bd=dateMs(b.due);if(ad!==null&&bd!==null)return ad-bd;if(ad!==null)return-1;if(bd!==null)return 1;return b.priority-a.priority})[0]||null}
function homeSnapshot(s={}){
 const tasks=A(s.tasks).filter(open).filter(personal),waiting=A(s.delegations).filter(open).filter(personal),inbox=[...A(s.inbox),...A(s.personalInbox?.items)].filter(open).filter(personal),tickets=A(s.ticketBook?.items).filter(activeTicket).filter(personal),calendar=personalCalendar(s),home=personalHomeRows(s),admin=adminRows(s),adminSoon=soon(admin,30),ticketSoon=tickets.map(x=>({...x,__days:daysTo(dueOf(x))})).filter(x=>x.__days!==null).sort((a,b)=>a.__days-b.__days),finance=s.financePlan||{},xtb=s.xtbReport||{},cash=N(finance.cashNow),reserve=N(finance.reserveFloor),planned=N(finance.plannedInvestment),xtbValue=N(xtb.czkValue||s.xtbHub?.valueCzk),xtbProfit=N(xtb.czkProfit||s.xtbHub?.profitCzk),xtbAge=xtb.asOf?Math.max(0,(Date.now()-dateMs(xtb.asOf))/3600000):null;
 const priorities=[];
 const taskRows=tasks.map(x=>({...x,__days:daysTo(dueOf(x))})).sort((a,b)=>((a.__days??999)-(b.__days??999))||(N(b.priority)-N(a.priority)));
 for(const x of taskRows.filter(x=>x.__days!==null&&x.__days<=1).slice(0,3))priorities.push({title:titleOf(x),meta:x.__days<0?'po termínu':x.__days===0?'dnes':'zítra',kind:'Úkol'});
 for(const x of adminSoon.filter(x=>x.__days<=14).slice(0,2))priorities.push({title:titleOf(x),meta:x.__days<0?'po termínu':`za ${x.__days} d`,kind:'Admin'});
 for(const x of ticketSoon.filter(x=>x.__days<=7).slice(0,2))priorities.push({title:titleOf(x),meta:x.__days<0?'po termínu':`za ${x.__days} d`,kind:'Vstupenky'});
 if(xtbAge===null||xtbAge>36)priorities.push({title:'Aktualizovat XTB data',meta:xtbAge===null?'bez data':`${Math.round(xtbAge)} h stará`,kind:'Finance'});
 if(!priorities.length&&taskRows[0])priorities.push({title:titleOf(taskRows[0]),meta:taskRows[0].__days===null?'bez termínu':fmt(dueOf(taskRows[0])),kind:'Úkol'});
 return{tasks,waiting,inbox,tickets,calendar,home,admin,adminSoon,ticketSoon,finance:{cash,reserve,planned},xtb:{value:xtbValue,profit:xtbProfit,age:xtbAge,asOf:xtb.asOf},priorities:priorities.slice(0,3),next:nextTask(s)};
}
async function hydrateFull(token){const host=qs('#todayView');if(!host||host.dataset.todayLite43!==token||!todayVisible())return false;try{if(!fullModule){fullPromise=fullPromise||import('./today29.js');fullModule=await fullPromise}const current=qs('#todayView');if(!current||current.dataset.todayLite43!==token||!todayVisible())return false;fullModule.renderToday?.();current.removeAttribute('data-today-lite43');window.__KAMIL_TODAY_FULL_AT__=performance.now();window.dispatchEvent(new CustomEvent('kamil:today-full-ready'));return true}catch(error){console.error('[todayLite43]',error);toast('Detail Today se nepodařilo načíst');return false}}
async function openDaily(){try{dailyPromise=dailyPromise||import('./personalDailyHub442.js');const m=await dailyPromise;return m.openPersonalDailyHub442()}catch(error){console.error('[personal-daily]',error);toast('Můj dnešek se nepodařilo načíst')}}
async function openAdmin(){try{adminPromise=adminPromise||import('./personalAdmin443.js');const m=await adminPromise;return m.openPersonalAdmin443()}catch(error){console.error('[personal-admin]',error);toast('Osobní administrativa se nepodařila načíst')}}
async function openHome(){try{homePromise=homePromise||import('./familyHome444.js');const m=await homePromise;return m.openFamilyHome444()}catch(error){console.error('[family-home]',error);toast('Rodina & domov se nepodařilo načíst')}}
async function openFinance(){try{financePromise=financePromise||import('./personalFinance445.js');const m=await financePromise;return m.openPersonalFinance445()}catch(error){console.error('[personal-finance]',error);toast('Moje finance se nepodařilo načíst')}}
async function openLife(){try{window.__KAMIL_LIFE_455_ERROR__=null;window.__KAMIL_LIFE_455_IMPORT_AT__=performance.now();lifePromise=lifePromise||import('./lifeDashboard455.js');const m=await lifePromise;window.__KAMIL_LIFE_455_IMPORTED_AT__=performance.now();return m.openLifeDashboard455()}catch(error){lifePromise=null;window.__KAMIL_LIFE_455_ERROR__=String(error?.stack||error);console.error('[life-dashboard]',error);toast('Životní dashboard se nepodařilo načíst')}}
async function assistantModule(){assistantPromise=assistantPromise||import('./personalAssistant530.js');return assistantPromise}
async function openAssistant(){try{return (await assistantModule()).openAssistant530()}catch(error){assistantPromise=null;console.error('[assistant-530]',error);toast('Osobní asistent se nepodařil načíst')}}
async function openCapture(){try{return (await assistantModule()).openQuickCapture501()}catch(error){assistantPromise=null;console.error('[capture-501]',error);toast('Quick Capture se nepodařil načíst')}}
const cardRows=(rows,empty='Nic důležitého.')=>rows.length?rows.map(x=>`<div class="row"><div><b>${h(x.title)}</b>${x.meta?`<div class="muted">${h(x.meta)}</div>`:''}</div>${x.value?`<b>${h(x.value)}</b>`:''}</div>`).join(''):`<div class="empty success-empty">${h(empty)}</div>`;
export function renderTodayLite43(){
 if(fullModule){fullModule.renderToday?.();return}
 const host=qs('#todayView');if(!host)return;const started=performance.now(),token=String(++seq),m=homeSnapshot(store.get());host.dataset.todayLite43=token;
 const priorityRows=m.priorities.map((x,i)=>({title:`${i+1}. ${x.title}`,meta:`${x.kind} · ${x.meta}`}));
 const calendarRows=m.calendar.slice(0,5).map(x=>({title:titleOf(x),meta:x.__days===0?'dnes':x.__days===1?'zítra':`za ${x.__days} d`,value:fmt(x.start||x.date||x.when)}));
 const ticketRows=m.ticketSoon.slice(0,4).map(x=>({title:titleOf(x),meta:x.__days<0?'deadline minul':x.__days===0?'řešit dnes':`za ${x.__days} d`,value:fmt(dueOf(x))}));
 const homeRows=m.home.slice(0,4).map(x=>({title:titleOf(x),meta:x.category||x.area||'Domov / rodina'}));
 const adminRows=m.adminSoon.slice(0,4).map(x=>({title:titleOf(x),meta:x.__days<0?'po termínu':x.__days===0?'dnes':`za ${x.__days} d`,value:fmt(dueOf(x))}));
 const xtbAge=m.xtb.age===null?'bez data':m.xtb.age>36?`${Math.round(m.xtb.age)} h · STARÉ`:`${Math.round(m.xtb.age)} h`;
 host.innerHTML=`<div class="view-head"><div><div class="eyebrow">KAMIL OS ${APP_VERSION} / PERSONAL HOME 53.1</div><h1>Můj život na jedné obrazovce.</h1><p>Co řešit teď, peníze, kalendář, vstupenky, rodina, domov a administrativa — bez pracovního balastu.</p></div><div class="row-actions"><button class="btn primary" data-assistant-530>Zeptat se Kamil OS</button><button class="btn" data-capture-501>+ Rychle přidat</button></div></div>
 <div class="metric-strip"><div class="metric"><span>Hotovost</span><b>${money(m.finance.cash)}</b></div><div class="metric"><span>XTB</span><b>${money(m.xtb.value)}</b></div><div class="metric"><span>Osobní úkoly</span><b>${m.tasks.length}</b></div><div class="metric"><span>Kalendář / 7 dní</span><b>${m.calendar.length}</b></div></div>
 <div class="card"><div class="card-head"><div><div class="eyebrow">TEĎ</div><h2>Dnes řeš tyhle věci. Ostatní ignoruj.</h2></div><button class="btn primary" data-life-dashboard>Otevřít celý dashboard</button></div>${cardRows(priorityRows,'Dnes podle uložených dat nic zásadního nehoří.')}</div>
 <div class="card"><div class="card-head"><div><div class="eyebrow">PENÍZE</div><h2>Kolik mám a co s tím?</h2></div><button class="btn" data-personal-finance>Detail financí</button></div><div class="row"><span>Hotovost</span><b>${money(m.finance.cash)}</b></div><div class="row"><span>Rezervní minimum</span><b>${money(m.finance.reserve)}</b></div><div class="row"><span>Plánovaná investice</span><b>${money(m.finance.planned)}</b></div><div class="row"><span>XTB hodnota</span><b>${money(m.xtb.value)}</b></div><div class="row"><span>XTB P/L</span><b>${money(m.xtb.profit)}</b></div><div class="row"><span>Stáří XTB dat</span><b>${h(xtbAge)}</b></div></div>
 <div class="card"><div class="card-head"><div><div class="eyebrow">KALENDÁŘ / 7 DNÍ</div><h2>Co mě čeká?</h2></div><button class="btn" data-personal-daily>Můj dnešek</button></div>${cardRows(calendarRows,'Na příštích 7 dní nemám uloženou osobní událost.')}</div>
 <div class="card"><div class="card-head"><div><div class="eyebrow">VSTUPENKY</div><h2>${m.tickets.length} aktivních pozic</h2></div><button class="btn" data-life-dashboard>Ticket intelligence</button></div>${cardRows(ticketRows,'Žádný blízký ticket deadline.')}</div>
 <div class="card"><div class="card-head"><div><div class="eyebrow">RODINA & DOMOV</div><h2>${m.home.length} otevřených věcí</h2></div><button class="btn" data-family-home>Detail</button></div>${cardRows(homeRows,'Domov a rodina jsou bez otevřené položky.')}</div>
 <div class="card"><div class="card-head"><div><div class="eyebrow">ADMINISTRATIVA / 30 DNÍ</div><h2>${m.adminSoon.length} blížících se termínů</h2></div><button class="btn" data-personal-admin>Detail</button></div>${cardRows(adminRows,'Do 30 dní nic administrativního nehoří.')}</div>
 <div class="card"><div class="eyebrow">RYCHLÉ VSTUPY</div><div class="row-actions"><button class="btn primary" data-assistant-530>Zeptat se</button><button class="btn" data-capture-501>Quick Capture</button><button class="btn" data-life-dashboard>Životní dashboard</button><button class="btn" data-personal-finance>Finance</button><button class="btn" data-family-home>Rodina & domov</button><button class="btn" data-personal-admin>Admin</button></div></div>
 <div class="decision-note">Personal Home 53.1 vykresluje hlavní přehled přímo z už uložených dat. Těžké analytické motory se dál načítají až po kliknutí; žádný nový background autopilot.</div>`;
 host.querySelectorAll('[data-life-dashboard]').forEach(b=>b.addEventListener('click',openLife));host.querySelectorAll('[data-personal-daily]').forEach(b=>b.addEventListener('click',openDaily));host.querySelectorAll('[data-personal-admin]').forEach(b=>b.addEventListener('click',openAdmin));host.querySelectorAll('[data-family-home]').forEach(b=>b.addEventListener('click',openHome));host.querySelectorAll('[data-personal-finance]').forEach(b=>b.addEventListener('click',openFinance));host.querySelectorAll('[data-assistant-530]').forEach(b=>b.addEventListener('click',openAssistant));host.querySelectorAll('[data-capture-501]').forEach(b=>b.addEventListener('click',openCapture));
 window.__KAMIL_PERSONAL_HOME_531_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now()};window.dispatchEvent(new CustomEvent('kamil:app-interactive'));
}
export function warmFullToday43(){if(fullModule)return Promise.resolve(fullModule);fullPromise=fullPromise||import('./today29.js');return fullPromise.then(m=>fullModule=m).catch(()=>null)}
// Legacy compatibility markers: Dnes řeš to důležité. Zbytek může počkat. · Personal 45.5 drží Safe Core · Životní dashboard
