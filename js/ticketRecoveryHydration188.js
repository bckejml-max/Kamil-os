import {syncTicketRecoveryVault186} from './ticketRecoveryCloud186.js';
import {openTicketRecoveryCenter185} from './ticketImport660.js';

export const TICKET_RECOVERY_HYDRATION_VERSION_188=188;
let opening=false;

export async function hydrateAndOpenTicketRecovery188(){
 if(opening)return false;
 opening=true;
 try{
  let sync=null;
  try{sync=await syncTicketRecoveryVault186()}catch(error){sync={ok:false,error}}
  if(sync?.ok){
   globalThis.dispatchEvent?.(new CustomEvent('ticket-recovery-cloud-synced',{detail:{ok:true,count:sync.snapshots?.length||0,localCount:sync.localCount||0,cloudCount:sync.cloudCount||0,syncedAt:new Date().toISOString()}}));
  }else{
   globalThis.dispatchEvent?.(new CustomEvent('ticket-recovery-cloud-sync-error',{detail:{message:sync?.error?.message||sync?.reason||'Cloud není dostupný'}}));
  }
  return await openTicketRecoveryCenter185();
 }finally{opening=false}
}

export function installTicketRecoveryHydration188(){
 if(!globalThis.document||globalThis.__ticketRecoveryHydration188)return;
 globalThis.__ticketRecoveryHydration188=true;
 document.addEventListener('click',event=>{
  const trigger=event.target?.closest?.('[data-ticket-recovery]');
  if(!trigger)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  hydrateAndOpenTicketRecovery188().catch(()=>{});
 },true);
}
