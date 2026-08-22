import {store} from './state.js';
import {h,money,modal} from './utils.js';

const A=v=>Array.isArray(v)?v:[],N=v=>Number(v||0),U=v=>String(v||'').toUpperCase();
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','CANCELLED','CANCELED']);
const WORK_RE=/zak[aá]zk|faktur|dodavat|cest[aá]k|doch[aá]zk|ředitel|reditel|pks|cpi|zbrojov|\bzl\b|projektov[aá] karta|pracovn/i;
const open=x=>!CLOSED.has(U(x?.status||x?.workflow));
const personal=x=>!WORK_RE.test(`${x?.title||''} ${x?.name||''} ${x?.area||''} ${x?.category||''} ${x?.project||''}`);
const first=(...v)=>v.find(x=>x!==undefined&&x!==null&&x!=='')??null;
const ts=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?t:null};
const daysTo=v=>{const t=ts(v);return t===null?null:Math.ceil((t-Date.now())/86400000)};
const ageDays=v=>{const t=ts(v);return t===null?null:Math.floor((Date.now()-t)/86400000)};
const sum=rows=>A(rows).reduce((a,x)=>a+N(x),0);
const pct=(a,b)=>b>0?Math.round(a/b*100):0;

function financeBase(s={}){
 const plan=s.financePlan||{};
 const cash=N(first(plan.cashNow,s.cashNow,s.liquidity?.cash,s.wealth?.cash));
 const reserve=N(first(plan.reserveFloor,s.reserveFloor,s.liquidity?.reserveTarget,40000));
 const income=N(first(plan.expectedIncome,s.monthlyIncome,s.household?.income));
 const bills=A(s.householdBills?.items).filter(open).filter(personal);
 const monthlyBills=bills.reduce((a,x)=>a+N(first(x.monthlyAmount,x.amount,x.price)),0);
 return{cash,reserve,income,monthlyBills,bills};
}

export function renewal456(s=store.get()){
 const rows=[...A(s.subscriptions?.items),...A(s.renewals?.items),...A(s.contracts?.items),...A(s.householdBills?.items)]
  .filter(open).filter(personal).map(x=>({title:first(x.title,x.name,'Obnova'),date:first(x.renewalDate,x.nextPayment,x.due,x.expiresAt),days:daysTo(first(x.renewalDate,x.nextPayment,x.due,x.expiresAt)),amount:N(first(x.annualAmount,x.amount,x.price)),autoRenew:Boolean(first(x.autoRenew,x.recurring,false))}));
 const soon=rows.filter(x=>x.days!==null&&x.days>=0&&x.days<=45).sort((a,b)=>a.days-b.days);
 return{rows,soon,annualExposure:rows.reduce((a,x)=>a+x.amount,0)};
}

export function insurance457(s=store.get()){
 const rows=[...A(s.insurance?.items),...A(s.insuranceCenter?.items),...A(s.policies?.items)].filter(open).filter(personal);
 const mapped=rows.map(x=>({title:first(x.title,x.name,x.type,'Pojištění'),expires:first(x.expiresAt,x.endDate,x.renewalDate),days:daysTo(first(x.expiresAt,x.endDate,x.renewalDate)),coverage:N(first(x.coverage,x.limit,x.insuredAmount)),premium:N(first(x.premium,x.amount,x.price))}));
 const expiring=mapped.filter(x=>x.days!==null&&x.days>=0&&x.days<=60);
 const missing=[];const text=mapped.map(x=>U(x.title)).join(' ');
 if(mapped.length&&!/DOM|NEMOV|HOUSE/.test(text))missing.push('Pojištění domu / nemovitosti není v datech');
 if(mapped.length&&!/AUTO|VOZ|POVIN/.test(text))missing.push('Pojištění auta není v datech');
 return{rows:mapped,expiring,missing,totalPremium:mapped.reduce((a,x)=>a+x.premium,0)};
}

