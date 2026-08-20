const DAY=86400000;
const n=v=>Number(v||0);
const hasNum=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const active=x=>String(x?.status||'ACTIVE').toUpperCase()!=='ARCHIVED';
const financialCats=new Set(['PAYMENT','SUBSCRIPTION','UTILITY','LOAN','HOME','FEE','INSURANCE','VEHICLE','OTHER']);
const cadenceMonths={MONTHLY:1,QUARTERLY:3,SEMIANNUAL:6,YEARLY:12};
export const SCENARIO_LAB_TYPES={ONE_OFF_EXPENSE:'Jednorázový výdaj',ONE_OFF_INCOME:'Jednorázový příjem',MONTHLY_EXPENSE:'Nový měsíční výdaj',MONTHLY_INCOME:'Nový měsíční příjem',MONTHLY_INVESTMENT:'Měsíční investice',INCOME_LOSS:'Výpadek příjmu'};
export const scenarioLabNote='Scenario Lab je pouze hypotetický výpočet nad kopií dat. Nic neukládá, neplatí ani neinvestuje. Cizí měnu bez skutečného FX kurzu nepřepočítává.';

const startDay=v=>{const d=new Date(v);d.setHours(0,0,0,0);return d};
const dateKey=v=>new Date(v).toISOString().slice(0,10);
const addMonthsSafe=(value,months)=>{const d=new Date(value),wanted=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+months);const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(wanted,last));d.setHours(0,0,0,0);return d};
const validDate=v=>{const d=new Date(v||0);return Number.isFinite(d.getTime())?d:null};

function addRecurring(out,{id,label,amount,date,cadence='once',source='MANUAL'},start,end){
 const first=validDate(date);if(!first||!amount)return;
 let d=startDay(first);
 if(cadence==='once'){if(d>=start&&d<=end)out.push({id,label,amount,at:d.getTime(),source});return}
 if(cadence==='weekly'){while(d<start)d=new Date(d.getTime()+7*DAY);while(d<=end){out.push({id,label,amount,at:d.getTime(),source});d=new Date(d.getTime()+7*DAY)}return}
 if(cadence==='monthly'){while(d<start)d=addMonthsSafe(d,1);while(d<=end){out.push({id,label,amount,at:d.getTime(),source});d=addMonthsSafe(d,1)}}
}

function existingEvents(s,start,end,currency){
 const out=[];
 for(const x of s.financePlan?.cashflow||[]){if(!x||x.active===false||!hasNum(x.amount)||Number(x.amount)===0)continue;addRecurring(out,{id:x.id||'manual',label:x.label||'Cashflow',amount:Number(x.amount),date:x.date,cadence:['weekly','monthly'].includes(x.cadence)?x.cadence:'once',source:'MANUAL'},start,end)}
 for(const x of s.debtBook?.items||[]){if(x?.status==='PAID')continue;const total=n(x.amount||x.total||x.value),paid=(x.payments||[]).reduce((z,p)=>z+n(p.amount),0),rem=Math.max(0,total-paid),due=x.due||x.dueDate||x.date;if(rem>0&&validDate(due))addRecurring(out,{id:`debt-${x.id||''}`,label:`Pohledávka: ${x.person||x.reason||'bez názvu'}`,amount:rem,date:due,source:'RECEIVABLE'},start,end)}
 for(const x of s.personalAdmin?.items||[]){
  if(!active(x)||!financialCats.has(String(x.category||'OTHER').toUpperCase())||!hasNum(x.amount)||Number(x.amount)<=0||!validDate(x.nextDue))continue;
  const c=String(x.currency||'CZK').toUpperCase();if(c!==currency)continue;
  const cadence=String(x.cadence||'ONCE').toUpperCase(),months=cadenceMonths[cadence]||0;
  let d=startDay(x.nextDue);if(d<start){if(!months){out.push({id:`personal-${x.id}`,label:x.title||'Osobní závazek',amount:-Math.abs(Number(x.amount)),at:start.getTime(),source:'PERSONAL',overdue:true});continue}while(d<start)d=addMonthsSafe(d,months)}
  if(d<=end)out.push({id:`personal-${x.id}`,label:x.title||'Osobní závazek',amount:-Math.abs(Number(x.amount)),at:d.getTime(),source:'PERSONAL'});
  if(months){d=addMonthsSafe(d,months);while(d<=end){out.push({id:`personal-${x.id}`,label:x.title||'Osobní závazek',amount:-Math.abs(Number(x.amount)),at:d.getTime(),source:'PERSONAL'});d=addMonthsSafe(d,months)}}
 }
 return out;
}

