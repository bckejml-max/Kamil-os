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
const ageDays=v=>{const t=ts(v);return t===null?null:Math.max(0,Math.floor((Date.now()-t)/86400000))};
const pct=(a,b)=>b>0?Math.round(a/b*1000)/10:0;
const cash=s=>N(first(s.financePlan?.cashNow,s.cashNow,s.liquidity?.cash,s.wealth?.cash));
const reserve=s=>N(first(s.financePlan?.reserveFloor,s.reserveFloor,s.liquidity?.reserveTarget,40000));
const bills=s=>A(s.householdBills?.items).filter(open).filter(personal);
const monthlyCost=s=>bills(s).reduce((a,x)=>a+N(first(x.monthlyAmount,x.amount,x.price)),0);

export function freshness476(s=store.get()){
 const sources=[
  ['XTB',first(s.xtbReport?.asOf,s.xtbReport?.updatedAt)],
  ['Finance',first(s.financePlan?.updatedAt,s.financePlan?.asOf)],
  ['Vstupenky',first(s.ticketBook?.updatedAt,s.ticketBook?.asOf)],
  ['Domácnost',first(s.householdBills?.updatedAt,s.householdBills?.asOf)],
  ['Kalendář',first(s.calendar?.updatedAt,s.calendar?.asOf)],
  ['Majetek',first(s.wealth?.updatedAt,s.wealth?.asOf)]
 ].map(([name,date])=>({name,date,age:ageDays(date),status:!date?'CHYBÍ':ageDays(date)>30?'STARÉ':ageDays(date)>7?'HLÍDAT':'ČERSTVÉ'}));
 return{sources,stale:sources.filter(x=>x.status==='STARÉ'||x.status==='CHYBÍ')};
}

export function missing477(s=store.get()){
 const checks=[
  ['Hotovost',cash(s)>0,'Doplň aktuální hotovost'],
  ['Rezerva',reserve(s)>0,'Nastav rezervní minimum'],
  ['Měsíční náklady',monthlyCost(s)>0,'Doplň pravidelné domácí náklady'],
  ['XTB',Boolean(s.xtbReport),'Obnov XTB import'],
  ['Vstupenky',A(s.ticketBook?.items).length>0,'Doplň aktivní vstupenky'],
  ['Cíle',A(s.personalGoals).length>0||A(s.goals?.items).length>0,'Doplň osobní cíle'],
  ['Pojištění',A(s.insurance?.items).length>0||A(s.insuranceCenter?.items).length>0,'Doplň pojistky'],
  ['Doklady',A(s.documents?.items).length>0||A(s.documentsExpiry?.items).length>0,'Doplň expirace dokladů']
 ];
 return{checks,missing:checks.filter(x=>!x[1]).map(x=>({name:x[0],action:x[2]})),coverage:Math.round(checks.filter(x=>x[1]).length/checks.length*100)};
}

function targetRows(s){
 const rows=[...A(s.sinkingFunds?.items),...A(s.personalGoals),...A(s.goals?.items)].filter(open).filter(personal);
 return rows.map(x=>{const target=N(first(x.targetAmount,x.amount,x.budget)),saved=N(first(x.saved,x.current,x.funded)),gap=Math.max(0,target-saved),days=daysTo(first(x.targetDate,x.due,x.date)),months=days===null?12:Math.max(1,Math.ceil(days/30));return{title:first(x.title,x.name,'Cíl'),kind:first(x.kind,x.category,'osobní'),target,saved,gap,days,monthly:Math.ceil(gap/months)}});
}
export function funds478(s=store.get()){const rows=targetRows(s);return{rows,totalGap:rows.reduce((a,x)=>a+x.gap,0),monthlyNeed:rows.reduce((a,x)=>a+x.monthly,0)}};

export function bigPurchase479(s=store.get()){
 const c=cash(s),r=reserve(s),m=monthlyCost(s);const rows=[...A(s.plannedPurchases),...A(s.purchasePlan?.items)].filter(open).filter(personal).map(x=>{const amount=N(first(x.amount,x.price,x.cost)),after=c-amount,buffer=after-r,monthsCover=m>0?Math.round(after/m*10)/10:null;return{title:first(x.title,x.name,'Nákup'),amount,after,buffer,monthsCover,action:buffer<0?'ODLOŽIT':m>0&&monthsCover<3?'ZVÁŽIT':'OK'}}).sort((a,b)=>a.buffer-b.buffer);return{rows,risky:rows.filter(x=>x.action!=='OK')};
}

export function savings480(s=store.get()){
 const income=N(first(s.financePlan?.expectedIncome,s.monthlyIncome,s.household?.income)),cost=monthlyCost(s),planned=N(s.financePlan?.plannedInvestment),saving=Math.max(0,income-cost),rate=pct(saving,income);return{income,cost,planned,saving,rate,afterInvestment:saving-planned,status:rate>=25?'SILNÉ':rate>=10?'OK':'NÍZKÉ'};
}

