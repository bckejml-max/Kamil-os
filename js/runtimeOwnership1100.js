const VERSION='1100.0.0';
const state=globalThis.__KAMIL_RUNTIME_OWNERSHIP1100__||(globalThis.__KAMIL_RUNTIME_OWNERSHIP1100__={version:VERSION,installed:false,owners:new Map(),domains:new Map(),scheduled:new Map(),events:[],maxEvents:200});
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

export function ownEvent1100(owner,target,type,handler,options){
 if(!target?.addEventListener||typeof handler!=='function')throw new TypeError('OS1100 invalid event subscription');
 const rec=ownerRecord(owner);
 for(const item of rec.listeners)if(item.target===target&&item.type===type&&item.handler===handler)return ()=>cleanupEntry(rec.listeners,item,()=>target.removeEventListener(type,handler,options));
 target.addEventListener(type,handler,options);
 const item={target,type,handler,options};rec.listeners.add(item);log('listener:add',{owner,type});
 return ()=>cleanupEntry(rec.listeners,item,()=>{target.removeEventListener(type,handler,options);log('listener:remove',{owner,type})});
}

export function ownTimeout1100(owner,key,fn,delay=0){
 if(typeof fn!=='function')throw new TypeError('OS1100 timeout callback must be a function');
 const rec=ownerRecord(owner);const token=`${owner}:${key}`;
 cancelScheduled1100(token);
 const item={token,id:null};
 item.id=setTimeout(()=>{rec.timers.delete(item);state.scheduled.delete(token);fn()},Math.max(0,Number(delay)||0));
 rec.timers.add(item);state.scheduled.set(token,{owner,key,item});log('timer:add',{owner,key,delay});
 return ()=>cancelScheduled1100(token);
}

export function schedule1100(owner,key,fn,delay=0){return ownTimeout1100(owner,key,fn,delay)}
export function scheduleMicrotask1100(owner,key,fn){
 const token=`${owner}:${key}`;if(state.scheduled.has(token))return false;
 const marker={owner,key,microtask:true,cancelled:false};state.scheduled.set(token,marker);
 queueMicrotask(()=>{if(marker.cancelled)return;state.scheduled.delete(token);fn()});
 return true;
}
export function cancelScheduled1100(tokenOrOwner,key){
 const token=key===undefined?String(tokenOrOwner):`${tokenOrOwner}:${key}`;const scheduled=state.scheduled.get(token);if(!scheduled)return false;
 state.scheduled.delete(token);
 if(scheduled.microtask){scheduled.cancelled=true;return true}
 const rec=state.owners.get(scheduled.owner);if(scheduled.item?.id!=null)clearTimeout(scheduled.item.id);rec?.timers.delete(scheduled.item);log('timer:cancel',{owner:scheduled.owner,key:scheduled.key});return true;
}

export function ownObserver1100(owner,observer){
 if(!observer?.disconnect)throw new TypeError('OS1100 observer must expose disconnect()');
 const rec=ownerRecord(owner);rec.observers.add(observer);log('observer:add',{owner});
 return ()=>cleanupEntry(rec.observers,observer,()=>{observer.disconnect();log('observer:remove',{owner})});
}
export function ownCleanup1100(owner,cleanup){if(typeof cleanup!=='function')throw new TypeError('OS1100 cleanup must be a function');const rec=ownerRecord(owner);rec.cleanups.add(cleanup);return()=>rec.cleanups.delete(cleanup)}

export function disposeOwner1100(owner){
 const rec=state.owners.get(owner);if(!rec)return false;
 for(const item of [...rec.listeners])cleanupEntry(rec.listeners,item,()=>item.target.removeEventListener(item.type,item.handler,item.options));
 for(const item of [...rec.timers]){if(item.id!=null)clearTimeout(item.id);rec.timers.delete(item);state.scheduled.delete(item.token)}
 for(const observer of [...rec.observers])cleanupEntry(rec.observers,observer,()=>observer.disconnect());
 for(const cleanup of [...rec.cleanups])cleanupEntry(rec.cleanups,cleanup,cleanup);
 state.owners.delete(owner);log('owner:dispose',{owner});return true;
}
export function disposeDomain1100(domain){const rec=state.domains.get(domain);if(!rec)return false;for(const owner of [...rec.owners])disposeOwner1100(owner);rec.active=false;rec.deactivatedAt=now();log('domain:deactivate',{domain});return true}
export function defineDomain1100(domain,owners=[]){const rec=state.domains.get(domain)||{domain,owners:new Set(),active:false,createdAt:now()};for(const owner of owners)rec.owners.add(owner);state.domains.set(domain,rec);return rec}
export function activateDomain1100(domain,owners=[]){const rec=defineDomain1100(domain,owners);rec.active=true;rec.activatedAt=now();log('domain:activate',{domain});return true}

export function runtimeSnapshot1100(){
 const owners={};let listeners=0,timers=0,observers=0,cleanups=0;
 for(const [owner,rec] of state.owners){const row={listeners:rec.listeners.size,timers:rec.timers.size,observers:rec.observers.size,cleanups:rec.cleanups.size};owners[owner]=row;listeners+=row.listeners;timers+=row.timers;observers+=row.observers;cleanups+=row.cleanups}
 return{version:VERSION,installed:state.installed,totals:{owners:state.owners.size,listeners,timers,observers,cleanups,scheduled:state.scheduled.size},owners,domains:Object.fromEntries([...state.domains].map(([name,rec])=>[name,{active:rec.active,owners:[...rec.owners]}])),events:[...state.events]};
}
export function installRuntimeOwnership1100(){
 if(state.installed)return runtimeSnapshot1100();state.installed=true;state.installedAt=now();
 defineDomain1100('core',['core.runtime']);defineDomain1100('tickets');defineDomain1100('betting');defineDomain1100('finance');defineDomain1100('control');
 globalThis.__KAMIL_RUNTIME1100__={ownEvent:ownEvent1100,schedule:schedule1100,scheduleMicrotask:scheduleMicrotask1100,cancel:cancelScheduled1100,ownObserver:ownObserver1100,ownCleanup:ownCleanup1100,disposeOwner:disposeOwner1100,disposeDomain:disposeDomain1100,activateDomain:activateDomain1100,snapshot:runtimeSnapshot1100};
 log('install',{version:VERSION});return runtimeSnapshot1100();
}