function scenarioEvents(input,start,end,currency){
 const type=String(input?.type||'ONE_OFF_EXPENSE').toUpperCase(),amount=Math.abs(Number(input?.amount||0)),date=validDate(input?.date)||start,duration=Math.max(1,Math.min(24,Math.floor(Number(input?.durationMonths||1))));
 if(!SCENARIO_LAB_TYPES[type])return {ok:false,code:'TYPE',message:'Neznámý typ scénáře.'};
 if(!Number.isFinite(amount)||amount<=0)return {ok:false,code:'AMOUNT',message:'Zadej kladnou částku.'};
 const inputCurrency=String(input?.currency||currency).toUpperCase();if(inputCurrency!==currency)return {ok:false,code:'FX_UNSUPPORTED',message:`Scénář je v ${inputCurrency}, ale primární cashflow je v ${currency}. Bez skutečného FX kurzu je nesčítám.`};
 const out=[],sign=['ONE_OFF_INCOME','MONTHLY_INCOME'].includes(type)?1:-1,label=SCENARIO_LAB_TYPES[type];
 if(['ONE_OFF_EXPENSE','ONE_OFF_INCOME'].includes(type)){if(date>=start&&date<=end)out.push({id:'scenario',label,amount:sign*amount,at:startDay(date).getTime(),source:'SCENARIO'})}
 else if(['MONTHLY_EXPENSE','MONTHLY_INCOME','MONTHLY_INVESTMENT'].includes(type)){let d=startDay(date);while(d<start)d=addMonthsSafe(d,1);while(d<=end){out.push({id:'scenario',label,amount:sign*amount,at:d.getTime(),source:'SCENARIO'});d=addMonthsSafe(d,1)}}
 else if(type==='INCOME_LOSS'){let d=startDay(date);for(let i=0;i<duration&&d<=end;i++){if(d>=start)out.push({id:`scenario-${i}`,label:`Výpadek příjmu ${i+1}/${duration}`,amount:-amount,at:d.getTime(),source:'SCENARIO'});d=addMonthsSafe(d,1)}}
 return {ok:true,type,label,amount,currency,inputCurrency,durationMonths:duration,events:out};
}

function calculate(s,scenario=null,now=new Date(),days=365){
 const start=startDay(now),end=new Date(start.getTime()+days*DAY),currency=String(s.financePlan?.currency||'CZK').toUpperCase(),cash=n(s.financePlan?.cashNow),reserve=n(s.financePlan?.reserveFloor),events=existingEvents(s,start,end,currency);
 if(scenario){const built=scenarioEvents(scenario,start,end,currency);if(!built.ok)return built;events.push(...built.events)}
 events.sort((a,b)=>a.at-b.at||String(a.label).localeCompare(String(b.label),'cs'));
 let balance=cash,minBalance=cash,below=cash<reserve?start.getTime():null;const timeline=[],monthMap=new Map();
 for(const e of events){balance+=e.amount;if(balance<minBalance)minBalance=balance;if(below===null&&balance<reserve)below=e.at;timeline.push({...e,balance});const d=new Date(e.at),key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;monthMap.set(key,balance)}
 const months=[];let cursor=new Date(start.getFullYear(),start.getMonth(),1),running=cash,idx=0;
 for(let i=0;i<12;i++){
  const next=new Date(cursor.getFullYear(),cursor.getMonth()+1,1),limit=next.getTime()-1;
  while(idx<timeline.length&&timeline[idx].at<=limit){running=timeline[idx].balance;idx++}
  months.push({month:`${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}`,balance:running});cursor=next;
 }
 const inflow=events.filter(x=>x.amount>0).reduce((z,x)=>z+x.amount,0),outflow=Math.abs(events.filter(x=>x.amount<0).reduce((z,x)=>z+x.amount,0));
 return {ok:true,days,currency,cash,reserve,minBalance,endBalance:balance,belowReserveDate:below===null?null:dateKey(below),headroom:Math.min(cash-reserve,minBalance-reserve),inflow,outflow,months,events:timeline,scenarioEvents:events.filter(x=>x.source==='SCENARIO').length,status:below!==null?'RISK':minBalance<reserve*1.15?'TIGHT':'OK'};
}

export function scenarioLab(s={},input={},now=new Date()){
 const base=calculate(s,null,now,365),sim=calculate(s,input,now,365);if(!sim.ok)return {...sim,base,note:scenarioLabNote};
 const delta={minBalance:sim.minBalance-base.minBalance,endBalance:sim.endBalance-base.endBalance,headroom:sim.headroom-base.headroom};
 let verdict='OK',reason='Scénář podle známého cashflow neporušuje rezervní minimum.';
 if(sim.status==='RISK'){verdict='BLOCK';reason=`Scénář prolomí rezervní minimum${sim.belowReserveDate?` od ${sim.belowReserveDate}`:''}.`}
 else if(sim.status==='TIGHT'){verdict='CAUTION';reason='Scénář nechá cashflow jen těsně nad rezervním minimem.'}
 else if(delta.headroom<0){verdict='CAUTION';reason='Scénář snižuje bezpečný prostor, ale podle známých dat rezervu neporuší.'}
 else if(delta.headroom>0){verdict='IMPROVES';reason='Scénář podle známých dat zvyšuje bezpečný prostor.'}
 return {ok:true,base,sim,delta,verdict,reason,type:String(input.type||'ONE_OFF_EXPENSE').toUpperCase(),typeLabel:SCENARIO_LAB_TYPES[String(input.type||'ONE_OFF_EXPENSE').toUpperCase()],amount:Math.abs(Number(input.amount||0)),date:dateKey(validDate(input.date)||now),durationMonths:Math.max(1,Math.floor(Number(input.durationMonths||1))),note:scenarioLabNote};
}
