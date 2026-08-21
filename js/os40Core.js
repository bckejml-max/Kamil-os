import {todayBrain34} from './todayBrain34.js';
import {waitingFor35,nextFollowUpDate35,ensureWaiting35} from './followUp35.js';
import {emailWorkflow35} from './emailWorkflow35.js';
import {directorBriefing34} from './director34.js';
import {totalInvestmentPortfolio34,monthlyInvestmentPlan34} from './totalPortfolio34.js';
import {ticketMarketBrain34} from './ticketBrain34.js';

const DAY=86400000;
const n=v=>Number.isFinite(Number(v))?Number(v):0;
const upper=v=>String(v||'').trim().toUpperCase();
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('cs-CZ').replace(/[^a-z0-9@.]+/g,' ').trim();
const done=x=>['DONE','HOTOVO','CLOSED','ARCHIVED','RESOLVED','SOLD','PAYOUT RECEIVED'].includes(upper(x?.status||x?.workflow||''))||x?.done===true||x?.completed===true;
const ms=v=>{const d=new Date(v);return Number.isFinite(d.getTime())?d.getTime():0};
const iso=d=>new Date(d).toISOString();
const ymd=d=>iso(d).slice(0,10);
const diffDays=(future,now=new Date())=>{const a=ms(future),b=ms(now);if(!a||!b)return null;return Math.round((a-b)/DAY)};
const ageDays=(past,now=new Date())=>{const a=ms(past),b=ms(now);return a?Math.max(0,Math.floor((b-a)/DAY)):null};
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,n(v)));
const titleOf=x=>x?.title||x?.subject||x?.name||x?.eventName||'Položka';
const personOf=x=>x?.person||x?.assignee||x?.owner||x?.from||x?.sender||x?.contact||'';
const whenOf=x=>x?.receivedAt||x?.updatedAt||x?.createdAt||x?.date||x?.at||null;
const tone=p=>n(p)>=90?'bad':n(p)>=75?'warn':'good';

export const OS40_DEFAULT_PERMISSIONS={email:'PREPARE',waiting:'PREPARE',work:'PROPOSE',money:'PROPOSE',tickets:'PROPOSE',personal:'PROPOSE'};
export const OS40_PERMISSION_LEVELS=['DISPLAY','PROPOSE','PREPARE','APPROVE'];
export const OS40_DEFAULT_GOALS={broad:55,bond:20,satellite:25};

export function ensureOs40State(state={}){
 state.os40=state.os40&&typeof state.os40==='object'?state.os40:{};
 state.os40.permissions={...OS40_DEFAULT_PERMISSIONS,...(state.os40.permissions||{})};
 state.os40.portfolioGoals={...OS40_DEFAULT_GOALS,...(state.os40.portfolioGoals||{})};
 state.os40.ticketPriceHistory=Array.isArray(state.os40.ticketPriceHistory)?state.os40.ticketPriceHistory:[];
 state.os40.ticketDecisions=state.os40.ticketDecisions&&typeof state.os40.ticketDecisions==='object'?state.os40.ticketDecisions:{};
 state.os40.executiveDone=state.os40.executiveDone&&typeof state.os40.executiveDone==='object'?state.os40.executiveDone:{};
 state.os40.relationshipNotes=state.os40.relationshipNotes&&typeof state.os40.relationshipNotes==='object'?state.os40.relationshipNotes:{};
 return state.os40;
}

function freshness(raw,now=new Date(),fresh=2,stale=14){
 const age=ageDays(raw,now);if(age===null)return {age:null,score:35,label:'bez data'};
 if(age<=fresh)return {age,score:98,label:age===0?'dnes':`${age} d`};
 if(age>=stale)return {age,score:45,label:`${age} d`};
 return {age,score:Math.round(98-(age-fresh)*(53/Math.max(1,stale-fresh))),label:`${age} d`};
}

