import {decisionCenter36,decisionAnalytics36} from './decisionCenter36.js';
import {todayBrain34} from './todayBrain34.js';

const n=v=>Number(v||0);
const upper=v=>String(v||'').toUpperCase();
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,Number(v)||0));
const round=v=>Math.round(n(v));
const days=(raw,now=new Date())=>{const t=Date.parse(raw||0);return Number.isFinite(t)?Math.ceil((t-now.getTime())/86400000):null};
const activeTicket=x=>!['SOLD','PAYOUT RECEIVED','CANCELLED'].includes(upper(x?.workflow));
const safeArr=v=>Array.isArray(v)?v:[];

export function confidenceEngine40(row={},state={}){
 let score=45,reasons=[];
 if(row.blocked){score=18;reasons.push('bezpečnostní blokace / stará data')}
 else{
  if(/FRESH|OFICIÁLNÍ|SEC/.test(upper(row.evidence))){score+=22;reasons.push('silný/čerstvý podklad')}
  else if(/SNAPSHOT|IMPORT/.test(upper(row.evidence))){score+=12;reasons.push('použitelný snapshot/import')}
  else{score-=8;reasons.push('slabší podklady')}
  const samples=n(row.learning?.samples);
  if(samples>=5){score+=12;reasons.push(`${samples} historických výsledků`)}
  else if(samples>=3){score+=7;reasons.push(`${samples} historické výsledky`)}
  if(n(row.priority)>=90)score+=5;
  if(n(row.impactCzk)>=100000){score-=8;reasons.push('vyšší kapitál v sázce')}
 }
 return {score:clamp(score),label:score>=80?'VYSOKÁ':score>=60?'STŘEDNÍ':score>=40?'OMEZENÁ':'NÍZKÁ',reasons};
}

export function riskEngine40(row={}){
 let doing=20,waiting=20;
 if(row.blocked)doing=95;
 if(['BUY','SELL','TRIM','REPRICE','SELL_NOW','LIST_NOW'].includes(upper(row.action)))doing+=20;
 if(n(row.impactCzk)>=50000)doing+=15;
 if(n(row.impactCzk)>=150000)doing+=15;
 waiting=Math.max(waiting,n(row.priority)-15);
 if(row.urgency==='TEĎ')waiting+=12;
 return {doing:clamp(doing),waiting:clamp(waiting),balance:clamp(waiting-doing,-100,100),label:waiting>doing+20?'RIZIKO NEČINNOSTI':doing>waiting+20?'RIZIKO PROVEDENÍ':'VYVÁŽENÉ'};
}

export function opportunityCost40(row={}){
 const impact=Math.max(0,n(row.impactCzk)),p=clamp(row.priority)/100;
 const horizon=row.urgency==='TEĎ'?0.025:row.urgency==='DNES'?0.015:0.0075;
 return {czk:impact?round(impact*p*horizon):null,kind:impact?'ORIENTAČNÍ KAPITÁLOVÝ DOPAD':'NEMĚŘITELNÉ',note:'Nejde o garantovanou ztrátu; jen o hrubý signál ceny odkladu.'};
}

export function explainDecision40(row={},state={}){
 const confidence=confidenceEngine40(row,state),risk=riskEngine40(row),cost=opportunityCost40(row);
 return {why:row.reason||'Doporučení vzniklo z aktuálních pravidel a dostupných dat.',whyNow:`Priorita ${round(row.priority)}/100 · ${row.urgency||'SLEDOVAT'}.`,evidence:row.evidence||'Bez explicitního zdroje',confidence,risk,cost,changeMind:row.blocked?'Nový čerstvý import může doporučení změnit.':'Novější data, změna ceny/termínu nebo nový výsledek mohou doporučení přepočítat.'};
}

export function whatIfSimulator40(row={},deltaPct=-10){
 const impact=Math.max(0,n(row.impactCzk)),delta=Number(deltaPct)||0;
 return {deltaPct:delta,estimatedCzk:impact?round(impact*Math.abs(delta)/100):null,direction:delta<0?'Snížení expozice/ceny':'Zvýšení expozice/ceny',warning:'Simulace je aritmetická, ne predikce trhu.'};
}