export function runway458(s=store.get()){
 const f=financeBase(s);const burn=Math.max(f.monthlyBills,N(s.household?.monthlyCost),1);const months=Math.round((f.cash/burn)*10)/10;
 return{...f,burn,months,status:months>=6?'SILNÁ':months>=3?'OK':'TENKÁ'};
}

export function purchase459(s=store.get()){
 const f=financeBase(s);const rows=[...A(s.plannedPurchases),...A(s.purchasePlan?.items)].filter(open).filter(personal).map(x=>({title:first(x.title,x.name,'Nákup'),amount:N(first(x.amount,x.price,x.cost)),date:first(x.targetDate,x.due,x.date),days:daysTo(first(x.targetDate,x.due,x.date))}));
 const ranked=rows.map(x=>{const after=f.cash-x.amount,buffer=after-f.reserve;const action=buffer<0?'ODLOŽIT':x.amount>f.cash*.25?'ZVÁŽIT':'OK';return{...x,after,buffer,action}}).sort((a,b)=>a.buffer-b.buffer);
 return{rows:ranked,delay:ranked.filter(x=>x.action==='ODLOŽIT')};
}

export function goal460(s=store.get()){
 const rows=[...A(s.personalGoals),...A(s.goals?.items)].filter(open).filter(personal).map(x=>{const target=N(first(x.targetAmount,x.amount,x.budget)),saved=N(first(x.saved,x.current,x.funded)),gap=Math.max(0,target-saved),days=daysTo(first(x.targetDate,x.due,x.date)),months=days===null?null:Math.max(1,Math.ceil(days/30));return{title:first(x.title,x.name,'Cíl'),target,saved,gap,days,monthlyNeed:months?Math.ceil(gap/months):0}});
 return{rows,totalGap:rows.reduce((a,x)=>a+x.gap,0),monthlyNeed:rows.reduce((a,x)=>a+x.monthlyNeed,0)};
}

export function household461(s=store.get()){
 const bills=A(s.householdBills?.items).filter(open).filter(personal);const now=bills.reduce((a,x)=>a+N(first(x.monthlyAmount,x.amount)),0);const history=A(s.householdBills?.history);const prior=history.length?N(first(history.at(-1)?.monthlyTotal,history.at(-1)?.amount)):N(s.household?.previousMonthlyCost);const drift=prior>0?Math.round((now-prior)/prior*1000)/10:0;
 return{now,prior,drift,status:drift>10?'ROSTE RYCHLE':drift>3?'ROSTE':'STABILNÍ',items:bills};
}

export function vehicle462(s=store.get()){
 const rows=A(s.vehicles).filter(personal).map(v=>{const costs=[...A(v.costs),...A(v.expenses)];const annual=costs.filter(x=>{const a=ageDays(first(x.date,x.paidAt));return a!==null&&a<=365}).reduce((a,x)=>a+N(first(x.amount,x.cost,x.price)),0);return{name:first(v.name,v.title,v.model,'Auto'),annual,nextService:first(v.nextService,v.serviceDue,v.stkDue),days:daysTo(first(v.nextService,v.serviceDue,v.stkDue))}});
 return{rows,totalAnnual:rows.reduce((a,x)=>a+x.annual,0)};
}

export function energy463(s=store.get()){
 const rows=[...A(s.energy?.items),...A(s.utilities?.items),...A(s.householdBills?.items).filter(x=>/elekt|plyn|voda|energie/i.test(`${x.title||''} ${x.name||''}`))].filter(personal);
 const monthly=rows.reduce((a,x)=>a+N(first(x.monthlyAmount,x.amount,x.price)),0);return{rows,monthly,annual:monthly*12};
}

export function docs464(s=store.get()){
 const rows=[...A(s.documents?.items),...A(s.documentsExpiry?.items),...A(s.personalDocs?.items)].filter(open).filter(personal).map(x=>({title:first(x.title,x.name,x.type,'Doklad'),expires:first(x.expiresAt,x.expiryDate,x.validTo),days:daysTo(first(x.expiresAt,x.expiryDate,x.validTo))}));
 const soon=rows.filter(x=>x.days!==null&&x.days>=0&&x.days<=120).sort((a,b)=>a.days-b.days);return{rows,soon};
}

