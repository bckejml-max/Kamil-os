import {renderBettingPage144} from './bettingPage144.js';

let loadPromise=null;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function mountBettingFeed692(){try{const m=await import('./bettingFeed692.js?rev=os692');if(typeof m?.appendBettingFeed692!=='function')throw new Error('Chybí appendBettingFeed692');return m.appendBettingFeed692()!==false}catch(error){console.warn('[betting527:feed692]',error);window.__KAMIL_BETTING_FEED692__={version:'692.0.0',configured:false,live:false,operational:false,error:String(error?.message||error),at:Date.now()};return false}}
async function mountBettingHub630(){try{const m=await import('./bettingHub630.js?rev=os692');if(typeof m?.appendBettingHub630!=='function')throw new Error('Chybí appendBettingHub630');return m.appendBettingHub630()!==false}catch(error){console.warn('[betting527:hub630]',error);window.__KAMIL_BETTING_HUB630__={version:'630.0.0',healthy:false,error:String(error?.message||error),at:Date.now()};return false}}

export function renderBettingPage527(){
 if(loadPromise)return loadPromise;
 const token=`bet527-${Date.now()}-${Math.random().toString(36).slice(2)}`;
 window.__KAMIL_BETTING_144__={ok:null,loading:true,loadToken527:token,at:Date.now()};
 loadPromise=(async()=>{
  renderBettingPage144();
  const started=Date.now();
  while(Date.now()-started<12000){
   const state=window.__KAMIL_BETTING_144__;
   if(state&&(state.ok===true||state.ok===false)){
    const finalState={...state,loading:false,loadToken527:token,completedAt:Date.now()};
    window.__KAMIL_BETTING_144__=finalState;
    const feed692=await mountBettingFeed692();
    const hub630=await mountBettingHub630();
    return{...finalState,feed692,hub630};
   }
   await wait(50);
  }
  throw new Error('Betting centrum nedokončilo načtení včas');
 })().finally(()=>{loadPromise=null});
 return loadPromise;
}
