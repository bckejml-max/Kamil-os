import {store,validateState} from './state.js';
import {sourceFreshness741,masterConflicts741} from './dataSourceRegistry.js';
import {localInboxSummary660} from './inboxHub660.js';
import {workCommandCenter440} from './workCommandCenter440.js';
import {ticketData1300} from './ticketOverview.js';
import {moneyData1300} from './moneyOverview.js';
import {buildPropertyHub620} from './propertyHub620.js';
import {bettingData1334} from './bettingOverview.js';
import {familyData140} from './familyPage140.js';
import {personalHomeTimeline650} from './personalAssistant650.js';
import {insuranceCenter} from './insurance25.js';
import {backupHealth} from './backupGuard26.js';

const DAY=86400000;
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','PAYOUT RECEIVED','PAYOUT_RECEIVED','CANCELLED','CANCELED']);
const A=v=>Array.isArray(v)?v:[];
const U=v=>String(v??'').trim();
const up=v=>U(v).toUpperCase();
const open=x=>!CLOSED.has(up(x?.status||x?.workflow||x?.market_status||'OPEN'));
const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const at=v=>{const n=Date.parse(v||'');return Number.isFinite(n)?n:null};
const title=x=>U(x?.title||x?.name||x?.label||x?.eventName||x?.event_name||'Bez názvu');
const due=x=>x?.due||x?.followUpAt||x?.nextFollowUpAt||x?.dueAt||x?.due_at||x?.dueDate||x?.due_date||x?.deadline||x?.date||x?.eventDate||x?.start||x?.startsAt||null;
const fold=v=>U(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const dayDiff=(v,now=Date.now())=>{const t=at(v);return t===null?null:Math.floor((t-new Date(now).setHours(0,0,0,0))/DAY)};
const ageDays=(v,now=Date.now())=>{const t=at(v);return t===null?null:Math.max(0,Math.floor((now-t)/DAY))};
const iso=v=>{const t=at(v);return t===null?null:new Date(t).toISOString()};
const moneyImpact=x=>Math.max(0,num(x?.moneyImpactCzk??x?.amount??x?.value??x?.stakeCzk??x?.buyTotalCzk??0)||0);

function deadlinePoints(date,now){
 const d=dayDiff(date,now);
 if(d===null)return 0;
 if(d<0)return 38+Math.min(18,Math.abs(d)*2);
 if(d===0)return 34;
 if(d===1)return 28;
 if(d<=2)return 22;
 if(d<=7)return 12;
 if(d<=30)return 4;
 return 0;
}
function moneyPoints(v){
 const n=Math.abs(Number(v||0));
 if(n>=1000000)return 24;
 if(n>=250000)return 20;
 if(n>=100000)return 16;
 if(n>=25000)return 11;
 if(n>=5000)return 6;
 return 0;
}
function toneScore(t){return t==='bad'?35:t==='warn'?18:t==='good'?-4:0}
function canonicalKey(x){
 if(x.sourceKey)return U(x.sourceKey).toLowerCase();
 if(x.sourceId)return U(x.source)+':'+U(x.sourceId);
 return [x.route,fold(x.title),iso(x.dueAt)||''].join(':');
}
function normalizedAction(row,now=Date.now()){
 const base=Math.max(0,Number(row.baseScore||row.score||0)),dPoints=deadlinePoints(row.dueAt,now),mPoints=moneyPoints(row.moneyImpactCzk),blocked=row.blocked?12:0,stale=row.stale?4:0;
 const score=Math.round(Math.min(200,base+dPoints+mPoints+blocked+stale+toneScore(row.tone)));
 const reasons=[row.reason,dPoints?dayDiff(row.dueAt,now)<0?'po termínu':dayDiff(row.dueAt,now)===0?'termín dnes':'blízký termín':null,mPoints?'významný finanční dopad':null,row.blocked?'blokuje další krok':null,row.stale?'data potřebují obnovit':null].filter(Boolean);
 return {...row,id:row.id||canonicalKey(row),canonicalKey:canonicalKey(row),score,reasons:[...new Set(reasons)],why:[...new Set(reasons)].join(' · ')||'otevřená položka',dueAt:iso(row.dueAt),moneyImpactCzk:moneyImpact(row)};
}
function dedupeActions(rows,now=Date.now()){
 const map=new Map();
 const mergeSemantics=(winner,other)=>{
  if(winner.insurance===true||other.insurance===true){winner.insurance=true;winner.route='more';winner.cta=winner.cta||'pojištění'}
  if(!winner.taskId&&other.taskId)winner.taskId=other.taskId;
  if(!winner.personalId&&other.personalId)winner.personalId=other.personalId;
  return winner
 };
 for(const raw of rows.map(x=>normalizedAction(x,now))){
  const keys=[raw.canonicalKey,raw.sourceId?U(raw.source)+':'+U(raw.sourceId):null,raw.title?fold(raw.title):null].filter(Boolean);
  const existing=[...map.values()].find(x=>keys.includes(x.canonicalKey)||keys.includes(fold(x.title))||(raw.sourceId&&x.source===raw.source&&x.sourceId===raw.sourceId));
  if(!existing){map.set(raw.canonicalKey,raw);continue}
  if(raw.score>existing.score){raw.reasons=[...new Set([...(existing.reasons||[]),...(raw.reasons||[])])];raw.why=raw.reasons.join(' · ');mergeSemantics(raw,existing);map.delete(existing.canonicalKey);map.set(raw.canonicalKey,raw)}
  else{existing.reasons=[...new Set([...(existing.reasons||[]),...(raw.reasons||[])])];existing.why=existing.reasons.join(' · ');mergeSemantics(existing,raw)}
 }
 return [...map.values()].sort((a,b)=>b.score-a.score||(at(a.dueAt)||Infinity)-(at(b.dueAt)||Infinity));
}

export function buildUnifiedWaiting741(s=store.get(),now=Date.now()){
 const out=[];
 const add=(x,source,route='inbox',extra={})=>{if(!x||!open(x))return;const created=x.lastContactAt||x.updatedAt||x.createdAt||null,dueAt=due(x),age=ageDays(created,now),d=dayDiff(dueAt,now),needsFollowUp=d!==null?d<=0:(age!==null&&age>=5);out.push({
  id:U(x.id||source+':'+title(x)),source,sourceId:x.id||null,title:title(x),detail:U(x.notes||x.detail||x.reason||''),route,dueAt:iso(dueAt),ageDays:age,needsFollowUp,
  score:(needsFollowUp?85:45)+(d!==null&&d<0?15:0),person:U(x.person||x.owner||''),raw:x,...extra
 })};
 for(const x of A(s.directorBook?.waiting))add(x,'director-waiting','inbox');
 for(const x of A(s.delegations))add(x,'delegation','inbox');
 for(const x of A(s.personalInbox?.items).filter(x=>U(x.bucket).toLowerCase()==='waiting'))add(x,'personal-waiting','inbox');
 const td=ticketData1300(s);
 for(const x of td.payout)add(x,'ticket-payout','tickets',{detail:'Prodej je dokončený, čeká se na payout.',needsFollowUp:true,score:88});
 const ins=insuranceCenter(s);
 for(const x of A(ins.actions).filter(x=>['TERMINATING','UPCOMING','REVIEW'].includes(up(x.lifecycle||x.status))))add({id:x.id,title:x.title,notes:x.issues?.[0],followUpAt:x.noticeDate||x.renewalDate||null,updatedAt:x.updatedAt},'insurance-wait','more',{score:72});
 return out.sort((a,b)=>Number(b.needsFollowUp)-Number(a.needsFollowUp)||b.score-a.score||(at(a.dueAt)||Infinity)-(at(b.dueAt)||Infinity));
}

function financeTruth741(s,money){
 const bankRecords=A(money?.v?.records).filter(x=>x.recordType==='bank-data'&&up(x.status?.code)!=='ARCHIVED');
 const readVal=x=>['balance','cashBalance','currentBalance'].map(k=>num(x?.[k])).find(v=>v!==null);
 const vaultBank=bankRecords.map(readVal).filter(v=>v!==null).reduce((a,b)=>a+b,0),vaultKnown=bankRecords.some(x=>readVal(x)!==null);
 const plan=num(s.financePlan?.cashNow),planKnown=!!s.financePlan?.updatedAt&&plan!==null;
 const difference=vaultKnown&&planKnown?vaultBank-plan:null;
 const currentRate=num(s.financePlan?.currentSavingsRatePct),bestRate=num(s.financePlan?.bestSavingsRatePct),capital=num(s.financePlan?.savingsCapitalCzk)??(money?.bankKnown?money.bank:null);
 const monthlyOpportunity=currentRate!==null&&bestRate!==null&&capital!==null&&bestRate>currentRate?capital*(bestRate-currentRate)/100/12:null;
 const reserve=num(s.financePlan?.reserveFloor)||0,planned=num(s.financePlan?.plannedInvestment)||0,free=money?.bankKnown?money.bank-reserve-planned:null;
 return {bank:money.bank,bankKnown:money.bankKnown,assets:money.assets,net:money.net,debt:money.debt,invest:money.invest,tickets:money.tickets,vaultBank:vaultKnown?vaultBank:null,planCash:planKnown?plan:null,reconciliationDifference:difference,reconciled:difference===null?null:Math.abs(difference)<=Math.max(1000,Math.abs(vaultBank)*.01),currentRate,bestRate,monthlyOpportunity,freeCash:free,reserveFloor:reserve,plannedInvestment:planned};
}
function ticketTruth741(s,t){
 const items=A(t.items),sum=(rows,key)=>rows.reduce((a,x)=>a+(num(x?.[key])||0),0),status=x=>up(x.market_status||x.marketStatus||x.workflow);
 const paid=items.filter(x=>status(x)==='PAYOUT_RECEIVED'),waiting=items.filter(x=>['SOLD_WAITING_PAYMENT','WAITING_PAYOUT','PAYOUT WAIT'].includes(status(x))),listed=items.filter(x=>status(x)==='LISTED'),held=items.filter(x=>['NOT_LISTED','HOLD'].includes(status(x))),undelivered=items.filter(x=>['SOLD_UNDELIVERED','TRANSFER_REQUIRED','SOLD_WAITING_TRANSFER'].includes(status(x)));
 const realizedBuy=sum(paid,'buyTotalCzk'),realizedSell=sum(paid,'sellTotalCzk'),waitingBuy=sum(waiting,'buyTotalCzk'),waitingSell=sum(waiting,'sellTotalCzk');
 const deadlineRisk=undelivered.map(x=>({id:x.id,title:title(x),date:iso(x.eventDate||x.date),days:dayDiff(x.eventDate||x.date),route:'tickets'})).sort((a,b)=>(a.days??999)-(b.days??999));
 return {lifecycle:{held:held.length,listed:listed.length,undelivered:undelivered.length,waitingPayout:waiting.length,paid:paid.length},profit:{realized:realizedSell-realizedBuy,waitingExpected:waitingSell-waitingBuy,realizedRevenue:realizedSell,waitingRevenue:waitingSell},capitalExposure:sum([...listed,...held],'buyTotalCzk'),deadlineRisk};
}
function bettingTruth741(s,b){
 const groups=new Map();
 for(const x of b.open){const key=fold(x.selection||x.event||'ostatní')||'ostatni',g=groups.get(key)||{key,label:x.selection||x.event||'Ostatní',stakeCzk:0,positions:0,tickets:0};g.stakeCzk+=num(x.stakeCzk)||0;g.positions++;g.tickets+=Math.max(1,num(x.ticketCount)||1);groups.set(key,g)}
 const heatmap=[...groups.values()].sort((a,b)=>b.stakeCzk-a.stakeCzk).slice(0,8);
 const settlementAudit=b.settled.map(x=>({id:x.id,label:x.label||x.selection||x.event,missing:['stakeCzk','odds','status'].filter(k=>x?.[k]===null||x?.[k]===undefined||x?.[k]==='').concat(x.pnlCzk===null||x.pnlCzk===undefined?['pnlCzk']:[])})).filter(x=>x.missing.length);
 const byCategory=new Map();for(const x of b.settled){const k=x.category||x.league||'Ostatní',g=byCategory.get(k)||{category:k,stake:0,pnl:0,wins:0,losses:0};g.stake+=num(x.stakeCzk)||0;g.pnl+=num(x.pnlCzk)||0;if(up(x.status)==='WIN')g.wins++;if(up(x.status)==='LOSS')g.losses++;byCategory.set(k,g)}
 const performance=[...byCategory.values()].map(g=>({...g,roi:g.stake?g.pnl/g.stake*100:0,hitRate:g.wins+g.losses?g.wins/(g.wins+g.losses)*100:0})).sort((a,b)=>b.stake-a.stake);
 return {heatmap,settlementAudit,performance};
}
function propertyTruth741(s,p){
 const raw=A(s.propertyBook?.candidates),life={new:0,review:0,negotiating:0,closed:0,bought:0},deadLinks=[];
 raw.forEach((x,i)=>{const st=up(x.status||x.lifecycle||'REVIEW');if(['CLOSED','SOLD','REMOVED','REJECTED','ARCHIVED'].includes(st))life.closed++;else if(['BOUGHT','PURCHASED'].includes(st))life.bought++;else if(['NEGOTIATING','OFFER','OFFERED'].includes(st))life.negotiating++;else if(['NEW'].includes(st))life.new++;else life.review++;if((['CLOSED','SOLD','REMOVED','ARCHIVED'].includes(st)||x.active===false)&&x.url)deadLinks.push({index:i,name:x.name||x.title||'Kandidát',url:x.url,status:st})});
 return {lifecycle:life,deadLinks,best:p.best?{name:p.best.name,score:p.best.score,decision:p.best.decision.code,netYield:p.best.netYield,downsideYield:p.best.downsideYield,cashAfterMortgage:p.best.cashAfterMortgage,dataPct:p.best.dataPct}:null,compareLock:A(s.ui?.propertyCompareIds).slice(0,4)};
}
function workTruth741(s,w){
 const blockers=A(w.topRisks).slice(0,6).map(x=>({title:x.title,kind:x.kind,detail:x.detail,score:x.score}));
 const closeout=A(s.projects).filter(open).map(p=>{
  const checks=[
   ['Fotky',p.photosDone??p.photosComplete],['Revize',p.revisionDone??p.revisionComplete],['DSPS',p.dspsDone??p.dspsComplete],['Předávák',p.handoverDone??p.handoverComplete],['Fakturace',p.invoicedDone??p.invoicingComplete],['Šanon',p.binderDone??p.binderComplete],['Zádržné',p.retentionDone??p.retentionComplete]
  ];
  const known=checks.filter(([,v])=>v!==undefined&&v!==null),missing=known.filter(([,v])=>v!==true).map(([k])=>k);
  const d=due(p);return {id:p.id,name:p.name||'Zakázka',deadline:iso(d),deadlineConfidence:d?(p.deadlineConfirmed===true?'confirmed':p.deadlineConfirmed===false?'estimated':'unknown'):'missing',knownChecks:known.length,missing};
 }).filter(x=>x.knownChecks||x.deadline);
 return {blockers,closeout};
}
function insuranceTruth741(s,ins){
 const policies=A(s.personalAdmin?.items).filter(x=>x.category==='INSURANCE'&&up(x.status)!=='ARCHIVED');
 const now=Date.now(),radar=policies.map(x=>{const date=x.noticeDate||x.renewalDate||x.nextDue||x.insurance?.startDate;return{id:x.id,title:x.title,provider:x.provider,days:dayDiff(date,now),date:iso(date),sourceStatus:x.insurance?.sourceStatus||null,kind:x.insurance?.kind||null,coverageAmount:num(x.insurance?.coverageAmount),deductible:num(x.insurance?.deductible)}}).filter(x=>x.days!==null&&x.days>=0&&x.days<=90).sort((a,b)=>a.days-b.days);
 const matrix=policies.map(x=>({id:x.id,title:x.title,kind:x.insurance?.kind||'OTHER',provider:x.provider||'—',sourceStatus:x.insurance?.sourceStatus||'UNKNOWN',coverageAmount:num(x.insurance?.coverageAmount),deductible:num(x.insurance?.deductible),verified:up(x.insurance?.sourceStatus)==='CONFIRMED'}));
 return {radar,matrix,actionCount:Number(ins.actionCount||A(ins.actions).length)};
}

function conflicts741(s,domains){
 const rows=[...masterConflicts741(s)];
 const fin=domains.finance;if(fin.reconciled===false)rows.push({id:'money:reconciliation',domain:'money',route:'money',severity:'warn',title:'Bankovní součty se rozcházejí',detail:'Rozdíl mezi vaultem a financePlan je '+Math.round(fin.reconciliationDifference).toLocaleString('cs-CZ')+' Kč.'});
 const seen=new Set();for(const x of [...A(s.tasks),...A(s.delegations)]){if(!x?.id)continue;if(seen.has(x.id))rows.push({id:'duplicate:'+x.id,domain:'state',route:'inbox',severity:'warn',title:'Duplicitní ID '+x.id,detail:'Stejné ID je použité ve více aktivních kolekcích.'});seen.add(x.id)}
 const urls=new Map();A(s.propertyBook?.candidates).forEach((x,i)=>{if(!x.url)return;const key=U(x.url).replace(/[?#].*$/,'');if(urls.has(key))rows.push({id:'property:url:'+i,domain:'property',route:'property',severity:'warn',title:'Duplicitní realitní odkaz',detail:(x.name||'Kandidát')+' sdílí odkaz s jiným kandidátem.'});else urls.set(key,i)});
 return rows;
}

function actions741(s,domains,freshness,waiting,now){
 const rows=[],fresh=Object.fromEntries(freshness.map(x=>[x.key,x]));
 const add=x=>rows.push(x);
 const inbox=domains.inbox;for(const x of A(inbox.rows).slice(0,8))if(Number(x.score||0)>=90||x.days!==null&&x.days<=7){const originId=x.sourceId||x.id,originKey=x.sourceKind==='waiting'?'waiting:'+originId:x.sourceKind==='task'?'task:'+originId:'inbox:'+x.id;add({source:'inbox',sourceId:originId,sourceKey:originKey,title:x.title,detail:x.detail||x.sourceLabel||x.bucket,route:x.route||'inbox',dueAt:x.due,taskId:x.sourceKind==='task'?originId:null,insurance:x.insurance===true,baseScore:Number(x.score||50),tone:Number(x.score||0)>=145?'bad':'warn',reason:'akční inbox',stale:fresh.personal?.stale})}
 for(const x of A(domains.work.topRisks).slice(0,6))add({source:'work',sourceId:x.id||x.title,sourceKey:'work:'+fold(x.title),title:x.title,detail:x.detail,route:'work',baseScore:Number(x.score||70),tone:Number(x.score||0)>=95?'bad':'warn',reason:x.kind||'pracovní riziko',moneyImpactCzk:/faktur|pohled|ZL/i.test(x.detail||'')?domains.work.finance?.receivable||0:0,stale:fresh.work?.stale});
 for(const x of A(domains.tickets.attention))add({source:'tickets',sourceId:x.taskId||x.title,sourceKey:'ticket:'+fold(x.title),title:x.title,detail:x.detail,route:'tickets',baseScore:x.tone==='bad'?105:75,tone:x.tone||'warn',reason:'ticket exception',moneyImpactCzk:domains.ticketTruth.capitalExposure,stale:fresh.tickets?.stale});
 for(const x of A(domains.money.attention))add({source:'money',sourceId:x.id,sourceKey:'money:'+x.kind+':'+x.id,title:x.title,detail:x.detail,route:'money',baseScore:Number(x.severity||60),tone:Number(x.severity||0)>=90?'bad':'warn',reason:'finanční kontrola',moneyImpactCzk:domains.finance.bank,stale:fresh.money?.stale});
 if(domains.property.best&&['BUY','NEGOTIATE','INCOMPLETE'].includes(domains.property.best.decision.code))add({source:'property',sourceId:domains.property.best.raw?.id||domains.property.best.name,sourceKey:'property:'+fold(domains.property.best.name),title:domains.property.best.name,detail:domains.property.best.decision.reason,route:'property',baseScore:domains.property.best.decision.code==='BUY'?72:domains.property.best.decision.code==='INCOMPLETE'?66:58,tone:domains.property.best.decision.code==='INCOMPLETE'?'warn':'',reason:domains.property.best.decision.action,moneyImpactCzk:domains.property.best.purchasePrice,stale:fresh.property?.stale});
 if(domains.betting.risk||domains.betting.unknownRisk)add({source:'betting',sourceId:'exposure',sourceKey:'betting:exposure',title:domains.betting.unknownRisk?'Doplň bankroll k otevřeným sázkám':'Zkontroluj sázkovou expozici',detail:domains.betting.unknownRisk?'Bez bankrollu nejde riziko poctivě vyhodnotit.':'Expozice je nad 20 % uloženého bankrollu.',route:'betting',baseScore:80,tone:'warn',reason:'řízení rizika',moneyImpactCzk:domains.betting.exposure,stale:fresh.betting?.stale});
 for(const x of A(domains.insurance.actions).slice(0,4))add({source:'insurance',sourceId:x.id,sourceKey:'insurance:'+x.id,title:x.title,detail:x.issues?.[0]||'Zkontrolovat pojistku.',route:'more',insurance:true,dueAt:x.noticeDate||x.renewalDate,baseScore:Number(x.priority||65),tone:x.status==='URGENT'?'bad':'warn',reason:'pojistný termín / kontrola',stale:fresh.insurance?.stale});
 for(const x of waiting.filter(x=>x.needsFollowUp).slice(0,6))add({source:'waiting',sourceId:x.sourceId||x.id,sourceKey:'waiting:'+(x.sourceId||x.id),title:'Follow-up: '+x.title,detail:x.detail||x.person||'Čeká se na druhou stranu.',route:x.route,dueAt:x.dueAt,baseScore:x.score,tone:dayDiff(x.dueAt,now)<0?'bad':'warn',reason:'follow-up čekání',blocked:true});
 const fam=domains.family.primary;if(fam)add({source:'family',sourceId:fam.id||title(fam),sourceKey:'family:'+fold(title(fam)),title:title(fam),detail:'Rodinný termín nebo úkol.',route:'family',dueAt:due(fam),baseScore:55,tone:dayDiff(due(fam),now)<0?'bad':'',reason:'rodina'});
 const home=A(domains.homeTimeline).filter(x=>x.days!==null&&x.days<=30)[0];if(home)add({source:'home',sourceId:home.id||home.title,sourceKey:'home:'+fold(home.title),title:home.title,detail:home.days<0?Math.abs(home.days)+' dní po termínu':'Domácí termín za '+home.days+' dní.',route:'home',dueAt:home.date||home.due||null,baseScore:home.days<0?88:55,tone:home.days<0?'bad':'warn',reason:'domácí termín'});
 return dedupeActions(rows,now);
}
function tomorrow741(s,waiting,now){
 const tomorrowStart=new Date(now);tomorrowStart.setHours(0,0,0,0);tomorrowStart.setDate(tomorrowStart.getDate()+1);const a=tomorrowStart.getTime(),b=a+DAY;
 const rows=[];
 const push=(x,source,route)=>{const t=at(due(x));if(t!==null&&t>=a&&t<b)rows.push({id:source+':'+(x.id||fold(title(x))),title:title(x),source,route,dueAt:new Date(t).toISOString()})};
 A(s.tasks).filter(open).forEach(x=>push(x,'task','inbox'));A(s.calendar?.events).filter(open).forEach(x=>push(x,'calendar','today'));waiting.forEach(x=>{const t=at(x.dueAt);if(t!==null&&t>=a&&t<b)rows.push({id:'waiting:'+x.id,title:'Follow-up: '+x.title,source:'waiting',route:x.route,dueAt:x.dueAt})});
 return rows.sort((x,y)=>(at(x.dueAt)||0)-(at(y.dueAt)||0));
}
function auditSummary741(s,actions,now){
 const start=new Date(now);start.setHours(0,0,0,0);const todayAt=start.getTime(),weekAt=todayAt-6*DAY;
 const audit=A(s.audit).filter(x=>at(x.at)!==null),today=audit.filter(x=>at(x.at)>=todayAt),week=audit.filter(x=>at(x.at)>=weekAt);
 return {dailyClose:{changes:today.length,completed:today.filter(x=>/hotovo|dokon|uzav|vyřeš|zaplac|prodán|přijat/i.test(x.label||'')).length,openActions:actions.length,carry:actions.filter(x=>x.score>=80).length},weeklyReview:{changes:week.length,completed:week.filter(x=>/hotovo|dokon|uzav|vyřeš|zaplac|prodán|přijat/i.test(x.label||'')).length,topLabels:week.slice(0,8).map(x=>x.label)},timeline:audit.slice(0,20).map(x=>({id:x.id,label:x.label,at:x.at}))};
}
function ignore741(domains,actions){
 const active=new Set(actions.filter(x=>x.score>=65).map(x=>x.route)),rows=[];
 if(!active.has('tickets')&&!domains.tickets.attention.length)rows.push({route:'tickets',title:'Vstupenky',reason:'žádný transfer, payout ani pricing problém teď nehoří'});
 if(!active.has('work')&&domains.work.status==='KLID')rows.push({route:'work',title:'Práce',reason:'uložené pracovní termíny a blokátory jsou klidné'});
 if(!active.has('betting')&&!domains.betting.risk&&!domains.betting.unknownRisk)rows.push({route:'betting',title:'Sázení',reason:'otevřená expozice není podle uložených dat mimo nastavený rámec'});
 if(!active.has('more')&&!domains.insurance.actionCount)rows.push({route:'more',title:'Dokumenty',reason:'žádná známá pojistka nebo dokument teď nevyžaduje zásah'});
 if(!active.has('family')&&!domains.family.overdue&&!domains.family.due7)rows.push({route:'family',title:'Rodina',reason:'žádný rodinný termín není po termínu ani do 7 dní'});
 return rows.slice(0,3);
}

export function buildActionTruth741(input=null,{now=Date.now()}={}){
 const s=input||store.get(),freshness=sourceFreshness741(s,now),waiting=buildUnifiedWaiting741(s,now);
 const inbox=localInboxSummary660(s),work=workCommandCenter440(s),tickets=ticketData1300(s),money=moneyData1300(s),property=buildPropertyHub620(s),betting=bettingData1334(s),family=familyData140(s),homeTimeline=personalHomeTimeline650(s),insurance=insuranceCenter(s);
 const domains={inbox,work,tickets,money,property,betting,family,homeTimeline,insurance};
 domains.finance=financeTruth741(s,money);domains.ticketTruth=ticketTruth741(s,tickets);domains.bettingTruth=bettingTruth741(s,betting);domains.propertyTruth=propertyTruth741(s,property);domains.workTruth=workTruth741(s,work);domains.insuranceTruth=insuranceTruth741(s,insurance);
 const actions=actions741(s,domains,freshness,waiting,now),conflicts=conflicts741(s,domains),tomorrow=tomorrow741(s,waiting,now),audit=auditSummary741(s,actions,now),stateCheck=validateState(JSON.parse(JSON.stringify({...s,undo:[]})));
 const portable=backupHealth(s,input?{}:store.meta(),new Date(now));
 const searchHealth={...portable,serializable:true,stateValid:stateCheck.ok&&!stateCheck.fatal.length,issues:stateCheck.issues||[],fatal:stateCheck.fatal||[],roundTripOk:portable.roundTrip?.ok===true};
 return {
  version:'744.0.0',generatedAt:new Date(now).toISOString(),actions,primary:actions[0]||null,secondary:actions.slice(1,5),waiting,followUps:waiting.filter(x=>x.needsFollowUp),freshness,staleSources:freshness.filter(x=>x.stale),conflicts,
  ignore:ignore741(domains,actions),tomorrow,dailyClose:audit.dailyClose,weeklyReview:audit.weeklyReview,timeline:audit.timeline,domains,backupHealth:searchHealth,
  counts:{actions:actions.length,high:actions.filter(x=>x.score>=100).length,followUps:waiting.filter(x=>x.needsFollowUp).length,stale:freshness.filter(x=>x.stale).length,conflicts:conflicts.length,tomorrow:tomorrow.length}
 };
}