export function confidence40(item,state={},now=new Date()){
 const kind=upper(item?.kind||item?.sourceType||'');
 let score=70,why=[];
 if(/EMAIL|MAIL/.test(kind)){score=94;why.push('konkrétní zpráva')}
 else if(/WAIT|FOLLOW|REPLY/.test(kind)){score=item?.linkConfidence?clamp(item.linkConfidence):88;why.push(item?.linkConfidence?'thread/předmět/kontakt':'uložený follow-up')}
 else if(/DEADLINE|WORK|TASK|PROJECT/.test(kind)){score=92;why.push('uložený termín / pracovní stav')}
 else if(/TICKET/.test(kind)){const f=freshness(item?.snapshotAt||item?.listingSnapshotAt||state.meta?.currentTicketSnapshotAt,now,2,10);score=Math.round((f.score+78)/2);why.push(`ticket data ${f.label}`)}
 else if(/MONEY|INVEST|PORTFOLIO/.test(kind)){const f=freshness(state.xtbHub?.asOf||state.xtbHub?.updatedAt||state.xtbReport?.asOf,now,2,14);score=Math.round((f.score+(totalInvestmentPortfolio34(state).complete?92:50))/2);why.push(`XTB ${f.label}`,totalInvestmentPortfolio34(state).complete?'FX kompletní':'FX neúplné')}
 if(item?.priority>=95)score=Math.min(99,score+2);
 return {score:clamp(score),label:score>=88?'vysoká':score>=70?'střední':'nižší',why:why.join(' · ')||'kombinace uložených dat'};
}

function execItem({id,kind,title,reason,priority,target,sourceType,sourceId,action='OPEN',...rest},state,now){
 const x={id:id||`${sourceType||kind}:${sourceId||norm(title)}`,kind,title,reason,priority:clamp(priority),target,sourceType:sourceType||kind,sourceId:sourceId||id,action,...rest};
 const c=confidence40(x,state,now);return {...x,tone:tone(x.priority),confidence:c.score,confidenceLabel:c.label,confidenceWhy:c.why};
}

export function executiveInbox40(state={},now=new Date()){
 const out=[],mail=emailWorkflow35(state,now),waiting=waitingFor35(state,now),director=directorBriefing34(state,now),tickets=ticketMarketBrain34(state,now),today=todayBrain34(state,now),portfolio=totalInvestmentPortfolio34(state),budget=n(state.financePlan?.plannedInvestment)||25000,plan=monthlyInvestmentPlan34(state,budget);
 for(const x of mail.replies)out.push(execItem({kind:'REPLY',title:`Přišla odpověď · ${x.title}`,reason:x.reason,priority:96,target:'email',sourceType:'WAITING',sourceId:x.id,action:'CLOSE_WAITING',linkConfidence:x.linkConfidence},state,now));
 for(const x of mail.followUps)out.push(execItem({kind:'FOLLOW_UP',title:`Urgovat · ${x.title}`,reason:x.reason,priority:x.priority,target:'waiting',sourceType:'WAITING',sourceId:x.id,action:'FOLLOW_UP'},state,now));
 for(const x of mail.triage.filter(x=>x.priority>=78).slice(0,8))out.push(execItem({kind:'EMAIL',title:x.title,reason:x.reason,priority:x.priority,target:'email',sourceType:'EMAIL',sourceId:x.id,action:'TRIAGE',person:x.person},state,now));
 for(const x of director.top){if(['WAITING','INBOX'].includes(x.kind))continue;out.push(execItem({kind:x.kind==='DEADLINE'?'DEADLINE':'WORK',title:x.title,reason:x.detail+(x.days!==null?` · ${x.days<0?`${Math.abs(x.days)} d po termínu`:x.days===0?'dnes':`za ${x.days} d`}`:''),priority:x.priority,target:'director',sourceType:x.kind,sourceId:x.id,action:x.kind==='TASK'?'DONE_OR_OPEN':'OPEN'},state,now))}
 for(const x of tickets.rows.filter(x=>x.priority>=82).slice(0,6))out.push(execItem({kind:'TICKET',title:x.eventName,reason:x.reason,priority:x.priority,target:'tickets',sourceType:'TICKET',sourceId:x.ticketId,action:x.action,snapshotAt:x.listingSnapshotAt,suggestedPrice:x.suggestedPrice},state,now));
 if(!plan.ok&&budget>0)out.push(execItem({kind:'MONEY',title:'Investiční plán vyžaduje pozornost',reason:plan.message||plan.routing?.reason||'Plán nelze bezpečně spočítat.',priority:92,target:'money',sourceType:'MONEY',sourceId:'monthly-plan',action:'OPEN'},state,now));
 else if(plan.ok&&budget>0)out.push(execItem({kind:'MONEY',title:`Rozdělit další investici ${Math.round(budget).toLocaleString('cs-CZ')} Kč`,reason:`Společná alokace XTB + investice mimo XTB. Drift ${n(plan.beforeDriftPct).toFixed(1)} % → ${n(plan.afterDriftPct).toFixed(1)} %.`,priority:portfolio.driftPct>=12?83:63,target:'money',sourceType:'MONEY',sourceId:'monthly-plan',action:'OPEN'},state,now));
 for(const x of today.rows){if(out.some(y=>norm(y.title)===norm(x.title)))continue;out.push(execItem({kind:x.kind||'OS',title:x.title,reason:x.reason,priority:x.priority,target:x.target||'today',sourceType:'TODAY',sourceId:x.id||x.title,action:'OPEN'},state,now))}
 const hidden=state.os40?.executiveDone||{},seen=new Set(),rows=out.filter(x=>!hidden[x.id]).sort((a,b)=>b.priority-a.priority||b.confidence-a.confidence||a.title.localeCompare(b.title,'cs-CZ')).filter(x=>{const key=`${x.sourceType}|${norm(x.title)}`;if(seen.has(key))return false;seen.add(key);return true}).slice(0,30);
 return {rows,top:rows[0]||null,critical:rows.filter(x=>x.priority>=90).length,today:rows.filter(x=>x.priority>=75).length,mail,waiting,director,tickets,portfolio,plan,note:'Executive Inbox sjednocuje e-mail, Waiting For, pracovní termíny, projekty, vstupenky a finance. One-click akce mění jen data v Kamil OS; externí služby se bez dalšího potvrzení nemění.'};
}

