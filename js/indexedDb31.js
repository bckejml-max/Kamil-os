const DB_NAME='kamil-os-data-v2',DB_VERSION=1,HISTORY='history',META='meta';
const req=r=>new Promise((resolve,reject)=>{r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||new Error('IndexedDB request failed'))});
const txDone=t=>new Promise((resolve,reject)=>{t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error||new Error('IndexedDB transaction failed'));t.onabort=()=>reject(t.error||new Error('IndexedDB transaction aborted'))});

export function indexedDbSupported31(){return typeof indexedDB!=='undefined'}
export async function openDataDb31(){
 if(!indexedDbSupported31())throw new Error('IndexedDB není podporovaný');
 return new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,DB_VERSION);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(HISTORY)){const s=db.createObjectStore(HISTORY,{keyPath:'key'});s.createIndex('bucket','bucket',{unique:false});s.createIndex('at','at',{unique:false})}if(!db.objectStoreNames.contains(META))db.createObjectStore(META,{keyPath:'key'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||new Error('IndexedDB open failed'));r.onblocked=()=>reject(new Error('IndexedDB upgrade blocked'))})
}
export async function mirrorHistory31(records=[]){
 const db=await openDataDb31();try{const tx=db.transaction([HISTORY,META],'readwrite'),store=tx.objectStore(HISTORY);for(const x of Array.isArray(records)?records:[])store.put({...x,mirroredAt:new Date().toISOString()});tx.objectStore(META).put({key:'mirror',lastMirrorAt:new Date().toISOString(),lastBatch:Array.isArray(records)?records.length:0});await txDone(tx);return {ok:true,written:Array.isArray(records)?records.length:0}}finally{db.close()}
}
export async function dataEngineSummary31(){
 if(!indexedDbSupported31())return {supported:false,ready:false,total:0,byBucket:{},lastMirrorAt:null,lastBatch:0};
 const db=await openDataDb31();try{const tx=db.transaction([HISTORY,META],'readonly'),s=tx.objectStore(HISTORY),total=await req(s.count()),meta=await req(tx.objectStore(META).get('mirror')),byBucket={};for(const bucket of ['decision','networth','ticket','trade','import'])byBucket[bucket]=await req(s.index('bucket').count(IDBKeyRange.only(bucket)));await txDone(tx);return {supported:true,ready:true,total,byBucket,lastMirrorAt:meta?.lastMirrorAt||null,lastBatch:Number(meta?.lastBatch||0)}}finally{db.close()}
}
export async function readHistory31(bucket,{limit=100}={}){
 const db=await openDataDb31();try{const tx=db.transaction(HISTORY,'readonly'),idx=tx.objectStore(HISTORY).index('bucket'),rows=await req(idx.getAll(IDBKeyRange.only(String(bucket)),Math.max(1,Math.min(1000,Number(limit)||100))));await txDone(tx);return rows.sort((a,b)=>new Date(b.at||0)-new Date(a.at||0))}finally{db.close()}
}
export const indexedDb31Info={dbName:DB_NAME,version:DB_VERSION,historyStore:HISTORY,metaStore:META};
