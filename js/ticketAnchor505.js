const VERSION='505.0.0';
let bound=false;
let timer=0;
let rootObserver=null;
let resizeObserver=null;
let observedCommander=null;

function observeCommander(commander){
  if(observedCommander===commander)return;
  resizeObserver?.disconnect();
  observedCommander=commander||null;
  if(!commander||typeof ResizeObserver!=='function')return;
  resizeObserver=new ResizeObserver(()=>schedule(55));
  resizeObserver.observe(commander);
}

function clear(side,host){
  document.documentElement.dataset.ticketAnchor505='mobile';
  observeCommander(null);
  host?.style.removeProperty('position');
  if(!side)return;
  for(const key of ['position','top','right','left','bottom','width','margin','z-index','transform'])side.style.removeProperty(key);
}

function anchor(){
  const host=document.querySelector('#ticketIntelView .td331');
  if(!host)return false;
  const commander=host.querySelector(':scope > [data-c465]');
  const side=host.querySelector('[data-ticket-side500]');
  if(matchMedia('(max-width:1180px)').matches){
    clear(side,host);
    return true;
  }
  if(!commander||!side)return false;

  document.documentElement.dataset.ticketAnchor505='1';
  side.setAttribute('data-focus459','');
  if(side.parentElement!==host)host.appendChild(side);
  observeCommander(commander);

  // Guarantee a predictable containing block, but still calculate from the real offsetParent.
  host.style.setProperty('position','relative','important');
  side.style.setProperty('position','absolute','important');
  side.style.setProperty('right','auto','important');
  side.style.setProperty('bottom','auto','important');
  side.style.setProperty('margin','0','important');
  side.style.setProperty('transform','none','important');
  side.style.setProperty('z-index','20','important');

  requestAnimationFrame(()=>{
    if(!host.isConnected||!commander.isConnected||!side.isConnected)return;
    const parent=side.offsetParent||host;
    const parentRect=parent.getBoundingClientRect();
    const commanderRect=commander.getBoundingClientRect();
    const top=Math.max(0,Math.round(commanderRect.bottom-parentRect.top+12));
    const left=Math.max(0,Math.round(commanderRect.left-parentRect.left));
    const width=Math.max(300,Math.round(commanderRect.width));

    side.style.setProperty('top',`${top}px`,'important');
    side.style.setProperty('left',`${left}px`,'important');
    side.style.setProperty('width',`${width}px`,'important');
    host.style.setProperty('--td503-side-top',`${top}px`);
    host.style.setProperty('--td503-right-width',`${width}px`);
    host.style.setProperty('--td502-side-offset','0px');

    window.__KAMIL_TICKET_ANCHOR505__={
      version:VERSION,
      healthy:true,
      top,left,width,
      offsetParent:parent.id||parent.className||parent.tagName,
      gap:Math.round(side.getBoundingClientRect().top-commanderRect.bottom),
      at:Date.now()
    };
  });
  return true;
}

function schedule(ms=75){
  clearTimeout(timer);
  timer=setTimeout(()=>{timer=0;anchor()},ms);
}

export function installTicketAnchor505(){
  anchor();
  requestAnimationFrame(()=>anchor());
  setTimeout(()=>anchor(),160);
  setTimeout(()=>anchor(),520);
  setTimeout(()=>anchor(),1400);
  if(bound)return;
  bound=true;

  for(const event of [
    'kamil:view-change','kamil:ticket-desk331-updated','kamil:ticket-boot466-updated',
    'kamil:ticket-commander465-updated','kamil:ticket-risk438-updated','kamil:ticket-refresh397-done'
  ])window.addEventListener(event,()=>schedule());
  window.addEventListener('resize',()=>schedule(100),{passive:true});

  const root=document.querySelector('#ticketIntelView');
  if(root){
    rootObserver=new MutationObserver(()=>schedule(70));
    rootObserver.observe(root,{childList:true,subtree:true});
  }
}
