export const TICKET_RECOVERY_UX_VERSION_187=187;
export const TICKET_RECOVERY_SYNC_STATE_KEY_187='kamil_os_ticket_recovery_sync_state_v187';

const now=()=>new Date().toISOString();
const num=x=>Math.max(0,Number(x||0)||0);

export function recoverySyncState187(detail={}){
 return{version:187,ok:detail.ok!==false,status:detail.ok===false?'local':'synced',count:num(detail.count),localCount:num(detail.localCount),cloudCount:num(detail.cloudCount),syncedAt:detail.syncedAt||now(),message:String(detail.message||'')};
}

export function recoverySyncLabel187(state){
 if(!state)return'☁ CLOUD · čekám na synchronizaci';
 if(state.status==='synced')return`☁ CLOUD SYNCED · ${num(state.cloudCount)} cloud / ${num(state.localCount)} lokálně`;
 return'◌ LOCAL FALLBACK · cloud teď není dostupný';
}

function readState(){try{return JSON.parse(sessionStorage.getItem(TICKET_RECOVERY_SYNC_STATE_KEY_187)||'null')}catch{return null}}
function writeState(state){try{sessionStorage.setItem(TICKET_RECOVERY_SYNC_STATE_KEY_187,JSON.stringify(state))}catch{}return state}

function recoveryHosts(){return[...document.querySelectorAll('[role="dialog"],dialog,.modal,.sheet,.drawer,form')].filter(el=>/Recovery Center|Vrátit poslední import|Vrátit import/i.test(el.textContent||''));}
function inject(host,state){
 let box=host.querySelector('[data-recovery-cloud-status-187]');if(!box){box=document.createElement('div');box.setAttribute('data-recovery-cloud-status-187','1');box.className='card';const target=host.querySelector('.card,form')||host.firstElementChild||host;target.parentNode?.insertBefore(box,target)}
 const label=recoverySyncLabel187(state),stamp=state?.syncedAt?new Date(state.syncedAt).toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit'}):'';
 box.innerHTML=`<div class="eyebrow">OS 187 · CLOUD VAULT</div><div class="row"><span>Recovery body</span><b>${label}</b></div>${stamp?`<p class="muted">Poslední kontrola ${stamp}. Recovery Center používá cloud i lokální zálohu.</p>`:'<p class="muted">Kontroluji cloud; lokální recovery body jsou mezitím bezpečně dostupné.</p>'}`;
}
function paint(){const state=readState();for(const host of recoveryHosts())inject(host,state)}

export function installTicketRecoveryUx187(){
 if(!globalThis.document||globalThis.__ticketRecoveryUx187)return;globalThis.__ticketRecoveryUx187=true;
 addEventListener('ticket-recovery-cloud-synced',e=>{writeState(recoverySyncState187({ok:true,...(e.detail||{}),syncedAt:now()}));paint()});
 addEventListener('ticket-recovery-cloud-saved',e=>{const prev=readState()||{};writeState(recoverySyncState187({ok:true,...prev,count:num(prev.count)||1,syncedAt:now()}));paint()});
 addEventListener('ticket-recovery-cloud-sync-error',e=>{writeState(recoverySyncState187({ok:false,message:e.detail?.message||'',syncedAt:now()}));paint()});
 new MutationObserver(paint).observe(document.body,{childList:true,subtree:true});
 paint();
}
