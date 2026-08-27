import {loadTicketCloud660} from './ticketCloud660.js';
import {store} from './state.js';
import {h,money} from './utils.js';
import {buildTicketCommander208} from './ticketCommanderModel208.js';

export async function appendTicketCommander208(host=document.querySelector('#ticketIntelView')){
 if(!host||host.querySelector('[data-ticket-commander208]'))return;
 const cloud=await loadTicketCloud660();if(!cloud?.ok)return;
 const state=store.get()||{},ticketBook=state.ticketBook||{},watchlist=ticketBook.watchlist||[];
 const plan=buildTicketCommander208({inventory:cloud.inventory||[],latest:cloud.latest||new Map(),watchlist,ticketBook},Date.now(),{eventCapPct:20,groupCapPct:35,dateCapPct:30,categoryCapPct:60,hardQtyCap:8});
 const sec=document.createElement('section');sec.dataset.ticketCommander208='1';sec.className='card';sec.style.margin='18px 0';
 const rows=plan.rows||[];
 sec.innerHTML=`<div class="eyebrow">OS 208 · TICKET COMMANDER 3.0</div><h2>NEXT MOVE</h2><p class="muted">Jedna fronta nad OS207 risk-adjusted rankingem a OS194 repricing guardem. Žádný nový paralelní ranking.</p><div class="metric-strip"><div class="metric"><span>Ranked</span><b>${plan.summary.ranked}</b></div><div class="metric"><span>Price actions</span><b>${plan.summary.priceActions}</b></div><div class="metric"><span>Rule checks</span><b>${plan.summary.verify}</b></div><div class="metric"><span>Top move</span><b>${h(plan.summary.topMove||'—')}</b></div></div>${rows.slice(0,7).map(r=>`<div class="card" style="margin-top:10px"><div style="display:flex;justify-content:space-between;gap:14px"><div><b>${r.riskAdjusted?.rank?`#${r.riskAdjusted.rank} · `:''}${h(r.name||'Ticket event')}</b><div class="muted">Risk-adjusted ${r.riskAdjusted?.riskAdjustedProfit==null?'—':money(r.riskAdjusted.riskAdjustedProfit)} · ask ${r.currentAsk==null?'—':money(r.currentAsk)} · market ${r.marketEach==null?'—':money(r.marketEach)}</div></div><div style="text-align:right"><div class="eyebrow">NEXT MOVE</div><b>${h(r.nextMove.label)}</b></div></div><div class="muted" style="margin-top:7px">${h(r.nextMove.reason)}</div></div>`).join('')||'<p class="muted">Zatím není dost dat pro Commander 3.0.</p>'}`;
 host.prepend(sec);window.__KAMIL_TICKET_COMMANDER208__=plan;
}
