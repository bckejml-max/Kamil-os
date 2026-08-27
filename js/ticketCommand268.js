import {store} from './state.js';
const num=x=>Number.isFinite(Number(x))?Number(x):0;
const upper=x=>String(x||'').toUpperCase();
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money=x=>`${Math.round(num(x)).toLocaleString('cs-CZ')} Kč`;
const live=x=>!['SOLD','PAID','ARCHIVED','CANCELLED','CANCELED'].includes(upper(x?.status||x?.workflow));
const items=s=>s.ticketBook?.items||s.ticket_inventory||[];
function cost(x){return num(x.costTotalCzk||x.totalCostCzk||(num(x.buy_each_czk||x.buyEachCzk||x.buyPriceCzk)*num(x.qty||1)))}
function ask(x){return num(x.ask_each_czk||x.askEachCzk||x.listPriceCzk||x.sell_each_czk)}
function payout(x){return num(x.actualPayoutCzk||x.payoutTotalCzk||x.projectedPayoutCzk)}
function compliant(x){return x.resaleAllowed===true&&x.transferCompatible===true&&['LIVE','ON_SALE','OPEN','AVAILABLE','VERIFIED','ACTIVE'].includes(upper(x.officialSaleStatus))&&!!x.restrictionsVerifiedAt}
function marketHistory(s,id){return (s.ticketMarketSnapshots||s.ticket_market_snapshots||[]).filter(x=>(x.ticketId||x.inventoryId||x.eventId)===(id||''));}

export function buildTicketCommand268(s=store.get()){
 const rows=items(s).map(x=>{const c=cost(x),q=num(x.qty||1)||1,a=ask(x),p=payout(x),profit=p?Math.max(-c,p-c):(a?Math.max(-c,a*q-c):0),roi=c?profit/c:0,daysTo=(()=>{const t=Date.parse(x.eventDate||x.date||x.startsAt||'');return Number.isFinite(t)?Math.ceil((t-Date.now())/86400000):null})();const comp=compliant(x);const safeBuy=upper(x.action)==='BUY'&&comp&&num(x.netSafeMaxBuyPrice||x.maxBuyPrice)>0;let sell='HOLD';if(['LISTED','ACTIVE'].includes(upper(x.status||x.workflow))){if(daysTo!==null&&daysTo<=3)sell='REPRICE NOW';else if(daysTo!==null&&daysTo<=10)sell='REVIEW PRICE';else sell='HOLD'}return {...x,cost:c,qty:q,ask:a,payout:p,profit,roi,daysTo,compliant:comp,safeBuy,sellTiming:sell,history:marketHistory(s,x.id||x.eventId)};});
 const active=rows.filter(live),invested=active.reduce((a,x)=>a+x.cost,0),projected=active.reduce((a,x)=>a+(x.payout||x.ask*x.qty),0),realized=rows.filter(x=>['SOLD','PAID'].includes(upper(x.status||x.workflow))).reduce((a,x)=>a+x.profit,0);
 const opportunities=rows.filter(x=>x.safeBuy).sort((a,b)=>num(b.score)-num(a.score)||num(b.netSafeMaxBuyPrice)-num(a.netSafeMaxBuyPrice));
 const blocked=rows.filter(x=>upper(x.action)==='BUY'&&!x.safeBuy);
 const rotation=active.slice().sort((a,b)=>a.roi-b.roi).map(x=>({name:x.name||x.event||'Vstupenka',roi:x.roi,cost:x.cost,review:x.roi<0?'EXIT/REPRICE REVIEW':'KEEP'}));
 const perf={count:rows.length,active:active.length,realized,avgRoi:rows.length?rows.reduce((a,x)=>a+x.roi,0)/rows.length:0};
 return {rows,active,invested,projected,realized,opportunities,blocked,rotation,perf,guardrails:{autoExecute:false,requiresExplicitConfirmation:true,complianceRequired:true,netPayoutRequired:true},generatedAt:new Date().toISOString()};
}
function body(m){const ops=m.opportunities.slice(0,4).map(x=>`<div class="tic268-row"><span><b>${esc(x.name||x.event||'Příležitost')}</b><small>safe max ${money(x.netSafeMaxBuyPrice||x.maxBuyPrice)} · compliance ověřena</small></span><strong>BUY READY</strong></div>`).join('')||'<div class="tic268-empty">Žádný BUY není teď bezpečně odemčený.</div>';const active=m.active.slice(0,5).map(x=>`<div class="tic268-row"><span><b>${esc(x.name||x.event||'Vstupenka')}</b><small>${x.qty} ks · ${x.daysTo??'—'} dní · ${x.sellTiming}</small></span><strong>${money(x.profit)}</strong></div>`).join('')||'<div class="tic268-empty">Žádné aktivní vstupenky.</div>';return `<div class="tic268"><div class="tic268-grid"><span><b>${money(m.invested)}</b><small>investováno</small></span><span><b>${money(m.projected)}</b><small>projekce payoutu</small></span><span><b>${money(m.realized)}</b><small>realizovaný zisk</small></span><span><b>${m.blocked.length}</b><small>BUY blokováno</small></span></div><div class="tic268-title">Bezpečně odemčené příležitosti</div>${ops}<div class="tic268-title">Aktivní portfolio</div>${active}<div class="tic268-note">Autopilot nikdy neprovádí nákup ani prodej. BUY vyžaduje ověřené resale/transfer podmínky a net-safe cenu.</div></div>`}
function ensureCss(){if(document.querySelector('link[data-tic268]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./ticketCommand268.css';l.dataset.tic268='1';document.head.appendChild(l)}
export function openTicketCommand268(){const m=buildTicketCommand268();window.dispatchEvent(new CustomEvent('kamil:detail-drawer',{detail:{title:'Ticket Intelligence 2.0',html:body(m)}}));return m}
export function installTicketCommand268(){ensureCss();window.addEventListener('kamil:open-ticket-command',openTicketCommand268);document.addEventListener('keydown',e=>{if(e.altKey&&!e.ctrlKey&&!e.metaKey&&e.key.toLowerCase()==='t'){e.preventDefault();openTicketCommand268()}},true);window.__KAMIL_TICKET_COMMAND268__={version:268,build:buildTicketCommand268,open:openTicketCommand268};}
