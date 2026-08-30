// OS430 compatibility shim.
// OS426+ is the only pricing writer. This file intentionally does not touch the
// ticket DOM; it only mirrors the canonical engine into historic globals used by
// older modules.
const VERSION=430;
let bound=false,timer=0,lastSig='';
function mirror(){
  const engine=window.__KAMIL_TICKET_MARKET_ENGINE426__;
  if(!engine?.models)return;
  const sig=engine.models.map(m=>`${m.r?.id}:${m.market}:${m.price}:${m.code}:${m.confidence}`).join('|');
  const compat={version:VERSION,healthy:true,canonical:true,models:engine.models,at:Date.now(),feeEstimatePct:Math.round((engine.fee?.rate??.15)*100)};
  window.__KAMIL_TICKET_PRICE430__=compat;
  window.__KAMIL_TICKET_PRICE380__=compat;
  window.__KAMIL_TICKET_PRICE377__=compat;
  window.__KAMIL_TICKET_PRICE374__=compat;
  document.documentElement.dataset.ticketPrice430='1';
  if(sig!==lastSig){
    lastSig=sig;
    window.dispatchEvent(new CustomEvent('kamil:ticket-price374-updated',{detail:{count:engine.models.length,version:VERSION,canonical:true}}));
  }
}
function schedule(ms=250){clearTimeout(timer);timer=setTimeout(mirror,ms)}
export function installTicketPriceIntelligence374(){
  if(bound)return;bound=true;
  document.documentElement.dataset.ticketPrice374Installed='compat';
  for(const ev of ['kamil:view-change','kamil:ticket-refresh397-done','kamil:ticket-manual398-saved','kamil:ticket-clipboard403-saved','kamil:ticket-source382-saved'])window.addEventListener(ev,()=>schedule(450));
  setInterval(mirror,1500);
  schedule(1800);
}
