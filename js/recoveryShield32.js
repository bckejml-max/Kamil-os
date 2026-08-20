import {APP_VERSION,SCHEMA_VERSION,STATE_TABLE} from './config.js';
import {store} from './state.js';
import {cloudClient} from './cloud.js';
import {cloudPayload32,cloudSchema32,mergeCloudIntoDevice32} from './cloudPayload32.js';

const TABLE='kamil_os_snapshots';
const FORMAT='KAMIL_OS_RECOVERY';
const FORMAT_VERSION=1;
let lastError=null,lastCreatedAt=null,running=false;
const count=(x,path)=>{try{const v=path.split('.').reduce((o,k)=>o?.[k],x);return Array.isArray(v)?v.length:0}catch{return 0}};
const dayKey=v=>{const d=new Date(v||0);return Number.isNaN(d.getTime())?null:d.toISOString().slice(0,10)};

function envelope32(payload,stateUpdatedAt,reason='DAILY'){
 return {format:FORMAT,formatVersion:FORMAT_VERSION,appVersion:APP_VERSION,schemaVersion:SCHEMA_VERSION,stateUpdatedAt:stateUpdatedAt||null,reason,createdBy:'Kamil OS Recovery Shield 32.4',payload:cloudPayload32(payload,SCHEMA_VERSION)};
}
export function recoverySnapshotCounts32(state={}){
 return {tasks:count(state,'tasks'),tickets:count(state,'ticketBook.items'),ticketHistory:count(state,'ticketBook.history'),debts:count(state,'debtBook.items'),tradeHistory:count(state,'tradeJournal.trades'),personalAdmin:count(state,'personalAdmin.items'),netWorthHistory:count(state,'netWorthBook.history')};
}
export function validateRecoverySnapshot32(row){
 const e=row?.payload;if(!e||e.format!==FORMAT||Number(e.formatVersion)!==FORMAT_VERSION||!e.payload)return {ok:false,reason:'INVALID_FORMAT'};
 const schema=cloudSchema32(e.payload,SCHEMA_VERSION);if(schema.future)return {ok:false,reason:'FUTURE_SCHEMA',remoteSchema:schema.remote};
 return {ok:true,envelope:e,schema,counts:recoverySnapshotCounts32(e.payload)};
}
export async function listRecoverySnapshots32(limit=10){
 try{const c=await cloudClient(false);if(!c)return {ok:false,reason:'LOCAL_ONLY',rows:[]};const sess=(await c.auth.getSession()).data.session;if(!sess)return {ok:false,reason:'NO_SESSION',rows:[]};const {data,error}=await c.from(TABLE).select('id,payload,created_at').eq('user_id',sess.user.id).order('created_at',{ascending:false}).limit(Math.max(1,Math.min(30,Number(limit)||10)));if(error)throw error;return {ok:true,rows:data||[]}}catch(error){lastError=String(error?.message||error);return {ok:false,error:lastError,rows:[]}}
}
export async function maybeCreateRecoverySnapshot32({force=false,reason='DAILY'}={}){
 if(running)return {ok:false,reason:'RUNNING'};running=true;
 try{
  const c=await cloudClient(false);if(!c)return {ok:false,reason:'LOCAL_ONLY'};const sess=(await c.auth.getSession()).data.session;if(!sess)return {ok:false,reason:'NO_SESSION'};
  const latest=await c.from(TABLE).select('id,created_at').eq('user_id',sess.user.id).order('created_at',{ascending:false}).limit(1).maybeSingle();if(latest.error)throw latest.error;
  if(!force&&latest.data?.created_at&&dayKey(latest.data.created_at)===dayKey(new Date()))return {ok:true,skipped:true,createdAt:latest.data.created_at};
  const current=await c.from(STATE_TABLE).select('payload,updated_at').eq('user_id',sess.user.id).maybeSingle();if(current.error)throw current.error;if(!current.data?.payload)return {ok:false,reason:'NO_CLOUD_STATE'};
  const schema=cloudSchema32(current.data.payload,SCHEMA_VERSION);if(schema.future)return {ok:false,reason:'FUTURE_SCHEMA',remoteSchema:schema.remote};
  const payload=envelope32(current.data.payload,current.data.updated_at,reason),insert=await c.from(TABLE).insert({user_id:sess.user.id,payload}).select('id,created_at').single();if(insert.error)throw insert.error;
  lastCreatedAt=insert.data?.created_at||new Date().toISOString();lastError=null;return {ok:true,id:insert.data?.id,createdAt:lastCreatedAt,counts:recoverySnapshotCounts32(payload.payload)};
 }catch(error){lastError=String(error?.message||error);return {ok:false,error:lastError}}
 finally{running=false}
}
export async function restoreRecoverySnapshot32(row){
 const valid=validateRecoverySnapshot32(row);if(!valid.ok)return valid;
 const c=await cloudClient(false);if(!c)return {ok:false,reason:'LOCAL_ONLY'};const sess=(await c.auth.getSession()).data.session;if(!sess)return {ok:false,reason:'NO_SESSION'};
 const backup=await maybeCreateRecoverySnapshot32({force:true,reason:'PRE_RESTORE'});if(!backup.ok)return {ok:false,reason:'PRE_RESTORE_BACKUP_FAILED',error:backup.error||backup.reason};
 const merged=mergeCloudIntoDevice32(store.get(),valid.envelope.payload,SCHEMA_VERSION),payload=cloudPayload32(merged,SCHEMA_VERSION),updatedAt=new Date().toISOString(),save=await c.from(STATE_TABLE).upsert({user_id:sess.user.id,payload,updated_at:updatedAt}).select('updated_at').single();if(save.error)return {ok:false,error:String(save.error.message||save.error)};
 store.replace(merged,'recovery-restore');store.dirty=false;store.clearQueue();store.setMeta({lastCloudAt:save.data?.updated_at||updatedAt,lastCloudSchema:SCHEMA_VERSION,lastRestoreAt:new Date().toISOString()});lastError=null;return {ok:true,updatedAt:save.data?.updated_at||updatedAt,counts:valid.counts,preRestoreSnapshotId:backup.id};
}
export function recoveryShieldStatus32(){return {table:TABLE,format:FORMAT,lastCreatedAt,lastError,automaticDaily:true,preRestoreBackup:true,clientDelete:false}}
export const recoveryShield32Info={table:TABLE,format:FORMAT,formatVersion:FORMAT_VERSION,automaticDaily:true,restoreRequiresExplicitUiConfirm:true,sourceOfTruth:'kamil_os_state'};
