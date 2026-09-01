const VERSION='502.0.0';
let bound=false;
let timer=0;

function money(text){
  const normalized=String(text||'').replace(/[\u00a0\u202f\s]/g,'');
  const m=normalized.match(/([0-9][0-9.,]*)Kč/i);
  if(!m)return 0;
  return Number(m[1].replace(/\./g,'').replace(',','.'))||0;
}

function relTop(el,root){
  if(!el||!root)return 0;
  const a=el.getBoundingClientRect();
  const b=root.getBoundingClientRect();
  return Math.max(0,Math.round(a.top-b.top));
}

function setCapitalLabel(host){
  const card=host.querySelector(':scope > .td331-overview [data-kpi-risk466]');
  if(!card)return;
  const modeled=Number(window.__KAMIL_TICKET_RISK438__?.var95||0);
  const investedCard=host.querySelector(':scope > .td331-overview .td331-stat:nth-child(2)');
  const fallback=money(investedCard?.querySelector('small')?.textContent||'');
  const label=card.querySelector('span:not(.td500-kpi-icon):not(.ticket-kpi-compat500)');
  const value=modeled||fallback;
  if(label)label.textContent=modeled?'Capital at Risk':'Vložený kapitál';
  if(value){
    const b=card.querySelector('b');
    const small=card.querySelector('small');
    if(b)b.textContent=`${Math.round(value).toLocaleString('cs-CZ')} Kč`;
    if(small)small.textContent=modeled?'heuristický downside proxy':'aktivně vložený kapitál';
  }
}

function layout(){
  const host=document.querySelector('#ticketIntelView .td331');
  if(!host)return false;
  if(matchMedia('(max-width:1180px)').matches){
    document.documentElement.dataset.ticketLayout502='mobile';
    host.style.removeProperty('--td502-commander-top');
    host.style.removeProperty('--td502-right-width');
    host.style.removeProperty('--td502-side-offset');
    setCapitalLabel(host);
    return true;
  }

  const overview=host.querySelector(':scope > .td331-overview');
  const commander=host.querySelector(':scope > [data-c465]');
  const side=host.querySelector(':scope > [data-ticket-side500]');
  if(!overview||!commander)return false;

  // Capture the current right-column width before absolute positioning changes flow.
  const width=Math.max(300,Math.round(commander.getBoundingClientRect().width||360));
  const top=relTop(overview,host);
  host.style.setProperty('--td502-right-width',`${width}px`);
  host.style.setProperty('--td502-commander-top',`${top}px`);
  host.style.setProperty('--td502-side-offset','0px');
  document.documentElement.dataset.ticketLayout502='1';
  setCapitalLabel(host);

  requestAnimationFrame(()=>{
    if(!host.isConnected||!commander.isConnected)return;
    const commanderBottom=top+commander.getBoundingClientRect().height;
    if(side?.isConnected){
      const sideTop=relTop(side,host);
      const offset=Math.max(0,Math.ceil(commanderBottom+12-sideTop));
      host.style.setProperty('--td502-side-offset',`${offset}px`);
    }
    window.__KAMIL_TICKET_LAYOUT502__={
      version:VERSION,healthy:true,commanderTop:top,rightWidth:width,
      sideOffset:Number.parseInt(host.style.getPropertyValue('--td502-side-offset'))||0,
      at:Date.now()
    };
  });
  return true;
}

function schedule(ms=90){
  clearTimeout(timer);
  timer=setTimeout(()=>{timer=0;layout()},ms);
}

export function installTicketLayout502(){
  layout();
  if(bound)return;
  bound=true;
  for(const event of [
    'kamil:view-change','kamil:ticket-desk331-updated','kamil:ticket-boot466-updated',
    'kamil:ticket-commander465-updated','kamil:ticket-risk438-updated','kamil:ticket-refresh397-done'
  ])window.addEventListener(event,()=>schedule());
  window.addEventListener('resize',()=>schedule(120),{passive:true});
  const root=document.querySelector('#ticketIntelView');
  if(root)new MutationObserver(()=>schedule(80)).observe(root,{childList:true,subtree:true});
}
