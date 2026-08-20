const DB_NAME='kamil-os-data-v2',DB_VERSION=2,HISTORY='history',META='meta',SYNC_SHADOW='sync_shadow',SYNC_OPS='sync_ops';
const req=r=>new Promise((resolve,reject)=>{r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||new Error('IndexedDB request failed'))});
const txDone=t=>new Promise((resolve,reject)=>{t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error||new Error('IndexedDB transaction failed'));t.onabort=()=>reject(t.error||new Error('IndexedDB transaction aborted'))});

export function indexedDbSupported31(){return typeof indexedDB!=='undefined'}
export async function openDataDb31(){
 if(!indexedDbSupported31())throw new Error('IndexedDB není podporovaný');
 return new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,DB_VERSION);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(HISTORY)){const s=db.createObjectStore(HISTORY,{keyPath:'key'});s.createIndex('bucket','bucket',{unique:false});s.createIndex('at','at',{unique:false})}if(!db.objectStoreNames.contains(META))db.createObjectStore(META,{keyPath:'key'});if(!db.objectStoreNames.contains(SYNC_SHADOW)){const s=db.createObjectStore(SYNC_SHADOW,{keyPath:'key'});s.createIndex('domain','domain',{unique:false})}if(!db.objectStoreNames.contains(SYNC_OPS)){const s=db.createObjectStore(SYNC_OPS,{keyPath:'id'});s.createIndex('status','status',{unique:false});s.createIndex('clientAt','clientAt',{unique:false});s.createIndex('domain','domain',{unique:false})}};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||new Error('IndexedDB open failed'));r.onblocked=()=>reject(new Error('IndexedDB upgrade blocked'))})
}
export async function mirrorHistory31(records=[]){
 const db=await openDataDb31();try{const tx=db.transaction([HISTORY,META],'readwrite'),done=txDone(tx),store=tx.objectStore(HISTORY),now=new Date().toISOString();for(const x of Array.isArray(records)?records:[])store.put({...x,mirroredAt:now});tx.objectStore(META).put({key:'mirror',lastMirrorAt:now,lastBatch:Array.isArray(records)?records.length:0});await done;return {ok:true,written:Array.isArray(records)?records.length:0}}finally{db.close()}
}
export async function dataEngineSummary31(){
 if(!indexedDbSupported31())return {supported:false,ready:false,total:0,byBucket:{},lastMirrorAt:null,lastBatch:0};
 const db=await openDataDb31();try{const tx=db.transaction([HISTORY,META],'readonly'),done=txDone(tx),s=tx.objectStore(HISTORY),totalReq=req(s.count()),metaReq=req(tx.objectStore(META).get('mirror')),buckets=['decision','networth','ticket','trade','import'],bucketReqs=buckets.map(bucket=>req(s.index('bucket').count(IDBKeyRange.only(bucket)))), [total,meta,bucketCounts]=await Promise.all([totalReq,metaReq,Promise.all(bucketReqs)]);await done;const byBucket=Object.fromEntries(buckets.map((bucket,i)=>[bucket,bucketCounts[i]]));return {supported:true,ready:true,total,byBucket,lastMirrorAt:meta?.lastMirrorAt||null,lastBatch:Number(meta?.lastBatch||0)}}finally{db.close()}
}
export async function readHistory31(bucket,{limit=100}={}){
 const db=await openDataDb31();try{const tx=db.transaction(HISTORY,'readonly'),done=txDone(tx),idx=tx.objectStore(HISTORY).index('bucket'),rows=await req(idx.getAll(IDBKeyRange.only(String(bucket)),Math.max(1,Math.min(1000,Number(limit)||100))));await done;return rows.sort((a,b)=>new Date(b.at||0)-new Date(a.at||0))}finally{db.close()}
}

