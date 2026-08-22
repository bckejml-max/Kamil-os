import {xtbBoard,xtbDataAge} from './live24.js';
import {ticketMarketBrain34} from './ticketBrain34.js';

const n=v=>Number(v||0);
const upper=v=>String(v||'').toUpperCase();
const tone=p=>Number(p)>=90?'bad':Number(p)>=75?'warn':'good';
const label=a=>({BUY:'PŘIKOUPIT',TRIM:'ZMENŠIT',SELL:'PRODAT',REVIEW:'PROVĚŘIT',HOLD:'DRŽET',VERIFY_DATA:'OPRAVIT DATA',SELL_NOW:'PRODAT TEĎ',REPRICE:'ZLEVNIT',LIST_NOW:'VYSTAVIT',CHECK_MARKET:'OBNOVIT TRH',REFRESH_XTB:'OBNOVIT DATA'})[upper(a)]||upper(a)||'PROVĚŘIT';
const urgency=p=>Number(p)>=96?'TEĎ':Number(p)>=90?'DNES':Number(p)>=80?'BRZY':'SLEDOVAT';
const round=v=>Math.round(n(v));
const memoryRows=s=>Array.isArray(s?.decisionMemory36?.items)?s.decisionMemory36.items:[];
const latestMemory=(s,id)=>memoryRows(s).filter(x=>x?.decisionId===id).sort((a,b)=>Date.parse(b.at||0)-Date.parse(a.at||0))[0]||null;
const memoryActive=(m,now=new Date())=>{if(!m)return false;if(m.status==='DONE'||m.status==='IGNORED')return true;if(m.status==='SNOOZED'){const t=Date.parse(m.until||0);return Number.isFinite(t)&&t>now.getTime()}return false};
const learningKey=(domain,action)=>`${upper(domain)}|${upper(action)}`;

function outcomeScore36(value){const v=upper(value);return v==='GOOD'?1:v==='BAD'?-1:0}
export function outcomeCalibration36(state={},domain='',action=''){
 const key=learningKey(domain,action),rated=memoryRows(state).filter(x=>x.status==='DONE'&&x.outcome&&learningKey(x.domain,x.action)===key),sum=rated.reduce((s,x)=>s+outcomeScore36(x.outcome),0),raw=sum*2,bias=Math.max(-8,Math.min(8,raw));
 return {key,samples:rated.length,good:rated.filter(x=>x.outcome==='GOOD').length,neutral:rated.filter(x=>x.outcome==='NEUTRAL').length,bad:rated.filter(x=>x.outcome==='BAD').length,bias};
}
function applyLearning36(row,state){
 const learning=outcomeCalibration36(state,row.domain,row.action),protectedRow=row.blocked||row.action==='REFRESH_XTB',priority=protectedRow?row.priority:Math.max(0,Math.min(100,row.priority+learning.bias));
 return {...row,rawRulePriority:row.priority,priority,tone:tone(priority),urgency:urgency(priority),learning};
}
function applyMemory36(row,state,now){const m=latestMemory(state,row.id);if(!m)return {...row,memory:null};const active=memoryActive(m,now);let adjustment=0;if(m.status==='SNOOZED'&&active)adjustment=-40;else if(m.status==='IGNORED')adjustment=-55;else if(m.status==='DONE')adjustment=-70;const effectivePriority=Math.max(0,Math.min(100,row.priority+adjustment));return {...row,memory:m,memoryActive:active,rawPriority:row.priority,priority:effectivePriority,tone:tone(effectivePriority),urgency:urgency(effectivePriority)}}