export function guardrails40(state={},row={}){
 const cash=n(state.financePlan?.cashNow),floor=n(state.financePlan?.reserveFloor),issues=[];
 if(row.domain==='XTB'&&upper(row.action)==='BUY'&&cash<floor)issues.push('Hotovost je pod rezervní podlahou.');
 if(row.blocked)issues.push('Rozhodnutí je blokované kvalitou/čerstvostí dat.');
 if(row.domain==='VSTUPENKY'&&n(row.suggestedPrice)>0&&n(row.breakEven)>0&&n(row.suggestedPrice)<n(row.breakEven))issues.push('Navržená cena je pod break-even.');
 return {ok:!issues.length,issues,hardBlock:issues.some(x=>/blokované|rezervní/.test(x))};
}

export function universalInbox40(state={}){
 const personal=safeArr(state.personalInbox?.items).filter(x=>upper(x.status)!=='DONE');
 const generic=safeArr(state.inbox).filter(x=>upper(x.status)!=='DONE');
 const rows=[...generic.map(x=>({id:x.id,title:x.title||x.text||'Inbox',source:'INBOX',target:x.target||'today'})),...personal.map(x=>({id:x.id,title:x.title||x.text||'Osobní inbox',source:'PERSONAL',target:x.target||'home'}))];
 return {rows:rows.slice(0,8),count:rows.length,unclassified:rows.filter(x=>!x.target||x.target==='today').length};
}

export function entityGraph40(state={}){
 const people=new Set(),projects=safeArr(state.projects),tasks=safeArr(state.tasks),deleg=safeArr(state.delegations),tickets=safeArr(state.ticketBook?.items);
 deleg.forEach(x=>{if(x.person)people.add(String(x.person))});
 const links=[];
 tasks.forEach(t=>{if(t.projectId)links.push({from:`task:${t.id}`,to:`project:${t.projectId}`,type:'TASK_PROJECT'})});
 deleg.forEach(d=>{if(d.person)links.push({from:`deleg:${d.id||d.title}`,to:`person:${d.person}`,type:'WAITING_PERSON'})});
 tickets.forEach(t=>{if(t.eventName||t.name)links.push({from:`ticket:${t.id}`,to:`event:${t.eventName||t.name}`,type:'TICKET_EVENT'})});
 return {nodes:people.size+projects.length+tasks.length+deleg.length+tickets.length,links:links.length,people:people.size,projects:projects.length};
}

export function directorIntelligence40(state={},now=new Date()){
 const projects=safeArr(state.projects).filter(p=>!/hotov|archiv/i.test(p.status||'')),tasks=safeArr(state.tasks).filter(t=>upper(t.status)!=='HOTOVO');
 const overdue=tasks.filter(t=>t.due&&days(t.due,now)<0),near=tasks.filter(t=>{const d=days(t.due,now);return d!==null&&d>=0&&d<=7});
 const risky=projects.filter(p=>['HIGH','MEDIUM'].includes(upper(p.risk)));
 return {projects:projects.length,openTasks:tasks.length,overdue:overdue.length,next7d:near.length,riskyProjects:risky.length,score:clamp(overdue.length*12+risky.length*10+near.length*3)};
}

export function waitingAnalytics40(state={},now=new Date()){
 const rows=safeArr(state.delegations).filter(x=>upper(x.status||'WAITING')!=='DONE').map(x=>{
  const at=Date.parse(x.lastContactAt||x.updatedAt||x.createdAt||0),age=Number.isFinite(at)?Math.floor((now-at)/86400000):null;
  return {...x,ageDays:age,priority:age===null?40:clamp(35+age*4)};
 }).sort((a,b)=>b.priority-a.priority);
 const byPerson={}; rows.forEach(x=>{const p=x.person||'Neurčeno';byPerson[p]=(byPerson[p]||0)+1});
 return {rows:rows.slice(0,8),count:rows.length,oldest:rows[0]||null,byPerson};
}

