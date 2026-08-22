import {store} from './state.js';
import {h,money,modal} from './utils.js';

const A=v=>Array.isArray(v)?v:[];
const U=v=>String(v||'').toUpperCase();
const N=v=>Number(v||0);
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','CANCELLED','CANCELED']);
const open=x=>!CLOSED.has(U(x?.status||x?.workflow));
const WORK_RE=/zak[aá]zk|faktur|dodavat|cest[aá]k|doch[aá]zk|ředitel|reditel|pks|cpi|zbrojov|\bzl\b|projektov[aá] karta|pracovn/i;
const personal=x=>!WORK_RE.test(`${x?.title||''} ${x?.name||''} ${x?.subject||''} ${x?.area||''} ${x?.category||''} ${x?.project||''}`);
const ms=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?t:null};
const days=v=>{const t=ms(v);if(t===null)return null;const a=new Date();a.setHours(0,0,0,0);const b=new Date(t);b.setHours(0,0,0,0);return Math.round((b-a)/86400000)};
const first=(...v)=>v.find(x=>x!==undefined&&x!==null&&x!=='')??null;
const measure=fn=>{const t=performance.now(),value=fn(),elapsed=Math.round((performance.now()-t)*10)/10;window.__KAMIL_HOME_444_LAST__={ms:elapsed,at:Date.now()};return{value,ms:elapsed}};

function norm(rows,kind){return A(rows).filter(open).filter(personal).map(x=>{const due=first(x.due,x.dueAt,x.nextService,x.nextServiceAt,x.date,x.when);return{kind,title:first(x.title,x.name,x.item,x.type,kind)||kind,due,days:days(due),amount:N(first(x.amount,x.price,x.cost,x.monthly)),owner:first(x.owner,x.person,x.assignee,''),priority:N(x.priority),status:first(x.status,x.workflow,'OPEN')};});}
function family(s){return norm([...A(s.family?.tasks),...A(s.familyHome?.items),...A(s.family?.items),...A(s.home?.family)],'Rodina');}
function home(s){return norm([...A(s.home?.tasks),...A(s.household?.items),...A(s.house?.tasks),...A(s.property?.tasks)],'Domov');}
function shopping(s){return norm([...A(s.shoppingList),...A(s.shopping?.items),...A(s.household?.shopping),...A(s.groceries)],'Nákup');}
function service(s){return norm([...A(s.home?.service),...A(s.house?.service),...A(s.maintenance?.items),...A(s.vehicleAdmin?.items),...A(s.cars),...A(s.vehicles)],'Servis');}
function expenses(s){return norm([...A(s.householdBills?.items),...A(s.household?.bills),...A(s.home?.expenses),...A(s.family?.expenses)],'Výdaj');}
function calendar(s){const rows=A(s.calendar?.events).length?A(s.calendar?.events):A(s.calendarEvents).length?A(s.calendarEvents):A(s.events);return rows.filter(personal).map(x=>({kind:'Termín',title:first(x.title,x.summary,x.name,'Událost'),due:first(x.start,x.startAt,x.date,x.when),days:days(first(x.start,x.startAt,x.date,x.when)),amount:0,owner:first(x.owner,x.person,''),priority:0,status:'OPEN'})).filter(x=>x.days!==null&&x.days>=0&&x.days<=30);}

export function familyHome444(s=store.get()){
 const groups={family:family(s),home:home(s),shopping:shopping(s),service:service(s),expenses:expenses(s),calendar:calendar(s)};
 const actionable=[...groups.family,...groups.home,...groups.shopping,...groups.service].sort((a,b)=>(a.days??999)-(b.days??999)||b.priority-a.priority);
 const overdue=actionable.filter(x=>x.days!==null&&x.days<0);
 const today=actionable.filter(x=>x.days===0);
 const soon=actionable.filter(x=>x.days!==null&&x.days>0&&x.days<=7);
 const month=groups.calendar.filter(x=>x.days!==null&&x.days<=30).sort((a,b)=>a.days-b.days);
 const monthly=groups.expenses.reduce((sum,x)=>sum+N(x.amount),0);
 const score=Math.max(0,100-Math.min(45,overdue.length*15)-Math.min(25,today.length*8)-Math.min(20,soon.length*4));
 return{groups,actionable,overdue,today,soon,month,monthly,score,status:overdue.length?'ŘEŠIT':today.length||soon.length?'HLÍDAT':'KLID'};
}

const dueText=x=>x.days===null?'bez termínu':x.days<0?`${Math.abs(x.days)} d po termínu`:x.days===0?'dnes':x.days===1?'zítra':`za ${x.days} d`;
const row=x=>`<div class="row"><div><b>${h(x.title)}</b><div class="muted">${h(x.kind)}${x.owner?` · ${h(x.owner)}`:''} · ${h(dueText(x))}</div></div>${x.amount?`<b>${money(x.amount)}</b>`:''}</div>`;
const block=(title,rows,empty='Nic evidovaného.')=>`<div class="card"><div class="eyebrow">${h(title)}</div>${rows.slice(0,7).map(row).join('')||`<div class="empty">${h(empty)}</div>`}</div>`;

export async function openFamilyHome444(){
 const {value:x,ms}=measure(()=>familyHome444());
 const top=[...x.overdue,...x.today,...x.soon].slice(0,8);
 const body=`<div class="metric-strip"><div class="metric"><span>Domácí skóre</span><b>${x.score}/100</b></div><div class="metric"><span>Režim</span><b>${h(x.status)}</b></div><div class="metric"><span>Dnes</span><b>${x.today.length}</b></div><div class="metric"><span>Do 7 dní</span><b>${x.soon.length}</b></div></div>${block('TEĎ ZAŘÍDIT',top,'Podle uložených dat doma nic akutního nehoří.')}${block('RODINA',x.groups.family)}${block('DOMOV',x.groups.home)}${block('NÁKUPY',x.groups.shopping)}${block('SERVIS DOMU / AUTA',x.groups.service)}${block('RODINNÉ TERMÍNY / 30 DNÍ',x.month)}<div class="card"><div class="eyebrow">DOMÁCÍ VÝDAJE</div><div class="row"><div><b>Evidované pravidelné / domácí náklady</b><div class="muted">Součet položek, které už jsou uložené v Kamil OS.</div></div><b>${money(x.monthly)}</b></div></div><div class="decision-note">Family & Home Center 44.4 · ${ms} ms pouze po kliknutí. Používá jen uložená osobní data, nic automaticky neobjednává ani neplatí.</div>`;
 const choice=await modal('Rodina & domov / 44.4',body,[{label:'Můj dnešek',value:'today'},{label:'Osobní administrativa',value:'more'},{label:'Peníze',value:'money'},{label:'Zavřít',value:null,primary:true}]);
 if(choice)window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:choice}));
}
