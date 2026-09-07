const owners=new Map();
function bag(owner){const key=String(owner||'anonymous');if(!owners.has(key))owners.set(key,new Set());return owners.get(key)}
export function listen(owner,target,type,handler,options){if(!target?.addEventListener||typeof handler!=='function')return()=>{};target.addEventListener(type,handler,options);const off=()=>{try{target.removeEventListener(type,handler,options)}catch{}bag(owner).delete(off)};bag(owner).add(off);return off}
export function cleanup(owner){const set=owners.get(String(owner||'anonymous'));if(!set)return 0;const n=set.size;for(const off of [...set])off();owners.delete(String(owner||'anonymous'));return n}
export function cleanupAll(){let n=0;for(const key of [...owners.keys()])n+=cleanup(key);return n}
export function lifecycleStats(){return{owners:[...owners.entries()].map(([owner,set])=>({owner,listeners:set.size})),total:[...owners.values()].reduce((n,set)=>n+set.size,0)}}
if(typeof window!=='undefined')window.__KAMIL_LIFECYCLE__={listen,cleanup,stats:lifecycleStats};
