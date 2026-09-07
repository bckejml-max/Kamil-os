// Canonical ticket view: critical workflow first, advanced analytics only on explicit user intent.
let bootPromise=null,advancedPromise=null;
const BOOT_VERSION='consolidation-ticket-1';
const CRITICAL=[
 ['./ticketUi421.js','installTicketUi421','CANONICAL UI'],
 ['./ticketMarketEngine426.js','installTicketMarketEngine426','MARKET ENGINE'],
 ['./ticketCommander465.js','installTicketCommander465','COMMANDER'],
 ['./ticketConsolidation466.js','installTicketConsolidation466','EXECUTION UI'],
 ['./ticketHub640.js','installTicketHub640','TICKET HUB']
];
const ADVANCED=[
 ['./ticketMarketHealth397.js','installTicketMarketHealth397','MARKET HEALTH'],
 ['./ticketAlerts413.js','installTicketAlerts413','ALERTS'],
 ['./ticketPriceIntelligence374.js','installTicketPriceIntelligence374','PRICE INTELLIGENCE'],
 ['./ticketRefresh395.js','installTicketRefresh395','REFRESH'],
 ['./ticketSourceEditor382.js','installTicketSourceEditor382','SOURCE EDITOR'],
 ['./ticketRowAuto396.js','installTicketRowAuto396','ROW AUTO'],
 ['./ticketManualMarket398.js','installTicketManualMarket398','MANUAL MARKET'],
 ['./ticketReadiness400.js','installTicketReadiness400','READINESS'],
 ['./ticketPriceMemory402.js','installTicketPriceMemory402','PRICE MEMORY'],
 ['./ticketClipboardMarket403.js','installTicketClipboardMarket403','CLIPBOARD MARKET'],
 ['./ticketAutopilot407.js','installTicketAutopilot407','AUTOPILOT'],
 ['./ticketSaleSync408.js','installTicketSaleSync408','SALE SYNC'],
 ['./ticketSoldGuard408.js','installTicketSoldGuard408','SOLD GUARD'],
 ['./ticketPriceHistory409.js','installTicketPriceHistory409','PRICE HISTORY'],
 ['./ticketActionQueue410.js','installTicketActionQueue410','ACTION QUEUE'],
 ['./ticketSettlement411.js','installTicketSettlement411','SETTLEMENT'],
 ['./ticketReconcile412.js','installTicketReconcile412','RECONCILE'],
 ['./ticketPerformance414.js','installTicketPerformance414','PERFORMANCE'],
 ['./ticketCapital415.js','installTicketCapital415','CAPITAL'],
 ['./ticketRepair418.js','installTicketRepair418','REPAIR'],
 ['./ticketDailyBrief419.js','installTicketDailyBrief419','DAILY BRIEF'],
 ['./ticketPortfolio428.js','installTicketPortfolio428','PORTFOLIO'],
 ['./ticketGmailSync429.js','installTicketGmailSync429','GMAIL'],
 ['./ticketEngineHealth431.js','installTicketEngineHealth431','ENGINE HEALTH'],
 ['./ticketAutoRepair432.js','installTicketAutoRepair432','AUTO REPAIR'],
 ['./ticketPredictive433.js','installTicketPredictive433','PREDICTIVE'],
 ['./ticketBacktest434.js','installTicketBacktest434','BACKTEST'],
 ['./ticketCommander435.js','installTicketCommander435','COMMANDER 435'],
 ['./ticketComparable437.js','installTicketComparable437','COMPARABLE'],
 ['./ticketRisk438.js','installTicketRisk438','RISK'],
 ['./ticketCommander439.js','installTicketCommander439','COMMANDER 439'],
 ['./ticketDecisionJournal440.js','installTicketDecisionJournal440','JOURNAL'],
 ['./ticketOutcomeCalibration441.js','installTicketOutcomeCalibration441','CALIBRATION'],
 ['./ticketCalibrationFeedback442.js','installTicketCalibrationFeedback442','FEEDBACK'],
 ['./ticketCalibrationReadiness443.js','installTicketCalibrationReadiness443','CALIBRATION READINESS'],
 ['./ticketDecisionQuality444.js','installTicketDecisionQuality444','QUALITY'],
 ['./ticketConsensus445.js','installTicketConsensus445','CONSENSUS'],
 ['./ticketRiskOps446.js','installTicketRiskOps446','RISK OPS'],
 ['./ticketPortfolioOptimizer447.js','installTicketPortfolioOptimizer447','OPTIMIZER'],
 ['./ticketCommander448.js','installTicketCommander448','COMMANDER 448'],
 ['./ticketActionExecution449.js','installTicketActionExecution449','SAFE EXECUTION UI'],
 ['./ticketExecutionOutcomes450.js','installTicketExecutionOutcomes450','OUTCOMES'],
 ['./ticketActionGovernance451.js','installTicketActionGovernance451','GOVERNANCE'],
 ['./ticketMarketRegime452.js','installTicketMarketRegime452','REGIME'],
 ['./ticketCapitalPlanner453.js','installTicketCapitalPlanner453','CAPITAL PLANNER'],
 ['./ticketCommander454.js','installTicketCommander454','COMMANDER 454'],
 ['./ticketRuntimeHealth455.js','installTicketRuntimeHealth455','RUNTIME HEALTH'],
 ['./ticketRecovery456.js','installTicketRecovery456','RECOVERY'],
 ['./ticketOperationalFocus459.js','installTicketOperationalFocus459','FOCUS'],
 ['./ticketWorkflow461.js','installTicketWorkflow461','WORKFLOW'],
 ['./ticketDecisionAnalytics462.js','installTicketDecisionAnalytics462','ANALYTICS'],
 ['./ticketCadence463.js','installTicketCadence463','CADENCE'],
 ['./ticketEventStrategy464.js','installTicketEventStrategy464','EVENT STRATEGY']
];

