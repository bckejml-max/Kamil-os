import {store} from './state.js';
import {ticketProfitLedger} from './ticketProfit29.js';
import {h,qs} from './utils.js';

const id='ticketProfit29Host';
const money=(v,c)=>`${Number(v||0).toLocaleString('cs-CZ',{maximumFractionDigits:0})} ${h(c)}`;
const tone=v=>Number(v)<0?'bad':Number(v)>0?'good':'';
const pct=v=>v===null||v===undefined?'—':`${Number(v).toLocaleString('cs-CZ',{maximumFractionDigits:1})} %`;
const settlementLabel=x=>x==='RECEIVED'?'vyplaceno':x==='PENDING'?'čeká na payout':'stav výplaty neznámý';
function currencyCard(b){
 const eventRows=b.events.slice(0,5).map(x=>`<div class="row"><div><b>${h(x.name)}</b><div class="muted">${x.trades} realizovaných obchodů · ROI ${pct(x.roi)}</div></div><b class="${tone(x.profit)}">${x.profit>0?'+':''}${money(x.profit,b.currency)}</b></div>`).join('')||'<div class="empty">Bez realizované akce.</div>';
 const tradeRows=b.realizedRows.slice(0,6).map(x=>`<div class="row"><div><b>${h(x.name)}</b><div class="muted">${x.qty} ks · ${h(settlementLabel(x.settlement))}${x.at?` · ${h(new Date(x.at).toLocaleDateString('cs-CZ'))}`:''}</div></div><div style="text-align:right"><b class="${tone(x.profit)}">${x.profit>0?'+':''}${money(x.profit,b.currency)}</b><div class="muted">ROI ${pct(x.roi)}</div></div></div>`).join('')||'<div class="empty">Bez realizovaného obchodu.</div>';
 return `<div class="card"><div class="card-head"><div><div class="eyebrow">${h(b.currency)} / REALIZED</div><h3 class="${tone(b.realizedProfit)}">${b.realizedProfit>0?'+':''}${money(b.realizedProfit,b.currency)}</h3></div><span class="status ${tone(b.realizedProfit)}">ROI ${pct(b.realizedRoi)}</span></div>
 <div class="metric-strip"><div class="metric"><span>Realizované tržby</span><b>${money(b.realizedRevenue,b.currency)}</b><small>${b.realizedTrades} obchodů</small></div><div class="metric"><span>Náklad realizovaných</span><b>${money(b.realizedCost,b.currency)}</b></div><div class="metric"><span>Poplatky</span><b>${money(b.realizedFees,b.currency)}</b></div><div class="metric"><span>Win rate</span><b>${pct(b.winRate)}</b><small>${b.wins} zisk / ${b.losses} ztráta</small></div></div>
 <div class="grid two" style="margin-top:12px"><div><h3>Cash settlement</h3><div class="row"><span>Skutečně vyplacené tržby</span><b>${money(b.cashReceived,b.currency)}</b></div><div class="row"><span>Čekající payout</span><b class="${b.payoutPending>0?'warn':''}">${money(b.payoutPending,b.currency)}</b></div>${b.unknownSettlementRevenue>0?`<div class="row"><span>Historie bez stavu výplaty</span><b class="warn">${money(b.unknownSettlementRevenue,b.currency)}</b></div>`:''}<h3 style="margin-top:14px">Otevřená zásoba</h3><div class="row"><span>Kapitál stále otevřený</span><b>${money(b.openCapital,b.currency)}</b></div><div class="row"><span>Pozice / kusy</span><b>${b.openPositions} / ${b.openQty}</b></div><div class="row"><span>Listingový objem</span><b>${money(b.listedGross,b.currency)}</b></div><div class="muted">Listingový objem je jen součet aktuálních nabídkových cen. Není to realizovaná tržba ani zisk.</div></div><div><h3>Nejvýdělečnější realizované akce</h3>${eventRows}</div></div>
 <h3 style="margin-top:14px">Poslední realizované obchody</h3>${tradeRows}</div>`;
}
function render(){
 const view=qs('#ticketsView');if(!view)return;qs(`#${id}`,view)?.remove();if(!view.querySelector('.ticket-table-card'))return;
 const r=ticketProfitLedger(store.get()),host=document.createElement('div');host.id=id;
 const headline=r.currencies.length===1?money(r.byCurrency[r.currencies[0]]?.realizedProfit,r.currencies[0]):r.currencies.length>1?'více měn':'—';
 const gaps=r.gaps.map(x=>`<div class="audit-risk"><b class="warn">DATA</b><span>${h(x)}</span></div>`).join('');
 host.innerHTML=`<div class="card"><div class="card-head"><div><div class="eyebrow">TICKET PROFIT & ROI / 29.9</div><h2>Co je opravdu vydělané</h2><p class="muted">Realizované obchody, payout a stále otevřený kapitál. Budoucí listingová cena se do zisku nikdy nepočítá.</p></div><div class="view-head-stat"><b>${h(headline)}</b><span>${r.coverage.realizedTrades} realizovaných obchodů</span></div></div>${r.currencies.length?`<div class="grid ${r.currencies.length>1?'two':''}">${r.currencies.map(c=>currencyCard(r.byCurrency[c])).join('')}</div>`:'<div class="empty">Zatím není žádný aktivní ani realizovaný ticket obchod.</div>'}${gaps?`<div style="margin-top:12px">${gaps}</div>`:''}<div class="decision-note" style="margin-top:12px">${h(r.note)}</div></div>`;
 const anchor=view.querySelector('.ticket-metrics')||view.querySelector('.view-head');if(anchor)anchor.insertAdjacentElement('afterend',host);else view.prepend(host);
}
const start=()=>{const view=qs('#ticketsView');if(!view)return;new MutationObserver(()=>{if(view.querySelector('.ticket-table-card')&&!qs(`#${id}`,view))queueMicrotask(render)}).observe(view,{childList:true,subtree:false});store.subscribe(()=>{if(qs('#view-tickets')?.classList.contains('on'))queueMicrotask(render)});render()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
