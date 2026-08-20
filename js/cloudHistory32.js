import {APP_VERSION} from './releaseMeta.js';
import {store} from './state.js';
import {cloudClient} from './cloud.js';
import {historyPlan31} from './historyPlan31.js';
const TABLE='kamil_os_history';
const BUCKETS=new Set(['decision','networth','ticket','trade','import']);
let lastSyncAt=null,lastError=null,lastUploaded=0,lastCloudCount=0,running=false;
const chunks=(a,n)=>{const out=[];for(let i=0;i<a.length;i+=n)out.push(a.slice(i,i+n));return out};
export function cloudHistoryRows32(records=[],userId='',version=APP_VERSION,updatedAt=new Date().toISOString()){
 const uid=String(userId||'').trim();if(!uid)return [];
 return (Array.isArray(records)?records:[]).filter(x=>x?.key&&BUCKETS.has(String(x.bucket||''))).map(x=>({user_id:uid,record_key:String(x.key),bucket:String(x.bucket),happened_at:x.at||null,payload:x.payload??{},source_version:String(version||APP_VERSION),updated_at:updatedAt}));
}
export async function syncCloudHistory32(){
 if(running)return {ok:false,reason:'RUNNING'};if(typeof navigator!=='undefined'&&!navigator.onLine)return {ok:false,reason:'OFFLINE'};running=true;
 try{const c=await cloudClient(false);if(!c)return {ok:false,reason:'LOCAL_ONLY'};const sess=(await c.auth.getSession()).data.session;if(!sess)return {ok:false,reason:'NO_SESSION'};const plan=historyPlan31(store.get()),now=new Date().toISOString(),rows=cloudHistoryRows32(plan.records,sess.user.id,APP_VERSION,now);let uploaded=0;for(const batch of chunks(rows,200)){if(!batch.length)continue;const {error}=await c.from(TABLE).upsert(batch,{onConflict:'user_id,record_key'});if(error)throw error;uploaded+=batch.length}const countRes=await c.from(TABLE).select('record_key',{count:'exact',head:true}).eq('user_id',sess.user.id);if(countRes.error)throw countRes.error;lastSyncAt=new Date().toISOString();lastUploaded=uploaded;lastCloudCount=Number(countRes.count||0);lastError=null;return {ok:true,uploaded,cloudCount:lastCloudCount,lastSyncAt,counts:plan.counts}}
 catch(error){lastError=String(error?.message||error);return {ok:false,error:lastError}}
 finally{running=false}
}
export async function readCloudHistory32(bucket,{limit=100}={}){try{const c=await cloudClient(false);if(!c)return {ok:false,reason:'LOCAL_ONLY',rows:[]};const sess=(await c.auth.getSession()).data.session;if(!sess)return {ok:false,reason:'NO_SESSION',rows:[]};let q=c.from(TABLE).select('record_key,bucket,happened_at,payload,source_version,updated_at').eq('user_id',sess.user.id);if(bucket)q=q.eq('bucket',String(bucket));const {data,error}=await q.order('happened_at',{ascending:false,nullsFirst:false}).limit(Math.max(1,Math.min(500,Number(limit)||100)));if(error)throw error;return {ok:true,rows:data||[]}}catch(error){return {ok:false,error:String(error?.message||error),rows:[]}}}
export function cloudHistoryStatus32(){return {table:TABLE,lastSyncAt,lastError,lastUploaded,lastCloudCount,mode:'DUAL_WRITE',primaryStillState:true,deleteEnabled:false}}
export const cloudHistory32Info={table:TABLE,buckets:[...BUCKETS],mode:'DUAL_WRITE',deleteEnabled:false,sourceOfTruth:'kamil_os_state + IndexedDB until cutover'};
