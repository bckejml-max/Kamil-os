// Canonical ticket view adapter.
// Critical ticket UX boots first. Historical analytics are best-effort and must
// never block or take DOM ownership away from the visible Commander 6 workflow.

let bootPromise=null,legacyPromise=null;
const BOOT_VERSION='466.1.2';
const LEGACY_DELAY_MS=12000;
const LEGACY_YIELD_MS=12;

const CRITICAL=[
  ['./ticketUi421.js','installTicketUi421','CANONICAL UI 421/466'],
  ['./ticketMarketEngine426.js','installTicketMarketEngine426','ENGINE 426'],
  ['./ticketCommander465.js','installTicketCommander465','COMMANDER 465'],
  ['./ticketConsolidation466.js','installTicketConsolidation466','EXECUTION UI 466']
];

const ESSENTIAL_ANALYTICS=[
  ['./ticketMarketHealth397.js','installTicketMarketHealth397','MARKET HEALTH 397'],
  ['./ticketAlerts413.js','installTicketAlerts413','ALERTS 413']
];

const MODULES=[
  ['./ticketPriceIntelligence374.js','installTicketPriceIntelligence374','PRICE 374'],
  ['./ticketRefresh395.js','installTicketRefresh395','REFRESH 395'],
  ['./ticketSourceEditor382.js','installTicketSourceEditor382','SOURCE 382'],
  ['./ticketRowAuto396.js','installTicketRowAuto396','ROW AUTO 396'],
  ['./ticketMarketHealth397.js','installTicketMarketHealth397','MARKET HEALTH 397'],
  ['./ticketManualMarket398.js','installTicketManualMarket398','MANUAL MARKET 398'],
  ['./ticketReadiness400.js','installTicketReadiness400','READINESS 400'],
  ['./ticketPriceMemory402.js','installTicketPriceMemory402','PRICE MEMORY 402'],
  ['./ticketClipboardMarket403.js','installTicketClipboardMarket403','CLIPBOARD 403'],
  ['./ticketAutopilot407.js','installTicketAutopilot407','AUTOPILOT 407'],
  ['./ticketSaleSync408.js','installTicketSaleSync408','SALE SYNC 408'],
  ['./ticketSoldGuard408.js','installTicketSoldGuard408','SOLD GUARD 408'],
  ['./ticketPriceHistory409.js','installTicketPriceHistory409','HISTORY 409'],
  ['./ticketActionQueue410.js','installTicketActionQueue410','ACTION QUEUE 410'],
  ['./ticketSettlement411.js','installTicketSettlement411','SETTLEMENT 411'],
  ['./ticketReconcile412.js','installTicketReconcile412','RECONCILE 412'],
  ['./ticketAlerts413.js','installTicketAlerts413','ALERTS 413'],
  ['./ticketPerformance414.js','installTicketPerformance414','PERFORMANCE 414'],
  ['./ticketCapital415.js','installTicketCapital415','CAPITAL 415'],
  ['./ticketRepair418.js','installTicketRepair418','REPAIR 418'],
  ['./ticketDailyBrief419.js','installTicketDailyBrief419','DAILY BRIEF 419'],
  ['./ticketUi420.js','installTicketUi420','CARD UI 420'],
  ['./ticketUi422.js','installTicketUi422','SOLD UI 422'],
  ['./ticketUi423.js','installTicketUi423','UI POLISH 423'],
  ['./ticketUi424.js','installTicketUi424','DETAIL UI 424'],
  ['./ticketUi425.js','installTicketUi425','RESPONSIVE 425'],
  ['./ticketEngineUi427.js','installTicketEngineUi427','ENGINE UI 427'],
  ['./ticketPortfolio428.js','installTicketPortfolio428','PORTFOLIO 428'],
  ['./ticketGmailSync429.js','installTicketGmailSync429','GMAIL 429'],
  ['./ticketEngineHealth431.js','installTicketEngineHealth431','ENGINE HEALTH 431'],
  ['./ticketAutoRepair432.js','installTicketAutoRepair432','AUTO REPAIR 432'],
  ['./ticketPredictive433.js','installTicketPredictive433','PREDICTIVE 433'],
  ['./ticketBacktest434.js','installTicketBacktest434','BACKTEST 434'],
  ['./ticketCommander435.js','installTicketCommander435','COMMANDER 435'],
  ['./ticketPredictUi436.js','installTicketPredictUi436','PREDICT UI 436'],
  ['./ticketComparable437.js','installTicketComparable437','COMPARABLE 437'],
  ['./ticketRisk438.js','installTicketRisk438','RISK 438'],
  ['./ticketCommander439.js','installTicketCommander439','COMMANDER 439'],
  ['./ticketDecisionJournal440.js','installTicketDecisionJournal440','JOURNAL 440'],
  ['./ticketOutcomeCalibration441.js','installTicketOutcomeCalibration441','CALIBRATION 441'],
  ['./ticketCalibrationFeedback442.js','installTicketCalibrationFeedback442','FEEDBACK 442'],
  ['./ticketCalibrationReadiness443.js','installTicketCalibrationReadiness443','READINESS 443'],
  ['./ticketDecisionQuality444.js','installTicketDecisionQuality444','QUALITY 444'],
  ['./ticketConsensus445.js','installTicketConsensus445','CONSENSUS 445'],
  ['./ticketRiskOps446.js','installTicketRiskOps446','RISK OPS 446'],
  ['./ticketPortfolioOptimizer447.js','installTicketPortfolioOptimizer447','OPTIMIZER 447'],
  ['./ticketCommander448.js','installTicketCommander448','COMMANDER 448'],
  ['./ticketActionExecution449.js','installTicketActionExecution449','EXECUTION 449'],
  ['./ticketExecutionOutcomes450.js','installTicketExecutionOutcomes450','OUTCOMES 450'],
  ['./ticketActionGovernance451.js','installTicketActionGovernance451','GOVERNANCE 451'],
  ['./ticketMarketRegime452.js','installTicketMarketRegime452','REGIME 452'],
  ['./ticketCapitalPlanner453.js','installTicketCapitalPlanner453','CAPITAL PLANNER 453'],
  ['./ticketCommander454.js','installTicketCommander454','COMMANDER 454'],
  ['./ticketRuntimeHealth455.js','installTicketRuntimeHealth455','RUNTIME 455'],
  ['./ticketRecovery456.js','installTicketRecovery456','RECOVERY 456'],
  ['./ticketUi457.js','installTicketUi457','COMPACT UI 457'],
  ['./ticketLayoutGuard458.js','installTicketLayoutGuard458','LAYOUT 458'],
  ['./ticketOperationalFocus459.js','installTicketOperationalFocus459','FOCUS 459'],
  ['./ticketWorkflow461.js','installTicketWorkflow461','WORKFLOW 461'],
  ['./ticketDecisionAnalytics462.js','installTicketDecisionAnalytics462','ANALYTICS 462'],
  ['./ticketCadence463.js','installTicketCadence463','CADENCE 463'],
  ['./ticketEventStrategy464.js','installTicketEventStrategy464','EVENT STRATEGY 464']
];

