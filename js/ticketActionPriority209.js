import {loadTicketCloud660} from './ticketCloud660.js';
import {store} from './state.js';
import {h,money} from './utils.js';
import {buildTicketActionPriority209} from './ticketActionPriorityModel209.js';

export async function appendTicketActionPriority209(host=document.querySelector('#ticketIntelView')){
 if(!host||host.querySelector('[data-ticket-action-priority209]'))return;
 const cloud=await loadTicketCloud660();if(!cloud?.ok)return;
 const state=store.get()||{},ticketBook=state.ticketBook||{},watchlist=ticketBook.watchlist||[];
 const plan=buildTicketActionPriority209({inventory:cloud.inventory||[],latest:cloud.latest||new Map(),watchlist,ticketBook},Date.now(),{eventCapPct:20,groupCapPct:35,dateCapPct:30,categoryCapPct:60,hardQtyCap:8});
 const sec=document.createElement('section');sec.dataset.ticketActionPriority209='1';sec.className='card';sec.style.margin='18px 0';
 const p=plan.primary,rest=(plan.queue||[]).slice(1,7);
 sec.innerHTML=`<div class="eyebrow">OS 209 · COMMANDER ACTION PRIORITY</div><h2>Udělej teď tohle</h2>${p?`<div class="card" style="margin-top:10px"><div style="display:flex;justify-content:space-between;gap:14px"><div><b>${h(p.name||'Ticket event')}</b><div class="muted">Risk-adjusted ${p.riskAdjusted?.riskAdjustedProfit==null?'—':money(p.riskAdjusted.riskAdjustedProfit)} · ask ${p.currentAsk==null?'—':money(p.currentAsk)} · market ${p.marketEach==null?'—':money(p.marketEach)}</div></div><div style="text-align:right"><div class="eyebrow">PRIMARY ACTION</div><b>${h(p.nextMove?.label||'—')}</b></div></div><div class="muted" style="margin-top:7px">${h(p.nextMove?.reason||'')}</div></div>`:'<p class="muted">Zatím není žádná ticket akce.</p>'}<div class="metric-strip" style="margin-top:10px"><div class="metric"><span>Queue</span><b>${plan.summary.total}</b></div><div class="metric"><span>Blockers</span><b>${plan.summary.blockers}</b></div><div class="metric"><span>Payout checks</span><b>${plan.summary.payoutChecks}</b></div><div class="metric"><span>Price actions</span><b>${plan.summary.priceActions}</b></div></div>${rest.length?`<div style="margin-top:12px"><div class="eyebrow">DALŠÍ V POŘADÍ</div>${rest.map((r,i)=>`<div style="display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-top:1px solid var(--line,#ddd)"><span>${i+2}. ${h(r.name||'Ticket event')}</span><b>${h(r.nextMove?.label||'—')}</b></div>`).join('')}</div>`:''}`;
 host.prepend(sec);window.__KAMIL_TICKET_ACTION_PRIORITY209__=plan;
}
