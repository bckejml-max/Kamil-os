// Canonical ticket view adapter.
// Ticket Desk 331 owns the ticket DOM. Scoped modules add pricing, reliable
// refresh and full source/row editing without replacing the canonical desk.

let bootPromise=null;

async function desk(){
  const mod=await import('./ticketDesk331.js');
  if(document.documentElement.dataset.ticketDesk331!=='1'){
    mod.installTicketDesk331();
  }
  const pricing=await import('./ticketPriceIntelligence374.js');
  pricing.installTicketPriceIntelligence374();
  const refresh=await import('./ticketRefreshFix375.js');
  refresh.installTicketRefreshFix375();
  const source=await import('./ticketSourceEditor382.js');
  source.installTicketSourceEditor382();
  return window.__KAMIL_TICKET_DESK331__;
}

export function renderTicketPage100(){
  if(!bootPromise)bootPromise=desk().catch(error=>{
    bootPromise=null;
    console.error('[tickets382] canonical desk boot failed',error);
    throw error;
  });
  return bootPromise;
}
