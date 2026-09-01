const VERSION='503.0.0';
let bound=false;
let timer=0;

function clearRail(host,side){
  document.documentElement.dataset.ticketRail503='mobile';
  host?.style.removeProperty('--td503-side-top');
  host?.style.removeProperty('--td503-right-width');
  if(side){
    side.style.removeProperty('position');
    side.style.removeProperty('top');
    side.style.removeProperty('right');
    side.style.removeProperty('width');
    side.style.removeProperty('margin');
    side.style.removeProperty('z-index');
  }
}

function placeRail(){
  const host=document.querySelector('#ticketIntelView .td331');
  if(!host)return false;
  const side=host.querySelector('[data-ticket-side500]');
  if(matchMedia('(max-width:1180px)').matches){
    clearRail(host,side);
    return true;
  }

  const commander=host.querySelector('[data-c465]');
  if(!commander||!side)return false;

  // Keep the OS500 insight panel as a top-level canonical child so UI421 never buries it in diagnostics.
  if(side.parentElement!==host)host.appendChild(side);
  side.setAttribute('data-focus459','');

  const hostRect=host.getBoundingClientRect();
  const commanderRect=commander.getBoundingClientRect();
  const top=Math.max(0,Math.round(commanderRect.bottom-hostRect.top+12));
  const width=Math.max(300,Math.round(commanderRect.width||360));

  host.style.setProperty('--td503-side-top',`${top}px`);
  host.style.setProperty('--td503-right-width',`${width}px`);
  document.documentElement.dataset.ticketRail503='1';

  window.__KAMIL_TICKET_RAIL503__={
    version:VERSION,
    healthy:true,
    sideTop:top,
    rightWidth:width,
    at:Date.now()
  };
  return true;
}

function schedule(ms=80){
  clearTimeout(timer);
  timer=setTimeout(()=>{timer=0;placeRail()},ms);
}

export function installTicketRail503(){
  placeRail();
  if(bound)return;
  bound=true;
  for(const event of [
    'kamil:view-change','kamil:ticket-desk331-updated','kamil:ticket-boot466-updated',
    'kamil:ticket-commander465-updated','kamil:ticket-risk438-updated','kamil:ticket-refresh397-done'
  ])window.addEventListener(event,()=>schedule());
  window.addEventListener('resize',()=>schedule(120),{passive:true});
  const root=document.querySelector('#ticketIntelView');
  if(root)new MutationObserver(()=>schedule(90)).observe(root,{childList:true,subtree:true});
}
