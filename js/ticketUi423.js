const VERSION=423;
let bound=false,timer=0;
function ensureCss(){if(document.querySelector('style[data-ticket-ui423]'))return;const s=document.createElement('style');s.dataset.ticketUi423='1';s.textContent=`
#ticketIntelView{letter-spacing:0!important}
#ticketIntelView .td331{max-width:1480px!important;gap:12px!important}
#ticketIntelView .td331-hero{box-shadow:0 10px 28px rgba(0,0,0,.12)!important}
#ticketIntelView .td331-kicker{font-size:8px!important;letter-spacing:.18em!important;color:#78aef4!important}
#ticketIntelView .td331-hero h1{font-size:23px!important;line-height:1.12!important;font-weight:800!important;letter-spacing:-.015em!important}
#ticketIntelView .td331-hero p{font-size:10px!important;line-height:1.45!important;max-width:760px!important;color:#8ea0b2!important}
#ticketIntelView .td331-btn,#ticketIntelView button{transition:border-color .16s ease,background .16s ease,transform .16s ease,opacity .16s ease}
#ticketIntelView .td331-btn:hover,#ticketIntelView button:hover{border-color:#4a6a82!important}
#ticketIntelView .td331-btn:active,#ticketIntelView button:active{transform:translateY(1px)}
#ticketIntelView .td331-overview{grid-template-columns:repeat(4,minmax(0,1fr))!important}
#ticketIntelView .td331-stat{border-color:#263b4d!important;background:linear-gradient(180deg,#0f1c27,#0c1821)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.015)!important}
#ticketIntelView .td331-stat span{color:#7893a9!important;font-weight:850!important}
#ticketIntelView .td331-stat b{font-size:20px!important;font-weight:820!important;letter-spacing:-.02em!important}
#ticketIntelView .td331-stat small{color:#6f8497!important;line-height:1.35!important}
#ticketIntelView .td331-modes{border-color:#263a4c!important;border-radius:10px!important}
#ticketIntelView .td331-mode{min-height:40px!important;font-size:10px!important;letter-spacing:.02em!important}
#ticketIntelView .td331-section{border-color:#233949!important;background:#09141d!important;box-shadow:0 12px 34px rgba(0,0,0,.08)!important}
#ticketIntelView .td331-section-head h2{font-size:11px!important;letter-spacing:.07em!important}
#ticketIntelView .td331-section-head p{font-size:9px!important;line-height:1.4!important}
#ticketIntelView .td331-grid{background:#07111a!important}
#ticketIntelView .td420-card,#ticketIntelView .td422-sold{border-color:#243a4b!important;box-shadow:0 8px 24px rgba(0,0,0,.09)!important}
#ticketIntelView .td420-card:hover,#ticketIntelView .td422-sold:hover{border-color:#31516a!important;box-shadow:0 10px 28px rgba(0,0,0,.14)!important}
#ticketIntelView .td420-card h3,#ticketIntelView .td422-sold h3{font-size:16px!important;font-weight:790!important;letter-spacing:-.012em!important;color:#eef4f8!important}
#ticketIntelView .td420-card .td331-meta,#ticketIntelView .td422-sold .td331-meta{font-size:10px!important;line-height:1.5!important;color:#8ba0b2!important}
#ticketIntelView .td331-badge{font-weight:900!important;letter-spacing:.055em!important;border:1px solid rgba(255,255,255,.04)!important}
#ticketIntelView .td420-summary,#ticketIntelView .td422-sold .td331-priceflow{gap:10px!important}
#ticketIntelView .td420-price,#ticketIntelView .td422-sold .td331-price{border-color:#243a4a!important;background:linear-gradient(180deg,#10212d,#0d1c27)!important;min-height:78px!important}
#ticketIntelView .td420-price span,#ticketIntelView .td422-sold .td331-price span{font-size:8px!important;letter-spacing:.085em!important;color:#718da3!important;font-weight:900!important}
#ticketIntelView .td420-price b,#ticketIntelView .td422-sold .td331-price b{font-size:17px!important;font-weight:820!important;letter-spacing:-.015em!important}
#ticketIntelView .td420-price small,#ticketIntelView .td422-sold .td331-price small{font-size:8px!important;line-height:1.35!important;color:#6f8395!important}
#ticketIntelView .td420-price.market{background:linear-gradient(180deg,#252014,#19170f)!important;border-color:#5a4d2d!important}
#ticketIntelView .td420-price.market b{color:#ffd88a!important}
#ticketIntelView .td420-price.decision,#ticketIntelView .td422-sold .td331-price.recommended{background:linear-gradient(180deg,#112a3a,#0e2130)!important;border-color:#31566f!important}
#ticketIntelView .td420-price.decision b,#ticketIntelView .td422-sold .td331-price.recommended b{color:#9bcfff!important}
#ticketIntelView .td422-sold .td331-price.positive{background:linear-gradient(180deg,#11271f,#0d1f19)!important;border-color:#2b5947!important}
#ticketIntelView .td422-sold .td331-price.negative{background:linear-gradient(180deg,#2a171d,#211218)!important;border-color:#65404a!important}
#ticketIntelView .td420-card .td331-ticket-actions,#ticketIntelView .td422-sold .td331-ticket-actions{gap:8px!important}
#ticketIntelView .td420-card .td331-ticket-actions .td331-btn,#ticketIntelView .td420-more,#ticketIntelView .td422-sold .td331-ticket-actions .td331-btn,#ticketIntelView .td422-sold-more{min-height:36px!important;font-size:9px!important;font-weight:850!important;border-color:#30495c!important;background:#10222f!important}
#ticketIntelView .td420-card .td331-ticket-actions .td331-btn:first-child,#ticketIntelView .td422-sold .td331-ticket-actions .td331-btn:first-child{background:#173451!important;border-color:#3b6283!important;color:#d9eaff!important}
#ticketIntelView .td420-source{font-size:9px!important;line-height:1.5!important;color:#708a9f!important}
#ticketIntelView .hub421,#ticketIntelView .db419{border-color:#263f50!important;box-shadow:0 8px 24px rgba(0,0,0,.07)!important}
#ticketIntelView .hub421-head,#ticketIntelView .db419-head{background:linear-gradient(180deg,#0b1a25,#09151e)!important}
#ticketIntelView .hub421-copy b,#ticketIntelView .db419 b{font-weight:820!important;letter-spacing:-.01em!important}
#ticketIntelView .td331-filter{border-radius:8px!important;min-height:30px!important}
#ticketIntelView .td331-filter.on{background:#183a5a!important;border-color:#396e9d!important}
@media(max-width:1000px){#ticketIntelView .td331-overview{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:620px){#ticketIntelView .td331{gap:9px!important}#ticketIntelView .td331-hero{padding:14px!important}#ticketIntelView .td331-hero h1{font-size:20px!important}#ticketIntelView .td331-stat b{font-size:17px!important}#ticketIntelView .td420-card h3,#ticketIntelView .td422-sold h3{font-size:14px!important}}
`;document.head.appendChild(s)}
function render(){ensureCss();const host=document.querySelector('#ticketIntelView');if(!host)return;document.documentElement.dataset.ticketUi423='1';window.__KAMIL_TICKET_UI423__={version:VERSION,healthy:true,cards:host.querySelectorAll('.td420-card,.td422-sold').length,at:Date.now()}}
function schedule(ms=140){clearTimeout(timer);timer=setTimeout(render,ms)}
export function installTicketUi423(){if(bound)return;bound=true;ensureCss();for(const ev of ['kamil:view-change','kamil:ticket-price374-updated','kamil:ticket-sale408-saved'])window.addEventListener(ev,()=>schedule());const host=document.querySelector('#ticketIntelView');if(host)new MutationObserver(()=>schedule(220)).observe(host,{childList:true,subtree:true});schedule();setTimeout(()=>schedule(),900)}
