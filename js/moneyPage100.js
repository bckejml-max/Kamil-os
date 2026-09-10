import {renderPersonalMoney640} from './personalMoney640.js';

let backgroundScheduled=false,backgroundRunning=false;

function ensureStyle(){
 for(const [key,href] of [['moneyvisual138','./moneyVisual138.css'],['os164','./os164.css'],['os181','./os181.css'],['upgrade610','./upgrade610.css'],['propertyhub620','./propertyHub620.css'],['moneyhub680','./moneyHub680.css'],['cashflowhub690','./cashflowHub690.css']]){
  if(document.querySelector(`link[data-${key}]`))continue;
  const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.setAttribute(`data-${key}`,'1');document.head.appendChild(l)
 }
}

async function safeImport(path,run){
 try{const mod=await import(path);await run(mod);return true}
 catch(error){console.warn(`[money100] optional ${path} failed`,error);return false}
}

async function loadBackground(){
 if(backgroundRunning)return;
 backgroundRunning=true;
 try{
  await safeImport('./moneyHub680.js',m=>m.appendMoneyHub680?.());
  await safeImport('./cashflowHub690.js',m=>m.appendCashflowHub690?.());
  await safeImport('./wealthHistory610.js',m=>m.appendWealthHistory610?.());
  await safeImport('./propertyFinance610.js',m=>m.appendPropertyFinance610?.());
  await safeImport('./propertyHub620.js',m=>m.appendPropertyHub620?.());
  await safeImport('./marketIntelligence100.js',async m=>{m.appendXtbIntelligence100?.();await m.appendCapitalBrain100?.()});
  await safeImport('./marketDetails100.js',m=>m.appendXtbDetails100?.());
  await safeImport('./xtbCockpit383.js',m=>m.installXtbCockpit383?.());
  await safeImport('./xtbReconciliationPanel391.js',m=>m.installXtbReconciliationPanel391?.());
  await safeImport('./xtbOrderAdvisorPanel392.js',m=>m.installXtbOrderAdvisorPanel392?.());
  await safeImport('./xtbOutcomePanel393.js',m=>m.installXtbOutcomePanel393?.());
  await safeImport('./xtbLearningPanel394.js',m=>m.installXtbLearningPanel394?.());
  await safeImport('./dataQa144.js',m=>m.applyMoneyDataQa144?.());
  await safeImport('./moneyVisual138.js',m=>m.enhanceMoneyVisual138?.());
  await safeImport('./unifiedCapital160.js',m=>m.enhanceUnifiedCapital160?.());
  await safeImport('./recommendationPerformance162.js',m=>m.enhanceRecommendationPerformance162?.());
  await safeImport('./os181Suite.js',m=>m.enhanceMoney181?.());
  await safeImport('./os181Final.js',m=>m.enhanceMoney181Final?.());
  window.__KAMIL_MONEY100__={healthy:true,background:true,at:Date.now()};
 }finally{backgroundRunning=false}
}

function scheduleBackground(){
 if(backgroundScheduled)return;
 backgroundScheduled=true;
 const run=()=>{backgroundScheduled=false;void loadBackground()};
 if('requestIdleCallback'in window)requestIdleCallback(run,{timeout:1800});else setTimeout(run,250);
}

export function renderMoneyPage100(){
 ensureStyle();
 try{
  renderPersonalMoney640();
  window.__KAMIL_MONEY100__={healthy:true,core:true,background:false,at:Date.now()};
 }catch(error){
  console.error('[money100] core render failed',error);
  window.__KAMIL_MONEY100__={healthy:false,core:false,error:String(error?.message||error),at:Date.now()};
  throw error;
 }
 scheduleBackground();
 return true;
}
