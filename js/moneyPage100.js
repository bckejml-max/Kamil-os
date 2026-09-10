import {renderPersonalMoney640} from './personalMoney640.js';

let backgroundScheduled=false,backgroundRunning=false,resumeBound=false;
const OPTIONAL_STYLES=[
 ['moneyvisual138','./moneyVisual138.css'],['os164','./os164.css'],['os181','./os181.css'],['upgrade610','./upgrade610.css'],
 ['propertyhub620','./propertyHub620.css'],['moneyhub680','./moneyHub680.css'],['cashflowhub690','./cashflowHub690.css']
];

const moneyActive=()=>!!document.querySelector('#view-money.on');
function ensureOptionalStyles(){
 for(const [key,href] of OPTIONAL_STYLES){
  if(document.querySelector(`link[data-${key}]`))continue;
  const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.setAttribute(`data-${key}`,'1');document.head.appendChild(l)
 }
}

async function safeImport(path,run){
 if(!moneyActive())return false;
 try{const mod=await import(path);if(!moneyActive())return false;await run(mod);return true}
 catch(error){console.warn(`[money100] optional ${path} failed`,error);return false}
}

async function loadBackground(){
 if(backgroundRunning||!moneyActive())return false;
 backgroundRunning=true;
 try{
  ensureOptionalStyles();
  const jobs=[
   ['./moneyHub680.js',m=>m.appendMoneyHub680?.()],
   ['./cashflowHub690.js',m=>m.appendCashflowHub690?.()],
   ['./wealthHistory610.js',m=>m.appendWealthHistory610?.()],
   ['./propertyFinance610.js',m=>m.appendPropertyFinance610?.()],
   ['./propertyHub620.js',m=>m.appendPropertyHub620?.()],
   ['./marketIntelligence100.js',async m=>{m.appendXtbIntelligence100?.();await m.appendCapitalBrain100?.()}],
   ['./marketDetails100.js',m=>m.appendXtbDetails100?.()],
   ['./xtbCockpit383.js',m=>m.installXtbCockpit383?.()],
   ['./xtbReconciliationPanel391.js',m=>m.installXtbReconciliationPanel391?.()],
   ['./xtbOrderAdvisorPanel392.js',m=>m.installXtbOrderAdvisorPanel392?.()],
   ['./xtbOutcomePanel393.js',m=>m.installXtbOutcomePanel393?.()],
   ['./xtbLearningPanel394.js',m=>m.installXtbLearningPanel394?.()],
   ['./dataQa144.js',m=>m.applyMoneyDataQa144?.()],
   ['./moneyVisual138.js',m=>m.enhanceMoneyVisual138?.()],
   ['./unifiedCapital160.js',m=>m.enhanceUnifiedCapital160?.()],
   ['./recommendationPerformance162.js',m=>m.enhanceRecommendationPerformance162?.()],
   ['./os181Suite.js',m=>m.enhanceMoney181?.()],
   ['./os181Final.js',m=>m.enhanceMoney181Final?.()]
  ];
  let loaded=0;
  for(const [path,run] of jobs){if(!moneyActive())break;if(await safeImport(path,run))loaded++;await new Promise(resolve=>setTimeout(resolve,8))}
  const complete=loaded===jobs.length;
  window.__KAMIL_MONEY100__={healthy:true,core:true,background:complete,backgroundLoaded:loaded,backgroundTotal:jobs.length,paused:!moneyActive(),at:Date.now()};
  return complete;
 }finally{backgroundRunning=false}
}

function scheduleBackground(delay=250){
 if(backgroundScheduled||backgroundRunning||!moneyActive())return;
 backgroundScheduled=true;
 const run=()=>{backgroundScheduled=false;if(moneyActive())void loadBackground()};
 if('requestIdleCallback'in window)requestIdleCallback(run,{timeout:1800});else setTimeout(run,delay);
}
function bindResume(){
 if(resumeBound)return;resumeBound=true;
 window.addEventListener('kamil:view-change',event=>{if(event.detail==='money')scheduleBackground(120)});
}

export function renderMoneyPage100(){
 bindResume();
 try{
  renderPersonalMoney640();
  window.__KAMIL_MONEY100__={healthy:true,core:true,background:false,paused:false,at:Date.now()};
 }catch(error){
  console.error('[money100] core render failed',error);
  window.__KAMIL_MONEY100__={healthy:false,core:false,error:String(error?.message||error),at:Date.now()};
  throw error;
 }
 scheduleBackground();
 return true;
}
