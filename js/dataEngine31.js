import {store} from './state.js';
import {historyPlan31} from './historyPlan31.js';
import {indexedDbSupported31,mirrorHistory31,dataEngineSummary31} from './indexedDb31.js';
let timer=null,running=false,lastError=null;

export async function runDataMirror31(){
 if(running)return null;if(!indexedDbSupported31()){lastError='IndexedDB není podporovaný';return {ok:false,error:lastError}}
 running=true;try{const plan=historyPlan31(store.get()),write=await mirrorHistory31(plan.records),summary=await dataEngineSummary31();lastError=null;const detail={ok:true,plan,write,summary};window.dispatchEvent(new CustomEvent('kamil:data-engine',{detail}));return detail}catch(error){lastError=String(error?.message||error);const detail={ok:false,error:lastError};window.dispatchEvent(new CustomEvent('kamil:data-engine',{detail}));return detail}finally{running=false}
}
export function scheduleDataMirror31(delay=1200){clearTimeout(timer);timer=setTimeout(()=>runDataMirror31(),Math.max(0,Number(delay)||0))}
export async function dataEngineStatus31(){try{return {...await dataEngineSummary31(),error:lastError}}catch(error){return {supported:indexedDbSupported31(),ready:false,total:0,byBucket:{},lastMirrorAt:null,lastBatch:0,error:String(error?.message||error)}}}
function start(){scheduleDataMirror31(100);store.subscribe(()=>scheduleDataMirror31());document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')scheduleDataMirror31(0)});window.addEventListener('beforeunload',()=>scheduleDataMirror31(0))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
