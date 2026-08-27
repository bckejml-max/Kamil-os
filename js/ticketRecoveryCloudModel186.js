import {TICKET_RECOVERY_LIMIT_185,ticketRecoverySummary185} from './ticketRecovery185.js';

export const TICKET_RECOVERY_CLOUD_VERSION_186=186;
const clone=x=>JSON.parse(JSON.stringify(x));
const time=x=>{const t=Date.parse(x||'');return Number.isFinite(t)?t:0};

export function cloudRowFromRecovery186(snapshot,userId,{syncedAt=new Date().toISOString()}={}){
 if(!snapshot?.id||!Array.isArray(snapshot?.rows)||!userId)throw new Error('Recovery snapshot není kompletní');
 const s=ticketRecoverySummary185(snapshot);
 return{user_id:userId,id:String(snapshot.id),version:TICKET_RECOVERY_CLOUD_VERSION_186,created_at:snapshot.createdAt||new Date().toISOString(),file_name:String(snapshot.fileName||''),kind:String(snapshot.kind||'import'),note:String(snapshot.note||''),stats:clone(snapshot.stats||{rows:s.rows,qty:s.qty,active:s.active,closed:s.closed,buyTotalCzk:s.buyTotalCzk,payoutReceivedCzk:s.payoutReceivedCzk}),delta:clone(snapshot.delta||s.delta||{}),rows:clone(snapshot.rows),synced_at:syncedAt};
}

export function recoveryFromCloudRow186(row){
 if(!row?.id||!Array.isArray(row?.rows))return null;
 return{version:185,id:String(row.id),createdAt:row.created_at||null,fileName:String(row.file_name||''),kind:String(row.kind||'import'),note:String(row.note||''),stats:clone(row.stats||{}),delta:clone(row.delta||{}),rows:clone(row.rows),cloudSyncedAt:row.synced_at||null};
}

export function mergeTicketRecoveryHistories186(localSnapshots=[],cloudSnapshots=[],limit=TICKET_RECOVERY_LIMIT_185){
 const all=[...(Array.isArray(localSnapshots)?localSnapshots:[]),...(Array.isArray(cloudSnapshots)?cloudSnapshots:[])].filter(x=>x?.id&&Array.isArray(x.rows));
 const byId=new Map();
 for(const item of all){const prev=byId.get(item.id);if(!prev||time(item.cloudSyncedAt||item.createdAt)>=time(prev.cloudSyncedAt||prev.createdAt))byId.set(item.id,clone(item))}
 return[...byId.values()].sort((a,b)=>time(b.createdAt)-time(a.createdAt)).slice(0,Math.max(1,Number(limit)||TICKET_RECOVERY_LIMIT_185));
}
