import {renderBettingPage144} from './bettingPage144.js';
import {ownEvent1100,schedule1100} from './runtimeOwnership1100.js';

let loadPromise=null,bootstrapPromise=null,hubPromise=null,bound=false;
const OWNER='betting.page527';
const isActive=()=>!!document.querySelector('#view-betting.on');

async function mountBettingHub630(){
 if(hubPromise)return hubPromise;
 hubPromise=(async()=>{
  if(!isActive())return false;
  try{const m=await import('./bettingHub630.js');if(typeof m?.appendBettingHub630!=='function')throw new Error('Chybí appendBettingHub630');return m.appendBettingHub630()!==false}
  catch(error){console.warn('[betting527:hub630]',error);window.__KAMIL_BETTING_HUB630__={version:'630.0.0',healthy:false,error:String(error?.message||error),at:Date.now()};return false}
 })().finally(()=>{hubPromise=null});
 return hubPromise;
}
async function ensureBettingBootstrap(){if(bootstrapPromise)return bootstrapPromise;bootstrapPromise=import('./bettingBootstrap543.js').then(m=>m.installBettingBootstrap543?.()??true).then(Boolean).catch(error=>{bootstrapPromise=null;console.warn('[betting527:bootstrap]',error);return false});return bootstrapPromise}
function scheduleHub(delay=250){schedule1100(OWNER,'hub630',()=>{if(isActive())void mountBettingHub630()},delay,{pauseWhenHidden:true})}
function bindViewAwareness(){if(bound)return;bound=true;ownEvent1100(OWNER,window,'kamil:view-change',event=>{if(event.detail==='betting')scheduleHub(120)})}

export function renderBettingPage527(){
 if(loadPromise)return loadPromise;
 const token=`bet527-${Date.now()}-${Math.random().toString(36).slice(2)}`;
 loadPromise=(async()=>{
  try{renderBettingPage144()}catch(error){
   console.error('[betting527:core]',error);
   window.__KAMIL_BETTING_144__={ok:false,loading:false,loadToken527:token,error:String(error?.message||error),completedAt:Date.now()};
   throw error;
  }
  bindViewAwareness();
  const current=window.__KAMIL_BETTING_144__||{};
  window.__KAMIL_BETTING_144__={...current,loadToken527:token,loading:false,coreReady:true,completedAt:Date.now(),enrichmentDone:false};
  void ensureBettingBootstrap().then(bootstrap=>{
   const state=window.__KAMIL_BETTING_144__||{};
   window.__KAMIL_BETTING_144__={...state,bootstrap,enrichmentAt:Date.now()};
   window.dispatchEvent(new CustomEvent('kamil:betting-enrichment-ready',{detail:{bootstrap}}));
  });
  scheduleHub();
  return window.__KAMIL_BETTING_144__;
 })().finally(()=>{loadPromise=null});
 return loadPromise;
}