const ESSENTIAL_PATHS=new Set(ESSENTIAL_ANALYTICS.map(x=>x[0]));
const BACKGROUND_MODULES=MODULES.filter(x=>!ESSENTIAL_PATHS.has(x[0]));
const RETIRED_CANONICAL_UI=new Set([
  './ticketUi420.js','./ticketUi422.js','./ticketUi423.js','./ticketUi424.js',
  './ticketUi425.js','./ticketEngineUi427.js','./ticketPredictUi436.js','./ticketUi457.js'
]);

function publishBoot(state){
  state.finishedAt=Date.now();
  state.failed=state.modules.filter(x=>x.status==='ERROR');
  state.ok=state.modules.filter(x=>['OK','RETIRED','BACKGROUND'].includes(x.status)).length;
  state.status=state.failed.length?'PARTIAL':state.legacyDone?'OK':state.criticalDone?'READY':'STARTING';
  window.__KAMIL_TICKET_BOOT466__=state;
  document.documentElement.dataset.ticketBoot466=state.status.toLowerCase();
  window.dispatchEvent(new CustomEvent('kamil:ticket-boot466-updated',{detail:{status:state.status,failed:state.failed.map(x=>x.label),ok:state.ok,total:state.modules.length,criticalDone:!!state.criticalDone,legacyStarted:!!state.legacyStarted,legacyDone:!!state.legacyDone}}));
}

function kick(source='boot466'){window.dispatchEvent(new CustomEvent('kamil:view-change',{detail:{view:'tickets',source}}))}
const yieldMain=()=>new Promise(resolve=>setTimeout(resolve,LEGACY_YIELD_MS));

async function installSafe(path,fn,label,state){
  if(RETIRED_CANONICAL_UI.has(path)){state.modules.push({label,path,status:'RETIRED',ms:0,owner:'canonical-466'});publishBoot(state);return true}
  const started=performance.now();
  try{
    const mod=await import(path);
    if(typeof mod?.[fn]!=='function')throw new Error(`Chybí export ${fn}`);
    await mod[fn]();
    state.modules.push({label,path,status:'OK',ms:Math.round(performance.now()-started)});
    publishBoot(state);return true;
  }catch(error){
    const message=String(error?.message||error||'Neznámá chyba');
    state.modules.push({label,path,status:'ERROR',error:message,ms:Math.round(performance.now()-started)});
    console.error(`[tickets466] ${label} failed`,error);publishBoot(state);return false;
  }
}

