import {APP_VERSION} from './releaseMeta.js';
import {installRuntimeOwnership1100,ownEvent1100,schedule1100,cancelScheduled1100,runtimeSnapshot1100,runSingleFlight1100,beginAction1100} from './runtimeOwnership1100.js';

const OWNER='core.hardening1110';
const VERSION='1159.0.0';
const API_TIMEOUT_MS=15000;
const health=globalThis.__KAMIL_HEALTH1159__||(globalThis.__KAMIL_HEALTH1159__={version:VERSION,startedAt:Date.now(),errors:[],rejections:[],network:[],navigation:[],warnings:[],release:{app:APP_VERSION},api:{timeouts:0,failures:0},healthy:true});
installRuntimeOwnership1100();

const push=(bucket,row,max=80)=>{bucket.push({...row,at:Date.now()});if(bucket.length>max)bucket.splice(0,bucket.length-max)};
const safeMessage=error=>String(error?.message||error||'Unknown error').slice(0,500);
const uuid=label=>`${String(label||'action').replace(/[^a-z0-9_-]+/gi,'-').slice(0,24)}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
const sameOriginApi=input=>{try{const raw=typeof input==='string'?input:input?.url;if(!raw)return false;const u=new URL(raw,location.href);return u.origin===location.origin&&u.pathname.startsWith('/api/')}catch{return false}};
const combineSignal=(external,controller)=>{
 if(!external)return controller.signal;
 if(external.aborted){controller.abort(external.reason);return controller.signal}
 const abort=()=>controller.abort(external.reason);external.addEventListener('abort',abort,{once:true});
 return controller.signal;
};

ownEvent1100(OWNER,window,'error',event=>{
 const error=event?.error||event?.message||'window error';push(health.errors,{message:safeMessage(error),source:event?.filename||'',line:event?.lineno||0});health.healthy=false;
});
ownEvent1100(OWNER,window,'unhandledrejection',event=>{
 push(health.rejections,{message:safeMessage(event?.reason)});health.healthy=false;
});

const nativeFetch=globalThis.fetch?.bind(globalThis);
if(nativeFetch&&!globalThis.__KAMIL_FETCH_HARDENED1110__){
 globalThis.__KAMIL_FETCH_HARDENED1110__=true;
 globalThis.fetch=async(input,init={})=>{
  if(!sameOriginApi(input))return nativeFetch(input,init);
  const controller=new AbortController(),method=String(init?.method||((typeof input!=='string'&&input?.method)||'GET')).toUpperCase();
  const actionId=init?.headers?.['X-Kamil-Action-Id']||init?.headers?.['x-kamil-action-id']||uuid(method.toLowerCase());
  const headers=new Headers(init?.headers||(typeof input!=='string'?input?.headers:undefined)||{});
  if(method!=='GET'&&method!=='HEAD'&&!headers.has('X-Kamil-Action-Id'))headers.set('X-Kamil-Action-Id',actionId);
  headers.set('X-Kamil-Client-Version',String(APP_VERSION));
  const timer=setTimeout(()=>{health.api.timeouts++;controller.abort(new DOMException('Kamil OS API timeout','TimeoutError'))},API_TIMEOUT_MS);
  const started=performance.now();
  try{
   const response=await nativeFetch(input,{...init,headers,signal:combineSignal(init?.signal,controller)});
   const ms=Math.round((performance.now()-started)*10)/10;push(health.network,{method,url:typeof input==='string'?input:input?.url,status:response.status,ok:response.ok,ms,actionId});
   const serverVersion=response.headers.get('x-kamil-version');if(serverVersion&&String(serverVersion)!==String(APP_VERSION)){health.release.server=serverVersion;health.release.mismatch=true;push(health.warnings,{type:'version-mismatch',app:APP_VERSION,server:serverVersion})}
   if(!response.ok)health.api.failures++;
   return response;
  }catch(error){health.api.failures++;push(health.network,{method,url:typeof input==='string'?input:input?.url,status:0,ok:false,error:safeMessage(error),actionId});throw error}
  finally{clearTimeout(timer)}
 };
}

let navCount=0,baseline=null;
function runtimeTotals(){try{return runtimeSnapshot1100().totals}catch{return null}}
function leakCheck(){
 const totals=runtimeTotals();if(!totals)return;
 if(!baseline){baseline={...totals};return}
 const delta={listeners:totals.listeners-baseline.listeners,timers:totals.timers-baseline.timers,observers:totals.observers-baseline.observers,jobs:totals.jobs-baseline.jobs};
 if(delta.listeners>12||delta.timers>8||delta.observers>4||delta.jobs>8){push(health.warnings,{type:'runtime-growth',delta,baseline,current:totals});health.healthy=false}
}
ownEvent1100(OWNER,window,'kamil:view-change',event=>{navCount++;push(health.navigation,{view:event?.detail||null,count:navCount});if(navCount%10===0)schedule1100(OWNER,'leak-check',leakCheck,80)});
schedule1100(OWNER,'baseline',()=>{baseline=runtimeTotals()},1500);

function versionCheck(){
 const versions=[...document.querySelectorAll('.version')].map(x=>String(x.textContent||'').trim()).filter(Boolean);
 if(versions.length&&versions.some(v=>v!==String(APP_VERSION))){health.release.dom=versions;health.release.mismatch=true;push(health.warnings,{type:'dom-version-mismatch',app:APP_VERSION,dom:versions});health.healthy=false}
}
ownEvent1100(OWNER,window,'kamil:release-stamp',versionCheck);
schedule1100(OWNER,'version-check',versionCheck,2500);

export function apiError1110(error,response=null){
 const status=Number(response?.status||error?.status||0)||0,message=safeMessage(error),retryable=status===0||status===408||status===429||status>=500;
 return{code:error?.code||response?.headers?.get?.('x-error-code')||'API_ERROR',status,retryable,message};
}
export function pragueIso1110(value=Date.now()){
 const d=value instanceof Date?value:new Date(value);if(Number.isNaN(d.getTime()))return null;
 const parts=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Prague',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).formatToParts(d).reduce((o,p)=>(o[p.type]=p.value,o),{});
 return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}
export function singleAction1110(key,fn){return runSingleFlight1100(OWNER,`action:${key}`,fn)}
export function actionId1110(label='action'){return beginAction1100(label)||uuid(label)}
export function scheduleFrame1110(key,fn){
 const token=`${OWNER}:frame:${key}`;cancelScheduled1100(token);let cancelled=false;const id=requestAnimationFrame(ts=>{if(!cancelled)fn(ts)});return()=>{cancelled=true;cancelAnimationFrame(id)}}
export function scheduleIdle1110(key,fn,timeout=2500){
 const token=`${OWNER}:idle:${key}`;cancelScheduled1100(token);if('requestIdleCallback'in window){let cancelled=false;const id=requestIdleCallback(deadline=>{if(!cancelled)fn(deadline)},{timeout});return()=>{cancelled=true;cancelIdleCallback?.(id)}}return schedule1100(OWNER,`idle:${key}`,()=>fn({didTimeout:true,timeRemaining:()=>0}),Math.min(timeout,1200));
}

function snapshot(){return{version:VERSION,appVersion:APP_VERSION,apiTimeoutMs:API_TIMEOUT_MS,healthy:health.healthy,errors:health.errors.length,rejections:health.rejections.length,warnings:health.warnings.length,network:health.network.length,navigation:navCount,runtime:runtimeTotals(),release:{...health.release}}}
globalThis.__KAMIL_HARDENING1110__={version:VERSION,apiTimeoutMs:API_TIMEOUT_MS,apiError:apiError1110,pragueIso:pragueIso1110,singleAction:singleAction1110,actionId:actionId1110,scheduleFrame:scheduleFrame1110,scheduleIdle:scheduleIdle1110,snapshot};
