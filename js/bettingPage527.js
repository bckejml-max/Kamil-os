import {renderBettingPage144} from './bettingPage144.js';

let loadPromise=null;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function waitForBetting527(token,timeoutMs=12000){
 const started=Date.now();
 while(Date.now()-started<timeoutMs){
  const state=window.__KAMIL_BETTING_144__;
  if(state?.loadToken527===token&&(state.ok===true||state.ok===false))return state;
  await wait(50);
 }
 throw new Error('Betting centrum nedokončilo načtení včas');
}

export function renderBettingPage527(){
 if(loadPromise)return loadPromise;
 const token=`bet527-${Date.now()}-${Math.random().toString(36).slice(2)}`;
 window.__KAMIL_BETTING_144__={ok:null,loading:true,loadToken527:token,at:Date.now()};
 loadPromise=(async()=>{
  renderBettingPage144();
  // bettingPage144 owns the DOM and publishes __KAMIL_BETTING_144__ when its async fetch finishes.
  // Preserve our token across that publication so this wrapper cannot accept an older render.
  while(true){
   const state=window.__KAMIL_BETTING_144__;
   if(state&&state.loadToken527!==token){window.__KAMIL_BETTING_144__={...state,loadToken527:token}}
   if(window.__KAMIL_BETTING_144__?.ok===true||window.__KAMIL_BETTING_144__?.ok===false)break;
   await wait(25);
  }
  return waitForBetting527(token,250);
 })().finally(()=>{loadPromise=null});
 return loadPromise;
}