const outbound=m=>upper(m?.direction)==='OUTBOUND'||m?.sent===true||upper(m?.folder)==='SENT';
const recipientOf=m=>Array.isArray(m?.to)?m.to.join(', '):m?.to||m?.recipient||m?.contact||'';
const asksForReply=m=>/pros(i|í)m|potvrd|dejte vědět|dej vědět|ozv|odpov|term[ií]n|pošl|posl|m[uů]žete|m[uů]žeš|čekám|schvál|zašli|zašlete|confirm|please|let me know|reply/i.test(`${m?.subject||''} ${m?.body||m?.snippet||m?.bodyPreview||''}`);
function linkedWaiting(state,m){const id=String(m?.id||''),thread=m?.threadId||m?.sourceThreadId||null,sub=norm(m?.subject||m?.title||'');return [...(state.directorBook?.waiting||[]),...(state.delegations||[])].some(x=>!done(x)&&((id&&String(x.sourceInboxId||x.sourceOutboundId||'')===id)||(thread&&String(x.sourceThreadId||x.threadId||'')===String(thread))||(sub.length>=8&&norm(x.subject||x.title||'')===sub)))}
export function autoWaitingCandidates40(state={},now=new Date()){
 return (state.inbox||[]).filter(m=>outbound(m)&&!done(m)&&asksForReply(m)&&!linkedWaiting(state,m)).map(m=>{const age=ageDays(whenOf(m),now);return {id:m.id||`out:${norm(titleOf(m))}:${whenOf(m)||''}`,title:titleOf(m),person:recipientOf(m),threadId:m.threadId||m.sourceThreadId||null,at:whenOf(m),ageDays:age,priority:clamp(80+(age||0)*3),reason:age===0?'Odesláno dnes a text očekává odpověď.':`Odesláno před ${age??'?'} d a text očekává odpověď.`,source:m}}).sort((a,b)=>b.priority-a.priority||ms(b.at)-ms(a.at));
}