export function familyLoad465(s=store.get()){
 const events=[...A(s.calendar?.events),...A(s.calendarEvents),...A(s.family?.events)].filter(personal).map(x=>({title:first(x.title,x.name,'Událost'),days:daysTo(first(x.start,x.date,x.when))})).filter(x=>x.days!==null&&x.days>=0&&x.days<=14);
 const perWeek=events.length/2;return{events,count14:events.length,perWeek:Math.round(perWeek*10)/10,status:perWeek>=5?'PŘETÍŽENO':perWeek>=3?'PLNO':'VOLNO'};
}

export function ticketExposure466(s=store.get()){
 const rows=A(s.ticketBook?.items).filter(x=>['HOLD','LISTED'].includes(U(x.workflow||'HOLD'))).map(x=>{const qty=N(first(x.qty,x.quantity,1))||1,buy=N(first(x.buy,x.buyPrice,x.cost)),market=N(first(x.marketPrice,x.listPrice,x.price));return{name:first(x.name,x.title,'Vstupenky'),capital:buy*qty,market:market*qty,days:daysTo(first(x.sellBy,x.eventDate,x.date))}});const capital=rows.reduce((a,x)=>a+x.capital,0),market=rows.reduce((a,x)=>a+x.market,0);return{rows,capital,market,upside:market-capital,urgent:rows.filter(x=>x.days!==null&&x.days<=7)};
}

export function xtb467(s=store.get()){
 const r=s.xtbReport||{};const value=N(first(r.czkValue,r.valueCZK,r.value)),profit=N(first(r.czkProfit,r.profitCZK,r.profit)),count=N(first(r.positionCount,A(r.positions).length));const positions=A(r.positions);const max=positions.length?Math.max(...positions.map(x=>N(first(x.valueCZK,x.value,x.marketValue)))):0;const concentration=value>0?pct(max,value):0;const stale=ageDays(first(r.asOf,r.updatedAt,r.date));return{value,profit,count,concentration,staleDays:stale,status:concentration>35?'KONCENTROVANÉ':concentration>25?'HLÍDAT':'OK'};
}

export function stress468(s=store.get()){
 const f=financeBase(s);const ticket=ticketExposure466(s),monthly=Math.max(f.monthlyBills,1);const liquid=f.cash;const shock3=liquid-f.reserve-monthly*3;const shock6=liquid-f.reserve-monthly*6;return{liquid,reserve:f.reserve,monthly,ticketCapital:ticket.capital,shock3,shock6,status:shock3>=0?'ODOLNÉ':shock6>=0?'NAPJATÉ':'KŘEHKÉ'};
}

export function debts469(s=store.get()){
 const rows=[...A(s.debtBook?.items),...A(s.debts?.items),...A(s.receivables?.items)].filter(open).filter(personal).map(x=>({title:first(x.person,x.title,x.name,'Dluh / pohledávka'),amount:N(first(x.amount,x.balance,x.value)),kind:U(first(x.kind,x.type,'DLUH')),due:first(x.due,x.dueAt,x.date),days:daysTo(first(x.due,x.dueAt,x.date))}));const owed=rows.filter(x=>/RECEIV|POHLED|DOSTAT/.test(x.kind)).reduce((a,x)=>a+x.amount,0),owe=rows.filter(x=>!/RECEIV|POHLED|DOSTAT/.test(x.kind)).reduce((a,x)=>a+x.amount,0);return{rows,owed,owe,net:owed-owe};
}

