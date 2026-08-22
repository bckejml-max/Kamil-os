import {store} from './state.js';
import {h,money,modal} from './utils.js';
import {practical490} from './personalPractical490.js';
import {personalFinance445} from './personalFinance445.js';
import {decision454} from './decision454.js';
import {inbox450} from './inbox450.js';
import {family452} from './family452.js';

const A=v=>Array.isArray(v)?v:[],N=v=>Number(v||0),U=v=>String(v||'').toUpperCase();
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','CANCELLED','CANCELED']);
const WORK_RE=/zak[aá]zk|faktur|dodavat|cest[aá]k|doch[aá]zk|ředitel|reditel|pks|cpi|zbrojov|\bzl\b|projektov[aá] karta|pracovn/i;
const open=x=>!CLOSED.has(U(x?.status||x?.workflow));
const personal=x=>!WORK_RE.test(`${x?.title||''} ${x?.name||''} ${x?.area||''} ${x?.category||''} ${x?.project||''}`);
const first=(...v)=>v.find(x=>x!==undefined&&x!==null&&x!=='')??null;
const ts=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?t:null};
const daysTo=v=>{const t=ts(v);return t===null?null:Math.ceil((t-Date.now())/86400000)};

export function nextAction491(s=store.get()){
 const d=decision454(s),p=practical490(s),inb=inbox450(s),candidates=[];
 for(const x of A(d.doNow))candidates.push({title:x.title,reason:x.reason||'Vysoká priorita',score:N(x.score)||80,money:N(x.money),source:'Rozhodnutí'});
 for(const x of A(p.actions))candidates.push({title:x.title,reason:x.reason||'Praktický krok',score:72,money:0,source:'Praktické centrum'});
 for(const x of A(inb.needsFollow).slice(0,3))candidates.push({title:first(x.title,x.name,'Follow-up'),reason:'Čeká na follow-up',score:68,money:0,source:'Inbox'});
 candidates.sort((a,b)=>b.score-a.score);
 return{main:candidates[0]||null,next:candidates.slice(1,4),all:candidates};
}

export function dataGap492(s=store.get()){
 const p=practical490(s);return{coverage:p.missing.coverage,missing:p.missing.missing.slice(0,3),status:p.missing.coverage>=80?'DOSTATEČNÁ':p.missing.coverage>=50?'DOPLNIT':'SLABÁ'};
}

export function fundPressure493(s=store.get()){
 const p=practical490(s),monthly=p.funds.monthlyNeed+p.vehicleFund.monthly+p.homeFund.monthly+p.travelFund.monthly;
 const saving=Math.max(0,p.savings.saving);const pressure=saving>0?Math.round(monthly/saving*100):monthly>0?999:0;
 return{monthly,saving,pressure,status:pressure<=60?'KRYTÉ':pressure<=100?'NAPJATÉ':'PŘETÍŽENÉ'};
}

export function purchaseDecision494(s=store.get()){
 const p=practical490(s),x=p.purchases.rows?.[0]||null;if(!x)return{item:null,action:'NIC K POSOUZENÍ'};
 const free=Math.max(0,personalFinance445(s).safeSpendNow||0);let action=x.action;
 if(x.amount>free&&action==='OK')action='ZVÁŽIT';
 return{item:x,free,action,reason:action==='ODLOŽIT'?'Nákup naruší rezervu':action==='ZVÁŽIT'?'Nákup výrazně sníží volnou hotovost':'Nákup je podle uložených dat krytý'};
}

export function cashBuffer495(s=store.get()){
 const f=personalFinance445(s),p=practical490(s);const commitments=p.commitments.d30;const after30=Math.max(0,N(f.cash)-commitments);const buffer=after30-N(f.reserve);
 return{cash:N(f.cash),reserve:N(f.reserve),commitments,after30,buffer,status:buffer>=0?'OK':'POD REZERVOU'};
}

export function ticketDecision496(s=store.get()){
 const p=practical490(s),best=p.tickets.best?.[0]||null,worst=p.tickets.worst?.[0]||null;
 const action=worst&&worst.roi<0?'PROVĚŘIT NEJHORŠÍ POZICI':best&&best.roi>25?'DRŽET TOP ROI':'BEZ SILNÉHO SIGNÁLU';
 return{best,worst,action};
}

export function portfolioFunding497(s=store.get()){
 const need=N(s.liquidityNeed?.amount),p=practical490(s);const plan=need>0?p.sellToFund:{target:0,proposal:[],covered:0,shortfall:0};
 return{need,plan,status:need<=0?'NENÍ POTŘEBA':plan.shortfall>0?'NESTAČÍ':'KRYTÉ',note:'Pouze návrh. Žádný prodej se automaticky neprovede.'};
}

export function calendarLoad498(s=store.get()){
 const f=family452(s),events=[...A(s.calendar?.events),...A(s.calendarEvents),...A(s.family?.events)].filter(personal).map(x=>({title:first(x.title,x.name,'Událost'),days:daysTo(first(x.start,x.date,x.when))})).filter(x=>x.days!==null&&x.days>=0&&x.days<=7);
 return{events,count:events.length,status:events.length>=8?'PŘETÍŽENO':events.length>=5?'PLNO':'OK',family:f};
}

