const DAY=86400000;
const active=x=>String(x?.status||'ACTIVE').toUpperCase()!=='ARCHIVED';
const flow=x=>String(x?.workflow||'HOLD').toUpperCase();
const hasNum=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const n=v=>Number(v||0);
const pad=v=>String(v).padStart(2,'0');
const dateKey=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const monthKey=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}`;
const ts=v=>{const t=v instanceof Date?v.getTime():new Date(v||0).getTime();return Number.isFinite(t)?t:null};
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('cs-CZ').trim();
const FINANCIAL_CATEGORIES=new Set(['PAYMENT','SUBSCRIPTION','UTILITY','LOAN','HOME','FEE','INSURANCE','VEHICLE','OTHER']);
const CADENCE_MONTHS={MONTHLY:1,QUARTERLY:3,SEMIANNUAL:6,YEARLY:12};

function startDay(v){const d=new Date(v);if(!Number.isFinite(d.getTime()))return null;d.setHours(0,0,0,0);return d}
function addMonthsSafe(v,months){const d=startDay(v);if(!d)return null;const wanted=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+months);const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(wanted,last));return d}
function bounds(now=new Date()){
 const r=new Date(now),from=new Date(r.getFullYear(),r.getMonth()+1,1),to=new Date(r.getFullYear(),r.getMonth()+13,1),months=[];
 for(let i=0;i<12;i++){const a=new Date(from.getFullYear(),from.getMonth()+i,1),z=new Date(from.getFullYear(),from.getMonth()+i+1,1);months.push({key:monthKey(a),from:a,to:z});}
 return {from,to,months,fromKey:dateKey(from),toExclusiveKey:dateKey(to)};
}
const inWindow=(v,b)=>{const t=ts(v);return t!==null&&t>=b.from.getTime()&&t<b.to.getTime()};
const personalCalendar=e=>e?.personal===true||norm(e?.area).includes('osob')||norm(e?.calendar).includes('osob')||norm(e?.source).includes('personal');

function annualOccurrence(raw,b){
 const d=startDay(raw);if(!d)return null;const month=d.getMonth(),day=d.getDate();
 for(let y=b.from.getFullYear();y<=b.to.getFullYear();y++){
  const last=new Date(y,month+1,0).getDate(),candidate=new Date(y,month,Math.min(day,last));
  if(candidate>=b.from&&candidate<b.to)return candidate;
 }
 return null;
}

function recurringDates(raw,cadence,b){
 const base=startDay(raw);if(!base)return[];const c=String(cadence||'ONCE').toUpperCase(),out=[];
 if(c==='ONCE'||(!CADENCE_MONTHS[c]&&c!=='WEEKLY'))return inWindow(base,b)?[base]:[];
 if(c==='WEEKLY'){
  let cur=base;while(cur<b.from)cur=new Date(cur.getTime()+7*DAY);
  while(cur<b.to){out.push(cur);cur=new Date(cur.getTime()+7*DAY)}return out;
 }
 let cur=base;while(cur<b.from){cur=addMonthsSafe(cur,CADENCE_MONTHS[c]);if(!cur)break}
 while(cur&&cur<b.to){out.push(cur);cur=addMonthsSafe(cur,CADENCE_MONTHS[c])}
 return out;
}

function buildMonths(b){return b.months.map(m=>({key:m.key,eventCount:0,milestoneCount:0,ticketCount:0,goalTargetCount:0,moneyByCurrency:{},goalPlanByCurrency:{},events:[]}));}
function addMoney(bucket,currency,amount){
 const c=String(currency||'CZK').toUpperCase();bucket.moneyByCurrency[c]=bucket.moneyByCurrency[c]||{inflow:0,outflow:0,net:0};
 if(amount>=0)bucket.moneyByCurrency[c].inflow+=amount;else bucket.moneyByCurrency[c].outflow+=Math.abs(amount);bucket.moneyByCurrency[c].net=bucket.moneyByCurrency[c].inflow-bucket.moneyByCurrency[c].outflow;
}
function addEvent(ctx,event){
 const t=ts(event.at);if(t===null||t<ctx.b.from.getTime()||t>=ctx.b.to.getTime())return;
 const key=`${event.key}|${dateKey(new Date(t))}`;if(ctx.seen.has(key))return;ctx.seen.add(key);
 const x={...event,at:new Date(t).toISOString(),date:dateKey(new Date(t)),month:monthKey(new Date(t))};ctx.events.push(x);
 const bucket=ctx.monthMap.get(x.month);if(!bucket)return;bucket.eventCount++;bucket.events.push(x);
 if(x.milestone){bucket.milestoneCount++;ctx.milestones.push(x)}
 if(x.domain==='Vstupenky')bucket.ticketCount++;
 if(x.domain==='Cíle')bucket.goalTargetCount++;
 if(hasNum(x.amount)&&Number(x.amount)!==0)addMoney(bucket,x.currency,Number(x.amount));
}

function addStoredDeadlines(s,ctx){
 for(const x of (s.personalAdmin?.items||[]).filter(active)){
  const title=x.title||'Osobní položka',id=x.id||title,cat=String(x.category||'OTHER').toUpperCase(),currency=String(x.currency||'CZK').toUpperCase();
  if(FINANCIAL_CATEGORIES.has(cat)&&x.nextDue){
   if(hasNum(x.amount)&&Number(x.amount)>0){for(const d of recurringDates(x.nextDue,x.cadence,ctx.b))addEvent(ctx,{key:`admin:${id}:payment:${dateKey(d)}`,title,at:d,domain:'Platby',type:'Známá platba',target:'home',mode:cat==='INSURANCE'?'insurance':'payments',source:'OSOBNÍ ADMINISTRATIVA',amount:-Math.abs(Number(x.amount)),currency,recurring:true});}
   else ctx.gaps.missingAmount++;
  }else if(FINANCIAL_CATEGORIES.has(cat)&&String(x.cadence||'ONCE').toUpperCase()!=='ONCE'&&!x.nextDue)ctx.gaps.missingDate++;
  const deadlines=[
   ['notice',x.noticeDate||x.insurance?.noticeDate,'Smlouvy','Výpovědní termín',cat==='INSURANCE'?'insurance':'contracts'],
   ['renewal',x.renewalDate||x.endDate||x.insurance?.renewalDate||x.insurance?.endDate,cat==='INSURANCE'?'Pojištění':'Smlouvy','Výročí / expirace',cat==='INSURANCE'?'insurance':'contracts'],
   ['doc-expiry',x.document?.expiryDate||((cat==='DOCUMENT')?(x.renewalDate||x.endDate):null),'Doklady','Expirace','documents'],
   ['doc-reminder',x.document?.reminderDate,'Doklady','Začít řešit','documents']
  ];
  for(const [k,at,domain,type,mode] of deadlines)if(inWindow(at,ctx.b))addEvent(ctx,{key:`admin:${id}:${k}`,title,at,domain,type,target:'home',mode,source:'OSOBNÍ ADMINISTRATIVA',milestone:true});
 }
 for(const x of (s.assetBook?.items||[]).filter(active)){
  const title=x.title||'Majetek',id=x.id||title,domain=x.kind==='VEHICLE'?'Auto':'Dům';
  if(inWindow(x.nextServiceAt,ctx.b))addEvent(ctx,{key:`asset:${id}:service`,title,at:x.nextServiceAt,domain,type:'Servis / kontrola',target:'home',mode:'dashboard',source:'ASSET BOOK',milestone:true});
  if(inWindow(x.warrantyUntil,ctx.b))addEvent(ctx,{key:`asset:${id}:warranty`,title,at:x.warrantyUntil,domain,type:'Konec záruky',target:'home',mode:'dashboard',source:'ASSET BOOK',milestone:true});
 }
 for(const m of (s.familyHome?.members||[]).filter(active)){
  const id=m.id||m.name||'family',birthday=annualOccurrence(m.birthday,ctx.b),anniversary=annualOccurrence(m.anniversary,ctx.b);
  if(birthday)addEvent(ctx,{key:`family:${id}:birthday`,title:`${m.name||'Rodina'} · narozeniny`,at:birthday,domain:'Rodina',type:'Narozeniny',target:'home',mode:'family',source:'RODINA',milestone:true});
  if(anniversary)addEvent(ctx,{key:`family:${id}:anniversary`,title:`${m.name||'Rodina'} · výročí`,at:anniversary,domain:'Rodina',type:'Výročí',target:'home',mode:'family',source:'RODINA',milestone:true});
 }
 for(const t of s.tasks||[]){if(t.status==='HOTOVO'||!norm(t.area).includes('osob')||!inWindow(t.due,ctx.b))continue;addEvent(ctx,{key:`task:${t.id||t.title}`,title:t.title||'Osobní úkol',at:t.due,domain:'Osobní',type:'Úkol',target:'today',mode:null,source:'OSOBNÍ ÚKOL',milestone:true});}
 for(const e of s.calendar?.events||[]){if(!personalCalendar(e))continue;const at=e?.start?.dateTime||e?.start?.date||e?.start||e?.date||e?.begin||e?.dtstart||null;if(!inWindow(at,ctx.b))continue;addEvent(ctx,{key:`calendar:${e.id||e.uid||e.title||e.summary||at}`,title:e.title||e.summary||'Osobní kalendář',at,domain:'Kalendář',type:'Událost',target:'today',mode:null,source:'OSOBNÍ KALENDÁŘ',milestone:true});}
}

function addManualCashflow(s,ctx){
 for(const x of s.financePlan?.cashflow||[]){if(!x||x.active===false||!hasNum(x.amount)||Number(x.amount)===0||!x.date)continue;for(const d of recurringDates(x.date,x.cadence,ctx.b))addEvent(ctx,{key:`cashflow:${x.id||x.label||'manual'}:${dateKey(d)}`,title:x.label||'Cashflow',at:d,domain:'Peníze',type:Number(x.amount)>0?'Známý příjem':'Známý výdaj',target:'money',mode:null,source:'RUČNÍ CASHFLOW',amount:Number(x.amount),currency:String(x.currency||s.financePlan?.currency||'CZK').toUpperCase(),recurring:String(x.cadence||'once').toLowerCase()!=='once'});}
}

function addGoals(s,ctx){
 for(const g of (s.personalGoals?.items||[]).filter(active)){
  const id=g.id||g.title||'goal',currency=String(g.currency||'CZK').toUpperCase(),target=hasNum(g.targetAmount)?Math.max(0,Number(g.targetAmount)):null,saved=hasNum(g.savedAmount)?Math.max(0,Number(g.savedAmount)):0,remaining=target===null?null:Math.max(0,target-saved),targetTs=ts(g.targetDate);
  if(targetTs!==null&&inWindow(targetTs,ctx.b))addEvent(ctx,{key:`goal:${id}:target`,title:g.title||'Cíl',at:g.targetDate,domain:'Cíle',type:'Cílové datum',target:'money',mode:null,source:'CÍLE',milestone:true});
  const monthly=hasNum(g.monthlyContribution)?Math.max(0,Number(g.monthlyContribution)):0;if(monthly<=0||remaining===0)continue;
  for(const bucket of ctx.months){const m=ctx.b.months.find(x=>x.key===bucket.key);if(!m)continue;if(targetTs!==null&&m.from.getTime()>targetTs)continue;bucket.goalPlanByCurrency[currency]=(bucket.goalPlanByCurrency[currency]||0)+monthly;ctx.goalPlanByCurrency[currency]=(ctx.goalPlanByCurrency[currency]||0)+monthly;}
 }
}

function addTickets(s,ctx){
 for(const x of s.ticketBook?.items||[]){if(!['HOLD','LISTED'].includes(flow(x))||!inWindow(x.date,ctx.b))continue;const currency=String(x.currency||s.ticketBook?.currency||'CZK').toUpperCase(),buy=Math.max(0,n(x.buy));addEvent(ctx,{key:`ticket:${x.id||x.name||x.date}`,title:x.name||'Vstupenka',at:x.date,domain:'Vstupenky',type:'Akce',target:'tickets',mode:null,source:'VSTUPENKY',milestone:true,qty:Math.max(1,n(x.qty)||1),ticketCapital:buy,currency});if(buy>0)ctx.ticketCapitalByCurrency[currency]=(ctx.ticketCapitalByCurrency[currency]||0)+buy;}
}

function summarize(ctx){
 ctx.events.sort((a,b)=>ts(a.at)-ts(b.at)||String(a.title).localeCompare(String(b.title),'cs'));ctx.milestones.sort((a,b)=>ts(a.at)-ts(b.at)||String(a.title).localeCompare(String(b.title),'cs'));
 const totalInflowByCurrency={},totalOutflowByCurrency={};
 for(const m of ctx.months)for(const [c,v] of Object.entries(m.moneyByCurrency)){totalInflowByCurrency[c]=(totalInflowByCurrency[c]||0)+v.inflow;totalOutflowByCurrency[c]=(totalOutflowByCurrency[c]||0)+v.outflow;}
 const peaksByCurrency={};for(const c of new Set(ctx.months.flatMap(m=>Object.keys(m.moneyByCurrency)))){let best=null;for(const m of ctx.months){const out=m.moneyByCurrency[c]?.outflow||0;if(!best||out>best.outflow)best={currency:c,month:m.key,outflow:out};}if(best&&best.outflow>0)peaksByCurrency[c]=best;}
 const hotMonths=ctx.months.filter(x=>x.eventCount>0).sort((a,b)=>b.milestoneCount-a.milestoneCount||b.eventCount-a.eventCount||a.key.localeCompare(b.key)).slice(0,3).map(x=>({key:x.key,eventCount:x.eventCount,milestoneCount:x.milestoneCount,ticketCount:x.ticketCount}));
 return {totalInflowByCurrency,totalOutflowByCurrency,peaksByCurrency,hotMonths};
}

export function yearAheadRadar(s={},now=new Date()){
 const b=bounds(now),months=buildMonths(b),ctx={b,months,monthMap:new Map(months.map(x=>[x.key,x])),events:[],milestones:[],seen:new Set(),gaps:{missingAmount:0,missingDate:0},goalPlanByCurrency:{},ticketCapitalByCurrency:{}};
 addStoredDeadlines(s,ctx);addManualCashflow(s,ctx);addGoals(s,ctx);addTickets(s,ctx);const summary=summarize(ctx);
 const monthsWithEvents=months.filter(x=>x.eventCount>0).length,status=ctx.milestones.length||ctx.events.length?'PLAN':'CLEAR';
 return {period:{from:b.fromKey,toExclusive:b.toExclusiveKey,months:12},status,months,events:ctx.events,milestones:ctx.milestones,coverage:{monthsWithEvents,eventCount:ctx.events.length,milestoneCount:ctx.milestones.length,missingAmountItems:ctx.gaps.missingAmount,missingDateItems:ctx.gaps.missingDate},goalPlanByCurrency:ctx.goalPlanByCurrency,ticketCapitalByCurrency:ctx.ticketCapitalByCurrency,...summary,note:'Year Ahead Radar ukazuje 12 celých budoucích měsíců jen z uložených termínů a z opakování, které mají explicitní periodicitu. Peníze i cíle zůstávají oddělené po měnách; žádný FX kurz, neznámý příjem, neznámý výdaj ani budoucí událost se nevymýšlí. Nic se automaticky neplatí, nepřevádí, neinvestuje ani neobchoduje.'};
}
