import {syncSignature31,syncPayloadSafe31} from './syncJournal31.js';
const arr=v=>Array.isArray(v)?v:[];
const time=x=>new Date(x?.created_at||x?.createdAt||x?.client_at||x?.clientAt||0).getTime()||0;
const clean=v=>String(v??'').trim();
const stable=v=>JSON.stringify(v??null);
const topDiff=(a,b)=>{const keys=new Set([...Object.keys(a&&typeof a==='object'&&!Array.isArray(a)?a:{}),...Object.keys(b&&typeof b==='object'&&!Array.isArray(b)?b:{})]);return [...keys].filter(k=>stable(a?.[k])!==stable(b?.[k])).slice(0,8)};

export function remoteInbox31(remoteRows=[],localRecords=[],seenIds=[]){
 const seen=new Set(arr(seenIds).map(clean)),latest=new Map();
 for(const raw of arr(remoteRows)){
  const id=clean(raw?.id),deviceId=clean(raw?.device_id||raw?.deviceId),domain=clean(raw?.domain),entityId=clean(raw?.entity_id||raw?.entityId),op=clean(raw?.op).toUpperCase();
  if(!id||!deviceId||!domain||!entityId||!['UPSERT','DELETE'].includes(op))continue;
  const payload=op==='DELETE'?null:syncPayloadSafe31(raw?.payload??null),row={id,deviceId,domain,entityId,op,payload,clientAt:raw?.client_at||raw?.clientAt||null,createdAt:raw?.created_at||raw?.createdAt||raw?.client_at||raw?.clientAt||null,seq:Number(raw?.seq||0)};
  const key=`${domain}|${entityId}`,prev=latest.get(key);if(!prev||time(row)>time(prev)||(time(row)===time(prev)&&row.seq>prev.seq))latest.set(key,row);
 }
 const local=new Map(arr(localRecords).map(x=>[`${clean(x?.domain)}|${clean(x?.entityId)}`,x])),items=[];
 for(const row of latest.values()){
  const key=`${row.domain}|${row.entityId}`,here=local.get(key),remoteSignature=row.op==='UPSERT'?syncSignature31(row.payload):null;let kind='SAME',attention=false;
  if(row.op==='DELETE'){if(here){kind='REMOTE_DELETE';attention=true}else kind='SAME'}
  else if(!here){kind='REMOTE_NEW';attention=true}
  else if(here.signature===remoteSignature)kind='SAME';
  else{kind='CONFLICT';attention=true}
  items.push({...row,key,kind,attention,seen:seen.has(row.id),remoteSignature,localSignature:here?.signature||null,changedFields:row.op==='UPSERT'&&here?topDiff(here.payload,row.payload):[],localPayload:here?.payload||null});
 }
 items.sort((a,b)=>time(b)-time(a));
 const actionable=items.filter(x=>x.attention),unseen=actionable.filter(x=>!x.seen);
 return {items,actionable,unseen,total:items.length,attention:actionable.length,unseenCount:unseen.length,conflicts:actionable.filter(x=>x.kind==='CONFLICT').length,remoteNew:actionable.filter(x=>x.kind==='REMOTE_NEW').length,remoteDeletes:actionable.filter(x=>x.kind==='REMOTE_DELETE').length,same:items.filter(x=>x.kind==='SAME').length,note:'Remote Change Inbox 31.5 je pouze read-only porovnání. Nic ze vzdálených operací automaticky nemění hlavní Kamil OS state.'};
}

export const remoteInboxKind31={CONFLICT:'Konflikt',REMOTE_NEW:'Nová vzdálená položka',REMOTE_DELETE:'Vzdálené smazání',SAME:'Už shodné'};
export const remoteInboxSafety31='31.5 nikdy automaticky neaplikuje vzdálenou operaci, nemaže lokální data ani nezapisuje do hlavního state.';
