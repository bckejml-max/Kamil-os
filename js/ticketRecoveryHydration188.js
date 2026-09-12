import {syncTicketRecoveryVault186} from './ticketRecoveryCloud186.js';
import {openTicketRecoveryCenter185} from './ticketImport660.js';
import {ownEvent1100} from './runtimeOwnership1100.js';

export const TICKET_RECOVERY_HYDRATION_VERSION_188=189;
const OWNER='tickets.recovery188';
let opening=false,bound=false;
const isActive=()=>!!document.querySelector('#view-tickets.on,#view-tickets.active,[data-view-panel="tickets"].on,[data-view-panel="tickets"].active');

export async function hydrateAndOpenTicketRecovery188(){
 if(opening||!isActive())return false;
 opening=true;
 try{
  let sync=null;
  try{sync=await syncTicketRecoveryVault186()}catch(error){sync={ok:false,error}}
  if(!isActive())return false;
  if(sync?.ok){
   globalThis.dispatchEvent?.(new CustomEvent('ticket-recovery-cloud-synced',{detail:{ok:true,count:sync.snapshots?.length||0,localCount:sync.localCount||0,cloudCount:sync.cloudCount||0,syncedAt:new Date().toISOString()}}));
  }else{
   globalThis.dispatchEvent?.(new CustomEvent('ticket-recovery-cloud-sync-error',{detail:{message:sync?.error?.message||sync?.reason||'Cloud není dostupný'}}));
  }
  if(!isActive())return false;
  return await openTicketRecoveryCenter185();
 }finally{opening=false}
}

export function installTicketRecoveryHydration188(){
 if(!globalThis.document||bound)return;
 bound=true;
 ownEvent1100(OWNER,document,'click',event=>{
  if(!isActive())return;
  const trigger=event.target?.closest?.('[data-ticket-recovery]');
  if(!trigger)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  hydrateAndOpenTicketRecovery188().catch(()=>{});
 },true);
 globalThis.__ticketRecoveryHydration188={version:TICKET_RECOVERY_HYDRATION_VERSION_188,runtimeOwner:OWNER,healthy:true,at:Date.now()};
}
