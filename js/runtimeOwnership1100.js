const VERSION='1100.1.0';
const state=globalThis.__KAMIL_RUNTIME_OWNERSHIP1100__||(globalThis.__KAMIL_RUNTIME_OWNERSHIP1100__={version:VERSION,installed:false,owners:new Map(),domains:new Map(),scheduled:new Map(),deferred:new Map(),jobs:new Map(),events:[],eventCatalog:new Set(),storms:new Map(),maxEvents:200,backgroundPaused:false});
const now=()=>Date.now();
const ownerRecord=owner=>{
 if(!owner||typeof owner!=='string')throw new TypeError('OS1100 owner must be a non-empty string');
 let rec=state.owners.get(owner);
 if(!rec){rec={owner,listeners:new Set(),timers:new Set(),observers:new Set(),cleanups:new Set(),createdAt:now(),updatedAt:now()};state.owners.set(owner,rec)}
 rec.updatedAt=now();
 return rec;
};
const log=(type,detail={})=>{
 state.events.push({type,...detail,at:now()});
 if(state.events.length>state.maxEvents)state.events.splice(0,state.events.length-state.maxEvents);
};
const cleanupEntry=(set,entry,fn)=>{try{fn?.()}finally{set.delete(entry)}};
const actionId=label=>`${String(label||'action').replace(/[^a-z0-9_-]+/gi,'-').slice(0,32)}-${now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;

export function ownEvent1100(owner,target,type,handler,options){
 if(!target?.addEventListener||typeof handler!=='function')throw new TypeError('OS1100 invalid event subscription');
 const rec=ownerRecord(owner);
 for(const item of rec.listeners)if(item.target===target&&item.type===type&&item.handler===handler)return ()=>cleanupEntry(rec.listeners,item,()=>target.removeEventListener(type,handler,options));
 target.addEventListener(type,handler,options);
 const item={target,type,handler,options};rec.listeners.add(item);log('listener:add',{owner,type});
 return ()=>cleanupEntry(rec.listeners,item,()=>{target.removeEventListener(type,handler,options);log('listener:remove',{owner,type})});
}

export function ownTimeout1100(owner,key,fn,delay=0,options={}){
 if(typeof fn!=='function')throw new TypeError('OS1100 timeout callback must be a function');
 const token=`${owner}:${key}`;
 if(state.backgroundPaused&&options?.pauseWhenHidden){cancelScheduled1100(token);state.deferred.set(token,{owner,key,fn,delay,options});log('timer:defer',{owner,key});return ()=>cancelScheduled1100(token)}
 const rec=ownerRecord(owner);cancelScheduled1100(token);
 const item={token,id:null};
 item.id=setTimeout(()=>{rec.timers.delete(item);state.scheduled.delete(token);fn()},Math.max(0,Number(delay)||0));
 rec.timers.add(item);state.scheduled.set(token,{owner,key,item});log('timer:add',{owner,key,delay});
 return ()=>cancelScheduled1100(token);
}

export function schedule1100(owner,key,fn,delay=0,options={}){return ownTimeout1100(owner,key,fn,delay,options)}
export function scheduleMicrotask1100(owner,key,fn){
 const token=`${owner}:${key}`;if(state.scheduled.has(token))return false;
 const marker={owner,key,microtask:true,cancelled:false};state.scheduled.set(token,marker);
 queueMicrotask(()=>{if(marker.cancelled)return;state.scheduled.delete(token);fn()});
 return true;
}
export function cancelScheduled1100(tokenOrOwner,key){
 const token=key===undefined?String(tokenOrOwner):`${tokenOrOwner}:${key}`;
 state.deferred.delete(token);
 const scheduled=state.scheduled.get(token);if(!scheduled)return false;
 state.scheduled.delete(token);
 if(scheduled.microtask){scheduled.cancelled=true;return true}
 const rec=state.owners.get(scheduled.owner);if(scheduled.item?.id!=null)clearTimeout(scheduled.item.id);rec?.timers.delete(scheduled.item);log('timer:cancel',{owner:scheduled.owner,key:scheduled.key});return true;
}
const wait1100=(owner,key,ms)=>new Promise(resolve=>schedule1100(owner,key,resolve,ms,{critical:true}));

export function ownObserver1100(owner,observer){
 if(!observer?.disconnect)throw new TypeError('OS1100 observer must expose disconnect()');
 const rec=ownerRecord(owner);rec.observers.add(observer);log('observer:add',{owner});
 return ()=>cleanupEntry(rec.observers,observer,()=>{observer.disconnect();log('observer:remove',{owner})});
}
export function ownCleanup1100(owner,cleanup){if(typeof cleanup!=='function')throw new TypeError('OS1100 cleanup must be a function');const rec=ownerRecord(owner);rec.cleanups.add(cleanup);return()=>rec.cleanups.delete(cleanup)}

export function runSingleFlight1100(owner,key,fn){
 if(typeof fn!=='function')throw new TypeError('OS1100 single-flight job must be a function');
 const token=`${owner}:${key}`;if(state.jobs.has(token))return state.jobs.get(token);
 const job=Promise.resolve().then(fn).finally(()=>{if(state.jobs.get(token)===job)state.jobs.delete(token)});
 state.jobs.set(token,job);log('job:start',{owner,key});return job;
}
export function retry1100(owner,key,fn,options={}){
 const attempts=Math.max(1,Number(options.attempts)||3);const baseDelay=Math.max(0,Number(options.baseDelay)||250);const maxDelay=Math.max(baseDelay,Number(options.maxDelay)||4000);const shouldRetry=typeof options.shouldRetry==='function'?options.shouldRetry:()=>true;
 return runSingleFlight1100(owner,`retry:${key}`,async()=>{
  let lastError;
  for(let attempt=1;attempt<=attempts;attempt++){
   try{return await fn({attempt,attempts})}catch(error){lastError=error;if(attempt>=attempts||!shouldRetry(error,attempt))throw error;const delay=Math.min(maxDelay,baseDelay*2**(attempt-1));log('retry',{owner,key,attempt,delay});await wait1100(owner,`retry-wait:${key}`,delay)}
  }
  throw lastError;
 });
}

export function beginAction1100(label='action'){const correlationId=actionId(label);log('action:begin',{correlationId,label});return correlationId}
export function emit1100(owner,type,detail={},options={}){
 if(!type||typeof type!=='string')throw new TypeError('OS1100 event type must be a string');
 const correlationId=options.correlationId||detail?.correlationId||beginAction1100(type);const bucket=state.storms.get(correlationId)||{count:0,startedAt:now()};
 if(now()-bucket.startedAt>5000){bucket.count=0;bucket.startedAt=now()}
 bucket.count++;state.storms.set(correlationId,bucket);state.eventCatalog.add(type);
 if(bucket.count>50){log('event:storm',{owner,type,correlationId,count:bucket.count});console.warn(`[OS1100] event storm blocked: ${type}`,correlationId);return false}
 globalThis.dispatchEvent?.(new CustomEvent(type,{detail:{...detail,correlationId,owner}}));log('event:emit',{owner,type,correlationId});return true;
}

export function disposeOwner1100(owner){
 const rec=state.owners.get(owner);if(!rec)return false;
 for(const item of [...rec.listeners])cleanupEntry(rec.listeners,item,()=>item.target.removeEventListener(item.type,item.handler,item.options));
 for(const item of [...rec.timers]){if(item.id!=null)clearTimeout(item.id);rec.timers.delete(item);state.scheduled.delete(item.token);state.deferred.delete(item.token)}
 for(const observer of [...rec.observers])cleanupEntry(rec.observers,observer,()=>observer.disconnect());
 for(const cleanup of [...rec.cleanups])cleanupEntry(rec.cleanups,cleanup,cleanup);
 for(const token of [...state.jobs.keys()])if(token.startsWith(`${owner}:`))state.jobs.delete(token);
 state.owners.delete(owner);log('owner:dispose',{owner});return true;
}
export function disposeDomain1100(domain){const rec=state.domains.get(domain);if(!rec)return false;for(const owner of [...rec.owners])disposeOwner1100(owner);rec.active=false;rec.deactivatedAt=now();log('domain:deactivate',{domain});return true}
export function defineDomain1100(domain,owners=[]){const rec=state.domains.get(domain)||{domain,owners:new Set(),active:false,createdAt:now()};for(const owner of owners)rec.owners.add(owner);state.domains.set(domain,rec);return rec}
export function activateDomain1100(domain,owners=[]){const rec=defineDomain1100(domain,owners);rec.active=true;rec.activatedAt=now();log('domain:activate',{domain});return true}

function setBackgroundPaused1100(paused){
 state.backgroundPaused=!!paused;log(paused?'background:pause':'background:resume');
 if(!paused&&state.deferred.size){const pending=[...state.deferred.values()];state.deferred.clear();for(const item of pending)schedule1100(item.owner,item.key,item.fn,item.delay,item.options)}
}
export function runtimeSnapshot1100(){
 const owners={};let listeners=0,timers=0,observers=0,cleanups=0;
 for(const [owner,rec] of state.owners){const row={listeners:rec.listeners.size,timers:rec.timers.size,observers:rec.observers.size,cleanups:rec.cleanups.size};owners[owner]=row;listeners+=row.listeners;timers+=row.timers;observers+=row.observers;cleanups+=row.cleanups}
 return{version:VERSION,installed:state.installed,backgroundPaused:state.backgroundPaused,totals:{owners:state.owners.size,listeners,timers,observers,cleanups,scheduled:state.scheduled.size,deferred:state.deferred.size,jobs:state.jobs.size},owners,domains:Object.fromEntries([...state.domains].map(([name,rec])=>[name,{active:rec.active,owners:[...rec.owners]}])),eventCatalog:[...state.eventCatalog].sort(),events:[...state.events]};
}
export function installRuntimeOwnership1100(){
 if(state.installed)return runtimeSnapshot1100();state.installed=true;state.installedAt=now();
 defineDomain1100('core',['core.runtime']);defineDomain1100('tickets');defineDomain1100('betting');defineDomain1100('finance');defineDomain1100('control');activateDomain1100('core',['core.runtime']);
 if(typeof document!=='undefined'){setBackgroundPaused1100(document.visibilityState==='hidden');ownEvent1100('core.runtime',document,'visibilitychange',()=>setBackgroundPaused1100(document.visibilityState==='hidden'))}
 globalThis.__KAMIL_RUNTIME1100__={ownEvent:ownEvent1100,schedule:schedule1100,scheduleMicrotask:scheduleMicrotask1100,cancel:cancelScheduled1100,ownObserver:ownObserver1100,ownCleanup:ownCleanup1100,runSingleFlight:runSingleFlight1100,retry:retry1100,beginAction:beginAction1100,emit:emit1100,disposeOwner:disposeOwner1100,disposeDomain:disposeDomain1100,activateDomain:activateDomain1100,snapshot:runtimeSnapshot1100};
 log('install',{version:VERSION});return runtimeSnapshot1100();
}
