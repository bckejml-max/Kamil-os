import {store} from './state.js';
import {cloudClient} from './cloud.js';
import {syncProjection31,syncDiff31} from './syncJournal31.js';
import {indexedDbSupported31,smartSyncContext31,resetSmartSyncBaseline31,commitSmartSyncDiff31,pendingSmartSyncOps31,markSmartSyncUploaded31,smartSyncOps31} from './indexedDb31.js';

const TABLE='kamil_os_changes';let timer=null,running=false,lastError=null,lastRun=null;
const deviceId31=()=>{const m=store.meta(),existing=String(m.smartSyncDevice31||'').trim();if(existing)return existing;const id=globalThis.crypto?.randomUUID?.()||`device-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;store.setMeta({smartSyncDevice31:id});return id};
const emit=detail=>{try{window.dispatchEvent(new CustomEvent('kamil:smart-sync',{detail}))}catch{}};

export async function uploadPendingSmartSync31(){
 if(!indexedDbSupported31())return {ok:false,reason:'NO_INDEXEDDB'};
 if(typeof navigator!=='undefined'&&!navigator.onLine)return {ok:false,reason:'OFFLINE'};
 const c=await cloudClient(false);if(!c)return {ok:false,reason:'LOCAL_ONLY'};
 const sess=(await c.auth.getSession()).data.session;if(!sess)return {ok:false,reason:'NO_SESSION'};
 const pending=await pendingSmartSyncOps31(200);if(!pending.length)return {ok:true,uploaded:0};
 try{
  const ids=pending.map(x=>x.id),existingRes=await c.from(TABLE).select('id').in('id',ids);if(existingRes.error)throw existingRes.error;const existing=new Set((existingRes.data||[]).map(x=>x.id));
  const fresh=pending.filter(x=>!existing.has(x.id));
  if(fresh.length){const rows=fresh.map(x=>({id:x.id,user_id:sess.user.id,device_id:x.deviceId,seq:x.seq,domain:x.domain,entity_id:x.entityId,op:x.op,payload:x.payload,client_at:x.clientAt}));const {error}=await c.from(TABLE).insert(rows);if(error)throw error}
  const countRes=await c.from(TABLE).select('id',{count:'exact',head:true});if(countRes.error)throw countRes.error;const serverAt=new Date().toISOString();await markSmartSyncUploaded31(ids,{serverAt,cloudCount:countRes.count||0});lastError=null;return {ok:true,uploaded:pending.length,newRows:fresh.length,existing:pending.length-fresh.length,cloudCount:countRes.count||0,serverAt};
 }catch(error){lastError=String(error?.message||error);return {ok:false,error:lastError}}
}

export async function fetchRemoteChanges31({limit=100}={}){
 try{
  if(typeof navigator!=='undefined'&&!navigator.onLine)return {ok:false,reason:'OFFLINE',rows:[]};
  const c=await cloudClient(false);if(!c)return {ok:false,reason:'LOCAL_ONLY',rows:[]};
  const sess=(await c.auth.getSession()).data.session;if(!sess)return {ok:false,reason:'NO_SESSION',rows:[]};
  const deviceId=deviceId31(),safeLimit=Math.max(1,Math.min(250,Number(limit)||100)),{data,error}=await c.from(TABLE).select('id,device_id,seq,domain,entity_id,op,payload,client_at,created_at').neq('device_id',deviceId).order('created_at',{ascending:false}).limit(safeLimit);if(error)throw error;return {ok:true,deviceId,rows:data||[],fetchedAt:new Date().toISOString()};
 }catch(error){return {ok:false,error:String(error?.message||error),rows:[]}}
}

export async function runSmartSync31({rebase=false,discardOps=false,upload=true}={}){
 if(running)return null;if(!indexedDbSupported31()){lastError='IndexedDB není podporovaný';return {ok:false,error:lastError}}
 running=true;try{
  const projection=syncProjection31(store.get()),context=await smartSyncContext31(),deviceId=deviceId31();
  if(rebase||!context.baseline){await resetSmartSyncBaseline31(projection.records,{seq:context.seq,discardOps});const uploaded=upload?await uploadPendingSmartSync31():null;lastRun=new Date().toISOString();lastError=null;const detail={ok:true,baseline:true,rebase:!!rebase,projection,ops:[],uploaded};emit(detail);return detail}
  const delta=syncDiff31(context.records,projection.records,{deviceId,seqStart:context.seq,at:new Date().toISOString()});await commitSmartSyncDiff31(projection.records,delta.ops,{nextSeq:delta.nextSeq});const uploaded=upload?await uploadPendingSmartSync31():null;lastRun=new Date().toISOString();const detail={ok:true,baseline:false,projection,delta,ops:delta.ops,uploaded};emit(detail);return detail;
 }catch(error){lastError=String(error?.message||error);const detail={ok:false,error:lastError};emit(detail);return detail}finally{running=false}
}
export function scheduleSmartSync31(delay=1400,opts={}){clearTimeout(timer);timer=setTimeout(()=>runSmartSync31(opts),Math.max(0,Number(delay)||0))}
export async function smartSyncStatus31(){try{const c=await smartSyncContext31();return {...c,deviceId:deviceId31(),lastError,lastRun,ops:await smartSyncOps31({limit:20})}}catch(error){return {supported:indexedDbSupported31(),baseline:false,pending:0,uploaded:0,lastError:String(error?.message||error),lastRun,ops:[]}}}

function start(){
 scheduleSmartSync31(250,{upload:true});
 store.subscribe((_state,reason)=>{if(reason==='cloud'||reason==='cloud-conflict')scheduleSmartSync31(50,{rebase:true,discardOps:true,upload:false});else scheduleSmartSync31(1400,{upload:true})});
 window.addEventListener('online',()=>scheduleSmartSync31(100,{upload:true}));
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')scheduleSmartSync31(0,{upload:true})});
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start()}

export const smartSync31Info={table:TABLE,mode:'SHADOW_ONLY',authoritative:'kamil_os_state',autoApplyRemote:false,remoteReadOnly:true};
