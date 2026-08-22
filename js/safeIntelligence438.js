import {store} from './state.js';
import {h,money,date,modal} from './utils.js';

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(v||0);
const U=v=>String(v||'').toUpperCase();
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','PAYOUT RECEIVED']);
const open=x=>!CLOSED.has(U(x?.status||x?.workflow));
const days=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.ceil((t-Date.now())/86400000):null};
const measure=(name,fn)=>{const t=performance.now();const value=fn();const ms=Math.round((performance.now()-t)*10)/10;window.__KAMIL_SAFE_INTEL_LAST__={name,ms,at:Date.now()};return {value,ms}};

function taskRows(s){return A(s.tasks).filter(open).map(x=>({kind:'Úkol',title:x.title||x.name||'Úkol',due:x.due||x.dueAt||x.date||null,days:days(x.due||x.dueAt||x.date),priority:N(x.priority)}));}
function waitingRows(s){return [...A(s.directorBook?.waiting),...A(s.delegations)].filter(open).map(x=>({kind:'Čekám',title:x.title||x.person||x.name||'Waiting for',due:x.due||x.nextFollowUpAt||null,days:days(x.due||x.nextFollowUpAt),priority:N(x.priority||60)}));}
function ticketRows(s){return A(s.ticketBook?.items).filter(x=>['HOLD','LISTED'].includes(U(x.workflow||'HOLD'))).map(x=>({kind:'Vstupenka',title:x.event||x.name||x.title||'Vstupenka',due:x.date||null,days:days(x.date),buy:N(x.buy),qty:N(x.qty||1),list:N(x.listPrice||0)}));}
function xtbMeta(s){const count=N(s.xtbHub?.positionCount||s.xtbReport?.positionCount||A(s.xtbReport?.positions).length);const value=N(s.xtbReport?.czkValue||s.xtbHub?.valueCzk||0);const asOf=s.xtbReport?.asOf||s.xtbHub?.asOf||null;return {count,value,asOf,age:days(asOf)};}
function monthlyDuties(){const now=new Date(),day=now.getDate(),last=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();return [
 {title:'Koncepty faktur vydaných',dueDay:1},
 {title:'Aktualizace karty zakázky',dueDay:20},
 {title:'Fakturace na dodavatele',dueDay:25},
 {title:'Cesták + docházka',dueDay:last}
].map(x=>({...x,delta:x.dueDay-day,status:day>x.dueDay?'po termínu':day===x.dueDay?'dnes':x.dueDay-day<=3?'brzy':'čeká'}));}

export function financeTickets438(s=store.get()){
 const xtb=xtbMeta(s),tickets=ticketRows(s),capital=tickets.reduce((a,x)=>a+x.buy,0),priced=tickets.filter(x=>x.list>0),urgent=tickets.filter(x=>x.days!==null&&x.days<=7).sort((a,b)=>(a.days??999)-(b.days??999));
 return {xtb,tickets:{active:tickets.length,capital,priced:priced.length,urgent:urgent.slice(0,5)}};
}
export function work438(s=store.get()){
 const tasks=taskRows(s),waiting=waitingRows(s),overdue=tasks.filter(x=>x.days!==null&&x.days<0),follow=waiting.filter(x=>x.days!==null&&x.days<=1),projects=A(s.projects),changes=A(s.changeOrders||s.zl);
 return {tasks:tasks.length,overdue:overdue.slice(0,5),waiting:waiting.length,follow:follow.slice(0,5),projects:projects.length,changes:changes.length,duties:monthlyDuties()};
}
export function mission438(s=store.get()){
 const finance=financeTickets438(s),work=work438(s),candidates=[
  ...work.overdue.map(x=>({...x,score:100+Math.abs(x.days||0)})),
  ...work.follow.map(x=>({...x,score:90})),
  ...finance.tickets.urgent.map(x=>({...x,score:80-Math.max(0,x.days||0)}))
 ];
 if(finance.xtb.count&&finance.xtb.age!==null&&finance.xtb.age<-1)candidates.push({kind:'XTB',title:'Obnovit XTB import',days:null,score:75});
 const top=candidates.sort((a,b)=>b.score-a.score).slice(0,3);
 return {top,finance,work,status:top.length?'ŘÍDIT':'KLID'};
}

