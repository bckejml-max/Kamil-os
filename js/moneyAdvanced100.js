import {renderPersonalMoney640} from './personalMoney640.js';
import {ensurePersonalMoneyBridge737} from './personalMoneyBridge737.js';
import {ownEvent1100,schedule1100} from './runtimeOwnership1100.js';

const OWNER='money.page100';
let backgroundScheduled=false,backgroundRunning=false,resumeBound=false;
// OS1300 keeps Money focused. Advanced market/property dashboards remain available in source
// and through their dedicated product views, but they no longer auto-mount over the core page.
const OPTIONAL_STYLES=[['upgrade610','./upgrade610.css']];

const moneyActive=()=>!!document.querySelector('#view-money.on');
const moneyAdvancedActive=()=>moneyActive()&&document.querySelector('#moneyView')?.dataset.productAdvanced==='1';
function ensureOptionalStyles(){
 if(!moneyAdvancedActive())return;
 for(const [key,href] of OPTIONAL_STYLES){
  if(document.querySelector(`link[data-${key}]`))continue;
  const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.setAttribute(`data-${key}`,'1');document.head.appendChild(l)
 }
}

async function safeImport(path,run){
 if(!moneyAdvancedActive())return false;
 try{const mod=await import(path);if(!moneyAdvancedActive())return false;await run(mod);return true}
 catch(error){console.warn(`[money100] optional ${path} failed`,error);return false}
}

async function loadBackground(){
 if(backgroundRunning||!moneyAdvancedActive())return false;
 backgroundRunning=true;
 try{
  ensureOptionalStyles();
  const jobs=[
   ['./personalDebtSummary737.js',m=>m.appendPersonalDebtSummary737?.()],
   ['./wealthHistory610.js',m=>m.appendWealthHistory610?.()],
   ['./dataQa144.js',m=>m.applyMoneyDataQa144?.()]
  ];
  let loaded=0;
  for(let i=0;i<jobs.length;i++){
   if(!moneyAdvancedActive())break;
   const [path,run]=jobs[i];
   if(await safeImport(path,run))loaded++;
   if(i<jobs.length-1)await new Promise(resolve=>schedule1100(OWNER,`yield-${i}`,resolve,8,{pauseWhenHidden:true}));
  }
  const complete=loaded===jobs.length;
  window.__KAMIL_MONEY100__={healthy:true,core:true,architecture:'stable-canonical',background:complete,backgroundLoaded:loaded,backgroundTotal:jobs.length,paused:!moneyAdvancedActive(),deferred:['cashflow690','xtb383-394','recommendation162','os181'],runtimeOwner:OWNER,at:Date.now()};
  return complete;
 }finally{backgroundRunning=false}
}

function scheduleBackground(delay=250){
 if(backgroundScheduled||backgroundRunning||!moneyAdvancedActive())return;
 backgroundScheduled=true;
 const queueOwned=()=>schedule1100(OWNER,'background',()=>{backgroundScheduled=false;if(moneyAdvancedActive())void loadBackground()},0,{pauseWhenHidden:true});
 if('requestIdleCallback'in window)requestIdleCallback(queueOwned,{timeout:1800});else schedule1100(OWNER,'idle-fallback',queueOwned,delay,{pauseWhenHidden:true});
}
function bindResume(){
 if(resumeBound)return;resumeBound=true;
 ownEvent1100(OWNER,window,'kamil:view-change',event=>{if(event.detail==='money')scheduleBackground(120)});
}

export function renderMoneyPage100(){
 bindResume();
 try{
  ensurePersonalMoneyBridge737();
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
