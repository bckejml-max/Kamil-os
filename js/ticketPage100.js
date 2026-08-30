// Canonical ticket view adapter.
// Ticket Desk 331 owns the ticket DOM. Scoped modules add pricing, unified
// multi-source refresh, source/row editing, row repair, market health, manual
// fallback, readiness/repair guidance, last-known price memory, clipboard
// market import, the OS407 decision/autopilot layer, OS408 sale workflow,
// OS409 price-history analytics, OS410 action queue, OS411 settlement ledger,
// OS412 payout reconciliation/cashflow, OS413 alert center, OS414 trading performance
// and OS415 capital allocation / concentration risk.

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
  const soldGuard=await import('./ticketSoldGuard408.js');
  soldGuard.installTicketSoldGuard408();
  const history=await import('./ticketPriceHistory409.js');
  history.installTicketPriceHistory409();
  const actions=await import('./ticketActionQueue410.js');
  actions.installTicketActionQueue410();
  const settlement=await import('./ticketSettlement411.js');
  settlement.installTicketSettlement411();
  const reconcile=await import('./ticketReconcile412.js');
  reconcile.installTicketReconcile412();
  const alerts=await import('./ticketAlerts413.js');
  alerts.installTicketAlerts413();
  const performance=await import('./ticketPerformance414.js');
  performance.installTicketPerformance414();
  const capital=await import('./ticketCapital415.js');
  capital.installTicketCapital415();
  return window.__KAMIL_TICKET_DESK331__;
}

export function renderTicketPage100(){
  if(!bootPromise)bootPromise=desk().catch(error=>{
    bootPromise=null;
    console.error('[tickets415] canonical desk boot failed',error);
    throw error;
  });
  return bootPromise;
}
