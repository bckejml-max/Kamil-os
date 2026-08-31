const VERSION=457;let bound=false,timer=0;
function ensureCss(){if(document.querySelector('style[data-ui457]'))return;const s=document.createElement('style');s.dataset.ui457='1';s.textContent=`
#ticketIntelView .td331{gap:8px!important}
#ticketIntelView .td331-hero{padding-bottom:10px!important;margin-bottom:0!important}
#ticketIntelView [data-c454]{order:1!important;margin:0 0 8px!important}
#ticketIntelView [data-runtime455],#ticketIntelView [data-recovery456]{margin:0 0 6px!important}
#ticketIntelView [data-runtime455] .rh455-head,#ticketIntelView [data-recovery456] .rec456-head{min-height:34px!important;padding:6px 9px!important}
#ticketIntelView .td331-overview{margin:2px 0 0!important;gap:8px!important}
#ticketIntelView .td331-stat{padding:9px 12px!important;min-height:62px!important}
#ticketIntelView .td331-stat b{font-size:16px!important}
#ticketIntelView .td331-section{margin-top:0!important}
#ticketIntelView .td331-section-head{padding:9px 13px!important;min-height:40px!important}
#ticketIntelView .td331-grid{padding:6px!important;gap:5px!important;background:#08121b!important}
#ticketIntelView .td331-ticket.td420-card{grid-template-columns:minmax(250px,.95fr) minmax(430px,1.55fr) 132px!important;gap:7px 12px!important;min-height:82px!important;padding:9px 10px!important;border-radius:9px!important;box-shadow:none!important;align-items:center!important}
#ticketIntelView .td331-grid .td331-ticket.td420-card:nth-child(even){background:#0c1822!important}
#ticketIntelView .td420-card h3{font-size:12px!important;line-height:1.2!important;max-width:285px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
#ticketIntelView .td420-card .td331-meta{margin-top:3px!important;font-size:8px!important;line-height:1.25!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
#ticketIntelView .td420-source{margin-top:3px!important;font-size:7.5px!important;line-height:1.2!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
#ticketIntelView .td420-card .td331-ticket-top>span.td331-badge{margin-top:5px!important;padding:3px 6px!important;font-size:7px!important}
#ticketIntelView .td420-summary{grid-template-columns:repeat(4,minmax(84px,1fr))!important;gap:5px!important}
#ticketIntelView .td420-price{min-height:48px!important;padding:6px 8px!important;border-radius:7px!important;background:#0d1d28!important}
#ticketIntelView .td420-price span{font-size:6.8px!important}
#ticketIntelView .td420-price b{margin-top:2px!important;font-size:11px!important;line-height:1.05!important}
#ticketIntelView .td420-price small{margin-top:2px!important;font-size:6.8px!important}
#ticketIntelView .td420-card .td331-ticket-actions{gap:4px!important}
#ticketIntelView .td420-card .td331-ticket-actions .td331-btn,#ticketIntelView .td420-card .td420-more{min-height:25px!important;padding:0 7px!important;border-radius:6px!important;font-size:7.5px!important}
#ticketIntelView .eng427-line{margin-top:4px!important;gap:3px!important}
#ticketIntelView .eng427-chip,.cmd439-chip{min-height:16px!important;padding:0 5px!important;font-size:6.7px!important;margin-top:2px!important}
#ticketIntelView .td420-card.td420-expanded{padding:12px!important;gap:10px 12px!important}
#ticketIntelView .td420-card.td420-expanded h3{white-space:normal!important;max-width:none!important}
#ticketIntelView .td420-card.td420-expanded .td331-meta,#ticketIntelView .td420-card.td420-expanded .td420-source{white-space:normal!important;overflow:visible!important}
#ticketIntelView .hub421{margin-top:2px!important}
#ticketIntelView .hub421-head{padding:7px 10px!important;min-height:38px!important}
#ticketIntelView .c454-head{padding:9px 10px!important;grid-template-columns:1.6fr repeat(4,.8fr)!important}
#ticketIntelView .c454-cols{max-height:235px;overflow:auto}
#ticketIntelView .c454-col{padding:7px 8px!important}
#ticketIntelView .c454-item{padding:5px 0!important}
@media(min-width:1250px){#ticketIntelView .td331-grid{display:grid!important;grid-template-columns:1fr!important}}
@media(max-width:1180px){#ticketIntelView .td331-ticket.td420-card{grid-template-columns:minmax(220px,.9fr) minmax(360px,1.45fr) 120px!important}#ticketIntelView .td420-summary{grid-template-columns:repeat(2,minmax(90px,1fr))!important}}
@media(max-width:860px){#ticketIntelView .td331-ticket.td420-card{grid-template-columns:1fr!important;grid-template-areas:"identity" "summary" "actions"!important;min-height:0!important;padding:10px!important}#ticketIntelView .td420-card h3{white-space:normal!important;max-width:none!important}#ticketIntelView .td420-card .td331-ticket-actions{grid-template-columns:repeat(3,minmax(0,1fr))!important}#ticketIntelView .c454-head,#ticketIntelView .c454-cols{grid-template-columns:1fr 1fr!important}}
`;document.head.appendChild(s)}
function moveAfter(el,anchor){if(el&&anchor&&el.previousElementSibling!==anchor)anchor.insertAdjacentElement('afterend',el);return el||anchor}
function reorder(){const host=document.querySelector('#ticketIntelView .td331');if(!host)return;const hero=host.querySelector('.td331-hero');if(!hero)return;const commander=host.querySelector('[data-c454]'),runtime=host.querySelector('[data-runtime455]'),recovery=host.querySelector('[data-recovery456]'),overview=host.querySelector('.td331-overview');let anchor=hero;anchor=moveAfter(commander,anchor);anchor=moveAfter(runtime,anchor);anchor=moveAfter(recovery,anchor);moveAfter(overview,anchor)}
function markCards(){const cards=[...document.querySelectorAll('#ticketIntelView [data-inventory-card]')];for(const c of cards)c.dataset.compact457='1';return cards.length}
function render(){ensureCss();reorder();const count=markCards();window.__KAMIL_TICKET_UI457__={version:VERSION,healthy:true,cards:count,commander:!!document.querySelector('#ticketIntelView [data-c454]'),runtime:!!document.querySelector('#ticketIntelView [data-runtime455]'),recovery:!!document.querySelector('#ticketIntelView [data-recovery456]'),at:Date.now()};document.documentElement.dataset.ticketUi457='1';window.dispatchEvent(new CustomEvent('kamil:ticket-ui457-updated',{detail:{cards:count}}))}
function schedule(ms=120){clearTimeout(timer);timer=setTimeout(render,ms)}
export function installTicketUi457(){if(bound)return;bound=true;ensureCss();for(const ev of ['kamil:view-change','kamil:ticket-commander454-updated','kamil:ticket-engine427-updated','kamil:ticket-recovery456-done','kamil:ticket-refresh397-done'])window.addEventListener(ev,()=>schedule());const host=document.querySelector('#ticketIntelView');if(host)new MutationObserver(()=>schedule(180)).observe(host,{childList:true,subtree:true});schedule(600);setTimeout(()=>schedule(),3500)}
