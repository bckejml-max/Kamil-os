import {store} from './state.js';

let unsubscribe226=null;
let timer226=0;
let wakeCount226=0;

function wakeToday226(reason='store'){
 clearTimeout(timer226);
 timer226=setTimeout(()=>{
  wakeCount226+=1;
  window.dispatchEvent(new CustomEvent('kamil:view-change',{detail:'today'}));
  window.__KAMIL_TODAY_WAKE226__={version:226,reason,wakeCount:wakeCount226,at:Date.now()};
 },20);
}

export function installTodayWake226(){
 if(unsubscribe226)return unsubscribe226;
 unsubscribe226=store.subscribe((_state,reason)=>wakeToday226(reason||'store'));
 window.__KAMIL_TODAY_WAKE226__={version:226,reason:'installed',wakeCount:wakeCount226,at:Date.now()};
 return unsubscribe226;
}
