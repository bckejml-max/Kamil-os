import {TICKET_IMPORT_BACKUP_KEY_184} from './ticketImportRollback184.js';

export const TICKET_RECOVERY_KEY_185='kamil_os_ticket_recovery_history_v185';
export const TICKET_RECOVERY_LIMIT_185=10;

const clone=x=>JSON.parse(JSON.stringify(x));
const rowsOf=x=>Array.isArray(x?.rows)?x.rows:[];
const statusOf=x=>String(x?.market_status||x?.marketStatus||'').toUpperCase();
const CLOSED=new Set(['SOLD_UNDELIVERED','SOLD_WAITING_PAYMENT','PAYOUT_RECEIVED','PAID']);
const safeInt=x=>Math.max(0,Number(x||0)||0);

function summaryRows(rows=[]){let qty=0,active=0,closed=0,buy=0,payout=0;for(const row of rows){qty+=safeInt(row?.qty);buy+=safeInt(row?.buy_total_czk??row?.buyTotalCzk);payout+=safeInt(row?.payout_received_czk??row?.payoutReceivedCzk);if(CLOSED.has(statusOf(row)))closed++;else active++}return{rows:rows.length,qty,active,closed,buyTotalCzk:buy,payoutReceivedCzk:payout}}
function deltaOf(diff={}){return{added:safeInt(diff?.added?.length??diff?.added),changed:safeInt(diff?.changed?.length??diff?.changed),removed:safeInt(diff?.removed?.length??diff?.removed),statusChanged:Array.isArray(diff?.changed)?diff.changed.filter(x=>x?.statusChanged).length:safeInt(diff?.statusChanged)}}
function idAt(createdAt,seed=''){return`recovery-${String(createdAt).replace(/[^0-9]/g,'')}-${String(seed||'snapshot').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').slice(0,32)||'snapshot'}`}

export function createTicketRecoverySnapshot185(inventory=[],options={}){
 const createdAt=options.createdAt||new Date().toISOString(),fileName=String(options.fileName||''),kind=String(options.kind||'import');
 const rows=clone(Array.isArray(inventory)?inventory:[]),stats=summaryRows(rows),delta=deltaOf(options.diff||{});
 return{version:185,id:options.id||idAt(createdAt,fileName||kind),createdAt,fileName,kind,note:String(options.note||''),stats,delta,rows};
}

export function ticketRecoverySummary185(snapshot){const rows=rowsOf(snapshot),stats=snapshot?.stats&&Number(snapshot.stats.rows)===rows.length?{...snapshot.stats}:summaryRows(rows);return{id:snapshot?.id||'',createdAt:snapshot?.createdAt||null,fileName:snapshot?.fileName||'',kind:snapshot?.kind||'import',note:snapshot?.note||'',...stats,delta:{added:safeInt(snapshot?.delta?.added),changed:safeInt(snapshot?.delta?.changed),removed:safeInt(snapshot?.delta?.removed),statusChanged:safeInt(snapshot?.delta?.statusChanged)}}}

function normalizeHistory(value){const source=Array.isArray(value)?value:Array.isArray(value?.snapshots)?value.snapshots:[];return source.filter(x=>x&&Array.isArray(x.rows)).map(x=>({version:185,...x,stats:ticketRecoverySummary185(x)})).slice(0,TICKET_RECOVERY_LIMIT_185)}
function readJson(storage,key){try{return JSON.parse(storage?.getItem?.(key)||'null')}catch{return null}}
function legacy184(storage){const old=readJson(storage,TICKET_IMPORT_BACKUP_KEY_184);if(Number(old?.version)!==184||!Array.isArray(old?.rows))return null;return createTicketRecoverySnapshot185(old.rows,{createdAt:old.createdAt,fileName:old.fileName,kind:'legacy-184',note:'Migrováno z OS 184'} )}

export function loadTicketRecoveryHistory185({storage=globalThis.localStorage,migrateLegacy=true}={}){
 if(!storage?.getItem)return{ok:false,reason:'NO_STORAGE',snapshots:[],summaries:[]};
 try{let snapshots=normalizeHistory(readJson(storage,TICKET_RECOVERY_KEY_185));if(!snapshots.length&&migrateLegacy){const legacy=legacy184(storage);if(legacy){snapshots=[legacy];storage.setItem(TICKET_RECOVERY_KEY_185,JSON.stringify({version:185,snapshots}))}}return{ok:true,snapshots,summaries:snapshots.map(ticketRecoverySummary185)}}catch(error){return{ok:false,error,snapshots:[],summaries:[]}}
}

export function saveTicketRecoverySnapshot185(inventory=[],options={}){
 const storage=options.storage??globalThis.localStorage;if(!storage?.setItem)return{ok:false,reason:'NO_STORAGE'};
 try{const current=loadTicketRecoveryHistory185({storage}),snapshot=createTicketRecoverySnapshot185(inventory,options),snapshots=[snapshot,...(current.ok?current.snapshots:[])].filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i).slice(0,TICKET_RECOVERY_LIMIT_185);storage.setItem(TICKET_RECOVERY_KEY_185,JSON.stringify({version:185,snapshots}));return{ok:true,snapshot,snapshots,summary:ticketRecoverySummary185(snapshot)}}catch(error){return{ok:false,error}}
}

export function getTicketRecoverySnapshot185(id,{storage=globalThis.localStorage}={}){const history=loadTicketRecoveryHistory185({storage});if(!history.ok)return{ok:false,reason:history.reason,error:history.error};const snapshot=history.snapshots.find(x=>x.id===id);return snapshot?{ok:true,snapshot,summary:ticketRecoverySummary185(snapshot)}:{ok:false,reason:'NOT_FOUND'}}

export function clearTicketRecoveryHistory185({storage=globalThis.localStorage}={}){if(!storage?.removeItem)return false;try{storage.removeItem(TICKET_RECOVERY_KEY_185);return true}catch{return false}}
