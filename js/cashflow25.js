const n=v=>Number(v||0);
const hasNumber=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const validDate=v=>{const t=new Date(v).getTime();return Number.isFinite(t)?t:null};
const DAY=86400000;
const startOfDay=d=>{const x=new Date(d);x.setHours(0,0,0,0);return x};
const dateKey=d=>new Date(d).toISOString().slice(0,10);
const active=x=>String(x?.status||'ACTIVE').toUpperCase()!=='ARCHIVED';
const cadenceMonths={MONTHLY:1,QUARTERLY:3,SEMIANNUAL:6,YEARLY:12};
const FINANCIAL_CATEGORIES=new Set(['PAYMENT','SUBSCRIPTION','UTILITY','LOAN','HOME','FEE','INSURANCE','VEHICLE','OTHER']);

function normalizedEntries(s){
 const manual=Array.isArray(s.financePlan?.cashflow)?s.financePlan.cashflow:[];
 return manual.filter(x=>x&&x.active!==false&&n(x.amount)!==0).map(x=>({
  id:x.id||`manual-${x.label||'cashflow'}`,label:x.label||'Cashflow',amount:n(x.amount),date:x.date||null,
  cadence:['weekly','monthly'].includes(x.cadence)?x.cadence:'once',source:'MANUAL'
 }));
}

function receivables(s){
 return (s.debtBook?.items||[]).filter(x=>x?.status!=='PAID').map(x=>{
  const total=n(x.amount||x.total||x.value),paid=n(x.paid||x.received),amount=Math.max(0,total-paid);
  return {id:`debt-${x.id||x.person||''}`,label:`Pohledávka: ${x.person||x.reason||'bez názvu'}`,amount,date:x.due||x.dueDate||x.date||null,cadence:'once',source:'RECEIVABLE'};
 }).filter(x=>x.amount>0&&validDate(x.date)!==null);
}

function occurrences(entry,start,end){
 const out=[],first=validDate(entry.date);
 if(first===null)return out;
 let t=startOfDay(first).getTime(),step=entry.cadence==='weekly'?7*DAY:null;
 if(entry.cadence==='once')return t>=start&&t<=end?[{...entry,at:t}]:[];
 if(entry.cadence==='weekly'){
  while(t<start)t+=step;
  while(t<=end){out.push({...entry,at:t});t+=step}
  return out;
 }
 const d=new Date(t),day=d.getDate();
 let cursor=new Date(d.getFullYear(),d.getMonth(),1);
 while(cursor.getTime()<=end){
  const last=new Date(cursor.getFullYear(),cursor.getMonth()+1,0).getDate();
  const at=new Date(cursor.getFullYear(),cursor.getMonth(),Math.min(day,last)).getTime();
  if(at>=t&&at>=start&&at<=end)out.push({...entry,at});
  cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);
 }
 return out;
}

function addMonthsSafe(timestamp,months){
 const d=new Date(timestamp),wanted=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+months);const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(wanted,last));d.setHours(0,0,0,0);return d.getTime();
}

function personalObligations(s,start,end){
 const currency=String(s.financePlan?.currency||'CZK').toUpperCase(),entries=[],events=[];
 let ignoredCurrency=0,missingAmount=0,missingDate=0;
 for(const x of s.personalAdmin?.items||[]){
  if(!active(x)||!FINANCIAL_CATEGORIES.has(String(x.category||'OTHER').toUpperCase()))continue;
  if(!hasNumber(x.amount)||Number(x.amount)<=0){missingAmount++;continue}
  if(validDate(x.nextDue)===null){missingDate++;continue}
  const itemCurrency=String(x.currency||'CZK').toUpperCase();
  if(itemCurrency!==currency){ignoredCurrency++;continue}
  const cadence=String(x.cadence||'ONCE').toUpperCase(),months=cadenceMonths[cadence]||0;
  const entry={id:`personal-${x.id||x.title||entries.length}`,label:x.title||'Osobní závazek',amount:-Math.abs(Number(x.amount)),date:x.nextDue,cadence,source:'PERSONAL_ADMIN',category:x.category||'OTHER',currency:itemCurrency,autoPay:!!x.autoPay};
  entries.push(entry);
  let due=startOfDay(validDate(x.nextDue)).getTime();
  if(due<start){events.push({...entry,at:start,overdue:true});if(!months)continue;while(due<=start)due=addMonthsSafe(due,months)}
  if(due>=start&&due<=end)events.push({...entry,at:due});
  if(months){let cursor=addMonthsSafe(due,months);while(cursor<=end){events.push({...entry,at:cursor});cursor=addMonthsSafe(cursor,months)}}
 }
 return {currency,entries,events,ignoredCurrency,missingAmount,missingDate};
}

export function cashflow90(s,now=new Date()){
 const start=startOfDay(now).getTime(),end=start+90*DAY,cash=n(s.financePlan?.cashNow),reserve=n(s.financePlan?.reserveFloor);
 const manual=normalizedEntries(s),receivable=receivables(s),personal=personalObligations(s,start,end);
 const events=[...manual,...receivable].flatMap(x=>occurrences(x,start,end)).concat(personal.events).sort((a,b)=>a.at-b.at||String(a.label).localeCompare(String(b.label),'cs'));
 let balance=cash,minBalance=cash,minAt=start,belowReserveAt=cash<reserve?start:null;
 const timeline=[];
 for(const e of events){
  balance+=e.amount;
  if(balance<minBalance){minBalance=balance;minAt=e.at}
  if(belowReserveAt===null&&balance<reserve)belowReserveAt=e.at;
  timeline.push({...e,balance});
 }
 const inflow=events.filter(x=>x.amount>0).reduce((z,x)=>z+x.amount,0),outflow=Math.abs(events.filter(x=>x.amount<0).reduce((z,x)=>z+x.amount,0));
 const endBalance=cash+inflow-outflow,headroom=endBalance-reserve;
 const status=belowReserveAt!==null?'RISK':minBalance<reserve*1.15?'TIGHT':'OK';
 const next=timeline.slice(0,10).map(x=>({...x,date:dateKey(x.at)}));
 const coverage=manual.length+receivable.length+personal.entries.length;
 const note=coverage
  ?`Výhled používá ručně zadané cashflow, datované pohledávky a osobní závazky se skutečnou částkou a termínem v ${personal.currency}. Cizí měny se bez FX kurzu ignorují. Neznámé příjmy ani výdaje se nedopočítávají.`
  :'Výhled zatím nemá naplánované peněžní toky; zobrazuje pouze dnešní hotovost proti rezervnímu minimu.';
 return {days:90,cash,reserve,inflow,outflow,endBalance,minBalance,minDate:dateKey(minAt),headroom,status,belowReserveDate:belowReserveAt===null?null:dateKey(belowReserveAt),events:timeline.length,next,timeline,
  coverage,manualEntries:manual.length,receivables:receivable.length,personalObligations:personal.entries.length,personalIgnoredCurrency:personal.ignoredCurrency,personalMissingAmount:personal.missingAmount,personalMissingDate:personal.missingDate,primaryCurrency:personal.currency,note};
}