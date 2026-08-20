import {cashflow90} from './cashflow25.js';
import {personalTimeline} from './personalTimeline26.js';
import {goalPlan} from './personalPlus29.js';

const active=x=>String(x?.status||'ACTIVE').toUpperCase()!=='ARCHIVED';
const flow=x=>String(x?.workflow||'HOLD').toUpperCase();
const hasNum=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const n=v=>Number(v||0);
const pad=v=>String(v).padStart(2,'0');
const dateKey=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const ts=v=>{const t=typeof v==='number'?v:new Date(v||0).getTime();return Number.isFinite(t)?t:null};

function bounds(now=new Date()){
 const ref=new Date(now),from=new Date(ref.getFullYear(),ref.getMonth()+1,1),to=new Date(ref.getFullYear(),ref.getMonth()+2,1);
 return {from,to,key:`${from.getFullYear()}-${pad(from.getMonth()+1)}`,fromKey:dateKey(from),toExclusiveKey:dateKey(to),days:Math.round((to-from)/86400000)};
}
const inMonth=(v,b)=>{const t=ts(v);return t!==null&&t>=b.from.getTime()&&t<b.to.getTime()};
const dayOfMonth=v=>{const t=ts(v);return t===null?99:new Date(t).getDate()};

function knownCashflow(s,now,b){
 const cf=cashflow90(s,now),timeline=Array.isArray(cf.timeline)?cf.timeline:[];
 let balance=cf.cash;
 for(const e of timeline)if(e.at<b.from.getTime())balance+=Number(e.amount||0);
 const startBalance=balance,events=timeline.filter(e=>inMonth(e.at,b)).sort((a,z)=>a.at-z.at||String(a.label).localeCompare(String(z.label),'cs'));
 let minBalance=startBalance,minAt=b.from.getTime();
 for(const e of events){balance+=Number(e.amount||0);if(balance<minBalance){minBalance=balance;minAt=e.at}}
 const inflow=events.filter(x=>Number(x.amount)>0).reduce((z,x)=>z+Number(x.amount),0),outflow=Math.abs(events.filter(x=>Number(x.amount)<0).reduce((z,x)=>z+Number(x.amount),0));
 const reserve=Number(cf.reserve||0),status=minBalance<reserve?'RISK':minBalance<reserve*1.15?'TIGHT':'OK';
 return {currency:cf.primaryCurrency||String(s.financePlan?.currency||'CZK').toUpperCase(),startBalance,endBalance:balance,minBalance,minDate:dateKey(new Date(minAt)),reserve,inflow,outflow,net:inflow-outflow,status,events,ignoredCurrencyCount:Number(cf.personalIgnoredCurrency||0),missingAmountCount:Number(cf.personalMissingAmount||0),note:'Cashflow příštího měsíce vychází jen ze známých položek v hlavní měně finančního plánu. Cizí měny se bez skutečného FX kurzu nepřepočítávají.'};
}

function deadlines(s,now,b){
 const rows=personalTimeline(s,now).items.filter(x=>inMonth(x.at,b)).map(x=>({...x,day:dayOfMonth(x.at)})).sort((a,z)=>a.day-z.day||z.priority-a.priority||String(a.title).localeCompare(String(z.title),'cs'));
 const byDomain={};for(const x of rows)byDomain[x.domain]=(byDomain[x.domain]||0)+1;
 return {items:rows,total:rows.length,early:rows.filter(x=>x.day<=7).length,byDomain,note:'Termíny jsou jen ze skutečně uložených osobních dat a explicitně osobního kalendáře.'};
}

function goals(s,now){
 const items=goalPlan(s,now).items.filter(x=>x.status!=='DONE'&&Number(x.remaining||0)>0).map(x=>{
  const planned=hasNum(x.monthlyContribution)?Math.max(0,Number(x.monthlyContribution)):0,required=x.requiredMonthly===null?null:Math.max(0,Number(x.requiredMonthly)),gap=required===null?null:Math.max(0,required-planned);
  return {id:x.id,title:x.title||'Cíl',currency:String(x.currency||'CZK').toUpperCase(),planned,required,gap,remaining:x.remaining,targetDate:x.targetDate||null,status:x.status};
 });
 const byCurrency={};for(const x of items){const c=x.currency;byCurrency[c]=byCurrency[c]||{planned:0,required:0,gap:0,goals:0,requiredKnown:0};byCurrency[c].planned+=x.planned;byCurrency[c].goals++;if(x.required!==null){byCurrency[c].required+=x.required;byCurrency[c].gap+=x.gap||0;byCurrency[c].requiredKnown++}}
 return {items,byCurrency,plannedCount:items.filter(x=>x.planned>0).length,gapCount:items.filter(x=>x.gap!==null&&x.gap>0).length,note:'Plánovaný příspěvek je pouze částka výslovně uložená u cíle. Potřebné tempo je pravidlový výpočet podle cílové částky a data; nic se automaticky nepřevádí.'};
}

