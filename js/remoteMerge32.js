import {syncPayloadSafe31} from './syncJournal31.js';
const arr=v=>Array.isArray(v)?v:[];
const clone=v=>{try{return structuredClone(v)}catch{return JSON.parse(JSON.stringify(v??{}))}};
const DOMAINS={
 tasks:s=>s.tasks,
 personalAdmin:s=>(s.personalAdmin=s.personalAdmin||{items:[]}).items,
 tickets:s=>(s.ticketBook=s.ticketBook||{items:[]}).items,
 debts:s=>(s.debtBook=s.debtBook||{items:[]}).items,
 goals:s=>(s.personalGoals=s.personalGoals||{items:[]}).items,
 netWorth:s=>(s.netWorthBook=s.netWorthBook||{items:[],history:[]}).items,
 spending:s=>(s.personalSpending=s.personalSpending||{transactions:[]}).transactions,
 assets:s=>(s.assetBook=s.assetBook||{items:[]}).items,
 personalInbox:s=>(s.personalInbox=s.personalInbox||{items:[]}).items
};
export function remoteMergePreview32(item={}){const local=item.localPayload&&typeof item.localPayload==='object'?syncPayloadSafe31(item.localPayload):null,remote=item.op==='DELETE'?null:syncPayloadSafe31(item.payload),fields=[...new Set([...(local?Object.keys(local):[]),...(remote?Object.keys(remote):[])])].filter(k=>JSON.stringify(local?.[k])!==JSON.stringify(remote?.[k])).slice(0,20);return {domain:String(item.domain||''),entityId:String(item.entityId||''),op:String(item.op||''),kind:String(item.kind||''),local,remote,fields,destructive:item.op==='DELETE',canApply:!!DOMAINS[item.domain]&&!!item.entityId}}
export function applyRemoteItem32(state,item={}){const get=DOMAINS[item.domain];if(!get||!item.entityId)return {ok:false,reason:'UNSUPPORTED_DOMAIN'};const list=get(state);if(!Array.isArray(list))return {ok:false,reason:'INVALID_COLLECTION'};const idx=list.findIndex(x=>String(x?.id||'')===String(item.entityId));if(item.op==='DELETE'){if(idx>=0)list.splice(idx,1);return {ok:true,action:idx>=0?'DELETE':'NOOP'}}const payload=syncPayloadSafe31(item.payload);if(!payload||typeof payload!=='object')return {ok:false,reason:'INVALID_PAYLOAD'};payload.id=String(item.entityId);if(idx>=0)list[idx]=clone(payload);else list.push(clone(payload));return {ok:true,action:idx>=0?'UPDATE':'INSERT'}}
export function remoteAutoCandidates32(inbox={}){return arr(inbox.actionable).filter(x=>x.kind==='REMOTE_NEW'&&x.op==='UPSERT'&&!x.seen)}
export const remoteMerge32Info={confirmed:true,autoDefault:false,autoKinds:['REMOTE_NEW'],neverAuto:['CONFLICT','REMOTE_DELETE']};
