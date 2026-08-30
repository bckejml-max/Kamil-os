const VERSION=424;
let bound=false,timer=0;
const toneMap={
  'PRODAT':'sell','PRODAT DNES':'sell','ZLEVNIT':'sell','POZOR':'sell',
  'DRŽET':'hold','OVĚŘIT':'warn','ČEKAT':'warn','DOPLNIT ZDROJ':'warn','ZDROJ CHYBÍ':'warn',
  'ZVÝŠIT':'good','VYSTAVIT':'good','V NABÍDCE':'good','VYPLACENO':'good'
};
function ensureCss(){if(document.querySelector('style[data-ticket-ui424]'))return;const s=document.createElement('style');s.dataset.ticketUi424='1';s.textContent=`
#ticketIntelView .td331-hero p{max-width:620px!important}
#ticketIntelView .td331-kicker{opacity:.88}
#ticketIntelView .td331-section-head{padding:12px 14px!important}
#ticketIntelView .td420-card .td420-source{max-width:300px}
#ticketIntelView .td331-badge[data-ui424-tone="sell"]{color:#ff9aa5!important;background:#311a20!important;border-color:#5d303a!important}
#ticketIntelView .td331-badge[data-ui424-tone="warn"]{color:#f2c67d!important;background:#302716!important;border-color:#5f4c25!important}
#ticketIntelView .td331-badge[data-ui424-tone="hold"]{color:#a9c6dd!important;background:#182733!important;border-color:#355267!important}
#ticketIntelView .td331-badge[data-ui424-tone="good"]{color:#89d9aa!important;background:#132c22!important;border-color:#2a5a45!important}
#ticketIntelView .td420-card .td331-priceflow,#ticketIntelView .td422-sold .td331-signal{border-top-color:#1e3443!important}
#ticketIntelView .td420-card.td420-expanded{row-gap:10px!important}
#ticketIntelView .td420-card.td420-expanded .td331-priceflow{padding-top:12px!important;gap:7px!important}
#ticketIntelView .td420-card.td420-expanded .td331-price{min-height:60px!important;padding:8px 9px!important;background:#0b1923!important}
#ticketIntelView .td420-card.td420-expanded .td331-price b{font-size:10px!important}
#ticketIntelView .td420-card.td420-expanded .td331-price small{font-size:7.5px!important;line-height:1.3!important}
#ticketIntelView .td420-card.td420-expanded .td331-signal,#ticketIntelView .td420-card.td420-expanded .td331-reason{margin-top:0!important}
#ticketIntelView .td420-card.td420-expanded .td331-signal{padding:9px 10px!important}
#ticketIntelView .td420-card.td420-expanded .td331-reason{padding:9px 10px!important;color:#7f94a6!important}
#ticketIntelView .td420-price small{max-width:180px}
#ticketIntelView .td331-toolbar .td331-btn:not(.primary){background:#0e1e2a!important}
#ticketIntelView .hub421-copy small{max-width:620px}
#ticketIntelView .db419-row em{line-height:1.35}
#ticketIntelView .td420-card .td331-ticket-actions .td331-btn,#ticketIntelView .td420-more,#ticketIntelView .td422-sold .td331-ticket-actions .td331-btn,#ticketIntelView .td422-sold-more{letter-spacing:.01em!important}
`;document.head.appendChild(s)}
const norm=s=>String(s||'').trim().replace(/\s+/g,' ');
function simplify(text){let s=norm(text);if(!s)return'';s=s.replace(/Kamil OS čeká na další ověření trhu\.?/gi,'Čekám na ověření trhu.')
.replace(/Doporučení blokováno:\s*/gi,'')
.replace(/Chybí ověřená tržní cena[^.]*\./gi,'Chybí ověřená tržní cena.')
.replace(/Používám\s+/gi,'Zdroj: ')
.replace(/confidence/gi,'conf.')
.replace(/veřejného indexu Viagogo/gi,'Viagogo indexu')
.replace(/cena je z veřejného indexu, ne z live listingu/gi,'orientační indexová cena')
.replace(/více vstupenek spolu/gi,'více ks spolu');
if(s.length>150)s=s.slice(0,147).replace(/[\s,;:.]+$/,'')+'…';return s}
function badge(card){const b=card.querySelector('.td331-badge');if(!b)return;const label=norm(b.textContent).toUpperCase(),tone=toneMap[label]||(/PROD|ZLEVN|POZOR/.test(label)?'sell':/DRŽ/.test(label)?'hold':/VYPLAC|VYSTAV|ZVÝŠ/.test(label)?'good':'warn');b.dataset.ui424Tone=tone}
function text(card){const src=card.querySelector('.td420-source');if(src){const clean=simplify(src.textContent);if(src.dataset.raw424!==src.textContent){src.dataset.raw424=src.textContent;src.textContent=clean}}const r=card.querySelector('.td331-reason');if(r){const clean=simplify(r.textContent);if(r.dataset.raw424!==r.textContent){r.dataset.raw424=r.textContent;r.textContent=clean}}for(const sm of card.querySelectorAll('.td420-price small,.td331-price small')){const clean=simplify(sm.textContent);if(sm.dataset.raw424!==sm.textContent){sm.dataset.raw424=sm.textContent;sm.textContent=clean}}}
function rename(){const hero=document.querySelector('#ticketIntelView .td331-hero');const p=hero?.querySelector('p');if(p)p.textContent='Co prodat, za kolik a co ještě čeká na payout.';const inv=document.querySelector('#ticketIntelView [data-td-pane="inventory"] .td331-section-head p');if(inv)inv.textContent='Aktivní pozice a doporučené cenové akce.';const sold=document.querySelector('#ticketIntelView [data-td-pane="sold"] .td331-section-head p');if(sold)sold.textContent='Uzavřené prodeje, P/L a payouty.'}
function render(){ensureCss();const host=document.querySelector('#ticketIntelView');if(!host)return;rename();for(const card of host.querySelectorAll('.td420-card,.td422-sold')){badge(card);text(card)}document.documentElement.dataset.ticketUi424='1';window.__KAMIL_TICKET_UI424__={version:VERSION,healthy:true,cards:host.querySelectorAll('.td420-card,.td422-sold').length,at:Date.now()}}
function schedule(ms=160){clearTimeout(timer);timer=setTimeout(render,ms)}
export function installTicketUi424(){if(bound)return;bound=true;ensureCss();for(const ev of ['kamil:view-change','kamil:ticket-price374-updated','kamil:ticket-sale408-saved','kamil:ticket-refresh397-done'])window.addEventListener(ev,()=>schedule());const host=document.querySelector('#ticketIntelView');if(host)new MutationObserver(()=>schedule(240)).observe(host,{childList:true,subtree:true,characterData:true});schedule();setTimeout(()=>schedule(),1000)}