function xtbNextStep36(action,d={}){
 if(action==='REFRESH_XTB')return 'Importovat nový XTB report a až potom znovu přepočítat doporučení.';
 if(action==='BUY')return d?.execution?.tranches?'Otevřít detail pozice, zkontrolovat tezi a provést jen první navrženou tranši.':'Otevřít detail pozice a před nákupem znovu ověřit tezi i velikost pozice.';
 if(action==='TRIM')return 'Otevřít detail pozice, ověřit aktuální data a případně zredukovat jen navrženou část.';
 if(action==='SELL')return 'Otevřít detail pozice, ověřit aktuální data a tezi; teprve potom potvrdit exit.';
 if(action==='REVIEW')return 'Neobchodovat. Nejdřív otevřít dostupný zdroj a dokončit review.';
 return 'Otevřít detail pozice a zkontrolovat aktuální stav.';
}
function xtbEvidence36(d={},blocked=false){if(blocked)return 'STALE XTB';if(d?.reviewBeforeTrade)return 'SEC REVIEW';if(d?.marketQuote?.fresh)return 'FRESH QUOTE';if(d?.evidence?.count>0)return 'OFICIÁLNÍ PODKLAD';return 'XTB IMPORT'}
function xtbImpact36(p={},d={},action=''){if(['TRIM','SELL'].includes(action)&&n(d?.execution?.trimAmount)>0)return round(d.execution.trimAmount);if(action==='SELL'&&n(p?.value)>0)return round(p.value);if(action==='BUY'&&n(d?.execution?.plannedAmount)>0)return round(d.execution.plannedAmount);return null}
function xtbRows36(state={}){
 const age=xtbDataAge(state),fresh=age?.days!==null&&age.days<=2;
 return xtbBoard(state).map(({p,d})=>{const rawAction=upper(d?.action||'HOLD'),blocked=!!d?.execution?.blocked||!fresh,actionable=['BUY','TRIM','SELL','REVIEW'].includes(rawAction);if(!actionable&&!blocked)return null;const action=blocked&&rawAction!=='REVIEW'?'REFRESH_XTB':rawAction;const priority=blocked&&['BUY','TRIM','SELL'].includes(rawAction)?Math.max(96,Number(d?.priority||0)):Number(d?.priority||0);return {id:`xtb:${p?.ticker||p?.name||'position'}`,domain:'XTB',target:'money',title:`${p?.ticker||p?.name||'Pozice'} · ${label(action)}`,action,priority,tone:tone(priority),urgency:urgency(priority),reason:blocked?(d?.execution?.blockReason||'XTB data nejsou dost čerstvá pro bezpečné provedení obchodu. Nejdřív obnov import účtu.'):(d?.reason||d?.when||'Pozice vyžaduje kontrolu.'),detail:d?.execution?.label||null,nextStep:xtbNextStep36(action,d),evidence:xtbEvidence36(d,blocked),impactCzk:xtbImpact36(p,d,rawAction),positionValueCzk:n(p?.value)>0?round(p.value):null,weightPct:Number.isFinite(Number(p?.weightPct))?Number(p.weightPct):null,blocked,autoExecute:false}}).filter(Boolean)
}
function ticketNextStep36(x={}){if(x.action==='VERIFY_DATA')return 'Opravit evidenci vstupenky a potom znovu přepočítat doporučení.';if(x.action==='SELL_NOW')return 'Otevřít vstupenky, zkontrolovat market a nastavit cenu nejméně na bezpečný floor.';if(x.action==='REPRICE')return 'Otevřít listing a snížit cenu jen k navržené hodnotě, ne pod bezpečný floor.';if(x.action==='LIST_NOW')return 'Vystavit vstupenky za navrženou cenu a uložit nový listing snapshot.';if(x.action==='CHECK_MARKET')return 'Doplnit aktuální market/recommended snapshot; bez něj cenu neměnit.';return 'Otevřít vstupenky a zkontrolovat stav.'}
function ticketEvidence36(x={}){return x.recommendedSource==='VIAGOGO_SNAPSHOT'?'VIAGOGO SNAPSHOT':x.recommendedSource==='MARKET'?'MARKET SNAPSHOT':'BEZ MARKET DAT'}
function ticketRows36(state={},now=new Date()){return ticketMarketBrain34(state,now).rows.filter(x=>x.priority>=80&&x.action!=='HOLD').map(x=>({id:`ticket:${x.ticketId}`,domain:'VSTUPENKY',target:'tickets',title:`${x.eventName} · ${label(x.action)}`,action:x.action,priority:Number(x.priority||0),tone:tone(x.priority),urgency:urgency(x.priority),reason:x.reason,detail:x.suggestedPrice?`Navržená cena ${Math.round(x.suggestedPrice).toLocaleString('cs-CZ')} Kč / ks`:null,nextStep:ticketNextStep36(x),evidence:ticketEvidence36(x),impactCzk:n(x.buyPer)>0?round(n(x.buyPer)*Math.max(1,n(x.qty))):null,potentialGrossCzk:x.grossAtSuggested===null||x.grossAtSuggested===undefined?null:round(x.grossAtSuggested),eventDays:x.eventDays,blocked:false,autoExecute:false}))}

