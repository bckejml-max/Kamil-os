// Canonical ticket view adapter.
// Ticket Desk 331 owns the ticket DOM. Scoped modules add pricing, unified
// multi-source refresh, source/row editing, row repair, market health, manual
// fallback, readiness/repair guidance, last-known price memory, clipboard
// market import, the OS407 decision/autopilot layer and OS408 partial-sale sync.

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
  const readiness=await import('./ticketReadiness400.js');
  readiness.installTicketReadiness400();
  const memory=await import('./ticketPriceMemory402.js');
  memory.installTicketPriceMemory402();
  const clipboard=await import('./ticketClipboardMarket403.js');
  clipboard.installTicketClipboardMarket403();
  const autopilot=await import('./ticketAutopilot407.js');
  autopilot.installTicketAutopilot407();
  const saleSync=await import('./ticketSaleSync408.js');
  saleSync.installTicketSaleSync408();
  return window.__KAMIL_TICKET_DESK331__;
}

export function renderTicketPage100(){
  if(!bootPromise)bootPromise=desk().catch(error=>{
    bootPromise=null;
    console.error('[tickets408] canonical desk boot failed',error);
    throw error;
  });
  return bootPromise;
}
