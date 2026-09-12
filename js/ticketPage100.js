// Canonical ticket view adapter.
// The portfolio desk, canonical controls and Commander shell are the only critical UX.
// Market modelling, Hub and selected operational analytics are best-effort background enrichment.

let bootPromise=null,legacyPromise=null,earlyPromise=null,wakeBound=false;
const BOOT_VERSION='737.0.0';
const EARLY_DELAY_MS=80;
const LEGACY_DELAY_MS=12000;
const LEGACY_RETRY_MS=1800;
const LEGACY_YIELD_MS=12;
const MAX_LEGACY_RETRIES=3;

const CRITICAL=[
  ['./ticketUi421.js','installTicketUi421','CANONICAL UI 421/466'],
  ['./ticketCommander465.js','installTicketCommander465','COMMANDER 465'],
  ['./ticketConsolidation466.js','installTicketConsolidation466','EXECUTION UI 466']
];
const EARLY_BACKGROUND=[
  ['./ticketMarketEngine426.js','installTicketMarketEngine426','ENGINE 426'],
  ['./ticketHub640.js','installTicketHub640','TICKETS 2.0 640']
];
const ESSENTIAL_ANALYTICS=[
  ['./ticketMarketHealth397.js','installTicketMarketHealth397','MARKET HEALTH 397'],
  ['./ticketAlerts413.js','installTicketAlerts413','ALERTS 413']
];

// Stability release: keep only modules that own current operational data/actions.
// Historical UI experiments, old commanders, predictive/calibration stacks and duplicate
// portfolio/risk renderers remain in source for migration/reference but never auto-boot.
const MODULES=[
  ['./ticketSaleSync408.js','installTicketSaleSync408','SALE SYNC 408'],
  ['./ticketSoldGuard408.js','installTicketSoldGuard408','SOLD GUARD 408'],
  ['./ticketPriceHistory409.js','installTicketPriceHistory409','HISTORY 409'],
  ['./ticketActionQueue410.js','installTicketActionQueue410','ACTION QUEUE 410'],
  ['./ticketSettlement411.js','installTicketSettlement411','SETTLEMENT 411'],
  ['./ticketReconcile412.js','installTicketReconcile412','RECONCILE 412'],
  ['./ticketPerformance414.js','installTicketPerformance414','PERFORMANCE 414'],
  ['./ticketCapital415.js','installTicketCapital415','CAPITAL 415'],
  ['./ticketRepair418.js','installTicketRepair418','REPAIR 418'],
  ['./ticketGmailSync429.js','installTicketGmailSync429','GMAIL 429'],
  ['./ticketRuntimeHealth455.js','installTicketRuntimeHealth455','RUNTIME 455'],
  ['./ticketRecovery456.js','installTicketRecovery456','RECOVERY 456'],
  ['./ticketLayoutGuard458.js','installTicketLayoutGuard458','LAYOUT 458'],
  ['./ticketWorkflow461.js','installTicketWorkflow461','WORKFLOW 461'],
  ['./ticketEventStrategy464.js','installTicketEventStrategy464','EVENT STRATEGY 464']
];

