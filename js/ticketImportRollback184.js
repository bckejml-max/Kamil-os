export const TICKET_IMPORT_BACKUP_KEY_184='kamil_os_ticket_import_backup_v184';

const cloneRows=rows=>JSON.parse(JSON.stringify(Array.isArray(rows)?rows:[]));
const statusOf=x=>x?.market_status||x?.marketStatus||'';
const CLOSED=new Set(['SOLD_UNDELIVERED','SOLD_WAITING_PAYMENT','PAYOUT_RECEIVED','PAID']);

export function createTicketImportBackup184(inventory=[],{fileName='',createdAt=new Date().toISOString()}={}){
 const rows=cloneRows(inventory);
 return{version:184,createdAt,fileName:String(fileName||''),rows};
}

export function ticketImportBackupSummary184(backup){
 const rows=Array.isArray(backup?.rows)?backup.rows:[];
 let qty=0,active=0,closed=0;
 for(const row of rows){qty+=Number(row?.qty||0);if(CLOSED.has(statusOf(row)))closed++;else active++}
 return{rows:rows.length,qty,active,closed,createdAt:backup?.createdAt||null,fileName:backup?.fileName||''};
}

export function saveTicketImportBackup184(inventory=[],options={}){
 const storage=options.storage??globalThis.localStorage;
 if(!storage?.setItem)return{ok:false,reason:'NO_STORAGE'};
 try{const backup=createTicketImportBackup184(inventory,options);storage.setItem(TICKET_IMPORT_BACKUP_KEY_184,JSON.stringify(backup));return{ok:true,backup,summary:ticketImportBackupSummary184(backup)}}catch(error){return{ok:false,error}}
}

export function loadTicketImportBackup184({storage=globalThis.localStorage}={}){
 if(!storage?.getItem)return{ok:false,reason:'NO_STORAGE'};
 try{const raw=storage.getItem(TICKET_IMPORT_BACKUP_KEY_184);if(!raw)return{ok:false,reason:'EMPTY'};const backup=JSON.parse(raw);if(Number(backup?.version)!==184||!Array.isArray(backup?.rows))return{ok:false,reason:'INVALID'};return{ok:true,backup,summary:ticketImportBackupSummary184(backup)}}catch(error){return{ok:false,error}}
}

export function clearTicketImportBackup184({storage=globalThis.localStorage}={}){
 if(!storage?.removeItem)return false;
 try{storage.removeItem(TICKET_IMPORT_BACKUP_KEY_184);return true}catch{return false}
}
