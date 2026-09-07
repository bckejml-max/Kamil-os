import {store,validateState} from './state.js';
import {modal,formModal,h,toast} from './utils.js';
import {collectActions949,globalInbox950,moneyCockpit954,ticketPortfolio957,bettingLedger958,propertyCenter959,documentIntelligence962,notificationBrain963} from './oneOS967.js';
import {sourceConfidence972,dataGaps973,consolidationHealth977,usage975} from './oneOS977.js';

export const CONTROL_PLANE1037_VERSION='1037.0.0';
const K={errors:'kamil.control.errors.989',snapshots:'kamil.control.snapshots.998',sync:'kamil.control.sync.1010',conflicts:'kamil.control.conflicts.1011',actions:'kamil.control.actions.1015',audit:'kamil.control.audit.1019',watches:'kamil.control.watches.1030',watchState:'kamil.control.watch-state.1031',automations:'kamil.control.automations.1035',resume:'kamil.control.resume.1008'};
const A=v=>Array.isArray(v)?v:[];
const N=v=>Number.isFinite(Number(v))?Number(v):0;
const U=v=>String(v||'').toUpperCase();
const nowIso=()=>new Date().toISOString();
const uid=p=>`${p}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
const read=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const pushBounded=(k,row,max=500)=>{const rows=A(read(k,[]));rows.push(row);write(k,rows.slice(-max));return row};
const closed=x=>['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','PAYOUT RECEIVED','VOID'].includes(U(x?.status||x?.workflow));
const title=x=>String(x?.title||x?.name||x?.summary||x?.event||x?.label||'Položka');
const due=x=>x?.due||x?.deadline||x?.followUpAt||x?.eventDate||x?.event_date||x?.expiry||x?.expiresAt||null;
const ageDays=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.floor((Date.now()-t)/86400000):null};
const clone=v=>JSON.parse(JSON.stringify(v));

// OS988-OS1000 · stability, errors, data and backup
export function errorInbox989(){return A(read(K.errors,[])).slice().reverse()}
export function recordError989(error,context='runtime'){
 const message=String(error?.message||error||'Unknown error'),stack=String(error?.stack||'').slice(0,1800);
 return pushBounded(K.errors,{id:uid('err989'),at:nowIso(),context,message,stack,url:location?.href||''},300);
}
export function errorDeduplication990(rows=errorInbox989()){
 const map=new Map();for(const x of rows){const key=`${x.context}|${x.message}`;const cur=map.get(key)||{...x,count:0,lastAt:x.at};cur.count++;if(Date.parse(x.at)>Date.parse(cur.lastAt))cur.lastAt=x.at;map.set(key,cur)}
 return [...map.values()].sort((a,b)=>Date.parse(b.lastAt)-Date.parse(a.lastAt));
}
export function selfDiagnostics991(){
 const groups=errorDeduplication990(),diagnoses=[];
 for(const x of groups.slice(0,12)){
  let cause='Neznámá runtime chyba';
  if(/import|module|fetch|404/i.test(x.message))cause='Pravděpodobně chybějící nebo nedostupný lazy modul';
  else if(/quota|storage/i.test(x.message))cause='LocalStorage je plný nebo nedostupný';
  else if(/network|offline|failed to fetch/i.test(x.message))cause='Síť nebo externí zdroj není dostupný';
  else if(/undefined|null|not a function/i.test(x.message))cause='Neplatný runtime kontrakt / chybějící data';
  diagnoses.push({...x,cause});
 }
 return diagnoses;
}
export function recoveryActions992(){
 const d=selfDiagnostics991();return [
  {id:'reload',label:'Obnovit aplikaci',safe:true,available:true},
  {id:'retry',label:'Znovu vyhodnotit One OS',safe:true,available:true},
  {id:'clear-errors',label:'Vyčistit Error Inbox',safe:true,available:d.length>0},
  {id:'restore',label:'Obnovit ze snapshotu',safe:true,available:backupSnapshotList998().length>0,requiresConfirmation:true}
 ];
}
export function dataIntegrityScanner993(s=store.get()){
 const validation=validateState(s),issues=[...A(validation.issues),...A(validation.fatal)];
 const stale=[];for(const [k,v] of Object.entries({finance:s.financePlan?.asOf,calendar:s.calendar?.asOf,xtb:s.xtbReport?.asOf})){const a=ageDays(v);if(a!==null&&a>30)stale.push(`${k}: ${a} dní`)}
 return{ok:validation.ok&&!issues.length,issues,stale,duplicateHints:duplicateStoreDetector995(s).duplicates.length};
}
export function canonicalSourceRegistry994(){return{
 MONEY:{canonical:'financePlan + netWorthBook',fallback:'xtbReport',externalRequired:false},
 TICKETS:{canonical:'ticketBook.items',fallback:'none',externalRequired:'market price adapter'},
 BETTING:{canonical:'bettingBook/betBook ledger',fallback:'none',externalRequired:'odds adapter'},
 PROPERTY:{canonical:'propertyBook.candidates',fallback:'propertyBook.items',externalRequired:'listing adapter'},
 WORK:{canonical:'projects + tasks',fallback:'personalInbox',externalRequired:false},
 FAMILY:{canonical:'familyHome + calendar',fallback:'tasks',externalRequired:false},
 DOCS:{canonical:'documentBook/documents + personalAdmin',fallback:'personalAdmin',externalRequired:false}
}}
export function duplicateStoreDetector995(s=store.get()){
 const domains=[['tasks',A(s.tasks)],['projects',A(s.projects)],['inbox',A(s.inbox)],['personalInbox',A(s.personalInbox?.items)],['tickets',A(s.ticketBook?.items)],['properties',A(s.propertyBook?.candidates||s.propertyBook?.items)]];
 const seen=new Map(),duplicates=[];for(const [domain,rows] of domains)for(const x of rows){const key=String(x?.id||title(x)).trim().toLowerCase();if(!key)continue;if(seen.has(key)&&seen.get(key)!==domain)duplicates.push({key,domains:[seen.get(key),domain]});else seen.set(key,domain)}
 return{duplicates,domains:domains.map(([name,rows])=>({name,count:rows.length}))};
}
export function safeDataMigrationPlan996(s=store.get()){
 const dup=duplicateStoreDetector995(s),integrity=dataIntegrityScanner993(s);return{mode:'PLAN_ONLY',steps:['Vytvořit OS998 snapshot','Validovat cílové schema','Sloučit pouze potvrzené duplicity','Spustit validateState','Porovnat counts před/po','Umožnit OS999 rollback'],duplicates:dup.duplicates,issues:integrity.issues,automatic:false};
}
export function dataSchemaVersions997(s=store.get()){return{current:Number(s.meta?.schemaVersion||0),createdAt:s.meta?.createdAt||null,lastMutationAt:s.meta?.lastMutationAt||null,policy:'migrate-through-state.js'}}
export function automaticBackupSnapshot998(reason='manual'){
 const s=store.get(),row={id:uid('snap998'),at:nowIso(),reason,schemaVersion:Number(s.meta?.schemaVersion||0),state:clone(s)};const rows=A(read(K.snapshots,[]));rows.push(row);write(K.snapshots,rows.slice(-12));auditTrail1019({type:'SNAPSHOT',detail:reason,ref:row.id});return row;
}
export function backupSnapshotList998(){return A(read(K.snapshots,[])).map(({state,...x})=>x).reverse()}
export function restoreCenter999(snapshotId,{apply=false}={}){
 const row=A(read(K.snapshots,[])).find(x=>x.id===snapshotId);if(!row)return{ok:false,reason:'SNAPSHOT_NOT_FOUND'};
 const validation=validateState(row.state);if(!validation.ok)return{ok:false,reason:'INVALID_SNAPSHOT',validation};
 if(!apply)return{ok:true,mode:'DRY_RUN',snapshot:{id:row.id,at:row.at,reason:row.reason},validation};
 automaticBackupSnapshot998('pre-restore');store.replace(clone(row.state),'OS999 restore snapshot');auditTrail1019({type:'RESTORE',detail:row.reason,ref:row.id});return{ok:true,mode:'APPLIED',snapshotId:row.id};
}
export function oneOSMilestone1000(){return{milestone:'OS1000',architecture:'ONE_OS_FROZEN_CORE',experimentalEntrypoints:false,controlPlaneRequired:true,legacyGateway:'OS969',retirementGate:'OS987',policy:{noInventedExternalData:true,noAutoFinancialExecution:true,noAutoBettingExecution:true}}}
export function systemHealth988(){
 const integrity=dataIntegrityScanner993(),errors=errorDeduplication990(),con=consolidationHealth977(),gaps=dataGaps973(),online=navigator.onLine!==false;let score=100;
 score-=Math.min(30,integrity.issues.length*6);score-=Math.min(18,errors.length*3);score-=Math.min(18,gaps.filter(x=>x.priority>=75).length*6);if(!online)score-=10;if(con.score<80)score-=10;
 return{score:Math.max(0,score),online,integrity,errors:errors.length,highPriorityGaps:gaps.filter(x=>x.priority>=75).length,oneOSHealth:con.score,version:CONTROL_PLANE1037_VERSION};
}

// OS1001-OS1014 · performance, offline/sync, provenance and trust
export function performanceProfiler1001(){
 const nav=performance.getEntriesByType?.('navigation')?.[0],resources=performance.getEntriesByType?.('resource')||[];return{domReady:nav?Math.round(nav.domContentLoadedEventEnd):null,load:nav?Math.round(nav.loadEventEnd):null,resources:resources.length,transferBytes:resources.reduce((a,x)=>a+N(x.transferSize),0),scripts:resources.filter(x=>/\.js(\?|$)/.test(x.name)).length,styles:resources.filter(x=>/\.css(\?|$)/.test(x.name)).length};
}
export function jsDependencyMap1002(){return{
 'controlPlane1037':['state','utils','oneOS967','oneOS977'],
 'oneOS977':['oneOS967','state','utils'],
 'oneOS967':['state','utils'],
 'legacyCleanup987':['oneOS977'],
 'commandCopilot840':['copilot840','strategyCommand790']
}}
export function deadImportDetector1003(){
 const loaded=new Set((performance.getEntriesByType?.('resource')||[]).filter(x=>/\.js(\?|$)/.test(x.name)).map(x=>x.name.split('/').pop().split('?')[0]));
 const candidates=['operator717.js','operatorTruth737.js','dataTruthAudit738.js','strategy788.js','copilot840.js','autonomous943.js','ticketCommander660.js'];return candidates.map(file=>({file,loaded:loaded.has(file),status:loaded.has(file)?'USED_THIS_SESSION':'NOT_LOADED_THIS_SESSION',deleteSafe:false}));
}
export function deadCssDetector1004(){
 const loaded=[...document.querySelectorAll('link[rel="stylesheet"]')].map(x=>x.href.split('/').pop().split('?')[0]);const candidates=['operator717.css','truth737.css','strategy788.css'];return candidates.map(file=>({file,loaded:loaded.includes(file),status:loaded.includes(file)?'USED_THIS_SESSION':'NOT_LOADED_THIS_SESSION',deleteSafe:false}));
}
export function bundleBudget1005(){const p=performanceProfiler1001(),budget=1500000;return{budgetBytes:budget,usedBytes:p.transferBytes,ratio:budget?p.transferBytes/budget:null,status:p.transferBytes<=budget?'OK':'OVER_BUDGET'}}
export function lazyLoadPolicy1006(){return{eager:['state','utils','shell','One OS Today'],deferred:['tickets details','betting intelligence','legacy centers','diagnostics','Control Plane detail modals'],policy:'critical-path-first'}}
export function bootPriorityEngine1007(){return[{priority:1,area:'Shell + navigation'},{priority:2,area:'Dnes / One OS'},{priority:3,area:'Command Bar'},{priority:4,area:'active domain view'},{priority:8,area:'diagnostics'},{priority:9,area:'legacy'}]}
export function instantResume1008(view){
 if(view){write(K.resume,{view:String(view),at:nowIso()});return{view:String(view),saved:true}}
 return read(K.resume,{view:'today',at:null});
}
export function offlineMode1009(){return{online:navigator.onLine!==false,mode:navigator.onLine===false?'OFFLINE':'ONLINE',safeOffline:['tasks','notes','local actions','snapshots','decision journal'],requiresNetwork:['external market feeds','cloud sync','Gmail adapter','Calendar adapter']}}
export function syncQueue1010(item){
 if(item){const rows=A(read(K.sync,[]));const row={id:uid('sync1010'),at:nowIso(),status:'QUEUED',...item};rows.push(row);write(K.sync,rows.slice(-300));return row}
 return A(read(K.sync,[]));
}
export function syncConflictCenter1011(localRow,remoteRow,key='id'){
 if(localRow&&remoteRow){const same=JSON.stringify(localRow)===JSON.stringify(remoteRow);if(same)return{conflict:false};const row={id:uid('conf1011'),at:nowIso(),key,local:clone(localRow),remote:clone(remoteRow),status:'NEEDS_REVIEW'};pushBounded(K.conflicts,row,100);return{conflict:true,row}}
 return{conflicts:A(read(K.conflicts,[])).filter(x=>x.status==='NEEDS_REVIEW')};
}
export function dataProvenance1012(s=store.get()){
 const reg=canonicalSourceRegistry994();return Object.entries(reg).map(([domain,x])=>({domain,canonical:x.canonical,fallback:x.fallback,externalRequired:x.externalRequired,observedAt:s.meta?.lastMutationAt||null}));
}
export function freshnessBadges1013(s=store.get()){
 const rows=[{domain:'MONEY',at:s.financePlan?.asOf||s.meta?.lastMutationAt},{domain:'CALENDAR',at:s.calendar?.asOf},{domain:'XTB',at:s.xtbReport?.asOf}];return rows.map(x=>{const age=ageDays(x.at);return{...x,ageDays:age,badge:age===null?'UNKNOWN':age<=0?'LIVE/TODAY':age<=7?'FRESH':age<=30?'AGING':'STALE'}});
}
export function trustAwareDecisions1014(){
 const trust=Object.fromEntries(sourceConfidence972().map(x=>[x.domain,x.grade]));const opp=[];const t=ticketPortfolio957(),b=bettingLedger958(),p=propertyCenter959();
 if(t.active.length)opp.push({domain:'TICKETS',decision:'Portfolio review',confidence:trust.TICKETS||'LOW'});if(b.rows.length)opp.push({domain:'BETTING',decision:'Ledger review',confidence:trust.BETTING||'LOW'});if(p.rows.length)opp.push({domain:'PROPERTY',decision:'Candidate review',confidence:trust.PROPERTY||'LOW'});return opp.map(x=>({...x,actionStrength:x.confidence==='HIGH'?'NORMAL':x.confidence==='MEDIUM'?'CAUTIOUS':'VERIFY_FIRST'}));
}

// OS1015-OS1020 · safe action execution
export function approvalLevels1016(action={}){
 const type=U(action.type),danger=/PAY|TRANSFER|BET|BUY|SELL|DELETE|SEND_EXTERNAL/.test(type);if(danger)return{level:'MANUAL',executable:false,reason:'High-impact/external action'};
 if(/RESTORE|UPDATE|COMPLETE|SNOOZE/.test(type))return{level:'CONFIRM',executable:true};return{level:'LOCAL_SAFE',executable:true};
}
export function dryRun1017(action={}){return{action:clone(action),approval:approvalLevels1016(action),changes:describeAction(action),executed:false}}
function describeAction(action={}){const type=U(action.type);if(type==='CREATE_TASK')return[`Přidat úkol: ${action.title||'Bez názvu'}`];if(type==='COMPLETE_TASK')return[`Označit úkol ${action.id||'?'} jako DONE`];if(type==='SNOOZE_TASK')return[`Posunout follow-up úkolu ${action.id||'?'} na ${action.until||'zítra'}`];if(type==='RESTORE_SNAPSHOT')return[`Obnovit snapshot ${action.snapshotId||'?'}`];return[`Akce ${type||'UNKNOWN'} není mapovaná na lokální změnu`]}
export function undoFramework1018(entry){
 if(entry){return pushBounded('kamil.control.undo.1018',{id:uid('undo1018'),at:nowIso(),...entry},40)}
 return A(read('kamil.control.undo.1018',[])).slice().reverse();
}
export function auditTrail1019(row){if(row)return pushBounded(K.audit,{id:uid('audit1019'),at:nowIso(),...row},500);return A(read(K.audit,[])).slice().reverse()}
export function safeAutomationRules1020(){return{allowed:['NOTIFY','CREATE_TASK','CREATE_INBOX_ITEM','SNOOZE_LOCAL'],blocked:['PAY','TRANSFER','BUY_TICKET','SELL_TICKET','PLACE_BET','CANCEL_BET','SEND_EMAIL_AUTOMATIC','DELETE_DATA'],externalWritesRequireExplicitUser:true,noFinancialExecution:true,noBettingExecution:true}}
export function actionExecutionFramework1015(action,{confirmed=false}={}){
 const approval=approvalLevels1016(action),dry=dryRun1017(action);if(!approval.executable)return{ok:false,blocked:true,...dry};if(approval.level==='CONFIRM'&&!confirmed)return{ok:false,needsConfirmation:true,...dry};
 const type=U(action.type);if(!safeAutomationRules1020().allowed.includes(type)&&!['COMPLETE_TASK','RESTORE_SNAPSHOT'].includes(type))return{ok:false,blocked:true,reason:'NOT_WHITELISTED',...dry};
 automaticBackupSnapshot998(`pre-action:${type}`);const before=clone(store.get());let ok=false;
 if(type==='CREATE_TASK'){store.mutate('OS1015 create task',s=>{s.tasks=s.tasks||[];s.tasks.push({id:uid('task'),title:String(action.title||'Nový úkol'),status:'OPEN',due:action.due||null,createdAt:nowIso(),source:'OS1015'})});ok=true}
 if(type==='CREATE_INBOX_ITEM'){store.mutate('OS1015 create inbox',s=>{s.personalInbox=s.personalInbox||{items:[]};s.personalInbox.items=s.personalInbox.items||[];s.personalInbox.items.push({id:uid('inbox'),title:String(action.title||'Nová položka'),status:'OPEN',note:String(action.note||''),createdAt:nowIso(),source:'OS1015'})});ok=true}
 if(type==='COMPLETE_TASK'){store.mutate('OS1015 complete task',s=>{const x=A(s.tasks).find(t=>String(t.id)===String(action.id));if(x){x.status='DONE';x.completedAt=nowIso();ok=true}})}
 if(type==='SNOOZE_LOCAL'||type==='SNOOZE_TASK'){store.mutate('OS1015 snooze',s=>{const x=A(s.tasks).find(t=>String(t.id)===String(action.id));if(x){x.followUpAt=action.until||new Date(Date.now()+86400000).toISOString();x.updatedAt=nowIso();ok=true}})}
 if(type==='RESTORE_SNAPSHOT'){const r=restoreCenter999(action.snapshotId,{apply:true});ok=!!r.ok}
 if(ok){undoFramework1018({type,action:clone(action),state:before});auditTrail1019({type:'ACTION',detail:type,ref:action.id||action.snapshotId||null})}
 return{ok,approval,executed:ok,changes:dry.changes};
}

// OS1021-OS1030 · adapter contracts and watch engine
export function gmailActionBridge1021(message){
 const contract={adapter:'GMAIL',status:'ADAPTER_REQUIRED',canRead:false,canWrite:false,reason:'Browser app nemá vlastní Gmail OAuth/API adapter'};if(!message)return contract;
 return{...contract,proposal:{type:'CREATE_INBOX_ITEM',title:message.subject||'Email',note:`Od: ${message.from||'—'}${message.snippet?` · ${message.snippet}`:''}`,sourceId:message.id||null},executed:false};
}
export function calendarBridge1022(event){const contract={adapter:'CALENDAR',status:'ADAPTER_REQUIRED',canRead:!!A(store.get().calendar?.events).length,canWrite:false};return event?{...contract,proposal:{type:'CREATE_TASK',title:event.title||event.summary||'Kalendář',due:event.start||event.date||null},executed:false}:contract}
export function contactResolution1023(query=''){
 const q=String(query).toLowerCase(),s=store.get(),rows=[...A(s.emergencyFile?.contacts),...A(s.contacts?.items),...A(s.familyHome?.members)];return rows.filter(x=>`${x.name||''} ${x.email||''} ${x.phone||''}`.toLowerCase().includes(q)).slice(0,12);
}
export function documentToAction1024(doc){
 if(!doc)return documentIntelligence962().map(x=>({doc:x,proposal:x.days!==null&&x.days<=30?{type:'CREATE_TASK',title:`Vyřešit: ${x.title}`,due:x.expires}:null}));const expiry=due(doc);return{proposal:expiry?{type:'CREATE_TASK',title:`Vyřešit: ${title(doc)}`,due:expiry}:null,executed:false};
}
export function workProjectSync1025(s=store.get()){
 return A(s.projects).filter(x=>!closed(x)).map(x=>({id:x.id,title:title(x),status:x.status||'OPEN',deadline:due(x),nextAction:x.nextAction||x.note||'',risk:U(x.status).includes('BLOCK')?'HIGH':due(x)&&Date.parse(due(x))<Date.now()?'HIGH':'NORMAL',source:'projects'}));
}
export function financialImportCenter1026(rows=[]){
 const normalized=A(rows).map((x,i)=>({id:x.id||`import-${i}`,date:x.date||x.datum||null,amount:N(x.amount||x.castka),description:String(x.description||x.popis||''),account:x.account||null}));const invalid=normalized.filter(x=>!x.date||!Number.isFinite(x.amount));return{mode:'PREVIEW_ONLY',rows:normalized,invalid:invalid.length,total:normalized.reduce((a,x)=>a+x.amount,0),requiresExplicitImport:true};
}
export function ticketMarketFeedContract1027(){return{domain:'TICKETS',interface:{id:'string',marketPrice:'number',asOf:'ISO date',source:'string'},status:'ADAPTER_REQUIRED',neverInventPrice:true}}
export function bettingOddsFeedContract1028(){return{domain:'BETTING',interface:{eventId:'string',market:'string',odds:'number',asOf:'ISO date',source:'string',closingOdds:'optional number'},status:'ADAPTER_REQUIRED',neverInventOdds:true,neverInventCLV:true}}
export function propertyFeedContract1029(){return{domain:'PROPERTY',interface:{id:'string',url:'string',price:'number',rent:'optional number',asOf:'ISO date',source:'string'},status:'ADAPTER_REQUIRED',neverInventListing:true}}
export function unifiedWatchEngine1030(watch){
 if(watch){const rows=A(read(K.watches,[])),row={id:watch.id||uid('watch1030'),enabled:watch.enabled!==false,createdAt:watch.createdAt||nowIso(),kind:U(watch.kind||'GENERIC'),subject:String(watch.subject||''),field:String(watch.field||''),condition:watch.condition||'CHANGED',threshold:watch.threshold??null,...watch};rows.push(row);write(K.watches,rows.slice(-150));return row}
 return A(read(K.watches,[]));
}

// OS1031-OS1037 · changes, notifications, digests, automation and final control plane
function watchValue(w,s=store.get()){
 if(w.kind==='MONEY')return moneyCockpit954(s)[w.field||'free'];if(w.kind==='TICKETS')return ticketPortfolio957(s)[w.field||'capital'];if(w.kind==='BETTING')return bettingLedger958(s)[w.field||'profit'];if(w.kind==='PROPERTY')return propertyCenter959(s)[w.field||'missing'];if(w.kind==='WORK')return workProjectSync1025(s).length;return null;
}
export function changeDetection1031(s=store.get()){
 const prev=read(K.watchState,{}),next={},changes=[];for(const w of unifiedWatchEngine1030().filter(x=>x.enabled)){const value=watchValue(w,s);next[w.id]={value,at:nowIso()};const old=prev[w.id]?.value;if(old!==undefined&&JSON.stringify(old)!==JSON.stringify(value))changes.push({watchId:w.id,kind:w.kind,subject:w.subject,from:old,to:value,at:nowIso()})}write(K.watchState,next);return changes;
}
export function smartNotificationDelivery1032(s=store.get()){
 const urgent=notificationBrain963(s),changes=changeDetection1031(s),immediate=[],today=[],digest=[];for(const x of urgent){if(N(x.score)>=85)immediate.push(x);else today.push(x)}for(const x of changes)digest.push(x);return{immediate:immediate.slice(0,6),today:today.slice(0,10),digest:digest.slice(0,20),policy:'urgent-now / actionable-today / changes-digest'};
}
export function dailyDigest1033(s=store.get()){
 const actions=collectActions949(s),inbox=globalInbox950(s),delivery=smartNotificationDelivery1032(s);return{date:new Date().toISOString().slice(0,10),do:actions.slice(0,3),decide:inbox.filter(x=>x.score>=60).slice(0,3),watching:delivery.digest.slice(0,5),dataGaps:dataGaps973(s).slice(0,3),health:systemHealth988().score};
}
export function weeklyCeoReview1034(s=store.get()){
 const money=moneyCockpit954(s),tickets=ticketPortfolio957(s),bets=bettingLedger958(s),property=propertyCenter959(s),work=workProjectSync1025(s),usage=usage975(7);return{week:new Date().toISOString().slice(0,10),health:systemHealth988().score,money:{cash:money.cash,free:money.free,netWorth:money.netWorth},tickets:{active:tickets.active.length,capital:tickets.capital,expectedNet:tickets.expectedNet},betting:{settled:bets.settled.length,profit:bets.profit,roi:bets.roi},property:{candidates:property.rows.length,best:property.best?.title||property.best?.name||null},work:{open:work.length,highRisk:work.filter(x=>x.risk==='HIGH').length},usage:usage.total};
}
export function personalAutomationBuilder1035(rule){
 if(rule){const allowedConditions=['HEALTH_BELOW','DATA_GAPS_ABOVE','TASKS_ABOVE','WATCH_CHANGED'],allowedActions=['NOTIFY','CREATE_TASK','CREATE_INBOX_ITEM'];if(!allowedConditions.includes(U(rule.condition?.type))||!allowedActions.includes(U(rule.action?.type)))return{ok:false,reason:'RULE_NOT_ALLOWED'};const rows=A(read(K.automations,[])),row={id:uid('auto1035'),enabled:false,createdAt:nowIso(),lastRunAt:null,...rule};rows.push(row);write(K.automations,rows.slice(-80));return{ok:true,row}}
 return A(read(K.automations,[]));
}
function evalCondition(rule,s=store.get()){
 const type=U(rule.condition?.type),v=N(rule.condition?.value);if(type==='HEALTH_BELOW')return systemHealth988().score<v;if(type==='DATA_GAPS_ABOVE')return dataGaps973(s).length>v;if(type==='TASKS_ABOVE')return A(s.tasks).filter(x=>!closed(x)).length>v;if(type==='WATCH_CHANGED')return changeDetection1031(s).length>0;return false;
}
export function automationSafetySimulator1036(rule,s=store.get()){
 const r=rule||{},condition=evalCondition(r,s),action=r.action||{},approval=approvalLevels1016(action),allowed=safeAutomationRules1020().allowed.includes(U(action.type));return{ruleId:r.id||null,wouldTrigger:condition,action,allowed,approval,executed:false,safe:allowed&&!/PAY|TRANSFER|BET|BUY|SELL/.test(U(action.type))};
}
export function runSafeAutomations1035(s=store.get()){
 const rows=personalAutomationBuilder1035(),results=[];for(const rule of rows.filter(x=>x.enabled)){const sim=automationSafetySimulator1036(rule,s);if(!sim.wouldTrigger||!sim.safe){results.push({...sim,skipped:true});continue}const action=U(rule.action?.type)==='NOTIFY'?{type:'CREATE_INBOX_ITEM',title:rule.action?.title||rule.name||'Automation',note:'OS1035 safe notification'}:rule.action;const res=actionExecutionFramework1015(action,{confirmed:true});rule.lastRunAt=nowIso();results.push({...sim,result:res})}write(K.automations,rows);return results;
}
export function controlPlane1037(){return{
 version:CONTROL_PLANE1037_VERSION,health:systemHealth988(),milestone:oneOSMilestone1000(),integrity:dataIntegrityScanner993(),performance:performanceProfiler1001(),bundle:bundleBudget1005(),offline:offlineMode1009(),sources:sourceConfidence972(),freshness:freshnessBadges1013(),sync:{queued:syncQueue1010().length,conflicts:syncConflictCenter1011().conflicts.length},actions:{audit:auditTrail1019().length,undo:undoFramework1018().length},integrations:{gmail:gmailActionBridge1021(),calendar:calendarBridge1022(),tickets:ticketMarketFeedContract1027(),betting:bettingOddsFeedContract1028(),property:propertyFeedContract1029()},watches:unifiedWatchEngine1030().length,automations:personalAutomationBuilder1035().length,policy:{controlPlane:true,noInventedExternalData:true,noAutomaticFinancialExecution:true,noAutomaticBettingExecution:true,externalWritesRequireExplicitUser:true}}
}

async function openErrors(){const rows=errorDeduplication990();return modal('Error Inbox · OS989–992',rows.length?rows.slice(0,20).map(x=>`<div class="row"><div><b>${h(x.message)}</b><div class="muted">${h(x.context)} · ${x.count}× · ${h(x.cause||'')}</div></div></div>`).join(''):'<div class="empty success-empty">Žádné zachycené runtime chyby.</div>',[{label:'Vyčistit chyby',value:'clear'},{label:'Zavřít',value:null,primary:true}]).then(v=>{if(v==='clear'){write(K.errors,[]);toast('Error Inbox vyčištěn')}return v})}
async function openBackups(){const list=backupSnapshotList998();const v=await modal('Backup & Restore · OS998/999',`<div class="card"><div class="row"><span>Snapshotů</span><b>${list.length}</b></div></div>${list.slice(0,8).map(x=>`<div class="row"><div><b>${h(x.reason)}</b><div class="muted">${h(new Date(x.at).toLocaleString('cs-CZ'))}</div></div><span>${h(x.schemaVersion)}</span></div>`).join('')||'<div class="empty">Zatím žádný snapshot.</div>'}`,[{label:'Vytvořit snapshot',value:'create',primary:true},{label:list.length?'Dry-run posledního restore':'Restore není dostupný',value:list.length?'dry':null},{label:'Zavřít',value:null}]);if(v==='create'){automaticBackupSnapshot998('manual-control-plane');toast('Snapshot vytvořen')}if(v==='dry'&&list[0]){const r=restoreCenter999(list[0].id);toast(r.ok?'Restore dry-run je v pořádku':'Snapshot nelze obnovit')}return v}
async function openIntegrations(){const c=controlPlane1037();return modal('Integrace & Feeds · OS1021–1030',Object.entries(c.integrations).map(([k,x])=>`<div class="row"><div><b>${h(k.toUpperCase())}</b><div class="muted">${h(x.status||'CONTRACT')}</div></div><span>${h(x.status==='ADAPTER_REQUIRED'?'ADAPTER':'READY')}</span></div>`).join('')+'<div class="decision-note">Externí adaptéry nejsou předstírané. Live stav začne až po skutečném připojení zdroje.</div>',[{label:'Zavřít',value:null,primary:true}])}
async function openAutomation(){const rules=personalAutomationBuilder1035();return modal('Automation Builder · OS1035/1036',`<div class="card"><div class="row"><span>Pravidel</span><b>${rules.length}</b></div><div class="row"><span>Povolené akce</span><b>NOTIFY / TASK / INBOX</b></div></div>${rules.map(r=>`<div class="row"><span>${h(r.name||r.id)}</span><b>${r.enabled?'ON':'OFF'}</b></div>`).join('')||'<div class="empty">Zatím žádné automation pravidlo.</div>'}<div class="decision-note">Finance, ticket buy/sell a betting jsou vždy blokované.</div>`,[{label:'Zavřít',value:null,primary:true}])}
export async function openControlPlane1037(){
 const x=controlPlane1037(),v=await modal('Kamil OS Control Plane · OS1037',`<div class="card"><div class="eyebrow">SYSTEM HEALTH</div><h2>${Math.round(x.health.score)} / 100</h2><div class="row"><span>Data integrity</span><b>${x.integrity.ok?'OK':`${x.integrity.issues.length} problémů`}</b></div><div class="row"><span>Runtime chyby</span><b>${x.health.errors}</b></div><div class="row"><span>Sync queue / conflicts</span><b>${x.sync.queued} / ${x.sync.conflicts}</b></div><div class="row"><span>Bundle budget</span><b>${h(x.bundle.status)}</b></div><div class="row"><span>Watches / automations</span><b>${x.watches} / ${x.automations}</b></div><div class="row"><span>Síť</span><b>${h(x.offline.mode)}</b></div></div><div class="decision-note">OS988–1037: stabilita, backup, sync, action safety, adapter contracts, watch engine a automations. Externí live data se nikdy nevymýšlí.</div>`,[{label:'Denní digest',value:'digest',primary:true},{label:'Errors / Recovery',value:'errors'},{label:'Data & Trust',value:'data'},{label:'Backup / Restore',value:'backup'},{label:'Integrace / Feeds',value:'integrations'},{label:'Automations',value:'automations'},{label:'Legacy cleanup',value:'cleanup'},{label:'One OS Control',value:'oneos'},{label:'Zavřít',value:null}]);
 if(v==='digest'){const d=dailyDigest1033();return modal('Daily Digest · OS1033',`<div class="card"><div class="eyebrow">UDĚLEJ</div>${d.do.map(x=>`<div class="row"><span>${h(x.title)}</span><b>${x.score}</b></div>`).join('')||'<div class="empty">Nic urgentního.</div>'}</div><div class="card"><div class="eyebrow">ROZHODNI</div>${d.decide.map(x=>`<div class="row"><span>${h(x.title)}</span><b>${x.score}</b></div>`).join('')||'<div class="empty">Nic k rozhodnutí.</div>'}</div>`,[{label:'Zavřít',value:null,primary:true}])}
 if(v==='errors')return openErrors();if(v==='data'){const d=dataIntegrityScanner993();return modal('Data & Trust · OS993–1014',`<div class="card"><div class="row"><span>Integrity</span><b>${d.ok?'OK':'CHECK'}</b></div><div class="row"><span>Issues</span><b>${d.issues.length}</b></div><div class="row"><span>Duplicate hints</span><b>${d.duplicateHints}</b></div></div>${sourceConfidence972().map(x=>`<div class="row"><span>${h(x.domain)}</span><b>${h(x.grade)}</b></div>`).join('')}`,[{label:'Zavřít',value:null,primary:true}])}if(v==='backup')return openBackups();if(v==='integrations')return openIntegrations();if(v==='automations')return openAutomation();if(v==='cleanup'){const m=await import('./legacyCleanup987.js');return m.openLegacyCleanup987?.()}if(v==='oneos'){const m=await import('./oneOS977.js');return m.openConsolidation977?.()}return v;
}
function bindCommand(){document.addEventListener('keydown',e=>{if(e.key!=='Enter'||e.target?.id!=='commandInput')return;const q=String(e.target.value||'').trim().toLowerCase();if(!/^\/(control|system|health2|backup|automations)\b/.test(q))return;e.preventDefault();e.stopImmediatePropagation();if(/^\/backup\b/.test(q))openBackups();else if(/^\/automations\b/.test(q))openAutomation();else openControlPlane1037()},true)}
function bindRuntimeErrors(){if(window.__KAMIL_CONTROL_ERRORS1037__)return;window.addEventListener('error',e=>recordError989(e.error||e.message,'window.error'));window.addEventListener('unhandledrejection',e=>recordError989(e.reason,'unhandledrejection'));window.__KAMIL_CONTROL_ERRORS1037__=true}
function bindResume(){document.addEventListener('click',e=>{const n=e.target.closest?.('[data-view]');if(n?.dataset?.view)instantResume1008(n.dataset.view)},true)}
export function installControlPlane1037(){if(window.__KAMIL_CONTROL_PLANE1037__?.installed)return;bindRuntimeErrors();bindCommand();bindResume();setTimeout(()=>{try{changeDetection1031();runSafeAutomations1035()}catch(error){recordError989(error,'automation-boot')}},2500);window.__KAMIL_CONTROL_PLANE1037__={installed:true,version:CONTROL_PLANE1037_VERSION,features:Array.from({length:50},(_,i)=>988+i),open:openControlPlane1037,health:systemHealth988,policy:controlPlane1037().policy}}
