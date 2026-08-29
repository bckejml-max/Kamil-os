// Canonical ticket view adapter.
// Ticket Desk 331 owns the ticket DOM. OS374 adds one scoped price layer
// after the canonical desk is installed; it does not replace the desk DOM.

let bootPromise=null;

async function desk(){
  const mod=await import('./ticketDesk331.js');
  if(document.documentElement.dataset.ticketDesk331!=='1'){
    mod.installTicketDesk331();
  }
  const pricing=await import('./ticketPriceIntelligence374.js');
  pricing.installTicketPriceIntelligence374();
  return window.__KAMIL_TICKET_DESK331__;
}

export function renderTicketPage100(){
  if(!bootPromise)bootPromise=desk().catch(error=>{
    bootPromise=null;
    console.error('[tickets374] canonical desk boot failed',error);
    throw error;
  });
  return bootPromise;
}
