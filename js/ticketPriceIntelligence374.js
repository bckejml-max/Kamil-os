// OS430 compatibility shim.
// The old Ticket Price Intelligence renderer used to write directly into the
// ticket cards. OS426+ owns all canonical pricing decisions now, so this module
// only preserves the historic public globals/events expected by older modules.
const VERSION=430;
let bound=false;

function mirror(){
  const engine=window.__KAMIL_TICKET_MARKET_ENGINE426__;
  if(!engine?.models)return;
  const compat={version:VERSION,healthy:true,canonical:true,models:engine.models,at:Date.now(),feeEstimatePct:engine.feePct??15};
  window.__KAMIL_TICKET_PRICE430__=compat;
  window.__KAMIL_TICKET_PRICE380__=compat;
  window.__KAMIL_TICKET_PRICE377__=compat;
  window.__KAMIL_TICKET_PRICE374__=compat;
  document.documentElement.dataset.ticketPrice430='1';
  window.dispatchEvent(new CustomEvent('kamil:ticket-price374-updated',{detail:{count:engine.models.length,version:VERSION,canonical:true}}));
}

export function installTicketPriceIntelligence374(){
  if(bound)return;
  bound=true;
  document.documentElement.dataset.ticketPrice374Installed='compat';
  window.addEventListener('kamil:ticket-engine426-updated',mirror);
  window.addEventListener('kamil:view-change',e=>{if(e.detail==='tickets')setTimeout(mirror,300)});
  setTimeout(mirror,1800);
}
