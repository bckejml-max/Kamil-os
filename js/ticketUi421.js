const VERSION='466.0.4';
let bound=false,timer=0,lastNudge=0;

function ensureCss(){
  if(document.querySelector('style[data-ticket-ui421]'))return;
  const s=document.createElement('style');
  s.dataset.ticketUi421='1';
  s.textContent=`
#ticketIntelView .td331{gap:8px!important}
#ticketIntelView .td331-hero{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;grid-template-rows:auto auto auto!important;gap:3px 18px!important;align-items:center!important;padding:14px 16px!important}
#ticketIntelView .td331-hero>.td331-kicker{grid-column:1!important;grid-row:1!important}
#ticketIntelView .td331-hero>h1{grid-column:1!important;grid-row:2!important;margin:3px 0!important;font-size:22px!important}
#ticketIntelView .td331-hero>p{grid-column:1!important;grid-row:3!important;margin:0!important;font-size:10px!important}
#ticketIntelView .td331-hero>.td331-toolbar{grid-column:2!important;grid-row:1/4!important;align-self:center!important}
#ticketIntelView [data-ticket-hub421]{display:none!important}
#ticketIntelView [data-c454],#ticketIntelView [data-inbox460]{display:none!important}
#ticketIntelView .analytics466{margin-top:8px;border:1px solid #294657;border-radius:10px;background:#081720;color:#dce9f2;overflow:hidden}
#ticketIntelView .analytics466-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 10px;cursor:pointer}
#ticketIntelView .analytics466-head span{font-size:8px;font-weight:900;letter-spacing:.07em;text-transform:uppercase;color:#7898ad}
#ticketIntelView .analytics466-head b{font-size:10px}
#ticketIntelView .analytics466-body{display:none;padding:8px;border-top:1px solid #203744}
#ticketIntelView .analytics466.open .analytics466-body{display:grid;gap:7px}
#ticketIntelView .analytics466-body>*{margin:0!important}
#ticketIntelView .bridge466-system{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 10px;margin:0 0 6px;border:1px solid #294657;border-radius:9px;background:#091923;color:#dce9f2}
#ticketIntelView .bridge466-system span{font-size:8px;font-weight:900;color:#7898ad;text-transform:uppercase;letter-spacing:.06em}
#ticketIntelView .bridge466-system b{font-size:10px}
#ticketIntelView .bridge466-ok{color:#8bd8ad}.bridge466-warn{color:#efc17c}.bridge466-bad{color:#ff9aa5}
#ticketIntelView .bridge466-btn{border:1px solid #35566b;border-radius:7px;background:#102735;color:#cce0ec;padding:5px 8px;font-size:8px;font-weight:900;cursor:pointer}
#ticketIntelView .td331-overview{grid-template-columns:repeat(5,minmax(0,1fr))!important}
@media(max-width:1100px){#ticketIntelView .td331-overview{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
@media(max-width:760px){#ticketIntelView .td331-hero{grid-template-columns:1fr!important}.td331-hero>.td331-toolbar{grid-column:1!important;grid-row:4!important;justify-content:flex-start!important;margin-top:7px!important}#ticketIntelView .td331-overview{grid-template-columns:1fr 1fr!important}}
`;
  document.head.appendChild(s);
}

function firstDirect(hero,selector,tag,className){
  const list=[...hero.querySelectorAll(`:scope > ${selector}`)];
  let el=list.shift();
  if(!el){
    el=document.createElement(tag);
    if(className)el.className=className;
    const toolbar=hero.querySelector(':scope > .td331-toolbar');
    hero.insertBefore(el,toolbar||null);
  }
  for(const extra of list)extra.remove();
  return el;
}

function normalizeHero(host){
  const hero=host.querySelector(':scope > .td331-hero');
  if(!hero)return;
  for(const n of [...hero.childNodes])if(n.nodeType===3&&String(n.textContent||'').trim())n.remove();
  const kicker=firstDirect(hero,'.td331-kicker','div','td331-kicker');
  const h1=firstDirect(hero,'h1','h1','');
  const p=firstDirect(hero,'p','p','');
  kicker.textContent='Kamil OS · Ticket Portfolio';
  h1.textContent='Ticket Trading Desk';
  p.textContent='Co udělat, kdy to udělat a jak chránit kapitál. Detailní modely jsou schované v analytice.';
  hero.dataset.canonicalHero466='1';
}