function nextBusinessDay(date,days=1){const d=new Date(date);let left=Math.max(1,days);while(left>0){d.setDate(d.getDate()+1);const wd=d.getDay();if(wd!==0&&wd!==6)left--}return d}
function nextMonday(date){const d=new Date(date),add=(8-d.getDay())%7||7;d.setDate(d.getDate()+add);return d}
export function smartSnoozeOptions40(row={},now=new Date()){
 const opts=[{key:'tomorrow',label:'Zítra',date:new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,12)},{key:'next-workday',label:'Další pracovní den',date:nextBusinessDay(now,1)},{key:'3-workdays',label:'Za 3 pracovní dny',date:nextBusinessDay(now,3)},{key:'monday',label:'Příští pondělí',date:nextMonday(now)},{key:'week',label:'Za týden',date:new Date(now.getFullYear(),now.getMonth(),now.getDate()+7,12)}];
 const due=row.due||row.dueAt;if(due){const d=new Date(due);if(Number.isFinite(d.getTime())){d.setDate(d.getDate()-2);opts.push({key:'before-due',label:'2 dny před deadlinem',date:d})}}
 const seen=new Set();return opts.map(x=>({...x,date:ymd(x.date)})).filter(x=>{if(seen.has(x.date)||diffDays(x.date,now)<1)return false;seen.add(x.date);return true}).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
}

export function morningBriefing40(state={},now=new Date()){
 const exec=executiveInbox40(state,now),top=exec.rows.slice(0,3),mail=exec.mail,waiting=exec.waiting,tickets=exec.tickets,plan=exec.plan;
 const problem=top.find(x=>x.priority>=90)||null;
 return {top,problem,counts:{actions:exec.rows.filter(x=>x.priority>=75).length,waiting:waiting.total,replies:waiting.replies,followUps:waiting.dueNow,emails:mail.needsAction,tickets:tickets.rows.filter(x=>x.priority>=82).length},money:plan.ok?`Investiční plán připraven · ${Math.round(plan.budget).toLocaleString('cs-CZ')} Kč`:`Investice: ${plan.message||'zkontrolovat data'}`,summary:problem?`Nejdřív: ${problem.title}`:top.length?`Dnes začni: ${top[0].title}`:'Dnes není nic kritického.'};
}

export function eveningShutdown40(state={},now=new Date()){
 const exec=executiveInbox40(state,now),open=exec.rows.filter(x=>x.priority>=75).slice(0,8),tomorrow=open.filter(x=>x.priority<90),must=open.filter(x=>x.priority>=90);
 return {isEvening:now.getHours()>=17,must,tomorrow,openCount:open.length,summary:must.length?`${must.length} kritické věci by neměly zůstat bez rozhodnutí.`:open.length?`${open.length} položek můžeš uzavřít nebo přesunout na další pracovní den.`:'Den je z pohledu OS uzavřený.'};
}

