const VERSION=425;
let bound=false,timer=0;
function ensureCss(){if(document.querySelector('style[data-ticket-ui425]'))return;const s=document.createElement('style');s.dataset.ticketUi425='1';s.textContent=`
#ticketIntelView .td420-card,#ticketIntelView .td422-sold{grid-template-columns:minmax(250px,.82fr) minmax(500px,1.65fr) 156px!important;gap:16px 18px!important;padding:17px 18px!important}
#ticketIntelView .td425-meta{display:flex!important;flex-wrap:wrap;gap:5px 7px!important;align-items:center;margin-top:7px!important;white-space:normal!important;overflow:visible!important}
#ticketIntelView .td425-meta-chip{display:inline-flex;align-items:center;min-height:21px;padding:0 7px;border:1px solid #253d4f;border-radius:999px;background:#0c1c27;color:#8fa5b7;font-size:8.5px;font-weight:750;line-height:1}
#ticketIntelView .td425-meta-chip.qty{color:#c6d8e5;background:#102431}
#ticketIntelView .td425-meta-chip.status{color:#9fc1d7;background:#122736;border-color:#31536a}
#ticketIntelView .td420-card .td420-source{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;max-width:330px!important;min-height:27px;margin-top:8px!important;font-size:8.5px!important;line-height:1.45!important}
#ticketIntelView .td420-summary{grid-template-columns:1.05fr 1fr .9fr 1.15fr!important;gap:9px!important}
#ticketIntelView .td420-price,#ticketIntelView .td422-sold .td331-price{min-height:76px!important;padding:12px 11px!important}
#ticketIntelView .td420-price b,#ticketIntelView .td422-sold .td331-price b{font-size:16px!important}
#ticketIntelView .td420-price small,#ticketIntelView .td422-sold .td331-price small{margin-top:3px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
#ticketIntelView .td420-price.decision{box-shadow:inset 0 0 0 1px rgba(115,181,229,.05)!important}
#ticketIntelView .td420-card .td331-ticket-actions,#ticketIntelView .td422-sold .td331-ticket-actions{display:grid!important;grid-auto-rows:minmax(34px,auto)!important;gap:7px!important;align-content:center!important}
#ticketIntelView .td420-card .td331-ticket-actions .td331-btn,#ticketIntelView .td420-more,#ticketIntelView .td422-sold .td331-ticket-actions .td331-btn,#ticketIntelView .td422-sold-more{min-height:34px!important;padding:0 9px!important;line-height:1.15!important}
#ticketIntelView .td420-card .td331-ticket-actions a.td331-btn{display:inline-flex!important}
#ticketIntelView .td331-section-head{min-height:58px}
#ticketIntelView .td331-filters{flex-wrap:wrap!important}
#ticketIntelView .td331-filter{min-height:29px!important;padding:5px 9px!important}
#ticketIntelView .db419-row{grid-template-columns:34px minmax(0,1.6fr) 82px auto!important}
#ticketIntelView .db419-row em{display:block;margin-top:2px;max-width:760px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#ticketIntelView .hub421-head{min-height:62px}
@media(max-width:1240px){
  #ticketIntelView .td420-card,#ticketIntelView .td422-sold{grid-template-columns:minmax(225px,.8fr) minmax(430px,1.55fr) 145px!important}
  #ticketIntelView .td420-summary,#ticketIntelView .td422-sold .td331-priceflow{grid-template-columns:repeat(2,minmax(125px,1fr))!important}
  #ticketIntelView .td420-card .td420-source{max-width:280px!important}
}
@media(max-width:960px){
  #ticketIntelView .td420-card,#ticketIntelView .td422-sold{grid-template-columns:1fr!important;grid-template-areas:"identity" "summary" "actions" "detail"!important;padding:16px!important}
  #ticketIntelView .td422-sold{grid-template-areas:"identity" "prices" "actions" "detail"!important}
  #ticketIntelView .td420-card .td331-ticket-actions,#ticketIntelView .td422-sold .td331-ticket-actions{grid-template-columns:repeat(2,minmax(0,1fr))!important;align-self:auto!important}
  #ticketIntelView .td420-card .td420-source{max-width:none!important;min-height:auto!important;-webkit-line-clamp:1}
  #ticketIntelView .db419-row{grid-template-columns:30px minmax(0,1fr) auto!important}
  #ticketIntelView .db419-row>:nth-child(3){display:none}
}
@media(max-width:620px){
  #ticketIntelView .td331-grid{padding:9px!important;gap:9px!important}
  #ticketIntelView .td420-card,#ticketIntelView .td422-sold{padding:14px!important;border-radius:12px!important;gap:11px!important}
  #ticketIntelView .td420-summary,#ticketIntelView .td422-sold .td331-priceflow{grid-template-columns:1fr 1fr!important;gap:7px!important}
  #ticketIntelView .td420-price,#ticketIntelView .td422-sold .td331-price{min-height:68px!important;padding:10px!important}
  #ticketIntelView .td420-price b,#ticketIntelView .td422-sold .td331-price b{font-size:14px!important}
  #ticketIntelView .td420-card .td331-ticket-actions,#ticketIntelView .td422-sold .td331-ticket-actions{grid-template-columns:1fr 1fr!important;gap:6px!important}
  #ticketIntelView .td425-meta{gap:4px!important}
  #ticketIntelView .td425-meta-chip{font-size:8px;padding:0 6px}
  #ticketIntelView .db419-row{grid-template-columns:26px 1fr!important}
  #ticketIntelView .db419-row>:nth-child(4){grid-column:2}
}
`;document.head.appendChild(s)}
function normalizeMeta(meta){if(!meta||meta.dataset.ui425==='1')return;const raw=(meta.textContent||'').trim();if(!raw)return;const parts=raw.split('·').map(x=>x.trim()).filter(Boolean);if(parts.length<2)return;meta.dataset.ui425='1';meta.dataset.raw425=raw;meta.classList.add('td425-meta');meta.innerHTML=parts.map((p,i)=>`<span class="td425-meta-chip ${/\bks\b/i.test(p)?'qty':i===parts.length-1?'status':''}">${escapeHtml(p)}</span>`).join('')}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function cleanSource(card){const src=card.querySelector('.td420-source');if(!src)return;let t=(src.textContent||'').replace(/\s+·\s+/g,' · ').replace(/conf\.\s*(\d+)\s*%/i,'conf. $1 %').trim();if(t.length>130)t=t.slice(0,127).replace(/[\s,;:.]+$/,'')+'…';if(src.textContent!==t)src.textContent=t}
function render(){ensureCss();const host=document.querySelector('#ticketIntelView');if(!host)return;for(const card of host.querySelectorAll('.td420-card,.td422-sold')){normalizeMeta(card.querySelector('.td331-meta'));cleanSource(card)}document.documentElement.dataset.ticketUi425='1';window.__KAMIL_TICKET_UI425__={version:VERSION,healthy:true,cards:host.querySelectorAll('.td420-card,.td422-sold').length,at:Date.now()}}
function schedule(ms=160){clearTimeout(timer);timer=setTimeout(render,ms)}
export function installTicketUi425(){if(bound)return;bound=true;ensureCss();for(const ev of ['kamil:view-change','kamil:ticket-price374-updated','kamil:ticket-sale408-saved','kamil:ticket-refresh397-done'])window.addEventListener(ev,()=>schedule());const host=document.querySelector('#ticketIntelView');if(host)new MutationObserver(()=>schedule(220)).observe(host,{childList:true,subtree:true});schedule();setTimeout(()=>schedule(),900)}