function ensureDrawer(host){
  let drawer=host.querySelector(':scope > [data-analytics466]');
  if(drawer)return drawer;
  drawer=document.createElement('section');
  drawer.dataset.analytics466='1';
  drawer.className='analytics466';
  let open=false;
  try{open=localStorage.getItem('kamil.ticket.analytics466')==='1'}catch{}
  if(open)drawer.classList.add('open');
  drawer.innerHTML=`<div class="analytics466-head"><div><span>ANALYTIKA & DIAGNOSTIKA</span><b>Market, risk, kalibrace a technické detaily</b></div><button type="button" class="bridge466-btn" data-a466-toggle>${open?'Skrýt':'Otevřít'}</button></div><div class="analytics466-body" data-analytics466-body></div>`;
  const toggle=()=>{
    drawer.classList.toggle('open');
    const on=drawer.classList.contains('open');
    drawer.querySelector('[data-a466-toggle]').textContent=on?'Skrýt':'Otevřít';
    try{localStorage.setItem('kamil.ticket.analytics466',on?'1':'0')}catch{}
  };
  drawer.querySelector('[data-a466-toggle]')?.addEventListener('click',e=>{e.stopPropagation();toggle()});
  drawer.querySelector('.analytics466-head')?.addEventListener('click',toggle);
  host.appendChild(drawer);
  return drawer;
}

function isPortfolioSection(el){
  return el.matches('.td331-section')&&(el.hasAttribute('data-td-pane')||!!el.querySelector('[data-inventory-card],[data-sold-card]'));
}

function isCore(el,drawer){
  if(el===drawer)return true;
  if(el.matches('.td331-hero,[data-c465],[data-system466],.bridge466-system,.td331-overview,.td331-modes,[data-focus459]'))return true;
  if(isPortfolioSection(el))return true;
  return false;
}

function moveLegacyHub(host,drawer){
  const body=drawer.querySelector('[data-analytics466-body]');
  const hub=host.querySelector('[data-ticket-hub421]');
  if(!hub||drawer.contains(hub))return;
  const oldBody=hub.querySelector('[data-hub421-body]');
  if(oldBody)for(const child of [...oldBody.children])body.appendChild(child);
  hub.remove();
}

function moveDiagnostics(host,drawer){
  moveLegacyHub(host,drawer);
  const body=drawer.querySelector('[data-analytics466-body]');
  for(const el of [...host.children]){
    if(isCore(el,drawer))continue;
    body.appendChild(el);
  }
  return body.children.length;
}

function bootInfo(){
  const b=window.__KAMIL_TICKET_BOOT466__||{};
  const mods=Array.isArray(b.modules)?b.modules:[];
  const failed=Array.isArray(b.failed)?b.failed:mods.filter(x=>x.status==='ERROR');
  return{status:b.status||'STARTING',ok:Number(b.ok||mods.filter(x=>x.status==='OK').length),total:mods.length,failed:failed.length};
}

function ensureSystem(host,drawer){
  let box=host.querySelector(':scope > [data-system466]');
  if(box)return box;
  box=host.querySelector(':scope > [data-bridge-system466]');
  if(!box){box=document.createElement('section');box.dataset.bridgeSystem466='1';box.className='bridge466-system'}
  const b=bootInfo(),cmd=!!window.__KAMIL_TICKET_COMMANDER465__,engine=window.__KAMIL_TICKET_ENGINE426__,models=engine?.models||[],priced=models.filter(x=>Number(x.market||0)>0).length;
  const bad=b.status==='FATAL'||b.failed>0,tone=bad?'bad':b.status==='OK'?'ok':'warn';
  box.innerHTML=`<div><span>SYSTÉM</span> <b class="bridge466-${tone}">${bad?'KONTROLA':b.status==='OK'?'OK':'START'}</b> <span>boot ${b.ok}/${b.total||'—'} · ${b.failed} chyb · trh ${priced}/${models.length} · Commander ${cmd?'OK':'čeká'}</span></div><button class="bridge466-btn" data-bridge-analytics>Analytika</button>`;
  box.querySelector('[data-bridge-analytics]')?.addEventListener('click',()=>{drawer.classList.add('open');drawer.querySelector('[data-a466-toggle],[data-analytics466-toggle]')?.click?.();drawer.classList.add('open');drawer.scrollIntoView({behavior:'smooth',block:'start'})});
  return box;
}

