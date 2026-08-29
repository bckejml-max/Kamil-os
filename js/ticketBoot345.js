let loadPromise=null;
let loaded=false;
let error=null;

function expose(extra={}){
 window.__KAMIL_TICKET_BOOT345__={version:345,loaded,loading:!!loadPromise&&!loaded,error:error?String(error?.message||error):null,ensure:ensureTickets,at:Date.now(),...extra};
 return window.__KAMIL_TICKET_BOOT345__;
}

async function ensureTickets(){
 if(loaded)return expose();
 if(loadPromise)return loadPromise;
 const started=performance.now();
 loadPromise=(async()=>{
  try{
   const desk=await import('./ticketDesk331.js');
   desk.installTicketDesk331?.();
   const qa=await import('./ticketQa332.js');
   qa.installTicketQa332?.();
   loaded=true;error=null;
   return expose({loadMs:Math.round((performance.now()-started)*10)/10});
  }catch(err){
   error=err;expose({loadMs:Math.round((performance.now()-started)*10)/10});
   console.error('[ticketBoot345]',err);
   throw err;
  }finally{loadPromise=null}
 })();
 expose();
 return loadPromise;
}

export function installTicketBoot345(){
 if(document.documentElement.dataset.ticketBoot345==='1')return expose();
 document.documentElement.dataset.ticketBoot345='1';
 window.addEventListener('kamil:view-change',e=>{if(String(e.detail)==='tickets')ensureTickets().catch(()=>{})});
 expose();
 if(document.querySelector('#view-tickets')?.classList.contains('on'))ensureTickets().catch(()=>{});
 return window.__KAMIL_TICKET_BOOT345__;
}
