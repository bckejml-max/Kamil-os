import {cloudClient,session} from './cloud.js';
import {TICKET_RECOVERY_KEY_185,TICKET_RECOVERY_LIMIT_185,loadTicketRecoveryHistory185,ticketRecoverySummary185} from './ticketRecovery185.js';
import {cloudRowFromRecovery186,recoveryFromCloudRow186,mergeTicketRecoveryHistories186} from './ticketRecoveryCloudModel186.js';

export const TICKET_RECOVERY_CLOUD_TABLE_186='ticket_recovery_snapshots';

async function context186(){
 const c=await cloudClient(),sess=await session();
 if(!c||!sess?.user?.id)return{ok:false,reason:'NO_SESSION'};
 return{ok:true,client:c,userId:sess.user.id};
}

async function pruneCloud186(client,userId){
 const {data,error}=await client.from(TICKET_RECOVERY_CLOUD_TABLE_186).select('id').eq('user_id',userId).order('created_at',{ascending:false}).range(TICKET_RECOVERY_LIMIT_185,99);
 if(error)return{ok:false,error};
 const stale=(data||[]).map(x=>x.id).filter(Boolean);
 if(!stale.length)return{ok:true,deleted:0};
 const {error:deleteError}=await client.from(TICKET_RECOVERY_CLOUD_TABLE_186).delete().eq('user_id',userId).in('id',stale);
 return deleteError?{ok:false,error:deleteError}:{ok:true,deleted:stale.length};
}

export async function saveTicketRecoveryCloudSnapshot186(snapshot){
 try{
  const ctx=await context186();if(!ctx.ok)return ctx;
  const row=cloudRowFromRecovery186(snapshot,ctx.userId),{error}=await ctx.client.from(TICKET_RECOVERY_CLOUD_TABLE_186).upsert(row,{onConflict:'user_id,id'});
  if(error)throw error;
  const prune=await pruneCloud186(ctx.client,ctx.userId);
  return{ok:true,snapshot,summary:ticketRecoverySummary185(snapshot),pruned:prune.ok?prune.deleted:0,pruneError:prune.ok?null:prune.error};
 }catch(error){return{ok:false,error}}
}

export async function loadTicketRecoveryCloudHistory186(){
 try{
  const ctx=await context186();if(!ctx.ok)return{...ctx,snapshots:[],summaries:[]};
  const {data,error}=await ctx.client.from(TICKET_RECOVERY_CLOUD_TABLE_186).select('id,version,created_at,file_name,kind,note,stats,delta,rows,synced_at').eq('user_id',ctx.userId).order('created_at',{ascending:false}).limit(TICKET_RECOVERY_LIMIT_185);
  if(error)throw error;
  const snapshots=(data||[]).map(recoveryFromCloudRow186).filter(Boolean);
  return{ok:true,snapshots,summaries:snapshots.map(ticketRecoverySummary185)};
 }catch(error){return{ok:false,error,snapshots:[],summaries:[]}}
}

export async function syncTicketRecoveryVault186({storage=globalThis.localStorage}={}){
 const local=loadTicketRecoveryHistory185({storage});
 try{
  const ctx=await context186();if(!ctx.ok)return{ok:false,reason:ctx.reason,local,snapshots:local.snapshots||[],summaries:local.summaries||[]};
  const localSnapshots=(local.ok?local.snapshots:[]).slice(0,TICKET_RECOVERY_LIMIT_185);
  if(localSnapshots.length){
   const rows=localSnapshots.map(x=>cloudRowFromRecovery186(x,ctx.userId)),{error}=await ctx.client.from(TICKET_RECOVERY_CLOUD_TABLE_186).upsert(rows,{onConflict:'user_id,id'});
   if(error)throw error;
  }
  const {data,error}=await ctx.client.from(TICKET_RECOVERY_CLOUD_TABLE_186).select('id,version,created_at,file_name,kind,note,stats,delta,rows,synced_at').eq('user_id',ctx.userId).order('created_at',{ascending:false}).limit(TICKET_RECOVERY_LIMIT_185);
  if(error)throw error;
  const cloudSnapshots=(data||[]).map(recoveryFromCloudRow186).filter(Boolean),merged=mergeTicketRecoveryHistories186(localSnapshots,cloudSnapshots);
  if(storage?.setItem)storage.setItem(TICKET_RECOVERY_KEY_185,JSON.stringify({version:185,snapshots:merged}));
  const prune=await pruneCloud186(ctx.client,ctx.userId);
  return{ok:true,snapshots:merged,summaries:merged.map(ticketRecoverySummary185),localCount:localSnapshots.length,cloudCount:cloudSnapshots.length,pruned:prune.ok?prune.deleted:0};
 }catch(error){return{ok:false,error,local,snapshots:local.snapshots||[],summaries:local.summaries||[]}}
}