function state(){return window.__KAMIL_TICKET_BOOT466__||{version:BOOT_VERSION,startedAt:Date.now(),status:'STARTING',modules:[],failed:[],criticalDone:false,advancedStarted:false,advancedDone:false}}
function publish(s){s.failed=s.modules.filter(x=>x.status==='ERROR');s.status=s.failed.length?(s.criticalDone?'PARTIAL':'ERROR'):s.advancedDone?'FULL':s.criticalDone?'READY':'STARTING';s.finishedAt=Date.now();window.__KAMIL_TICKET_BOOT466__=s;document.documentElement.dataset.ticketBoot466=s.status.toLowerCase();window.dispatchEvent(new CustomEvent('kamil:ticket-boot466-updated',{detail:{status:s.status,criticalDone:s.criticalDone,advancedDone:s.advancedDone,failed:s.failed.map(x=>x.label)}}))}
async function install(path,fn,label,s){const started=performance.now();try{const m=await import(path);if(typeof m?.[fn]!=='function')throw new Error(`Chybí ${fn}`);await m[fn]();s.modules.push({path,label,status:'OK',ms:Math.round(performance.now()-started)});publish(s);return true}catch(error){s.modules.push({path,label,status:'ERROR',error:String(error?.message||error),ms:Math.round(performance.now()-started)});console.warn(`[ticket] ${label}`,error);publish(s);return false}}
function mountAdvancedButton(){const host=document.querySelector('#ticketIntelView');if(!host||host.querySelector('[data-ticket-advanced]'))return;const wrap=document.createElement('div');wrap.className='row ticket-advanced-entry';wrap.dataset.ticketAdvanced='1';wrap.innerHTML='<div><b>Rozšířená analytika</b><div class="muted">Historie, backtest, kalibrace a pokročilé modely se načtou jen když je potřebuješ.</div></div><button class="btn" type="button">Načíst analytiku</button>';wrap.querySelector('button').onclick=async()=>{const b=wrap.querySelector('button');b.disabled=true;b.textContent='Načítám…';await loadTicketAdvancedAnalytics();b.textContent='Analytika načtena'};host.prepend(wrap)}
async function critical(){const s=state();window.__KAMIL_TICKET_BOOT466__=s;const base=await import('./ticketDesk331.js');if(document.documentElement.dataset.ticketDesk331!=='1')await base.installTicketDesk331();for(const [p,f,l] of CRITICAL)await install(p,f,l,s);s.criticalDone=true;publish(s);mountAdvancedButton();return s}
export function loadTicketAdvancedAnalytics(){
 if(advancedPromise)return advancedPromise;const s=state();advancedPromise=(async()=>{s.advancedStarted=true;publish(s);for(const [p,f,l] of ADVANCED)await install(p,f,l,s);s.advancedDone=true;publish(s);return s})().finally(()=>{advancedPromise=null});return advancedPromise
}
export function renderTicketPage100(){if(!bootPromise)bootPromise=critical().catch(error=>{const s=state();s.status='FATAL';s.fatal=String(error?.message||error);publish(s);bootPromise=null;throw error});return bootPromise}
window.addEventListener('kamil:ticket-advanced',()=>void loadTicketAdvancedAnalytics());