const ESSENTIAL_PATHS=new Set(ESSENTIAL_ANALYTICS.map(x=>x[0]));
const BACKGROUND_MODULES=MODULES.filter(x=>!ESSENTIAL_PATHS.has(x[0]));
const RETIRED_CANONICAL_UI=new Set();
const moduleKey=x=>`${x.path}|${x.label}`;
const isTicketViewActive=()=>!!document.querySelector('#view-tickets.on,#view-tickets.active,[data-view-panel="tickets"].on,[data-view-panel="tickets"].active');
function setModule(state,entry){const key=moduleKey(entry),i=state.modules.findIndex(x=>moduleKey(x)===key);if(i>=0)state.modules[i]=entry;else state.modules.push(entry);return entry}
function removeModule(state,path){state.modules=state.modules.filter(x=>x.path!==path)}
function publishBoot(state){
  state.finishedAt=Date.now();
  state.failed=state.modules.filter(x=>x.status==='ERROR');
  state.ok=state.modules.filter(x=>['OK','RETIRED','BACKGROUND'].includes(x.status)).length;
  state.status=state.failed.length?'PARTIAL':state.legacyDone?'OK':state.criticalDone?'READY':'STARTING';
  window.__KAMIL_TICKET_BOOT466__=state;
  document.documentElement.dataset.ticketBoot466=state.status.toLowerCase();
  window.dispatchEvent(new CustomEvent('kamil:ticket-boot466-updated',{detail:{status:state.status,failed:state.failed.map(x=>x.label),ok:state.ok,total:state.modules.length,criticalDone:!!state.criticalDone,earlyDone:!!state.earlyDone,legacyStarted:!!state.legacyStarted,legacyDone:!!state.legacyDone,retries:state.legacyRetries||0}}));
}
const yieldMain=()=>new Promise(resolve=>setTimeout(resolve,LEGACY_YIELD_MS));
async function installSafe(path,fn,label,state){
  if(RETIRED_CANONICAL_UI.has(path)){setModule(state,{label,path,status:'RETIRED',ms:0,owner:'canonical-466'});publishBoot(state);return true}
  const started=performance.now();
  try{const mod=await import(path);if(typeof mod?.[fn]!=='function')throw new Error(`Chybí export ${fn}`);await mod[fn]();setModule(state,{label,path,status:'OK',ms:Math.round(performance.now()-started)});publishBoot(state);return true}
  catch(error){const message=String(error?.message||error||'Neznámá chyba');setModule(state,{label,path,status:'ERROR',error:message,ms:Math.round(performance.now()-started)});console.error(`[tickets466] ${label} failed`,error);publishBoot(state);return false}
}
async function installLegacySafe(path,fn,label,state){
  const started=performance.now();
  try{const mod=await import(path);if(typeof mod?.[fn]!=='function')throw new Error(`Chybí export ${fn}`);const result=mod[fn]();const entry=setModule(state,{label,path,status:result&&typeof result.then==='function'?'BACKGROUND':'OK',ms:Math.round(performance.now()-started)});publishBoot(state);if(result&&typeof result.then==='function')Promise.resolve(result).then(()=>{entry.status='OK';entry.ms=Math.round(performance.now()-started);delete entry.error;publishBoot(state)}).catch(error=>{entry.status='ERROR';entry.error=String(error?.message||error||'Neznámá chyba');console.warn(`[tickets466] background ${label} failed`,error);publishBoot(state)});return true}
  catch(error){const message=String(error?.message||error||'Neznámá chyba');setModule(state,{label,path,status:'ERROR',error:message,ms:Math.round(performance.now()-started)});console.error(`[tickets466] deferred ${label} failed`,error);publishBoot(state);return false}
}
async function waitCanonicalAnalytics(){
  for(let i=0;i<12;i++){
    const healthMounted=!!document.querySelector('[data-analytics466-body] [data-ticket-health397]');
    const alertsReady=!!window.__KAMIL_TICKET_ALERTS413__?.renderAlerts;
    if(healthMounted&&alertsReady)return{healthMounted,alertsReady};
    await new Promise(resolve=>setTimeout(resolve,120));
  }
  return{healthMounted:!!document.querySelector('[data-analytics466-body] [data-ticket-health397]'),alertsReady:!!window.__KAMIL_TICKET_ALERTS413__?.renderAlerts};
}
async function loadEarlyBackground(state){
  if(state.earlyDone)return true;
  if(!isTicketViewActive()){state.earlyDeferred=true;publishBoot(state);return false}
  state.earlyDeferred=false;
  for(const [path,fn,label] of EARLY_BACKGROUND){if(!isTicketViewActive()){state.earlyDeferred=true;publishBoot(state);return false}await installLegacySafe(path,fn,label,state);await yieldMain()}
  state.earlyDone=true;publishBoot(state);return true;
}
function scheduleEarlyBackground(state,delay=EARLY_DELAY_MS){
  if(state.earlyDone)return Promise.resolve(true);if(earlyPromise)return earlyPromise;
  earlyPromise=new Promise(resolve=>setTimeout(resolve,delay)).then(()=>loadEarlyBackground(state)).catch(error=>{state.earlyError=String(error?.message||error);console.warn('[tickets466] early background failed',error);publishBoot(state);return false}).finally(()=>{earlyPromise=null});
  return earlyPromise;
}
async function loadBackground(state){
  if(state.backgroundDone)return true;
  for(const [path,fn,label] of BACKGROUND_MODULES){if(!isTicketViewActive()){state.backgroundDeferred=true;publishBoot(state);return false}await installLegacySafe(path,fn,label,state);await yieldMain()}
  state.backgroundDeferred=false;state.backgroundDone=true;publishBoot(state);return true
}
async function loadLegacy(state){
  if(state.legacyDone)return true;
  if(!isTicketViewActive()){state.legacyDeferred=true;state.legacyStarted=false;publishBoot(state);return false}
  state.legacyDeferred=false;state.legacyStarted=true;removeModule(state,'canonical:analytics466');publishBoot(state);
  let essentialsOk=true;for(const [path,fn,label] of ESSENTIAL_ANALYTICS){if(!isTicketViewActive()){state.legacyDeferred=true;state.legacyStarted=false;publishBoot(state);return false}essentialsOk=(await installSafe(path,fn,label,state))&&essentialsOk}
  const ready=await waitCanonicalAnalytics();
  if(!essentialsOk||!ready.healthMounted||!ready.alertsReady){state.legacyStarted=false;setModule(state,{label:'CANONICAL ANALYTICS READY',path:'canonical:analytics466',status:'ERROR',error:`essentialsOk=${essentialsOk};healthMounted=${ready.healthMounted};alertsReady=${ready.alertsReady}`,ms:0});publishBoot(state);return false}
  removeModule(state,'canonical:analytics466');state.legacyDone=true;state.legacyStarted=false;document.documentElement.dataset.ticketCanonical430='1';publishBoot(state);
  setTimeout(()=>{if(isTicketViewActive())loadBackground(state).catch(error=>{state.backgroundError=String(error?.message||error);console.warn('[tickets466] background analytics failed',error);publishBoot(state)});else{state.backgroundDeferred=true;publishBoot(state)}},1000);return true
}
function scheduleLegacy(state,delay=LEGACY_DELAY_MS){
  if(state.legacyDone)return Promise.resolve(true);if(legacyPromise)return legacyPromise;
  legacyPromise=new Promise(resolve=>setTimeout(resolve,delay)).then(()=>loadLegacy(state)).catch(error=>{console.error('[tickets466] deferred analytics failed',error);state.legacyError=String(error?.message||error);publishBoot(state);return false}).then(ok=>{legacyPromise=null;if(!ok&&!state.legacyDone&&isTicketViewActive()&&(state.legacyRetries||0)<MAX_LEGACY_RETRIES){state.legacyRetries=(state.legacyRetries||0)+1;setTimeout(()=>scheduleLegacy(state,LEGACY_RETRY_MS),LEGACY_RETRY_MS)}return ok});
  return legacyPromise
}
function bindWake(){
  if(wakeBound)return;wakeBound=true;
  window.addEventListener('kamil:view-change',()=>{const state=window.__KAMIL_TICKET_BOOT466__;if(!state||!isTicketViewActive())return;if(!state.earlyDone)scheduleEarlyBackground(state,40);if(!state.legacyDone)scheduleLegacy(state,400);else if(!state.backgroundDone)loadBackground(state).catch(error=>{state.backgroundError=String(error?.message||error);publishBoot(state)})});
}
async function desk(){
  const state={version:BOOT_VERSION,startedAt:Date.now(),finishedAt:null,status:'STARTING',modules:[],failed:[],ok:0,criticalDone:false,earlyDone:false,legacyStarted:false,legacyDone:false,backgroundDone:false,legacyRetries:0,prunedLegacy:true};
  window.__KAMIL_TICKET_BOOT466__=state;document.documentElement.dataset.ticketBoot466='starting';
  bindWake();
  const base=await import('./ticketDesk331.js');
  if(document.documentElement.dataset.ticketDesk331!=='1')await base.installTicketDesk331();
  for(const [path,fn,label] of CRITICAL)await installSafe(path,fn,label,state);
  state.criticalDone=true;publishBoot(state);
  scheduleEarlyBackground(state);
  scheduleLegacy(state);
  return window.__KAMIL_TICKET_DESK331__;
}
export function renderTicketPage100(){if(!bootPromise)bootPromise=desk().catch(error=>{bootPromise=null;legacyPromise=null;earlyPromise=null;const state=window.__KAMIL_TICKET_BOOT466__||{version:BOOT_VERSION,modules:[]};state.status='FATAL';state.fatal=String(error?.message||error);state.finishedAt=Date.now();window.__KAMIL_TICKET_BOOT466__=state;document.documentElement.dataset.ticketBoot466='fatal';console.error('[tickets466] base desk boot failed',error);throw error});return bootPromise}