function tickets(s,b){
 const items=(s.ticketBook?.items||[]).filter(x=>['HOLD','LISTED'].includes(flow(x))&&inMonth(x.date,b)).map(x=>({id:x.id,title:x.name||'Vstupenka',date:x.date,day:dayOfMonth(x.date),qty:Math.max(1,n(x.qty)||1),buy:Math.max(0,n(x.buy)),currency:String(x.currency||s.ticketBook?.currency||'CZK').toUpperCase(),listPrice:hasNum(x.listPrice)&&Number(x.listPrice)>0?Number(x.listPrice):null,workflow:flow(x)})).sort((a,z)=>a.day-z.day||String(a.title).localeCompare(String(z.title),'cs'));
 const capitalByCurrency={};for(const x of items)if(x.buy>0)capitalByCurrency[x.currency]=(capitalByCurrency[x.currency]||0)+x.buy;
 return {items,positions:items.length,qty:items.reduce((z,x)=>z+x.qty,0),unpriced:items.filter(x=>x.listPrice===null).length,capitalByCurrency,note:'Ticket kapitál se sčítá jen po jednotlivých měnách a pouze z uložené nákupní ceny.'};
}

function priorities(cash,dead,goal,ticket){
 const rows=[];
 if(cash.status==='RISK')rows.push({key:'cashflow-risk',priority:98,title:'Příští měsíc by známé cashflow prolomilo rezervu',detail:`Minimum vychází na ${Math.round(cash.minBalance).toLocaleString('cs-CZ')} ${cash.currency} proti rezervě ${Math.round(cash.reserve).toLocaleString('cs-CZ')} ${cash.currency}.`,target:'money',mode:null,source:'CASHFLOW'});
 else if(cash.status==='TIGHT')rows.push({key:'cashflow-tight',priority:86,title:'Příští měsíc bude rezerva těsnější',detail:`Známé minimum vychází na ${Math.round(cash.minBalance).toLocaleString('cs-CZ')} ${cash.currency}.`,target:'money',mode:null,source:'CASHFLOW'});
 if(cash.ignoredCurrencyCount>0)rows.push({key:'fx-gap',priority:72,title:`Cashflow vynechává ${cash.ignoredCurrencyCount} položek v jiné měně`,detail:'Bez skutečného FX kurzu je Kamil OS nepřepočítává do hlavní měny.',target:'home',mode:'payments',source:'FX'});
 for(const x of ticket.items.slice(0,2)){const priority=x.day<=14?88:76;rows.push({key:`ticket:${x.id}`,priority,title:`Připravit prodej: ${x.title}`,detail:`Akce ${dateKey(new Date(x.date))} · ${x.qty} ks${x.listPrice===null?' · bez uložené listingové ceny':''}.`,target:'tickets',mode:null,source:'VSTUPENKY'});}
 for(const x of goal.items.filter(x=>x.gap!==null&&x.gap>0).slice(0,2))rows.push({key:`goal:${x.id}`,priority:76,title:`Cíl potřebuje vyšší tempo: ${x.title}`,detail:`Uložený plán ${Math.round(x.planned).toLocaleString('cs-CZ')} ${x.currency} / měsíc, potřebné tempo přibližně ${Math.round(x.required).toLocaleString('cs-CZ')} ${x.currency}.`,target:'money',mode:null,source:'CÍL'});
 for(const x of dead.items.filter(x=>x.domain!=='Platby'&&x.domain!=='Vstupenky').slice(0,4)){const priority=x.day<=7?82:x.day<=14?74:66;rows.push({key:`deadline:${x.key}`,priority,title:x.title,detail:`${x.type} · ${dateKey(new Date(x.at))} · ${x.domain}.`,target:x.target||'home',mode:x.homeMode||null,source:'TERMÍN'});}
 const seen=new Set();return rows.sort((a,z)=>z.priority-a.priority||String(a.title).localeCompare(String(z.title),'cs')).filter(x=>{const k=`${x.key}|${x.title}`;if(seen.has(k))return false;seen.add(k);return true}).slice(0,8);
}

export function nextMonthPlan(s={},now=new Date()){
 const b=bounds(now),cash=knownCashflow(s,now,b),deadline=deadlines(s,now,b),goal=goals(s,now),ticket=tickets(s,b),attention=priorities(cash,deadline,goal,ticket);
 const status=attention.some(x=>x.priority>=90)?'ACTION':attention.length?'PLAN':'CLEAR';
 return {period:{key:b.key,from:b.fromKey,toExclusive:b.toExclusiveKey,days:b.days},status,attention,attentionCount:attention.length,cashflow:cash,deadlines:deadline,goals:goal,tickets:ticket,note:'Plán příštího měsíce používá jen skutečně uložená data a pravidlové výpočty nad nimi. Měny se nesčítají, neznámé výdaje ani příjmy se nedopočítávají a žádná platba, převod, investice ani ticket obchod se neprovede automaticky.'};
}
