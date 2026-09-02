import {renderBettingPage144} from './bettingPage144.js';

let loadPromise=null;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

export function renderBettingPage527(){
 if(loadPromise)return loadPromise;
 const token=`bet527-${Date.now()}-${Math.random().toString(36).slice(2)}`;
 window.__KAMIL_BETTING_144__={ok:null,loading:true,loadToken527:token,at:Date.now()};
 loadPromise=(async()=>{
  renderBettingPage144();
  const started=Date.now();
  while(Date.now()-started<12000){
   const state=window.__KAMIL_BETTING_144__;
   // We reset the global state immediately before starting the base renderer, so the
   // first terminal state observed here belongs to this load rather than a previous visit.
   if(state&&(state.ok===true||state.ok===false)){
    const finalState={...state,loading:false,loadToken527:token,completedAt:Date.now()};
    window.__KAMIL_BETTING_144__=finalState;
    return finalState;
   }
   await wait(50);
  }
  throw new Error('Betting centrum nedokončilo načtení včas');
 })().finally(()=>{loadPromise=null});
 return loadPromise;
}
