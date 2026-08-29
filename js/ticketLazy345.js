let loadPromise=null;
let loaded=false;
let lastError=null;

function expose(){
  window.__KAMIL_TICKET_LAZY345__={
    version:345,
    loaded,
    loading:!!loadPromise&&!loaded,
    error:lastError,
    ensure:ensureTickets,
    at:Date.now()
  };
}

async function ensureTickets(){
  if(loaded)return true;
  if(loadPromise)return loadPromise;
  loadPromise=(async()=>{
    try{
      const desk=await import('./ticketDesk331.js');
      desk.installTicketDesk331?.();
      const qa=await import('./ticketQa332.js');
      qa.installTicketQa332?.();
      loaded=true;
      lastError=null;
      expose();
      return true;
    }catch(error){
      lastError=String(error?.message||error);
      loadPromise=null;
      expose();
      throw error;
    }
  })();
  expose();
  return loadPromise;
}

export function installTicketLazy345(){
  expose();
  const maybe=view=>{
    if(view==='tickets')ensureTickets().catch(error=>console.error('[ticketLazy345]',error));
  };
  window.addEventListener('kamil:view-change',event=>maybe(event.detail));
  if(document.querySelector('#view-tickets')?.classList.contains('on'))maybe('tickets');
}
