// OS338: TicketDesk331 is the single owner of #ticketIntelView.
// The legacy ticketPage100 stack remains only as a fallback for environments
// where the modern desk has not been installed yet.
let fallbackPromise=null;

export function renderTicketPage338(){
  const host=document.querySelector('#ticketIntelView');
  const desk=window.__KAMIL_TICKET_DESK331__;

  if(desk?.refresh){
    // TicketDesk331 already listens to the canonical view-change/click events.
    // Do not call refresh here: doing so would race with its scheduled render and
    // reintroduce the visible "Načítám…" flash.
    if(!host?.querySelector('.td331')){
      // Keep the quick shell until the desk's own coalesced scheduler paints it.
      host?.setAttribute('data-ticket-render-owner','ticketDesk331');
    }
    return;
  }

  // Safe fallback for an older/partial boot only. Never run this in parallel
  // with TicketDesk331.
  if(!fallbackPromise)fallbackPromise=import('./ticketPage100.js').catch(error=>{
    fallbackPromise=null;
    throw error;
  });
  fallbackPromise.then(m=>m.renderTicketPage100()).catch(error=>console.warn('[ticketPage338 fallback]',error));
}