export function earlyWarning40(state={},now=new Date()){
 const out=[],d=directorIntelligence40(state,now),w=waitingAnalytics40(state,now);
 if(d.overdue)out.push({domain:'PRÁCE',severity:clamp(70+d.overdue*5),title:`${d.overdue} úkolů po termínu`});
 if(d.riskyProjects)out.push({domain:'PRÁCE',severity:clamp(65+d.riskyProjects*5),title:`${d.riskyProjects} rizikové projekty`});
 if(w.oldest?.ageDays>=7)out.push({domain:'WAITING',severity:clamp(60+w.oldest.ageDays*3),title:`Nejdelší čekání ${w.oldest.ageDays} dní`});
 const cash=n(state.financePlan?.cashNow),floor=n(state.financePlan?.reserveFloor);if(floor>0&&cash<floor)out.push({domain:'PENÍZE',severity:96,title:'Hotovost pod rezervní podlahou'});
 return out.sort((a,b)=>b.severity-a.severity);
}

export function moneyBrain40(state={}){
 const cash=n(state.financePlan?.cashNow),floor=n(state.financePlan?.reserveFloor),planned=n(state.financePlan?.plannedInvestment);
 const accounts=Object.values(state.xtbHub?.accounts||{}),xtb=accounts.reduce((s,a)=>s+n(a.value),0)||n(state.xtbReport?.czkValue);
 const reserveGap=Math.max(0,floor-cash),investable=reserveGap>0?0:Math.max(0,planned);
 return {cash:round(cash),reserveFloor:round(floor),reserveGap:round(reserveGap),planned:round(planned),investable:round(investable),xtb:round(xtb),status:reserveGap>0?'STOP NOVÉ INVESTICE':'OK'};
}

export function ticketPortfolioManager40(state={},now=new Date()){
 const rows=safeArr(state.ticketBook?.items).filter(activeTicket),capital=rows.reduce((s,x)=>s+n(x.buy),0);
 const due14=rows.filter(x=>{const d=days(x.date,now);return d!==null&&d>=0&&d<=14}).length;
 const listed=rows.filter(x=>upper(x.workflow)==='LISTED').length;
 const sold=safeArr(state.ticketBook?.items).filter(x=>upper(x.workflow)==='SOLD'),realized=sold.reduce((s,x)=>s+(n(x.sell)-n(x.buy)),0);
 return {positions:rows.length,capital:round(capital),listed,due14,realized:round(realized),risk:clamp(due14*12+(rows.length-listed)*5)};
}

export function performanceAttribution40(state={}){
 const trades=safeArr(state.tradeJournal?.trades).filter(x=>Number.isFinite(Number(x.realized))),investment=trades.reduce((s,x)=>s+n(x.realized),0);
 const sold=safeArr(state.ticketBook?.items).filter(x=>Number.isFinite(Number(x.sell))&&n(x.sell)>0),tickets=sold.reduce((s,x)=>s+n(x.sell)-n(x.buy),0);
 const total=investment+tickets;
 return {investment:round(investment),tickets:round(tickets),total:round(total),leader:investment===tickets?'SHODA':investment>tickets?'INVESTICE':'VSTUPENKY'};
}

export function forecastEngine40(state={},now=new Date()){
 const windows=[7,30,90].map(h=>{
  const taskDeadlines=safeArr(state.tasks).filter(t=>{const d=days(t.due,now);return d!==null&&d>=0&&d<=h&&upper(t.status)!=='HOTOVO'}).length;
  const events=safeArr(state.ticketBook?.items).filter(x=>{const d=days(x.date,now);return d!==null&&d>=0&&d<=h&&activeTicket(x)}).length;
  const calendar=safeArr(state.calendar?.events).filter(x=>{const d=days(x.start||x.date,now);return d!==null&&d>=0&&d<=h}).length;
  return {days:h,taskDeadlines,events,calendar,pressure:clamp(taskDeadlines*8+events*10+calendar*2)};
 });
 return {windows};
}

export function morningBrief40(state={},now=new Date()){
 const today=todayBrain34(state,now),decisions=decisionCenter36(state,now),warnings=earlyWarning40(state,now);
 const top=[...safeArr(today.rows),...safeArr(decisions.rows)].sort((a,b)=>n(b.priority)-n(a.priority)).slice(0,3);
 return {top,warnings:warnings.slice(0,3),headline:top.length?`Dnes mají největší smysl ${top.length} konkrétní kroky.`:'Dnes není nic kritického.'};
}

