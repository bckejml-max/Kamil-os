import {renderBettingPage144} from './bettingPage144.js';

let loadPromise=null,bootstrapPromise=null;
async function mountBettingHub630(){try{const m=await import('./bettingHub630.js');if(typeof m?.appendBettingHub630!=='function')throw new Error('Chybí appendBettingHub630');return m.appendBettingHub630()!==false}catch(error){console.warn('[betting527:hub630]',error);window.__KAMIL_BETTING_HUB630__={version:'630.0.0',healthy:false,error:String(error?.message||error),at:Date.now()};return false}}
async function ensureBettingBootstrap(){if(bootstrapPromise)return bootstrapPromise;bootstrapPromise=import('./bettingBootstrap543.js').then(m=>m.installBettingBootstrap543?.()??true).then(Boolean).catch(error=>{bootstrapPromise=null;console.warn('[betting527:bootstrap]',error);return false});return bootstrapPromise}

export function renderBettingPage527(){
 if(loadPromise)return loadPromise;
 const token=`bet527-${Date.now()}-${Math.random().toString(36).slice(2)}`;
 loadPromise=(async()=>{
  try{
   renderBettingPage144();
  }catch(error){
   console.error('[betting527:core]',error);
   window.__KAMIL_BETTING_144__={ok:false,loading:false,loadToken527:token,error:String(error?.message||error),completedAt:Date.now()};
   throw error;
  }
  const current=window.__KAMIL_BETTING_144__||{};
  window.__KAMIL_BETTING_144__={...current,loadToken527:token,loading:false,coreReady:true,completedAt:Date.now()};
  Promise.allSettled([mountBettingHub630(),ensureBettingBootstrap()]).then(results=>{
   const state=window.__KAMIL_BETTING_144__||{};
   window.__KAMIL_BETTING_144__={...state,enrichmentDone:true,hub630:results[0]?.status==='fulfilled'?results[0].value:false,bootstrap:results[1]?.status==='fulfilled'?results[1].value:false,enrichmentAt:Date.now()};
   window.dispatchEvent(new CustomEvent('kamil:betting-enrichment-ready',{detail:{hub630:window.__KAMIL_BETTING_144__.hub630,bootstrap:window.__KAMIL_BETTING_144__.bootstrap}}));
  });
  return window.__KAMIL_BETTING_144__;
 })().finally(()=>{loadPromise=null});
 return loadPromise;
}