export async function smartSyncContext31(){
 if(!indexedDbSupported31())return {supported:false,baseline:false,records:[],seq:0,pending:0,uploaded:0,lastDiffAt:null,lastUploadAt:null};
 const db=await openDataDb31();try{const tx=db.transaction([SYNC_SHADOW,SYNC_OPS,META],'readonly'),done=txDone(tx),shadow=tx.objectStore(SYNC_SHADOW),ops=tx.objectStore(SYNC_OPS),metaStore=tx.objectStore(META);const [records,meta,pending,uploaded]=await Promise.all([req(shadow.getAll()),req(metaStore.get('smart-sync')),req(ops.index('status').count(IDBKeyRange.only('PENDING'))),req(ops.index('status').count(IDBKeyRange.only('UPLOADED')))]);await done;return {supported:true,baseline:!!meta?.baseline,records,seq:Number(meta?.seq||0),pending,uploaded,lastDiffAt:meta?.lastDiffAt||null,lastUploadAt:meta?.lastUploadAt||null,lastCloudCount:Number(meta?.lastCloudCount||0)}}finally{db.close()}
}
export async function resetSmartSyncBaseline31(records=[],{seq=0,discardOps=false}={}){
 const db=await openDataDb31();try{const tx=db.transaction([SYNC_SHADOW,SYNC_OPS,META],'readwrite'),done=txDone(tx),shadow=tx.objectStore(SYNC_SHADOW),ops=tx.objectStore(SYNC_OPS),meta=tx.objectStore(META),now=new Date().toISOString();shadow.clear();for(const x of Array.isArray(records)?records:[])shadow.put(x);if(discardOps)ops.clear();meta.put({key:'smart-sync',baseline:true,seq:Math.max(0,Number(seq)||0),lastDiffAt:now,lastUploadAt:null,lastCloudCount:0});await done;return {ok:true,baseline:true,total:Array.isArray(records)?records.length:0}}finally{db.close()}
}
export async function commitSmartSyncDiff31(records=[],ops=[],{nextSeq=0}={}){
 const db=await openDataDb31();try{const tx=db.transaction([SYNC_SHADOW,SYNC_OPS,META],'readwrite'),done=txDone(tx),shadow=tx.objectStore(SYNC_SHADOW),opStore=tx.objectStore(SYNC_OPS),meta=tx.objectStore(META),now=new Date().toISOString();shadow.clear();for(const x of Array.isArray(records)?records:[])shadow.put(x);for(const x of Array.isArray(ops)?ops:[])opStore.put(x);meta.put({key:'smart-sync',baseline:true,seq:Math.max(0,Number(nextSeq)||0),lastDiffAt:now});await done;return {ok:true,written:Array.isArray(ops)?ops.length:0}}finally{db.close()}
}
export async function pendingSmartSyncOps31(limit=100){
 const db=await openDataDb31();try{const tx=db.transaction(SYNC_OPS,'readonly'),done=txDone(tx),rows=await req(tx.objectStore(SYNC_OPS).index('status').getAll(IDBKeyRange.only('PENDING'),Math.max(1,Math.min(500,Number(limit)||100))));await done;return rows.sort((a,b)=>(a.seq||0)-(b.seq||0))}finally{db.close()}
}
export async function markSmartSyncUploaded31(ids=[],{serverAt=new Date().toISOString(),cloudCount=0}={}){
 const wanted=new Set(Array.isArray(ids)?ids:[]),db=await openDataDb31();try{const tx=db.transaction([SYNC_OPS,META],'readwrite'),done=txDone(tx),ops=tx.objectStore(SYNC_OPS),meta=tx.objectStore(META);for(const id of wanted){const r=ops.get(id);r.onsuccess=()=>{if(r.result)ops.put({...r.result,status:'UPLOADED',uploadedAt:serverAt})}}meta.put({key:'smart-sync-upload',lastUploadAt:serverAt,lastCloudCount:Number(cloudCount||0)});await done;const context=await smartSyncContext31();const db2=await openDataDb31();try{const tx2=db2.transaction(META,'readwrite'),done2=txDone(tx2),m=tx2.objectStore(META),current=await req(m.get('smart-sync'));m.put({...current,key:'smart-sync',lastUploadAt:serverAt,lastCloudCount:Number(cloudCount||0)});await done2}finally{db2.close()}return {...context,lastUploadAt:serverAt,lastCloudCount:Number(cloudCount||0)}}finally{db.close()}
}
export async function smartSyncOps31({limit=100}={}){
 const db=await openDataDb31();try{const tx=db.transaction(SYNC_OPS,'readonly'),done=txDone(tx),rows=await req(tx.objectStore(SYNC_OPS).getAll());await done;return rows.sort((a,b)=>new Date(b.clientAt||0)-new Date(a.clientAt||0)).slice(0,Math.max(1,Math.min(1000,Number(limit)||100)))}finally{db.close()}
}

export const indexedDb31Info={dbName:DB_NAME,version:DB_VERSION,historyStore:HISTORY,metaStore:META,syncShadowStore:SYNC_SHADOW,syncOpsStore:SYNC_OPS};
