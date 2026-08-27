import {loadTicketCloud660} from './ticketCloud660.js';
import {h,money} from './utils.js';
import {buildTicketMarketDesk190} from './ticketMarketDeskModel190.js';

function marketCell(m){
 const bits=[];
 if(m.listed)bits.push('LISTED');
 if(m.marketEach)bits.push(`market ${money(m.marketEach)}`);
 if(m.askEach)bits.push(`ask ${money(m.askEach)}`);
 if(m.netEach)bits.push(`net ${money(m.netEach)}`);
 if(!m.feeKnown&&m.askEach)bits.push('payout fee ověřit');
 if(m.market==='TicketSwap'&&m.eligible)bits.push('5% seller fee');
 return `<div class="card" style="padding:10px 12px;min-width:180px"><b>${h(m.market)}</b><div class="muted">${h(bits.join(' · ')||'bez dat')}</div>${m.url?`<a class="btn" style="margin-top:8px;display:inline-flex" href="${h(m.url)}" target="_blank" rel="noopener">Otevřít market</a>`:''}</div>`;
}

export async function appendTicketMarketDesk190(host=document.querySelector('#ticketIntelView')){
 if(!host||host.querySelector('[data-ticket-market-desk190]'))return;
 const cloud=await loadTicketCloud660();if(!cloud?.ok)return;
 const desk=buildTicketMarketDesk190(cloud.inventory||[],cloud.sources||new Map());
 const sec=document.createElement('section');sec.dataset.ticketMarketDesk190='1';sec.className='card';sec.style.margin='18px 0';
 const rows=desk.rows.slice().sort((a,b)=>(a.status==='LISTED'?-1:1)-(b.status==='LISTED'?-1:1)).slice(0,12);
 sec.innerHTML=`<div class="eyebrow">OS 190 · MULTI-MARKET TICKET DESK</div><h2>Kde teď prodávat vstupenky</h2><p class="muted">Viagogo a StubHub fee nevymýšlím — payout porovnávám až z reálných dat. TicketSwap plán počítá standardní 5% seller fee a 120% cenový strop.</p><div class="metric-strip"><div class="metric"><span>Aktivní</span><b>${desk.coverage.active}</b></div><div class="metric"><span>Viagogo listed</span><b>${desk.coverage.viagogo}</b></div><div class="metric"><span>StubHub event známý</span><b>${desk.coverage.stubhubKnown}</b></div><div class="metric"><span>TicketSwap kandidát</span><b>${desk.coverage.ticketSwapEligible}</b></div></div>${rows.map(v=>`<div class="card" style="margin-top:12px"><div style="display:flex;justify-content:space-between;gap:14px;align-items:flex-start"><div><b>${h(v.name)}</b><div class="muted">${h(v.section)} · ${v.qty} ks · nákup ${money(v.buyEach)}/ks</div></div><div><b>${h(v.recommendation)}</b></div></div><div style="display:flex;gap:8px;overflow:auto;margin-top:10px">${v.markets.map(marketCell).join('')}</div><div class="decision-note" style="margin-top:10px">${h(v.reason)}</div></div>`).join('')}`;
 host.appendChild(sec);
}