export function netWorth481(s=store.get()){
 const history=A(s.wealth?.history);const current=N(first(s.wealth?.netWorth,s.wealth?.net,s.netWorth));const prev=history.length?N(first(history.at(-1)?.netWorth,history.at(-1)?.net,history.at(-1)?.value)):0;const delta=prev?current-prev:0;return{current,prev,delta,percent:prev?pct(delta,prev):0};
}

export function commitments482(s=store.get()){
 const rows=[...bills(s),...A(s.plannedPurchases),...A(s.purchasePlan?.items),...A(s.family?.expenses),...A(s.maintenance?.items)].filter(open).filter(personal).map(x=>({title:first(x.title,x.name,'Závazek'),amount:N(first(x.amount,x.price,x.cost)),days:daysTo(first(x.due,x.targetDate,x.date,x.nextService))})).filter(x=>x.days!==null&&x.days>=0&&x.days<=90).sort((a,b)=>a.days-b.days);return{rows,total:rows.reduce((a,x)=>a+x.amount,0),d30:rows.filter(x=>x.days<=30).reduce((a,x)=>a+x.amount,0)};
}

export function ticketRank483(s=store.get()){
 const rows=A(s.ticketBook?.items).filter(x=>['HOLD','LISTED'].includes(U(x.workflow||'HOLD'))).map(x=>{const qty=N(first(x.qty,x.quantity,1))||1,buy=N(first(x.buy,x.buyPrice,x.cost)),market=N(first(x.marketPrice,x.listPrice,x.price)),cost=buy*qty,value=market*qty,profit=value-cost,roi=cost>0?pct(profit,cost):0,days=daysTo(first(x.sellBy,x.eventDate,x.date));return{name:first(x.name,x.title,'Vstupenka'),cost,value,profit,roi,days}}).sort((a,b)=>b.roi-a.roi);return{rows,best:rows.slice(0,3),worst:[...rows].sort((a,b)=>a.roi-b.roi).slice(0,3)};
}

export function sellToFund484(s=store.get(),need=0){
 const target=Math.max(0,N(need)||N(s.liquidityNeed?.amount));const positions=A(s.xtbReport?.positions).map(x=>({name:first(x.symbol,x.ticker,x.name,'Pozice'),value:N(first(x.valueCZK,x.marketValue,x.value)),profit:N(first(x.profitCZK,x.profit,x.pnl)),weight:N(x.weight)})).filter(x=>x.value>0).sort((a,b)=>a.profit-b.profit||b.value-a.value);let left=target;const proposal=[];for(const p of positions){if(left<=0)break;const amount=Math.min(left,p.value);proposal.push({...p,sellAmount:amount});left-=amount}return{target,proposal,covered:Math.max(0,target-left),shortfall:left,note:'Pouze návrh zdroje hotovosti; nic se neprodává.'};
}

export function subscriptions485(s=store.get()){
 const rows=[...A(s.subscriptions?.items),...A(s.renewals?.items)].filter(open).filter(personal).map(x=>({title:first(x.title,x.name,'Předplatné'),monthly:N(first(x.monthlyAmount,x.amount,x.price)),used:N(first(x.usagePerMonth,x.uses,0)),lastUsed:first(x.lastUsed,x.lastUse),autoRenew:Boolean(first(x.autoRenew,x.recurring,true))}));const waste=rows.filter(x=>x.monthly>0&&(x.used===0||(ageDays(x.lastUsed)!==null&&ageDays(x.lastUsed)>45))).sort((a,b)=>b.monthly-a.monthly);return{rows,waste,potentialMonthly:waste.reduce((a,x)=>a+x.monthly,0)};
}

export function vehicleFund486(s=store.get()){
 const target=N(first(s.vehiclePlan?.replacementBudget,s.carPlan?.targetAmount));const saved=N(first(s.vehiclePlan?.saved,s.carPlan?.saved));const days=daysTo(first(s.vehiclePlan?.targetDate,s.carPlan?.targetDate));const months=days===null?36:Math.max(1,Math.ceil(days/30)),gap=Math.max(0,target-saved);return{target,saved,gap,months,monthly:Math.ceil(gap/months)};
}

export function homeFund487(s=store.get()){
 const target=N(first(s.home?.reserveTarget,s.homePlan?.reserveTarget,s.houseReserve?.target));const saved=N(first(s.home?.reserveSaved,s.homePlan?.reserveSaved,s.houseReserve?.saved));const gap=Math.max(0,target-saved);return{target,saved,gap,monthly:Math.ceil(gap/12)};
}

export function travelFund488(s=store.get()){
 const rows=targetRows(s).filter(x=>/dovol|travel|cest|výlet|vylet/i.test(`${x.title} ${x.kind}`));return{rows,totalGap:rows.reduce((a,x)=>a+x.gap,0),monthly:rows.reduce((a,x)=>a+x.monthly,0)};
}