function ensureFifthKpi(host){
  const overview=host.querySelector(':scope > .td331-overview');
  if(!overview)return;
  let r=overview.querySelector('[data-kpi-risk466]');
  if(!r){r=document.createElement('div');r.className='td331-stat';r.dataset.kpiRisk466='1';overview.appendChild(r)}
  const risk=Number(window.__KAMIL_TICKET_RISK438__?.var95||0);
  r.innerHTML=`<span>Capital at Risk</span><b>${risk?`${Math.round(risk).toLocaleString('cs-CZ')} Kč`:'—'}</b><small>heuristický downside proxy</small>`;
}

function moveAfter(el,anchor){
  if(!el||!anchor)return anchor;
  if(el.previousElementSibling!==anchor)anchor.insertAdjacentElement('afterend',el);
  return el;
}

function reorder(host,system,drawer){
  const hero=host.querySelector(':scope > .td331-hero');
  const cmd=host.querySelector(':scope > [data-c465]');
  const overview=host.querySelector(':scope > .td331-overview');
  const modes=host.querySelector(':scope > .td331-modes');
  const focus=host.querySelector(':scope > [data-focus459]');
  const sections=[...host.children].filter(isPortfolioSection);
  let a=hero;
  a=moveAfter(cmd,a);
  a=moveAfter(system,a);
  a=moveAfter(overview,a);
  a=moveAfter(modes,a);
  a=moveAfter(focus,a);
  for(const s of sections)a=moveAfter(s,a);
  if(host.lastElementChild!==drawer)host.appendChild(drawer);
}

function nudgeCommander(){
  const now=Date.now();
  if(now-lastNudge<700)return;
  lastNudge=now;
  window.dispatchEvent(new CustomEvent('kamil:view-change',{detail:{view:'tickets',source:'canonical-bridge466'}}));
  for(const name of ['kamil:ticket-quality444-updated','kamil:ticket-governance451-updated','kamil:ticket-regime452-updated','kamil:ticket-capital453-updated','kamil:ticket-commander454-updated','kamil:ticket-workflow461-updated','kamil:ticket-cadence463-updated','kamil:ticket-event464-updated'])window.dispatchEvent(new CustomEvent(name,{detail:{source:'canonical-bridge466'}}));
}

function render(){
  ensureCss();
  const host=document.querySelector('#ticketIntelView .td331');
  if(!host)return;
  normalizeHero(host);
  const drawer=ensureDrawer(host);
  const system=ensureSystem(host,drawer);
  ensureFifthKpi(host);
  const count=moveDiagnostics(host,drawer);
  reorder(host,system,drawer);
  if(!window.__KAMIL_TICKET_COMMANDER465__)nudgeCommander();
  window.__KAMIL_TICKET_UI421__={version:VERSION,healthy:true,retiredLegacyHub:true,analyticsPanels:count,commander:!!window.__KAMIL_TICKET_COMMANDER465__,at:Date.now()};
  document.documentElement.dataset.ticketUi421='canonical-466';
}

function schedule(ms=100){clearTimeout(timer);timer=setTimeout(render,ms)}

export function installTicketUi421(){
  if(bound)return;
  bound=true;
  ensureCss();
  const events=['kamil:view-change','kamil:ticket-boot466-updated','kamil:ticket-commander454-updated','kamil:ticket-commander465-updated','kamil:ticket-consolidation466-updated','kamil:ticket-refresh397-done','kamil:ticket-alert413-created','kamil:ticket-runtime455-updated','kamil:ticket-recovery456-done','kamil:ticket-focus459-updated'];
  for(const ev of events)window.addEventListener(ev,()=>schedule());
  const root=document.querySelector('#ticketIntelView');
  if(root)new MutationObserver(()=>schedule(160)).observe(root,{childList:true,subtree:true});
  schedule(0);
  setTimeout(()=>{nudgeCommander();schedule(0)},900);
  setTimeout(()=>{nudgeCommander();schedule(0)},2600);
  setTimeout(()=>{nudgeCommander();schedule(0)},5200);
}