export function weeklyFocus499(s=store.get()){
 const tasks=A(s.tasks).filter(open).filter(personal).map(x=>({title:first(x.title,x.name,'Úkol'),days:daysTo(first(x.due,x.dueAt,x.date)),priority:N(x.priority)})).filter(x=>x.days===null||x.days<=7);
 const p=practical490(s),rows=[];
 for(const x of tasks)rows.push({title:x.title,score:(x.days!==null&&x.days<=0?70:x.days!==null&&x.days<=3?50:30)+Math.min(20,x.priority),kind:'Úkol'});
 if(p.commitments.d30>0)rows.push({title:`Připravit ${money(p.commitments.d30)} na závazky`,score:65,kind:'Finance'});
 if(p.missing.missing.length)rows.push({title:p.missing.missing[0].action,score:40,kind:'Data'});
 rows.sort((a,b)=>b.score-a.score);return{focus:rows.slice(0,5),ignore:rows.slice(5),total:rows.length};
}

export function command500(s=store.get()){
 const next=nextAction491(s),data=dataGap492(s),funds=fundPressure493(s),purchase=purchaseDecision494(s),cash=cashBuffer495(s),tickets=ticketDecision496(s),portfolio=portfolioFunding497(s),calendar=calendarLoad498(s),week=weeklyFocus499(s),finance=personalFinance445(s);
 const healthPoints=(cash.status==='OK'?25:8)+(data.coverage>=80?20:data.coverage>=50?12:5)+(funds.status==='KRYTÉ'?20:funds.status==='NAPJATÉ'?12:5)+(calendar.status==='OK'?15:calendar.status==='PLNO'?9:4)+(finance.reserveGap<=0?20:8);
 return{next,data,funds,purchase,cash,tickets,portfolio,calendar,week,finance,readiness:Math.max(0,Math.min(100,healthPoints))};
}

const row=(a,b,c='')=>`<div class="row"><span>${h(a)}</span><div><b>${h(b)}</b>${c?`<div class="muted">${h(c)}</div>`:''}</div></div>`;
export async function openCommand500(){
 const t=performance.now(),x=command500();window.__KAMIL_COMMAND_500_LAST__={ms:Math.round((performance.now()-t)*10)/10,at:Date.now()};
 const main=x.next.main?`<div class="row"><div><b>${h(x.next.main.title)}</b><div class="muted">${h(x.next.main.reason)} · ${h(x.next.main.source)}</div></div>${x.next.main.money?`<b>${money(x.next.main.money)}</b>`:''}</div>`:'<div class="empty success-empty">Podle uložených dat teď nic zásadního nehoří.</div>';
 const next=x.next.next.map((v,i)=>`<div class="row"><div><b>${i+2}. ${h(v.title)}</b><div class="muted">${h(v.reason)}</div></div></div>`).join('')||'<div class="empty">Žádné další silné priority.</div>';
 const ignore=x.week.ignore.slice(0,4).map(v=>`<div class="row"><span>${h(v.title)}</span><b>POČKÁ</b></div>`).join('')||'<div class="empty">Nic dalšího nemusíš aktivně ignorovat.</div>';
 const missing=x.data.missing.map(v=>`<div class="row"><span>${h(v.name)}</span><b>${h(v.action)}</b></div>`).join('')||'<div class="empty success-empty">Klíčová data jsou dostatečně pokrytá.</div>';
 const body=`<div class="metric-strip"><div class="metric"><span>Readiness</span><b>${x.readiness}/100</b></div><div class="metric"><span>Volně utratit</span><b>${money(x.finance.safeSpendNow||0)}</b></div><div class="metric"><span>Buffer po 30 dnech</span><b>${money(x.cash.buffer)}</b></div><div class="metric"><span>Pokrytí dat</span><b>${x.data.coverage}%</b></div></div>
 <div class="card"><div class="eyebrow">UDĚLEJ TEĎ JEDNU VĚC</div>${main}</div>
 <div class="card"><div class="eyebrow">PAK TYHLE 3</div>${next}</div>
 <div class="card"><div class="eyebrow">PENÍZE / ROZHODNUTÍ</div>${row('Fondy potřebují měsíčně',money(x.funds.monthly),x.funds.status)}${row('Závazky do 30 dní',money(x.cash.commitments))}${row('Velký nákup',x.purchase.item?x.purchase.action:'—',x.purchase.item?.title||'bez položky')}${row('Vstupenky',x.tickets.action,x.tickets.worst?.name||'bez silného signálu')}${row('XTB pro hotovost',x.portfolio.status,x.portfolio.note)}</div>
 <div class="card"><div class="eyebrow">CO MŮŽE POČKAT</div>${ignore}</div>
 <div class="card"><div class="eyebrow">CO DOPLNIT PRO LEPŠÍ DOPORUČENÍ</div>${missing}</div>
 <div class="decision-note">Command 50.0 je click-only a read-only. Dává návrhy a pořadí kroků; nic sám neplatí, neprodává, neposílá ani nepřepisuje.</div>`;
 await modal('Kamil OS / Udělej teď · 50.0',body,[{label:'Zavřít',value:null,primary:true}]);
}
