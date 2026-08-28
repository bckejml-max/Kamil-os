// Canonical ticket view adapter.
// OS338: the previous implementation mounted the legacy Ticket Page 687 plus
// ~30 asynchronous enhancers and a MutationObserver into #ticketIntelView.
// Ticket Desk 331 is also mounted by the modern shell, so both renderers were
// repeatedly replacing the same DOM and caused visible flicker.
// Keep one owner of the ticket DOM: Ticket Desk 331.

let bootPromise=null;

async function desk(){
  const mod=await import('./ticketDesk331.js');
  if(document.documentElement.dataset.ticketDesk331!=='1'){
    mod.installTicketDesk331();
  }
  return window.__KAMIL_TICKET_DESK331__;
}

export function renderTicketPage100(){
  // Ticket Desk 331 owns its view-change scheduling. Do not call refresh here:
  // doing so would race the desk's own view-change listener and produce two
  // overlapping cloud loads / DOM replacements on every navigation.
  if(!bootPromise)bootPromise=desk().catch(error=>{
    bootPromise=null;
    console.error('[tickets338] canonical desk boot failed',error);
    throw error;
  });
  return bootPromise;
}