export function familyPrep489(s=store.get()){
 const events=[...A(s.calendar?.events),...A(s.calendarEvents),...A(s.family?.events)].filter(personal).map(x=>({title:first(x.title,x.name,'Rodinná událost'),days:daysTo(first(x.start,x.date,x.when)),cost:N(first(x.estimatedCost,x.amount,x.budget)),prep:A(x.prep||x.checklist).filter(y=>!y?.done)})).filter(x=>x.days!==null&&x.days>=0&&x.days<=60).sort((a,b)=>a.days-b.days);return{events,needsPrep:events.filter(x=>x.prep.length||x.cost>0)};
}

export function practical490(s=store.get()){
 const f=freshness476(s),m=missing477(s),fund=funds478(s),buy=bigPurchase479(s),sav=savings480(s),nw=netWorth481(s),com=commitments482(s),ticket=ticketRank483(s),sell=sellToFund484(s),subs=subscriptions485(s),car=vehicleFund486(s),home=homeFund487(s),travel=travelFund488(s),family=familyPrep489(s);
 const actions=[];
 if(m.missing.length)actions.push({title:m.missing[0].action,reason:'Zlepší přesnost osobních doporučení'});
 if(f.stale.length)actions.push({title:`Obnov ${f.stale[0].name}`,reason:'Zdroj je starý nebo chybí'});
 if(buy.risky.length)actions.push({title:`Prověř nákup: ${buy.risky[0].title}`,reason:buy.risky[0].action});
 if(com.d30>0)actions.push({title:`Připrav ${money(com.d30)} na 30 dní`,reason:'Známé osobní závazky'});
 if(subs.potentialMonthly>0)actions.push({title:`Prověř předplatná za ${money(subs.potentialMonthly)}/měs.`,reason:'Nízké nebo žádné využití'});
 return{freshness:f,missing:m,funds:fund,purchases:buy,savings:sav,netWorth:nw,commitments:com,tickets:ticket,sellToFund:sell,subscriptions:subs,vehicleFund:car,homeFund:home,travelFund:travel,familyPrep:family,actions:actions.slice(0,5)};
}

const row=(a,b,c='')=>`<div class="row"><span>${h(a)}</span><div><b>${h(b)}</b>${c?`<div class="muted">${h(c)}</div>`:''}</div></div>`;
export async function openPractical490(){
 const t=performance.now(),x=practical490();window.__KAMIL_PRACTICAL_490_LAST__={ms:Math.round((performance.now()-t)*10)/10,at:Date.now()};
 const acts=x.actions.map((v,i)=>`<div class="row"><div><b>${i+1}. ${h(v.title)}</b><div class="muted">${h(v.reason)}</div></div></div>`).join('')||'<div class="empty success-empty">Podle uložených dat není nutný zásah.</div>';
 const body=`<div class="metric-strip"><div class="metric"><span>Pokrytí dat</span><b>${x.missing.coverage}%</b></div><div class="metric"><span>Závazky / 30 dní</span><b>${money(x.commitments.d30)}</b></div><div class="metric"><span>Savings rate</span><b>${x.savings.rate}%</b></div><div class="metric"><span>Fondy / měsíčně</span><b>${money(x.funds.monthlyNeed)}</b></div></div>
 <div class="card"><div class="eyebrow">CO UDĚLAT TEĎ</div>${acts}</div>
 <div class="card"><div class="eyebrow">PENÍZE A PLÁNY</div>${row('47.8 Fondy / chybí',money(x.funds.totalGap),`${money(x.funds.monthlyNeed)}/měs.`)}${row('47.9 Rizikové velké nákupy',String(x.purchases.risky.length))}${row('48.0 Savings rate',`${x.savings.rate}%`,x.savings.status)}${row('48.1 Změna majetku',money(x.netWorth.delta),`${x.netWorth.percent}%`)}${row('48.2 Závazky / 90 dní',money(x.commitments.total))}${row('48.6 Auto fond',money(x.vehicleFund.gap),`${money(x.vehicleFund.monthly)}/měs.`)}${row('48.7 Dům fond',money(x.homeFund.gap),`${money(x.homeFund.monthly)}/měs.`)}${row('48.8 Dovolená fond',money(x.travelFund.totalGap),`${money(x.travelFund.monthly)}/měs.`)}</div>
 <div class="card"><div class="eyebrow">DATA, VSTUPENKY, ÚSPORY</div>${row('47.6 Staré/chybějící zdroje',String(x.freshness.stale.length))}${row('47.7 Chybějící data',String(x.missing.missing.length))}${row('48.3 Nejlepší ticket ROI',x.tickets.best[0]?`${x.tickets.best[0].roi}%`:'—',x.tickets.best[0]?.name||'bez dat')}${row('48.4 Sell-to-fund',money(x.sellToFund.target),'jen návrh')}${row('48.5 Potenciál předplatných',money(x.subscriptions.potentialMonthly),'/ měsíc')}${row('48.9 Rodinné akce k přípravě',String(x.familyPrep.needsPrep.length))}</div>
 <div class="decision-note">Praktické centrum 49.0 je click-only a read-only. Sell-to-fund je pouze návrh; žádný obchod ani platba se automaticky neprovede.</div>`;
 await modal('Kamil OS / Praktické centrum 49.0',body,[{label:'Zavřít',value:null,primary:true}]);
}