export function admin470(s=store.get()){
 const renew=renewal456(s),docs=docs464(s),ins=insurance457(s),maintenance=A(s.maintenance?.items).filter(open);let score=100;score-=Math.min(25,renew.soon.length*5);score-=Math.min(25,docs.soon.length*5);score-=Math.min(25,ins.expiring.length*7);score-=Math.min(25,maintenance.filter(x=>{const d=daysTo(first(x.nextService,x.due));return d!==null&&d<0}).length*8);return{score:Math.max(0,score),renewals:renew.soon.length,documents:docs.soon.length,insurance:ins.expiring.length};
}

export function confidence471(s=store.get()){
 const data=[financeBase(s).cash>0,A(s.personalGoals).length>0||A(s.goals?.items).length>0,A(s.householdBills?.items).length>0,Boolean(s.xtbReport),A(s.ticketBook?.items).length>0];const completeness=Math.round(data.filter(Boolean).length/data.length*100);return{completeness,confidence:completeness>=80?'VYSOKÁ':completeness>=50?'STŘEDNÍ':'NÍZKÁ',missing:data.map((v,i)=>v?null:['hotovost','cíle','účty','XTB','vstupenky'][i]).filter(Boolean)};
}

export function reset472(s=store.get()){
 const checks=[['Finance',financeBase(s).cash>0],['Účty',A(s.householdBills?.items).length>0],['Cíle',A(s.personalGoals).length>0||A(s.goals?.items).length>0],['Doklady',A(s.documents?.items).length>0||A(s.documentsExpiry?.items).length>0],['Pojištění',A(s.insurance?.items).length>0||A(s.insuranceCenter?.items).length>0],['Servis',A(s.maintenance?.items).length>0],['XTB',Boolean(s.xtbReport)],['Vstupenky',A(s.ticketBook?.items).length>0]];return{checks,done:checks.filter(x=>x[1]).length,total:checks.length,percent:pct(checks.filter(x=>x[1]).length,checks.length)};
}

export function opportunity473(s=store.get()){
 const f=financeBase(s),stress=stress468(s),goals=goal460(s);const afterReserve=Math.max(0,f.cash-f.reserve);const nearGoals=Math.min(afterReserve,goals.monthlyNeed);const free=Math.max(0,afterReserve-nearGoals-f.monthlyBills);return{afterReserve,nearGoals,free,status:stress.shock3>=0&&free>0?'MÁŠ PROSTOR':'DRŽ HOTOVOST'};
}

export function noise474(s=store.get()){
 const tasks=A(s.tasks).filter(open).filter(personal),inbox=A(s.inbox).filter(open).filter(personal);const scored=[...tasks,...inbox].map(x=>{const d=daysTo(first(x.due,x.dueAt,x.date));const p=N(x.priority);const age=ageDays(first(x.createdAt,x.date));const score=(d!==null&&d<=0?50:d!==null&&d<=3?30:0)+Math.min(30,p)+Math.min(20,Math.max(0,age||0));return{title:first(x.title,x.name,'Položka'),score}}).sort((a,b)=>b.score-a.score);return{focus:scored.slice(0,5),ignore:scored.slice(5),total:scored.length};
}

export function health475(s=store.get()){
 const runway=runway458(s),admin=admin470(s),stress=stress468(s),confidence=confidence471(s),reset=reset472(s),house=household461(s);let score=0;score+=Math.min(25,Math.round(runway.months/6*25));score+=Math.round(admin.score*.2);score+=stress.status==='ODOLNÉ'?20:stress.status==='NAPJATÉ'?12:5;score+=Math.round(confidence.completeness*.15);score+=Math.round(reset.percent*.15);if(house.drift>10)score-=8;else if(house.drift>3)score-=3;score=Math.max(0,Math.min(100,score));return{score,label:score>=80?'VÝBORNÉ':score>=65?'DOBRÉ':score>=45?'HLÍDAT':'ŘEŠIT',runway,admin,stress,confidence,reset,house};
}

