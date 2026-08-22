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
const measure=fn=>{const t=performance.now(),value=fn(),elapsed=Math.round((performance.now()-t)*10)/10;window.__KAMIL_ADMIN_443_LAST__={ms:elapsed,at:Date.now()};return{value,ms:elapsed}};

function normalize(rows,kind){return A(rows).filter(open).filter(personal).map(x=>{const due=first(x.due,x.expiry,x.expiresAt,x.renewalDate,x.nextPaymentAt,x.validUntil,x.date);return{kind,title:first(x.title,x.name,x.type,kind)||kind,due,days:days(due),amount:N(first(x.amount,x.price,x.monthly,x.cost)),provider:first(x.provider,x.company,x.insurer,x.bank,x.vendor,''),status:first(x.status,x.workflow,'OPEN')};});}
function docs(s){return normalize([...A(s.documents),...A(s.personalDocuments),...A(s.expiries),...A(s.documentsExpiry?.items)],'Doklad');}
function insurance(s){return normalize([...A(s.insurance?.items),...A(s.insurances),...A(s.personalInsurance?.items)],'Pojištění');}
function vehicles(s){return normalize([...A(s.vehicles),...A(s.cars),...A(s.vehicleAdmin?.items)],'Auto');}
function contracts(s){return normalize([...A(s.contracts),...A(s.personalContracts),...A(s.contractAdmin?.items)],'Smlouva');}
function payments(s){return normalize([...A(s.householdBills?.items),...A(s.recurringPayments),...A(s.subscriptions),...A(s.bills)],'Platba');}
function property(s){return normalize([...A(s.property?.items),...A(s.home?.admin),...A(s.house?.admin),...A(s.household?.admin)],'Dům');}

export function personalAdmin443(s=store.get()){
 const groups={insurance:insurance(s),vehicles:vehicles(s),property:property(s),contracts:contracts(s),payments:payments(s),documents:docs(s)};
 const all=Object.values(groups).flat();
 const overdue=all.filter(x=>x.days!==null&&x.days<0).sort((a,b)=>a.days-b.days);
 const soon=all.filter(x=>x.days!==null&&x.days>=0&&x.days<=30).sort((a,b)=>a.days-b.days);
 const later=all.filter(x=>x.days===null||x.days>30).sort((a,b)=>(a.days??9999)-(b.days??9999));
 const recurringMonthly=groups.payments.reduce((a,x)=>a+N(x.amount),0);
 const score=Math.max(0,100-Math.min(60,overdue.length*20)-Math.min(30,soon.length*6));
 return{groups,all,overdue,soon,later,recurringMonthly,score,status:overdue.length?'ŘEŠIT':soon.length?'HLÍDAT':'KLID'};
}

const dueText=x=>x.days===null?'bez termínu':x.days<0?`${Math.abs(x.days)} d po termínu`:x.days===0?'dnes':x.days===1?'zítra':`za ${x.days} d`;
const row=x=>`<div class="row"><div><b>${h(x.title)}</b><div class="muted">${h(x.kind)}${x.provider?` · ${h(x.provider)}`:''} · ${h(dueText(x))}</div></div>${x.amount?`<b>${money(x.amount)}</b>`:''}</div>`;
const group=(title,rows)=>`<div class="card"><div class="eyebrow">${h(title)}</div>${rows.slice(0,6).map(row).join('')||'<div class="empty">Nic evidovaného.</div>'}</div>`;

export async function openPersonalAdmin443(){
 const {value:x,ms}=measure(()=>personalAdmin443());
 const body=`<div class="metric-strip"><div class="metric"><span>Admin skóre</span><b>${x.score}/100</b></div><div class="metric"><span>Režim</span><b>${h(x.status)}</b></div><div class="metric"><span>Po termínu</span><b>${x.overdue.length}</b></div><div class="metric"><span>Do 30 dní</span><b>${x.soon.length}</b></div></div><div class="card"><div class="eyebrow">NEJDŘÍV VYŘEŠIT</div>${[...x.overdue,...x.soon].slice(0,8).map(row).join('')||'<div class="empty">Podle uložených dat nic urgentního.</div>'}</div>${group('POJIŠTĚNÍ',x.groups.insurance)}${group('AUTA',x.groups.vehicles)}${group('DŮM / NEMOVITOST',x.groups.property)}${group('SMLOUVY',x.groups.contracts)}${group('PRAVIDELNÉ PLATBY / PŘEDPLATNÉ',x.groups.payments)}${group('DOKLADY / EXPIRACE',x.groups.documents)}<div class="decision-note">Personal Admin Center 44.3 · ${ms} ms pouze po kliknutí. Používá jen uložená osobní data a je read-only: nic sám neplatí, neruší ani neposílá.</div>`;
 const choice=await modal('Osobní administrativa / 44.3',body,[{label:'Můj dnešek',value:'today'},{label:'Domov',value:'home'},{label:'Peníze',value:'money'},{label:'Zavřít',value:null,primary:true}]);
 if(choice)window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:choice}));
}