export function eveningReview40(state={},now=new Date()){
 const memories=safeArr(state.decisionMemory36?.items),todayKey=now.toISOString().slice(0,10),done=memories.filter(x=>x.status==='DONE'&&String(x.at||'').startsWith(todayKey));
 const pending=safeArr(state.tasks).filter(t=>upper(t.status)!=='HOTOVO'&&t.due&&days(t.due,now)<=0);
 return {done:done.length,pending:pending.length,reviewNeeded:done.filter(x=>!x.outcome).length,message:`Hotovo ${done.length} rozhodnutí · ${pending.length} otevřených termínů k přenosu.`};
}

export function copilot40(state={},query='',now=new Date()){
 const q=String(query||'').toLowerCase(),cmd=commandCenter40(state,now);
 if(/invest|25k|pen[ií]ze|cash/.test(q))return {answer:`Money Brain: ${cmd.money.status}. Investovatelný plán ${cmd.money.investable.toLocaleString('cs-CZ')} Kč; rezerva gap ${cmd.money.reserveGap.toLocaleString('cs-CZ')} Kč.`,target:'money'};
 if(/vstup|ticket|l[ií]st/.test(q))return {answer:`Ticket portfolio: ${cmd.tickets.positions} aktivních pozic, kapitál ${cmd.tickets.capital.toLocaleString('cs-CZ')} Kč, ${cmd.tickets.due14} akcí do 14 dnů.`,target:'tickets'};
 if(/ček|urg|komu/.test(q))return {answer:cmd.waiting.oldest?`Nejdéle čekáš ${cmd.waiting.oldest.ageDays??'?'} dní na ${cmd.waiting.oldest.person||cmd.waiting.oldest.title||'položku'}.`:'Na nikoho kriticky nečekáš.',target:'waiting'};
 const x=cmd.top[0];return {answer:x?`Teď bych řešil: ${x.title}. Priorita ${round(x.priority)}/100.`:'Teď není nic kritického.',target:x?.target||'today'};
}

export function commandCenter40(state={},now=new Date()){
 const decisions=decisionCenter36(state,now),today=todayBrain34(state,now),money=moneyBrain40(state),tickets=ticketPortfolioManager40(state,now),director=directorIntelligence40(state,now),waiting=waitingAnalytics40(state,now),warnings=earlyWarning40(state,now),forecast=forecastEngine40(state,now),inbox=universalInbox40(state),graph=entityGraph40(state),performance=performanceAttribution40(state),analytics=decisionAnalytics36(state);
 const enriched=safeArr(decisions.rows).map(row=>({...row,confidence:confidenceEngine40(row,state),risk:riskEngine40(row),opportunityCost:opportunityCost40(row),guardrails:guardrails40(state,row),explain:explainDecision40(row,state),whatIf:whatIfSimulator40(row,-10)}));
 const top=[...enriched,...safeArr(today.rows)].sort((a,b)=>n(b.priority)-n(a.priority)).slice(0,3);
 return {top,decisions:{...decisions,rows:enriched},money,tickets,director,waiting,warnings,forecast,inbox,graph,performance,analytics};
}

export function autopilot40(state={},now=new Date()){
 const command=commandCenter40(state,now),morning=morningBrief40(state,now),evening=eveningReview40(state,now);
 const status={money:command.money.status==='OK'?'OK':'POZOR',work:command.director.score>=70?'PROBLÉM':command.director.score>=40?'POZOR':'OK',tickets:command.tickets.risk>=70?'PROBLÉM':command.tickets.risk>=40?'POZOR':'OK',waiting:command.waiting.oldest?.ageDays>=7?'POZOR':'OK'};
 return {version:'40.0',command,morning,evening,status,contract:{autoTrade:false,autoReprice:false,autoSend:false,autoDelete:false,criticalActionsRequireConfirmation:true},note:'Autopilot 40 pouze sleduje, vyhodnocuje, vysvětluje a navrhuje. Kritické akce musí potvrdit uživatel.'};
}
