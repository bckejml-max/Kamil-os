const n=v=>Number(v||0);
const validDate=v=>{const t=new Date(v).getTime();return Number.isFinite(t)?t:null};
const DAY=86400000;
const startOfDay=d=>{const x=new Date(d);x.setHours(0,0,0,0);return x};
const dateKey=d=>new Date(d).toISOString().slice(0,10);

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
 while(cursor.getTime()<start)cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);
 while(cursor.getTime()<=end){
  const last=new Date(cursor.getFullYear(),cursor.getMonth()+1,0).getDate();
  const at=new Date(cursor.getFullYear(),cursor.getMonth(),Math.min(day,last)).getTime();
  if(at>=start&&at<=end)out.push({...entry,at});
  cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);
 }
 return out;
}

export function cashflow90(s,now=new Date()){
 const start=startOfDay(now).getTime(),end=start+90*DAY,cash=n(s.financePlan?.cashNow),reserve=n(s.financePlan?.reserveFloor);
 const entries=[...normalizedEntries(s),...receivables(s)],events=entries.flatMap(x=>occurrences(x,start,end)).sort((a,b)=>a.at-b.at);
 let balance=cash,minBalance=cash,minAt=start,belowReserveAt=null;
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
 const next=timeline.slice(0,8).map(x=>({...x,date:dateKey(x.at)}));
 return {days:90,cash,reserve,inflow,outflow,endBalance,minBalance,minDate:dateKey(minAt),headroom,status,belowReserveDate:belowReserveAt===null?null:dateKey(belowReserveAt),events:timeline.length,next,
  coverage:entries.length,manualEntries:normalizedEntries(s).length,receivables:receivables(s).length,
  note:entries.length?'Výhled používá pouze ručně zadané cashflow položky a pohledávky s konkrétním datem splatnosti. Neznámé příjmy ani výdaje se nedopočítávají.':'Výhled zatím nemá naplánované peněžní toky; zobrazuje pouze dnešní hotovost proti rezervnímu minimu.'};
}