function hhmm(d){return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`}
export function workdayPlan40(state={},now=new Date()){
 const exec=executiveInbox40(state,now),top=exec.rows.filter(x=>x.priority>=70),calendar=(state.calendar?.events||[]).filter(x=>{const raw=x.start||x.at||x.date;return raw&&ymd(raw)===ymd(now)}).sort((a,b)=>ms(a.start||a.at||a.date)-ms(b.start||b.at||b.date));
 const blocks=[],push=(start,end,label,kind,priority=50)=>blocks.push({start,end,label,kind,priority});
 push('08:30','09:00','Rychlý triage: mail + Waiting For','ADMIN',72);
 if(top[0])push('09:00','10:30',top[0].title,'FOCUS',top[0].priority);else push('09:00','10:30','Deep work na nejdůležitější zakázce','FOCUS',70);
 push('10:45','11:30',exec.waiting.dueNow?`Follow-upy: ${exec.waiting.dueNow} urgovat`:'E-maily a follow-upy','FOLLOW_UP',78);
 if(top[1])push('13:00','14:30',top[1].title,'FOCUS',top[1].priority);else push('13:00','14:30','Projektový blok','FOCUS',65);
 if(exec.plan.ok&&n(exec.plan.budget)>0)push('15:30','15:45','Finance: zkontrolovat investiční plán','MONEY',60);
 push('16:30','16:45','Shutdown: uzavřít / odložit otevřené věci','SHUTDOWN',65);
 const meetings=calendar.map(x=>({start:hhmm(new Date(x.start||x.at||x.date)),end:x.end?hhmm(new Date(x.end)):'',label:titleOf(x),kind:'CALENDAR',priority:80}));
 return {blocks,meetings,note:'Workday Planner je doporučená struktura dne; nic sám nevkládá do kalendáře.'};
}

export function delegationCenter40(state={},now=new Date()){
 const rows=(state.delegations||[]).filter(x=>!done(x)).map(x=>{const created=whenOf(x),age=ageDays(created,now),due=x.due||x.dueAt||x.deadline||null,days=due?diffDays(due,now):null,last=x.lastTouchAt||x.lastFollowUpAt||x.updatedAt||created,lastAge=ageDays(last,now),risk=(days!==null&&days<0)?'OVERDUE':lastAge!==null&&lastAge>=5?'STALE':days!==null&&days<=2?'DUE_SOON':'OK',priority=risk==='OVERDUE'?98:risk==='STALE'?86:risk==='DUE_SOON'?82:60;return {id:x.id,title:titleOf(x),person:personOf(x)||'neuvedeno',createdAt:created,ageDays:age,due,days,lastTouchAt:last,lastTouchAge:lastAge,risk,priority,reason:risk==='OVERDUE'?`Po termínu ${Math.abs(days)} d.`:risk==='STALE'?`Bez kontaktu ${lastAge} d.`:risk==='DUE_SOON'?`Termín ${days===0?'dnes':`za ${days} d`}.`:'Bez akutního problému.',source:x}}).sort((a,b)=>b.priority-a.priority);
 return {rows,overdue:rows.filter(x=>x.risk==='OVERDUE').length,stale:rows.filter(x=>x.risk==='STALE').length,dueSoon:rows.filter(x=>x.risk==='DUE_SOON').length};
}

function textHasProject(x,p){const name=norm(p.name||p.title||'');if(!name)return false;return norm(`${x?.project||''} ${x?.projectName||''} ${x?.title||''} ${x?.subject||''}`).includes(name)}
export function projectHealth40(state={},now=new Date()){
 const projects=(state.projects||[]).filter(p=>!done(p));
 return projects.map(p=>{const tasks=(state.tasks||[]).filter(x=>!done(x)&&(String(x.projectId||'')===String(p.id)||textHasProject(x,p))),waiting=[...(state.directorBook?.waiting||[]),...(state.delegations||[])].filter(x=>!done(x)&&textHasProject(x,p)),inbox=(state.inbox||[]).filter(x=>!done(x)&&textHasProject(x,p)),overdue=tasks.filter(x=>{const d=x.due||x.dueAt||x.deadline;return d&&diffDays(d,now)<0}).length,staleWaiting=waiting.filter(x=>(ageDays(x.lastTouchAt||x.createdAt,now)||0)>=5).length,hotInbox=inbox.filter(x=>x.important===true||upper(x.priority)==='HIGH'||x.unread!==false).length,due=p.due||p.deadline||null,days=due?diffDays(due,now):null;let score=100;score-=Math.min(55,overdue*18);score-=Math.min(25,staleWaiting*9);score-=Math.min(18,hotInbox*4);if(days!==null&&days<0)score-=25;else if(days!==null&&days<=7)score-=8;score=clamp(score);return {id:p.id,title:titleOf(p),score,status:score<55?'RED':score<75?'YELLOW':'GREEN',tasks:tasks.length,overdue,waiting:waiting.length,staleWaiting,inbox:hotInbox,due,days,reason:overdue?`${overdue} úkolů po termínu`:staleWaiting?`${staleWaiting} čekání bez pohybu`:hotInbox?`${hotInbox} důležité zprávy`:'Bez zjevného blockeru',source:p}}).sort((a,b)=>a.score-b.score||a.title.localeCompare(b.title,'cs-CZ'));
}

export function portfolioGoals40(state={}){return {...OS40_DEFAULT_GOALS,...(state.os40?.portfolioGoals||{})}}
export function moneyAutopilot40(state={},budget=null){
 const amount=Math.max(0,n(budget??state.financePlan?.plannedInvestment??25000)),plan=monthlyInvestmentPlan34(state,amount),portfolio=totalInvestmentPortfolio34(state);
 const steps=plan.ok?plan.trades.map((t,i)=>({rank:i+1,bucket:t.bucket,label:t.label,ticker:t.ticker,name:t.name,amount:t.baseAmount,currency:t.baseCurrency,nativeAmount:t.nativeAmount,nativeCurrency:t.nativeCurrency,requiresChoice:t.requiresChoice,reason:t.reason})):[];
 const c=confidence40({kind:'MONEY'},state);return {ok:plan.ok,budget:amount,steps,plan,portfolio,confidence:c.score,headline:plan.ok?steps.length?`Rozdělit ${Math.round(amount).toLocaleString('cs-CZ')} Kč do ${steps.length} kroků`:'Nový vklad není potřeba rozdělovat':'Nejdřív opravit data pro investiční plán',note:'Návrh neprovádí bankovní převod ani obchod.'};
}

export function portfolioWhatIf40(state={},amount=25000,bucket='broad'){
 const p=totalInvestmentPortfolio34(state),goals=portfolioGoals40(state),a=Math.max(0,n(amount));if(!p.ok||!p.complete)return {ok:false,message:'Chybí kompletní portfolio nebo FX data.',portfolio:p};
 const keys=['broad','bond','satellite'],before=Object.fromEntries(keys.map(k=>[k,n(p.buckets[k]?.value)])),total=keys.reduce((z,k)=>z+before[k],0),after={...before};after[bucket]=(after[bucket]||0)+a;const final=total+a,pcts=Object.fromEntries(keys.map(k=>[k,final>0?after[k]/final*100:0])),drift=keys.reduce((z,k)=>z+Math.abs(pcts[k]-n(goals[k])),0)/2;return {ok:true,amount:a,bucket,beforePct:Object.fromEntries(keys.map(k=>[k,total?before[k]/total*100:0])),afterPct:pcts,afterDriftPct:Math.round(drift*10)/10,goals,totalBefore:total,totalAfter:final};
}

export function investmentScorecards40(state={}){
 const p=totalInvestmentPortfolio34(state);if(!p.ok)return {rows:[],portfolio:p};
 const rows=p.rows.filter(x=>x.baseValue!==null).map(x=>{const weight=p.total>0?n(x.baseValue)/p.total*100:0,pl=n(x.position?.net_profit_pct),isBroad=x.bucket==='broad',isBond=x.bucket==='bond';let verdict='HOLD',priority=45,risk='NORMAL';if(isBroad&&p.buckets.broad.pct<n(p.targets?.broad||55)-5){verdict='ADD';priority=72}else if(x.bucket==='satellite'&&weight>=12){verdict='TRIM';priority=86;risk='CONCENTRATION'}else if(pl<=-15&&x.source==='XTB'){verdict='REVIEW';priority=88;risk='THESIS'}else if(pl>=40&&x.source==='XTB'){verdict='TRIM';priority=82;risk='PROFIT'}const dataScore=x.source==='XTB'?90:x.position?.costBasis?82:68,divScore=isBroad||isBond?92:Math.max(45,100-weight*3),score=clamp((dataScore+divScore)/2);return {id:x.id,name:x.name,ticker:x.ticker,provider:x.provider,bucket:x.bucket,value:x.baseValue,weightPct:Math.round(weight*10)/10,profitPct:Number.isFinite(Number(x.position?.net_profit_pct))?pl:null,score:Math.round(score),verdict,priority,risk,confidence:confidence40({kind:'INVESTMENT'},state).score,reason:verdict==='ADD'?'Pomáhá dorovnat cílovou alokaci.':risk==='CONCENTRATION'?`Váha ${weight.toFixed(1)} % celého investičního portfolia.`:risk==='THESIS'?`Pokles ${pl.toFixed(1)} % vyžaduje kontrolu teze.`:risk==='PROFIT'?`Zisk ${pl.toFixed(1)} % stojí za ochranu.`:'Bez extrémního signálu.'}}).sort((a,b)=>b.priority-a.priority||b.weightPct-a.weightPct);return {rows,portfolio:p};
}

export function recordTicketPriceHistory40(state={},now=new Date()){
 const os=ensureOs40State(state),date=ymd(now);let changed=false;
 for(const t of state.ticketBook?.items||[]){if(done(t))continue;const list=n(t.listPrice),market=n(t.viagogoRecommended)||n(t.marketPrice),buy=n(t.buy),qty=Math.max(1,n(t.qty)||1);if(!list&&!market)continue;const key=`${t.id}|${date}`,existing=os.ticketPriceHistory.find(x=>x.key===key),row={key,ticketId:t.id,date,at:iso(now),eventName:t.eventName||t.name||'Vstupenka',listPrice:list||null,marketPrice:market||null,buyPer:buy/qty||null,workflow:upper(t.workflow||'HOLD')};if(existing)Object.assign(existing,row);else{os.ticketPriceHistory.unshift(row);changed=true}}
 os.ticketPriceHistory=os.ticketPriceHistory.sort((a,b)=>ms(b.at)-ms(a.at)).slice(0,2000);return changed;
}

export function dynamicTicketPricing40(state={},now=new Date()){
 const brain=ticketMarketBrain34(state,now);return brain.rows.map(x=>{const d=x.eventDays,phase=d===null?'UNKNOWN':d<=3?'LIQUIDATE':d<=7?'EXIT':d<=14?'ACTIVE':d<=30?'TEST':'EARLY',floor=n(x.breakEven),market=n(x.recommendedPrice),current=n(x.currentListPrice),suggested=n(x.suggestedPrice);let price=suggested||current||market||floor;if(phase==='EARLY'&&market)price=Math.max(floor,market*1.25);if(phase==='TEST'&&market)price=Math.max(floor,market*1.12);if(phase==='ACTIVE'&&market)price=Math.max(floor,market*1.04);if(phase==='EXIT'&&market)price=Math.max(floor,market);if(phase==='LIQUIDATE')price=Math.max(floor,market||floor);price=price?Math.round(price):null;return {...x,phase,dynamicPrice:price,dynamicReason:phase==='EARLY'?'Je čas testovat vyšší marži.':phase==='TEST'?'Začít přibližovat cenu trhu.':phase==='ACTIVE'?'Priorita je konverze při stále rozumné marži.':phase==='EXIT'?'Týden do akce: cena má být konkurenceschopná.':phase==='LIQUIDATE'?'Poslední 3 dny: likvidita má přednost, ne pod bezpečný floor.':'Chybí datum akce.'}})}

export function ticketRoiBrain40(state={},now=new Date()){
 const pricing=dynamicTicketPricing40(state,now),byId=new Map((state.ticketBook?.items||[]).map(x=>[String(x.id),x]));return pricing.map(x=>{const t=byId.get(String(x.ticketId))||{},qty=Math.max(1,n(x.qty)||1),buy=n(t.buy),sellPer=n(x.dynamicPrice)||n(x.currentListPrice),gross=sellPer?Math.round(sellPer*qty-buy):null,roi=gross!==null&&buy>0?gross/buy*100:null,created=t.createdAt||t.snapshotAt||t.listingSnapshotAt||null,held=created?ageDays(created,now):null,annualized=roi!==null&&held&&held>0?((Math.pow(1+roi/100,365/held)-1)*100):null,capitalDays=buy*(held||0),efficiency=roi===null?'UNKNOWN':roi>=30&&held!==null&&held<=60?'EXCELLENT':roi>=15&&held!==null&&held<=90?'GOOD':roi<5&&held!==null&&held>=30?'WEAK':'NORMAL';return {...x,buyTotal:buy,grossProfit:gross,roiPct:roi===null?null:Math.round(roi*10)/10,heldDays:held,annualizedPct:annualized===null?null:Math.round(Math.min(999,annualized)*10)/10,capitalDays,efficiency,reason:efficiency==='EXCELLENT'?'Vysoká marže a rychlý obrat kapitálu.':efficiency==='GOOD'?'Dobrý poměr marže a času.':efficiency==='WEAK'?'Kapitál je blokovaný dlouho vzhledem k očekávané marži.':'Standardní poměr výnosu a času.'}}).sort((a,b)=>(b.roiPct??-999)-(a.roiPct??-999));
}

export function relationshipMemory40(state={},now=new Date()){
 const map=new Map(),notes=state.os40?.relationshipNotes||{};
 const add=(person,kind,title,at)=>{const raw=String(person||'').trim();if(!raw)return;const key=norm(raw);if(!key||['inbox','neuvedeno','někoho','odpověď'].includes(key))return;const x=map.get(key)||{id:key,person:raw,touches:0,kinds:new Set(),lastAt:null,lastTitle:'',open:0};x.touches++;x.kinds.add(kind);if(ms(at)>ms(x.lastAt)){x.lastAt=at;x.lastTitle=title}map.set(key,x)};
 for(const m of state.inbox||[])add(m.from||m.sender||m.to,'E-mail',titleOf(m),whenOf(m));
 for(const x of state.directorBook?.waiting||[]){add(x.person,'Waiting For',titleOf(x),whenOf(x));if(!done(x)){const k=norm(x.person);if(map.has(k))map.get(k).open++}}
 for(const x of state.delegations||[]){add(personOf(x),'Delegace',titleOf(x),whenOf(x));if(!done(x)){const k=norm(personOf(x));if(map.has(k))map.get(k).open++}}
 return [...map.values()].map(x=>({...x,kinds:[...x.kinds],ageDays:ageDays(x.lastAt,now),note:notes[x.id]||'',status:x.open?'OPEN':'CLEAR'})).sort((a,b)=>b.open-a.open||ms(b.lastAt)-ms(a.lastAt)).slice(0,100);
}

function searchPush(out,type,title,detail,target,id,score=70){out.push({type,title,detail,target,id,score})}
export function universalSearch40(state={},query=''){
 const q=norm(query);if(q.length<2)return [];
 const out=[],hit=(...vals)=>norm(vals.filter(Boolean).join(' ')).includes(q);
 for(const x of state.tasks||[])if(hit(titleOf(x),x.project,x.note))searchPush(out,'Úkol',titleOf(x),x.project||x.due||'',x.scope==='work'?'director':'today',x.id,done(x)?45:82);
 for(const x of state.projects||[])if(hit(titleOf(x),x.client,x.note))searchPush(out,'Projekt',titleOf(x),x.client||x.status||'','director',x.id,85);
 for(const x of state.inbox||[])if(hit(titleOf(x),x.from,x.sender,x.snippet,x.bodyPreview))searchPush(out,'E-mail',titleOf(x),x.from||x.sender||'','email',x.id,x.unread!==false?88:62);
 for(const x of state.directorBook?.waiting||[])if(hit(titleOf(x),x.person,x.note))searchPush(out,'Waiting For',titleOf(x),x.person||'','waiting',x.id,done(x)?50:90);
 for(const x of state.delegations||[])if(hit(titleOf(x),personOf(x),x.note))searchPush(out,'Delegace',titleOf(x),personOf(x),'director',x.id,done(x)?50:84);
 for(const x of state.ticketBook?.items||[])if(hit(titleOf(x),x.eventName,x.section,x.platform))searchPush(out,'Vstupenky',x.eventName||titleOf(x),`${x.section||''} · ${x.workflow||''}`,'tickets',x.id,80);
 for(const x of state.netWorthBook?.items||[])if(hit(titleOf(x),x.provider,x.instrument,x.isin))searchPush(out,'Investice',titleOf(x),`${x.provider||''} · ${x.value||''} ${x.currency||''}`,'money',x.id,76);
 for(const x of state.calendar?.events||[])if(hit(titleOf(x),x.location,x.description))searchPush(out,'Kalendář',titleOf(x),x.start||x.date||'','today',x.id,72);
 for(const x of relationshipMemory40(state))if(hit(x.person,x.lastTitle,x.note))searchPush(out,'Kontakt',x.person,`${x.open} otevřených · naposled ${x.lastTitle}`,'director',x.id,74+x.open*4);
 return out.sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title,'cs-CZ')).slice(0,40);
}
