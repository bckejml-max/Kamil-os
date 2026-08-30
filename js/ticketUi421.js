const VERSION=421;
let bound=false,timer=0;
const PANEL_SELECTORS=[
  '[data-ticket-health397]',
  '[data-repair418]',
  '[data-ticket-autopilot407]',
  '[data-sold-guard408]',
  '[data-action-queue410]',
  '[data-settlement411]',
  '[data-reconcile412]',
  '[data-performance414]',
  '[data-capital415]',
  '.td397-health','.rep418','.ta407','.sg408','.aq410','.set411','.rc412','.pf414','.cap415'
];
function ensureCss(){if(document.querySelector('style[data-ticket-ui421]'))return;const s=document.createElement('style');s.dataset.ticketUi421='1';s.textContent=`
#ticketIntelView .td331{gap:10px!important}
#ticketIntelView .td331-hero{padding:14px 16px!important;gap:14px!important}
#ticketIntelView .td331-hero h1{font-size:22px!important;margin:4px 0 3px!important}
#ticketIntelView .td331-hero p{font-size:10px!important}
#ticketIntelView .td331-overview{gap:10px!important}
#ticketIntelView .td331-stat{padding:12px 14px!important;border-radius:11px!important}
#ticketIntelView .td331-stat b{font-size:18px!important}
#ticketIntelView .hub421{border:1px solid #284255;border-radius:12px;background:#0a1721;overflow:hidden;margin:0 0 2px;color:#dbe8f2}
#ticketIntelView .hub421-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px}
#ticketIntelView .hub421-copy{min-width:0}
#ticketIntelView .hub421-copy span{display:block;font-size:8px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#789cb7}
#ticketIntelView .hub421-copy b{display:block;margin-top:3px;font-size:12px}
#ticketIntelView .hub421-copy small{display:block;margin-top:2px;color:#7f94a6;font-size:9px}
#ticketIntelView .hub421-toggle{flex:0 0 auto;min-height:32px;padding:0 11px;border:1px solid #35566c;border-radius:8px;background:#112635;color:#c8ddea;font-size:9px;font-weight:850;cursor:pointer}
#ticketIntelView .hub421-body{display:grid;gap:10px;padding:0 10px 10px;border-top:1px solid #1d3444}
#ticketIntelView .hub421:not(.open) .hub421-body{display:none}
#ticketIntelView .hub421-body>*{margin:10px 0 0!important}
#ticketIntelView .hub421-count{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;margin-left:6px;padding:0 6px;border-radius:999px;background:#183147;color:#a9c9df;font-size:9px}
#ticketIntelView .db419{margin-bottom:2px!important}
#ticketIntelView .db419-head{padding:10px 12px!important}
#ticketIntelView .db419-row{padding:9px 12px!important}
#ticketIntelView .td331-section{margin-top:2px!important}
#ticketIntelView .td331-grid{padding:14px!important;gap:12px!important}
#ticketIntelView .td420-card{min-height:132px}
#ticketIntelView .td420-card .td420-summary{align-items:stretch}
#ticketIntelView .td420-card .td420-price{display:flex;flex-direction:column;justify-content:center;min-height:74px}
#ticketIntelView .td420-card .td331-ticket-actions{align-self:stretch!important;align-content:center!important}
#ticketIntelView .td420-card .td331-ticket-actions .td331-btn,#ticketIntelView .td420-card .td420-more{width:100%!important}
@media(max-width:860px){#ticketIntelView .hub421-head{align-items:flex-start}#ticketIntelView .hub421-copy small{max-width:70vw}}
`;document.head.appendChild(s)}
function uniquePanels(host,hub){const seen=new Set(),out=[];for(const sel of PANEL_SELECTORS){for(const el of host.querySelectorAll(sel)){if(el===hub||hub?.contains(el)||el.closest('.td420-card'))continue;if(seen.has(el))continue;seen.add(el);out.push(el)}}return out}
function ensureHub(host){let hub=host.querySelector('[data-ticket-hub421]');if(hub)return hub;hub=document.createElement('section');hub.dataset.ticketHub421='1';hub.className='hub421';let open=false;try{open=localStorage.getItem('kamil.ticket.analytics421')==='1'}catch{}if(open)hub.classList.add('open');hub.innerHTML=`<div class="hub421-head"><div class="hub421-copy"><span>ANALYTIKA · OS421 <i class="hub421-count" data-hub421-count>0</i></span><b>Detailní market, kapitál, payouty a performance</b><small>Hlavní obrazovka zůstává čistá. Tyto diagnostické panely otevři jen když je potřebuješ.</small></div><button type="button" class="hub421-toggle" data-hub421-toggle>${open?'Skrýt analytiku':'Zobrazit analytiku'}</button></div><div class="hub421-body" data-hub421-body></div>`;const brief=host.querySelector('[data-daily-brief419]');if(brief)brief.insertAdjacentElement('afterend',hub);else{const overview=host.querySelector('.td331-overview');overview?.insertAdjacentElement('afterend',hub);if(!hub.isConnected){const hero=host.querySelector('.td331-hero');hero?.insertAdjacentElement('afterend',hub)}}hub.querySelector('[data-hub421-toggle]')?.addEventListener('click',()=>{hub.classList.toggle('open');const on=hub.classList.contains('open');hub.querySelector('[data-hub421-toggle]').textContent=on?'Skrýt analytiku':'Zobrazit analytiku';try{localStorage.setItem('kamil.ticket.analytics421',on?'1':'0')}catch{}});return hub}
function movePanels(host,hub){const body=hub.querySelector('[data-hub421-body]'),panels=uniquePanels(host,hub);for(const p of panels)body.appendChild(p);const count=body.children.length,chip=hub.querySelector('[data-hub421-count]');if(chip)chip.textContent=String(count);hub.hidden=count===0;return count}
function render(){const host=document.querySelector('#ticketIntelView .td331');if(!host)return;ensureCss();const hub=ensureHub(host),count=movePanels(host,hub);document.documentElement.dataset.ticketUi421='1';window.__KAMIL_TICKET_UI421__={version:VERSION,healthy:true,count,open:hub.classList.contains('open'),at:Date.now()}}
function schedule(ms=180){clearTimeout(timer);timer=setTimeout(render,ms)}
export function installTicketUi421(){if(bound)return;bound=true;ensureCss();for(const ev of ['kamil:view-change','kamil:ticket-refresh397-done','kamil:ticket-repair418-done','kamil:ticket-sale408-saved','kamil:ticket-settlement411-saved','kamil:ticket-price374-updated'])window.addEventListener(ev,()=>schedule());const host=document.querySelector('#ticketIntelView');if(host)new MutationObserver(()=>schedule(260)).observe(host,{childList:true,subtree:true});schedule();setTimeout(()=>schedule(),1200)}
