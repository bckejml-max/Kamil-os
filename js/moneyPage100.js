import {renderPersonalMoney640} from './personalMoney640.js';
import {ownEvent1100,schedule1100} from './runtimeOwnership1100.js';

const OWNER='money.page100';
let backgroundScheduled=false,backgroundRunning=false,resumeBound=false;
const OPTIONAL_STYLES=[
 ['moneyvisual138','./moneyVisual138.css'],['upgrade610','./upgrade610.css'],
 ['propertyhub620','./propertyHub620.css'],['moneyhub680','./moneyHub680.css']
];

const moneyActive=()=>!!document.querySelector('#view-money.on');
function ensureOptionalStyles(){
 if(!moneyActive())return;
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
  // Stability release: only canonical money layers auto-load.
  // Older cockpit/learning/cashflow suites remain available in source but no longer
  // attach permanent listeners or timers merely by visiting Money.
  const jobs=[
   ['./moneyHub680.js',m=>m.appendMoneyHub680?.()],
   ['./wealthHistory610.js',m=>m.appendWealthHistory610?.()],
   ['./propertyFinance610.js',m=>m.appendPropertyFinance610?.()],
   ['./propertyHub620.js',m=>m.appendPropertyHub620?.()],
   ['./marketIntelligence100.js',async m=>{m.appendXtbIntelligence100?.();await m.appendCapitalBrain100?.()}],
   ['./marketDetails100.js',m=>m.appendXtbDetails100?.()],
   ['./dataQa144.js',m=>m.applyMoneyDataQa144?.()],
   ['./moneyVisual138.js',m=>m.enhanceMoneyVisual138?.()],
   ['./unifiedCapital160.js',m=>m.enhanceUnifiedCapital160?.()]
  ];
  let loaded=0;
  for(let i=0;i<jobs.length;i++){
   if(!moneyActive())break;
   const [path,run]=jobs[i];
   if(await safeImport(path,run))loaded++;
   if(i<jobs.length-1)await new Promise(resolve=>schedule1100(OWNER,`yield-${i}`,resolve,8,{pauseWhenHidden:true}));
  }
  const complete=loaded===jobs.length;
  window.__KAMIL_MONEY100__={healthy:true,core:true,architecture:'stable-canonical',background:complete,backgroundLoaded:loaded,backgroundTotal:jobs.length,paused:!moneyActive(),deferred:['cashflow690','xtb383-394','recommendation162','os181'],runtimeOwner:OWNER,at:Date.now()};
  return complete;
 }finally{backgroundRunning=false}
}

function scheduleBackground(delay=250){
 if(backgroundScheduled||backgroundRunning||!moneyActive())return;
 backgroundScheduled=true;
 schedule1100(OWNER,'background',()=>{backgroundScheduled=false;if(moneyActive())void loadBackground()},delay,{pauseWhenHidden:true});
}
function bindResume(){
 if(resumeBound)return;resumeBound=true;
 ownEvent1100(OWNER,window,'kamil:view-change',event=>{if(event.detail==='money')scheduleBackground(120)});
}

export function renderMoneyPage100(){
 bindResume();
 try{
  renderPersonalMoney640();
  window.__KAMIL_MONEY100__={healthy:true,core:true,architecture:'stable-canonical',background:false,paused:false,runtimeOwner:OWNER,at:Date.now()};
 }catch(error){
  console.error('[money100] core render failed',error);
  window.__KAMIL_MONEY100__={healthy:false,core:false,error:String(error?.message||error),at:Date.now()};
  throw error;
 }
 scheduleBackground();
 return true;
}