export function decisionMemorySummary36(state={}){const rows=memoryRows(state),last=rows[0]||null,rated=rows.filter(x=>x.status==='DONE'&&x.outcome);return {total:rows.length,done:rows.filter(x=>x.status==='DONE').length,snoozed:rows.filter(x=>x.status==='SNOOZED').length,ignored:rows.filter(x=>x.status==='IGNORED').length,rated:rated.length,good:rated.filter(x=>x.outcome==='GOOD').length,bad:rated.filter(x=>x.outcome==='BAD').length,last}}
export function pendingOutcomes36(state={},limit=4){return memoryRows(state).filter(x=>x.status==='DONE'&&!x.outcome).sort((a,b)=>Date.parse(b.at||0)-Date.parse(a.at||0)).slice(0,limit)}
export function recordDecisionMemory36(state={},row={},status='DONE',now=new Date()){
 state.decisionMemory36=state.decisionMemory36||{items:[]};state.decisionMemory36.items=Array.isArray(state.decisionMemory36.items)?state.decisionMemory36.items:[];
 const s=upper(status),at=new Date(now).toISOString(),until=s==='SNOOZED'?new Date(new Date(now).getTime()+24*3600000).toISOString():null;
 state.decisionMemory36.items.unshift({id:`dm36-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,decisionId:row.id,title:row.title,domain:row.domain,action:row.action,status:s,at,until,priority:row.rawRulePriority??row.rawPriority??row.priority,learnedPriority:row.rawPriority??row.priority,impactCzk:row.impactCzk??null,outcome:null,outcomeAt:null});state.decisionMemory36.items=state.decisionMemory36.items.slice(0,200);return state.decisionMemory36.items[0]
}
export function recordDecisionOutcome36(state={},memoryId='',outcome='NEUTRAL',now=new Date()){
 const item=memoryRows(state).find(x=>x.id===memoryId);if(!item||item.status!=='DONE')return null;const value=['GOOD','NEUTRAL','BAD'].includes(upper(outcome))?upper(outcome):'NEUTRAL';item.outcome=value;item.outcomeAt=new Date(now).toISOString();return item
}

function analyticsRow36(key,rows){
 const [domain,action]=key.split('|'),samples=rows.length,good=rows.filter(x=>x.outcome==='GOOD').length,neutral=rows.filter(x=>x.outcome==='NEUTRAL').length,bad=rows.filter(x=>x.outcome==='BAD').length,net=good-bad,scorePct=samples?Math.round((net/samples)*100):0,goodPct=samples?Math.round((good/samples)*100):0;
 const confidence=samples>=5?'TREND':samples>=3?'SIGNÁL':'MÁLO DAT';
 const verdict=samples<3?'Sbírat další výsledky.':scorePct>=40?'Doporučení zatím funguje dobře.':scorePct<=-40?'Tady je potřeba pravidla zpřesnit.':'Výsledky jsou smíšené.';
 return {key,domain,action,label:label(action),samples,good,neutral,bad,net,scorePct,goodPct,confidence,verdict,bias:Math.max(-8,Math.min(8,net*2))};
}
export function decisionAnalytics36(state={}){
 const rated=memoryRows(state).filter(x=>x.status==='DONE'&&x.outcome),groups=new Map();
 for(const x of rated){const key=learningKey(x.domain,x.action);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(x)}
 const rows=[...groups.entries()].map(([key,list])=>analyticsRow36(key,list)).sort((a,b)=>b.samples-a.samples||b.scorePct-a.scorePct||a.key.localeCompare(b.key));
 const mature=rows.filter(x=>x.samples>=3),best=[...mature].sort((a,b)=>b.scorePct-a.scorePct||b.samples-a.samples)[0]||null,worst=[...mature].sort((a,b)=>a.scorePct-b.scorePct||b.samples-a.samples)[0]||null;
 const overall=analyticsRow36('CELKEM|ALL',rated);overall.domain='CELKEM';overall.action='ALL';overall.label='Všechna rozhodnutí';
 return {rows,overall,best,worst,rated:rated.length,mature:mature.length,needsData:rows.filter(x=>x.samples<3).length,minSignalSamples:3,minTrendSamples:5,note:'Analytics je popisná zpětná vazba. Do 3 hodnocení nevyvozuje směr; od 5 hodnocení označuje výsledek jako trend.'};
}
export function decisionCenter36(state={},now=new Date()){
 const candidates=[...xtbRows36(state),...ticketRows36(state,now)].map(x=>applyMemory36(applyLearning36(x,state),state,now));
 const rows=candidates.filter(x=>!x.memoryActive||x.memory?.status==='SNOOZED').sort((a,b)=>b.priority-a.priority||a.title.localeCompare(b.title,'cs-CZ')).slice(0,8).map((x,i)=>({...x,rank:i+1}));
 const visibleImpact=rows.reduce((s,x)=>s+Math.max(0,n(x.impactCzk)),0),memory=decisionMemorySummary36(state),pendingOutcomes=pendingOutcomes36(state),analytics=decisionAnalytics36(state);
 const counts={critical:rows.filter(x=>x.priority>=90).length,blocked:rows.filter(x=>x.blocked).length,xtb:rows.filter(x=>x.domain==='XTB').length,tickets:rows.filter(x=>x.domain==='VSTUPENKY').length,visibleImpactCzk:round(visibleImpact),memory:memory.total,pendingOutcomes:pendingOutcomes.length,rated:analytics.rated};
 return {rows,counts,memory,pendingOutcomes,analytics,top:rows[0]||null,generatedAt:new Date(now).toISOString(),contract:{autoTrade:false,autoReprice:false,proposalOnly:true,explicitFeedbackOnly:true,maxLearnedPriorityShift:8,safetyBlocksNeverReduced:true,analyticsMinSignalSamples:3,analyticsMinTrendSamples:5},note:'Outcome Learning používá jen tvoje explicitní hodnocení dokončených rozhodnutí. Korekce priority je omezená na ±8 bodů a nikdy nesnižuje bezpečnostní blokaci.'};
}