const row=x=>`<div class="row"><div><b>${h(x.title)}</b><div class="muted">${h(x.kind||'')}${x.days===null||x.days===undefined?'':` · ${x.days<0?`${Math.abs(x.days)} d po termínu`:x.days===0?'dnes':`za ${x.days} d`}`}</div></div></div>`;

async function showFinance(){const {value:x,ms}=measure('financeTickets438',()=>financeTickets438());const body=`<div class="metric-strip"><div class="metric"><span>XTB pozic</span><b>${x.xtb.count}</b></div><div class="metric"><span>XTB hodnota</span><b>${money(x.xtb.value)}</b></div><div class="metric"><span>Aktivní vstupenky</span><b>${x.tickets.active}</b></div><div class="metric"><span>Kapitál ve vstupenkách</span><b>${money(x.tickets.capital)}</b></div></div>${x.tickets.urgent.map(row).join('')||'<div class="empty">Žádná vstupenka do 7 dnů.</div>'}<div class="decision-note">Výpočet ${ms} ms. Detailní XTB rozhodnutí se načte až po otevření Peníze; ticket intelligence až po otevření Vstupenky.</div>`;const choice=await modal('Peníze + vstupenky',body,[{label:'Peníze / XTB',value:'money',primary:true},{label:'Vstupenky',value:'tickets'},{label:'Zavřít',value:null}]);if(choice)window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:choice}));}
async function showWork(){const {value:x,ms}=measure('work438',()=>work438());const body=`<div class="metric-strip"><div class="metric"><span>Otevřené úkoly</span><b>${x.tasks}</b></div><div class="metric"><span>Waiting For</span><b>${x.waiting}</b></div><div class="metric"><span>Zakázky</span><b>${x.projects}</b></div><div class="metric"><span>ZL</span><b>${x.changes}</b></div></div><div class="card"><div class="eyebrow">TERMÍNY ŘEDITELE</div>${x.duties.map(d=>`<div class="row"><span>${h(d.title)}</span><b class="${d.status==='po termínu'?'bad':d.status==='dnes'||d.status==='brzy'?'warn':''}">${h(d.status)}</b></div>`).join('')}</div>${x.overdue.map(row).join('')}${x.follow.map(row).join('')}<div class="decision-note">Výpočet ${ms} ms. Žádný background refresh neběží.</div>`;await modal('Work Command Center',body,[{label:'Zavřít',value:null,primary:true}]);}
async function showMission(){const {value:x,ms}=measure('mission438',()=>mission438());const body=`<div class="metric-strip"><div class="metric"><span>Režim</span><b>${h(x.status)}</b></div><div class="metric"><span>XTB pozic</span><b>${x.finance.xtb.count}</b></div><div class="metric"><span>Aktivní vstupenky</span><b>${x.finance.tickets.active}</b></div><div class="metric"><span>Waiting For</span><b>${x.work.waiting}</b></div></div><div class="card"><div class="eyebrow">TOP 3 TEĎ</div>${x.top.map(row).join('')||'<div class="empty">Nic kritického.</div>'}</div><div class="decision-note">Mission Control je teď čistě on-demand a spočítal se za ${ms} ms. Nic se samo neobchoduje, nepřecenňuje ani neposílá.</div>`;const choice=await modal('Mission Control / Safe Intelligence',body,[{label:'Peníze',value:'money'},{label:'Vstupenky',value:'tickets'},{label:'Zavřít',value:null,primary:true}]);if(choice)window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:choice}));}

export function openSafeIntelligence438(mode){if(mode==='finance')return showFinance();if(mode==='work')return showWork();return showMission();}
