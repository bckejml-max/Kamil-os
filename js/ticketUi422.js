const VERSION=422;
let bound=false,timer=0;
function ensureCss(){if(document.querySelector('style[data-ticket-ui422]'))return;const s=document.createElement('style');s.dataset.ticketUi422='1';s.textContent=`
#ticketIntelView .td331-hero{border:1px solid #203647!important;border-radius:14px!important;background:linear-gradient(180deg,#0b1721 0%,#09131c 100%)!important;padding:16px 18px!important}
#ticketIntelView .td331-toolbar{align-items:center!important}
#ticketIntelView .td331-toolbar .td331-btn{min-height:34px!important;border-radius:9px!important}
#ticketIntelView .td422-tools{display:flex;gap:7px;align-items:center;flex-wrap:wrap}
#ticketIntelView .td422-tools-toggle{display:none;min-height:34px;padding:0 12px;border:1px solid #30485b;border-radius:9px;background:#112432;color:#b9d2e3;font-size:9px;font-weight:850;cursor:pointer}
#ticketIntelView .td331-overview{padding:0!important}
#ticketIntelView .td331-stat{min-height:82px;display:flex;flex-direction:column;justify-content:center}
#ticketIntelView .td331-stat span{text-transform:uppercase;letter-spacing:.055em;font-size:8px!important}
#ticketIntelView .td331-stat b{font-size:19px!important;line-height:1.1}
#ticketIntelView .td331-modes{margin-top:2px!important}
#ticketIntelView .td331-ticket.td422-sold{display:grid!important;grid-template-columns:minmax(280px,.9fr) minmax(480px,1.55fr) 150px!important;grid-template-areas:"identity prices actions" "identity prices actions" "detail detail detail"!important;gap:14px 18px!important;align-items:center!important;margin:0!important;padding:18px!important;border:1px solid #263c4e!important;border-left:3px solid #65d59b!important;border-radius:14px!important;background:linear-gradient(180deg,#0d1924 0%,#0b1620 100%)!important;overflow:visible!important;box-shadow:0 8px 26px rgba(0,0,0,.10)}
#ticketIntelView .td331-grid .td422-sold:nth-child(even){background:linear-gradient(180deg,#0f1c28 0%,#0c1822 100%)!important}
#ticketIntelView .td422-sold[data-tone="critical"]{border-left-color:#ff7885!important}
#ticketIntelView .td422-sold .td331-ticket-top{grid-area:identity!important;display:block!important;min-width:0!important;overflow:visible!important}
#ticketIntelView .td422-sold .td331-ticket-top>div{overflow:visible!important}
#ticketIntelView .td422-sold h3{font-size:15px!important;line-height:1.25!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;max-width:320px!important}
#ticketIntelView .td422-sold .td331-meta{margin-top:6px!important;font-size:10px!important;color:#91a6b8!important;white-space:normal!important}
#ticketIntelView .td422-sold .td331-badge{display:inline-flex!important;margin-top:10px!important;padding:5px 9px!important;font-size:9px!important}
#ticketIntelView .td422-sold .td331-priceflow{grid-area:prices!important;display:grid!important;grid-template-columns:repeat(4,minmax(110px,1fr))!important;gap:9px!important;min-width:0!important}
#ticketIntelView .td422-sold .td331-price{display:flex!important;flex-direction:column!important;justify-content:center!important;min-height:74px!important;padding:13px 12px!important;border:1px solid #243c4d!important;border-radius:10px!important;background:#0f202c!important;text-align:left!important}
#ticketIntelView .td422-sold .td331-price span{font-size:8px!important;letter-spacing:.055em!important;color:#7896ad!important}
#ticketIntelView .td422-sold .td331-price b{font-size:15px!important;margin-top:5px!important;overflow:hidden!important;text-overflow:ellipsis!important}
#ticketIntelView .td422-sold .td331-price.positive{border-color:#285a46!important;background:#10271f!important}
#ticketIntelView .td422-sold .td331-price.positive b{color:#86dfae!important}
#ticketIntelView .td422-sold .td331-price.negative{border-color:#65404a!important;background:#29151b!important}
#ticketIntelView .td422-sold .td331-price.recommended{border-color:#31546b!important;background:#102432!important}
#ticketIntelView .td422-sold .td331-ticket-actions{grid-area:actions!important;display:grid!important;align-content:center!important;align-self:stretch!important}
#ticketIntelView .td422-sold .td331-ticket-actions .td331-btn{width:100%!important;min-height:36px!important;border-radius:9px!important;font-size:9px!important}
#ticketIntelView .td422-sold .td331-signal{grid-area:detail!important;display:none!important;margin:0!important;padding:11px 12px!important;border:1px solid #223a4b!important;border-radius:9px!important;background:#0c1b26!important}
#ticketIntelView .td422-sold.td422-expanded .td331-signal{display:flex!important}
#ticketIntelView .td422-sold .td422-sold-more{width:100%;min-height:34px;border:1px solid #30485b;border-radius:9px;background:#112432;color:#b9d2e3;font-size:9px;font-weight:850;cursor:pointer}
#ticketIntelView .td331-section[data-td-pane="sold"] .td331-grid{gap:12px!important;padding:14px!important;background:#08121b!important}
@media(max-width:1120px){#ticketIntelView .td331-ticket.td422-sold{grid-template-columns:minmax(230px,.85fr) minmax(360px,1.4fr) 130px!important}#ticketIntelView .td422-sold .td331-priceflow{grid-template-columns:repeat(2,minmax(120px,1fr))!important}}
@media(max-width:860px){#ticketIntelView .td331-ticket.td422-sold{grid-template-columns:1fr!important;grid-template-areas:"identity" "prices" "actions" "detail"!important}#ticketIntelView .td422-sold .td331-ticket-actions{grid-template-columns:1fr 1fr!important;gap:7px!important}#ticketIntelView .td422-sold h3{max-width:none!important}}
@media(max-width:720px){#ticketIntelView .td422-tools-toggle{display:inline-flex;align-items:center;justify-content:center}#ticketIntelView .td422-tools:not(.open)>*:not(.td422-tools-toggle):not([data-refresh]){display:none!important}#ticketIntelView .td422-tools{width:100%}}
@media(max-width:560px){#ticketIntelView .td422-sold .td331-priceflow{grid-template-columns:1fr 1fr!important}#ticketIntelView .td331-stat{min-height:72px}}
`;document.head.appendChild(s)}
function toolbar(){const bar=document.querySelector('#ticketIntelView .td331-toolbar');if(!bar)return;if(!bar.classList.contains('td422-tools'))bar.classList.add('td422-tools');let toggle=bar.querySelector('[data-tools422]');if(!toggle){toggle=document.createElement('button');toggle.type='button';toggle.className='td422-tools-toggle';toggle.dataset.tools422='1';toggle.textContent='Nástroje';toggle.addEventListener('click',()=>{bar.classList.toggle('open');toggle.textContent=bar.classList.contains('open')?'Skrýt nástroje':'Nástroje'});bar.appendChild(toggle)}}
function sold(card){if(!card.matches('[data-sold-card]'))return;card.classList.add('td422-sold');const actions=card.querySelector('.td331-ticket-actions');if(actions&&!actions.querySelector('[data-sold-more422]')){const b=document.createElement('button');b.type='button';b.className='td422-sold-more';b.dataset.soldMore422='1';b.textContent='Payout detail';b.addEventListener('click',()=>{card.classList.toggle('td422-expanded');b.textContent=card.classList.contains('td422-expanded')?'Skrýt detail':'Payout detail'});actions.appendChild(b)}}
function render(){ensureCss();toolbar();const host=document.querySelector('#ticketIntelView');if(!host)return;host.querySelectorAll('[data-sold-card]').forEach(sold);document.documentElement.dataset.ticketUi422='1';window.__KAMIL_TICKET_UI422__={version:VERSION,healthy:true,sold:host.querySelectorAll('.td422-sold').length,at:Date.now()}}
function schedule(ms=160){clearTimeout(timer);timer=setTimeout(render,ms)}
export function installTicketUi422(){if(bound)return;bound=true;ensureCss();for(const ev of ['kamil:view-change','kamil:ticket-sale408-saved','kamil:ticket-settlement411-saved','kamil:ticket-reconcile412-saved'])window.addEventListener(ev,()=>schedule());const host=document.querySelector('#ticketIntelView');if(host)new MutationObserver(()=>schedule(220)).observe(host,{childList:true,subtree:true});schedule();setTimeout(()=>schedule(),1000)}