async function installLegacySafe(path,fn,label,state){
  if(RETIRED_CANONICAL_UI.has(path)){state.modules.push({label,path,status:'RETIRED',ms:0,owner:'canonical-466'});publishBoot(state);return true}
  const started=performance.now();
  try{
    const mod=await import(path);
    if(typeof mod?.[fn]!=='function')throw new Error(`Chybí export ${fn}`);
    const result=mod[fn]();
    const entry={label,path,status:result&&typeof result.then==='function'?'BACKGROUND':'OK',ms:Math.round(performance.now()-started)};
    state.modules.push(entry);publishBoot(state);
    if(result&&typeof result.then==='function')Promise.resolve(result).then(()=>{entry.status='OK';entry.ms=Math.round(performance.now()-started);publishBoot(state)}).catch(error=>{entry.status='ERROR';entry.error=String(error?.message||error||'Neznámá chyba');console.warn(`[tickets466] background ${label} failed`,error);publishBoot(state)});
    return true;
  }catch(error){
    const message=String(error?.message||error||'Neznámá chyba');
    state.modules.push({label,path,status:'ERROR',error:message,ms:Math.round(performance.now()-started)});
    console.error(`[tickets466] deferred ${label} failed`,error);publishBoot(state);return false;
  }
}

async function loadBackground(state){
  for(const [path,fn,label] of BACKGROUND_MODULES){await installLegacySafe(path,fn,label,state);await yieldMain()}
  state.backgroundDone=true;publishBoot(state);
}

async function loadLegacy(state){
  if(state.legacyDone)return;
  state.legacyStarted=true;publishBoot(state);
  // Only diagnostics that are part of the canonical visible analytics contract
  // are required here. Historical models remain best-effort background work.
  for(const [path,fn,label] of ESSENTIAL_ANALYTICS)await installSafe(path,fn,label,state);
  window.__KAMIL_TICKET_MARKET_HEALTH397__?.refresh?.();
  window.__KAMIL_TICKET_UI421__?.refresh?.();
  const healthMounted=!!document.querySelector('[data-analytics466-body] [data-ticket-health397]');
  const alertsReady=!!window.__KAMIL_TICKET_ALERTS413__?.renderAlerts;
  if(!healthMounted||!alertsReady){
    state.modules.push({label:'CANONICAL ANALYTICS READY',path:'canonical:analytics466',status:'ERROR',error:`healthMounted=${healthMounted};alertsReady=${alertsReady}`,ms:0});
    publishBoot(state);
    return;
  }
  state.legacyDone=true;
  document.documentElement.dataset.ticketCanonical430='1';
  publishBoot(state);
  setTimeout(()=>loadBackground(state).catch(error=>{state.backgroundError=String(error?.message||error);console.warn('[tickets466] background analytics failed',error);publishBoot(state)}),1000);
}

function scheduleLegacy(state){
  if(legacyPromise)return legacyPromise;
  legacyPromise=new Promise(resolve=>setTimeout(resolve,LEGACY_DELAY_MS)).then(()=>loadLegacy(state)).catch(error=>{console.error('[tickets466] deferred analytics failed',error);state.legacyError=String(error?.message||error);publishBoot(state)});
  return legacyPromise;
}

async function desk(){
  const state={version:BOOT_VERSION,startedAt:Date.now(),finishedAt:null,status:'STARTING',modules:[],failed:[],ok:0,criticalDone:false,legacyStarted:false,legacyDone:false,backgroundDone:false};
  window.__KAMIL_TICKET_BOOT466__=state;document.documentElement.dataset.ticketBoot466='starting';
  const base=await import('./ticketDesk331.js');
  if(document.documentElement.dataset.ticketDesk331!=='1')base.installTicketDesk331();
  for(const [path,fn,label] of CRITICAL)await installSafe(path,fn,label,state);
  state.criticalDone=true;publishBoot(state);
  scheduleLegacy(state);
  return window.__KAMIL_TICKET_DESK331__;
}

export function renderTicketPage100(){if(!bootPromise)bootPromise=desk().catch(error=>{bootPromise=null;const state=window.__KAMIL_TICKET_BOOT466__||{version:BOOT_VERSION,modules:[]};state.status='FATAL';state.fatal=String(error?.message||error);state.finishedAt=Date.now();window.__KAMIL_TICKET_BOOT466__=state;document.documentElement.dataset.ticketBoot466='fatal';console.error('[tickets466] base desk boot failed',error);throw error});return bootPromise}
