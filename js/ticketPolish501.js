const VERSION='501.0.0';
let bound=false;
let timer=0;

function parseCzk(text){
  const normalized=String(text||'').replace(/[\u00a0\u202f\s]/g,'');
  const match=normalized.match(/([0-9][0-9.,]*)Kč/i);
  if(!match)return 0;
  const numeric=match[1].replace(/\./g,'').replace(',','.');
  return Number(numeric)||0;
}

function fallbackCapital(host){
  const bought=host.querySelector(':scope > .td331-overview .td331-stat:nth-child(2)');
  return parseCzk(bought?.querySelector('small')?.textContent||'');
}

function polishRisk(host){
  const card=host.querySelector(':scope > .td331-overview [data-kpi-risk466]');
  if(!card)return;
  const modeled=Number(window.__KAMIL_TICKET_RISK438__?.var95||0);
  const fallback=fallbackCapital(host);
  const value=modeled||fallback;
  if(!value)return;
  const b=card.querySelector('b');
  const small=card.querySelector('small');
  if(b)b.textContent=`${Math.round(value).toLocaleString('cs-CZ')} Kč`;
  if(small)small.textContent=modeled?'heuristický downside proxy':'aktivně vložený kapitál';
}

function polish(){
  document.documentElement.dataset.ticketPolish501='1';
  const host=document.querySelector('#ticketIntelView .td331');
  if(!host)return false;
  polishRisk(host);
  host.querySelectorAll('.td500-event-thumb').forEach(el=>{
    if(!el.title){
      const row=el.closest('[data-ticket-id]');
      const name=row?.querySelector('h3')?.textContent?.trim();
      if(name)el.title=name;
    }
  });
  window.__KAMIL_TICKET_POLISH501__={version:VERSION,healthy:true,at:Date.now()};
  return true;
}

function schedule(ms=160){
  clearTimeout(timer);
  timer=setTimeout(()=>{timer=0;polish()},ms);
}

export function installTicketPolish501(){
  polish();
  if(bound)return;
  bound=true;
  const events=[
    'kamil:view-change','kamil:ticket-desk331-updated','kamil:ticket-boot466-updated',
    'kamil:ticket-risk438-updated','kamil:ticket-commander465-updated','kamil:ticket-refresh397-done'
  ];
  for(const event of events)window.addEventListener(event,()=>schedule());
  const root=document.querySelector('#ticketIntelView');
  if(root)new MutationObserver(()=>schedule(120)).observe(root,{childList:true,subtree:true});
}
