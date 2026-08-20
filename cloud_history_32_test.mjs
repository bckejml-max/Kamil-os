globalThis.localStorage={_d:new Map(),getItem(k){return this._d.has(k)?this._d.get(k):null},setItem(k,v){this._d.set(k,String(v))},removeItem(k){this._d.delete(k)}};
const {cloudHistoryRows32,cloudHistory32Info}=await import('./js/cloudHistory32.js');
const assert=(x,m)=>{if(!x)throw new Error(m)};
const rows=cloudHistoryRows32([{key:'ticket|1',bucket:'ticket',at:'2026-08-20T10:00:00Z',payload:{id:'1',profit:100}},{key:'trade|2',bucket:'trade',at:null,payload:{ticker:'WDAY'}}],'u1','32.1.0','2026-08-20T12:00:00Z');
assert(rows.length===2,'row mapping count');assert(rows[0].user_id==='u1'&&rows[0].record_key==='ticket|1'&&rows[0].bucket==='ticket','identity mapping');assert(rows[0].payload.profit===100&&rows[0].source_version==='32.1.0','payload/version mapping');assert(rows[1].happened_at===null,'null date preserved');assert(cloudHistory32Info.mode==='DUAL_WRITE'&&cloudHistory32Info.deleteEnabled===false,'dual-write safety contract');
console.log('KAMIL OS 32.1 CLOUD HISTORY UNIT PASS');
