const VERSION='504.1.0';
let bound=false;
let timer=0;
let rootObserver=null;
let resizeObserver=null;
let observedCommander=null;

function money(text){
  const normalized=String(text||'').replace(/[\u00a0\u202f\s]/g,'');
  const match=normalized.match(/([0-9][0-9.,]*)Kč/i);
  if(!match)return 0;
  return Number(match[1].replace(/\./g,'').replace(',','.'))||0;
}

function fixCapital(host){
  const overview=host?.querySelector(':scope > .td331-overview');
  if(!overview)return false;
  const card=overview.querySelector('[data-kpi-risk466]')||overview.querySelector('.td331-stat:nth-child(5)');
  if(!card)return false;

  const modeled=Number(window.__KAMIL_TICKET_RISK438__?.var95||0);
  const investedCard=overview.querySelector('.td331-stat:nth-child(2)');
  const fallback=money(investedCard?.querySelector('small')?.textContent||'');
  const value=modeled||fallback;
  const spans=[...card.querySelectorAll(':scope > span')];
  const label=spans.find(s=>!s.classList.contains('td500-kpi-icon')&&!s.classList.contains('ticket-kpi-compat500'))
    ||spans.find(s=>!s.classList.contains('td500-kpi-icon'));
  const desiredLabel=modeled?'Capital at Risk':'Vložený kapitál';
  const desiredSmall=modeled?'heuristický downside proxy':'aktivně vložený kapitál';
  const b=card.querySelector(':scope > b');
  const small=card.querySelector(':scope > small');

  if(label&&label.textContent!==desiredLabel)label.textContent=desiredLabel;
  if(value&&b){
    const desiredValue=`${Math.round(value).toLocaleString('cs-CZ')} Kč`;
    if(b.textContent!==desiredValue)b.textContent=desiredValue;
  }
  if(small&&small.textContent!==desiredSmall)small.textContent=desiredSmall;
  return true;
}

function clearRail(side){
  if(!side)return;
  for(const key of ['position','top','right','left','width','margin','z-index','transform'])side.style.removeProperty(key);
}

function observeCommander(commander){
  if(observedCommander===commander)return;
  resizeObserver?.disconnect();
  observedCommander=commander||null;
  if(!commander||typeof ResizeObserver!=='function')return;
  resizeObserver=new ResizeObserver(()=>schedule(25));
  resizeObserver.observe(commander);
}

function stabilize(){
  const host=document.querySelector('#ticketIntelView .td331');
  if(!host)return false;
  fixCapital(host);

  // OS505 owns the rail geometry. Keep this layer alive only for KPI normalization.
  if(document.documentElement.dataset.ticketAnchor505==='1')return true;

  const side=host.querySelector('[data-ticket-side500]');
  if(matchMedia('(max-width:1180px)').matches){
    document.documentElement.dataset.ticketStability504='mobile';
    clearRail(side);
    observeCommander(null);
    return true;
  }

  const overview=host.querySelector(':scope > .td331-overview');
  const commander=host.querySelector(':scope > [data-c465]');
  if(!overview||!commander||!side)return false;
  if(side.parentElement!==host)host.appendChild(side);
  side.setAttribute('data-focus459','');
  observeCommander(commander);

  const hostRect=host.getBoundingClientRect();
  const overviewRect=overview.getBoundingClientRect();
  const commanderRect=commander.getBoundingClientRect();
  const overviewTop=Math.max(0,Math.round(overviewRect.top-hostRect.top));
  const commanderHeight=Math.max(0,Math.round(commanderRect.height));
  const width=Math.max(300,Math.round(commanderRect.width||360));
  const top=overviewTop+commanderHeight+12;

  side.style.setProperty('position','absolute','important');
  side.style.setProperty('top',`${top}px`,'important');
  side.style.setProperty('right','0','important');
  side.style.setProperty('width',`${width}px`,'important');
  side.style.setProperty('margin','0','important');
  side.style.setProperty('z-index','20','important');
  host.style.setProperty('--td503-side-top',`${top}px`);
  host.style.setProperty('--td503-right-width',`${width}px`);
  host.style.setProperty('--td502-side-offset','0px');
  document.documentElement.dataset.ticketRail503='1';
  document.documentElement.dataset.ticketStability504='1';

  window.__KAMIL_TICKET_STABILITY504__={
    version:VERSION,healthy:true,railTop:top,rightWidth:width,commanderHeight,overviewTop,at:Date.now()
  };
  return true;
}

function schedule(ms=60){
  clearTimeout(timer);
  timer=setTimeout(()=>{timer=0;stabilize()},ms);
}

export function installTicketStability504(){
  stabilize();
  requestAnimationFrame(()=>stabilize());
  setTimeout(()=>stabilize(),180);
  setTimeout(()=>stabilize(),650);
  setTimeout(()=>stabilize(),1600);
  if(bound)return;
  bound=true;

  for(const event of [
    'kamil:view-change','kamil:ticket-desk331-updated','kamil:ticket-boot466-updated',
    'kamil:ticket-commander465-updated','kamil:ticket-risk438-updated','kamil:ticket-refresh397-done'
  ])window.addEventListener(event,()=>schedule());
  window.addEventListener('resize',()=>schedule(80),{passive:true});

  const root=document.querySelector('#ticketIntelView');
  if(root){
    rootObserver=new MutationObserver(()=>schedule(30));
    rootObserver.observe(root,{childList:true,subtree:true,characterData:true});
  }
}