export function personalLifePlus475(s=store.get()){
 return{renewal:renewal456(s),insurance:insurance457(s),runway:runway458(s),purchase:purchase459(s),goals:goal460(s),household:household461(s),vehicle:vehicle462(s),energy:energy463(s),docs:docs464(s),familyLoad:familyLoad465(s),ticketExposure:ticketExposure466(s),xtb:xtb467(s),stress:stress468(s),debts:debts469(s),admin:admin470(s),confidence:confidence471(s),reset:reset472(s),opportunity:opportunity473(s),noise:noise474(s),health:health475(s)};
}

const row=(name,value,status='')=>`<div class="row"><span>${h(name)}</span><div><b>${h(value)}</b>${status?`<div class="muted">${h(status)}</div>`:''}</div></div>`;
export async function openPersonalLifePlus475(){
 const t=performance.now(),x=personalLifePlus475();window.__KAMIL_LIFE_PLUS_475_LAST__={ms:Math.round((performance.now()-t)*10)/10,at:Date.now()};
 const body=`<div class="metric-strip"><div class="metric"><span>Life Health</span><b>${x.health.score}/100</b></div><div class="metric"><span>Runway</span><b>${x.runway.months} měs.</b></div><div class="metric"><span>Opportunity budget</span><b>${money(x.opportunity.free)}</b></div><div class="metric"><span>Admin score</span><b>${x.admin.score}/100</b></div></div>
 <div class="card"><div class="eyebrow">PENÍZE A ODOLNOST</div>${row('45.8 Rezerva / runway',`${x.runway.months} měsíců`,x.runway.status)}${row('45.9 Nákupy k odložení',String(x.purchase.delay.length))}${row('46.0 Měsíčně na cíle',money(x.goals.monthlyNeed))}${row('46.1 Domácí náklady',money(x.household.now),`${x.household.drift}% vs. minule`)}${row('46.7 XTB koncentrace',`${x.xtb.concentration}%`,x.xtb.status)}${row('46.8 Liquidity stress',money(x.stress.shock3),x.stress.status)}${row('46.9 Dluhy / pohledávky netto',money(x.debts.net))}${row('47.3 Opportunity budget',money(x.opportunity.free),x.opportunity.status)}</div>
 <div class="card"><div class="eyebrow">DOMOV, RODINA, ADMIN</div>${row('45.6 Obnovy do 45 dní',String(x.renewal.soon.length),money(x.renewal.annualExposure))}${row('45.7 Pojistky do 60 dní',String(x.insurance.expiring.length),x.insurance.missing.length?`${x.insurance.missing.length} mezery`:'bez zjevné mezery')}${row('46.2 Auto / roční náklady',money(x.vehicle.totalAnnual))}${row('46.3 Energie / rok',money(x.energy.annual))}${row('46.4 Doklady do 120 dní',String(x.docs.soon.length))}${row('46.5 Rodinný kalendář / 14 dní',String(x.familyLoad.count14),x.familyLoad.status)}${row('47.0 Life Admin Score',`${x.admin.score}/100`)}${row('47.2 Měsíční reset',`${x.reset.done}/${x.reset.total}`,`${x.reset.percent}% dat pokryto`)}</div>
 <div class="card"><div class="eyebrow">INVESTICE, VSTUPENKY, ROZHODOVÁNÍ</div>${row('46.6 Ticket capital exposure',money(x.ticketExposure.capital),`${x.ticketExposure.urgent.length} urgentních`)}${row('47.1 Confidence dat',`${x.confidence.completeness}%`,x.confidence.confidence)}${row('47.4 Noise filter',`${x.noise.focus.length} fokus / ${x.noise.ignore.length} ignorovat`)}${row('47.5 Life Health Score',`${x.health.score}/100`,x.health.label)}</div>
 <div class="decision-note">Personal Life Plus 45.6–47.5 je read-only a spouští se jen po kliknutí. Nic neplatí, neobchoduje, nepřecenňuje ani neposílá.</div>`;
 await modal('Kamil OS / Life+ 47.5',body,[{label:'Zavřít',value:null,primary:true}]);
}
