// Canonical ticket view adapter.
// Ticket Desk 331 owns the ticket DOM. Scoped modules add pricing, unified
// multi-source refresh, source/row editing, row repair, market health and manual fallback.

let bootPromise=null;

async function desk(){
  const mod=await import('./ticketDesk331.js');
  if(document.documentElement.dataset.ticketDesk331!=='1'){
    mod.installTicketDesk331();
  }
  const pricing=await import('./ticketPriceIntelligence374.js');
  pricing.installTicketPriceIntelligence374();
  const refresh=await import('./ticketRefresh395.js');
  refresh.installTicketRefresh395();
  const source=await import('./ticketSourceEditor382.js');
  source.installTicketSourceEditor382();
  const rowAuto=await import('./ticketRowAuto396.js');
  rowAuto.installTicketRowAuto396();
  const health=await import('./ticketMarketHealth397.js');
  health.installTicketMarketHealth397();
  const manual=await import('./ticketManualMarket398.js');
  manual.installTicketManualMarket398();
  return window.__KAMIL_TICKET_DESK331__;
}

export function renderTicketPage100(){
  if(!bootPromise)bootPromise=desk().catch(error=>{
    bootPromise=null;
    console.error('[tickets399] canonical desk boot failed',error);
    throw error;
  });
  return bootPromise;
}
