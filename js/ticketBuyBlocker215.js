import {loadTicketCloud660} from './ticketCloud660.js';
import {store} from './state.js';
import {h,money} from './utils.js';
import {buildTicketBuyBlocker215} from './ticketBuyBlockerModel215.js';

const badge=s=>s==='BLOCK'?'⛔':s==='VERIFY'?'🔎':'◌';
export async function appendTicketBuyBlocker215(host=document.querySelector('#ticketIntelView')){
 if(!host||host.querySelector('[data-ticket-buy-blocker215]'))return;
 const cloud=await loadTicketCloud660();if(!cloud?.ok)return;
 const watchlist=store.get()?.ticketBook?.watchlist||[];
 const desk=buildTicketBuyBlocker215({inventory:cloud.inventory||[],latest:cloud.latest||new Map(),watchlist});
 const sec=document.createElement('section');sec.dataset.ticketBuyBlocker215='1';sec.className='card';sec.style.margin='18px 0';
 sec.innerHTML=`<div class="eyebrow">OS 215 · BUY BLOCKER EXPLAINER</div><h2>Co přesně blokuje nákup</h2><p class="muted">Žádné hádání: ukazuje konkrétní compliance nebo payout blokaci a nejbližší bezpečný další krok.</p><div class="metric-strip"><div class="metric"><span>Blokací</span><b>${desk.summary.total}</b></div><div class="metric"><span>VERIFY</span><b>${desk.summary.verify}</b></div><div class="metric"><span>DATA NEEDED</span><b>${desk.summary.dataNeeded}</b></div><div class="metric"><span>BLOCK</span><b>${desk.summary.blocked}</b></div></div>${desk.rows.slice(0,8).map(v=>`<div class="card" style="margin-top:12px"><div style="display:flex;justify-content:space-between;gap:14px"><div><b>${h(v.name)}</b><div class="muted">Opportunity ${v.score}/100${v.market?` · ${h(v.market)}`:''}</div></div><b>${badge(v.state)} ${h(v.state)}</b></div><h3 style="margin:10px 0 4px">${h(v.title)}</h3><p style="margin:0 0 8px">${h(v.reason)}</p><div class="muted"><b>Další krok:</b> ${h(v.next)}</div>${v.grossSpreadCeiling||v.netSafeMaxBuyPrice?`<div class="metric-strip" style="margin-top:10px"><div class="metric"><span>Hrubý strop</span><b>${v.grossSpreadCeiling?money(v.grossSpreadCeiling):'—'}</b></div><div class="metric"><span>Net-safe max BUY</span><b>${v.netSafeMaxBuyPrice?money(v.netSafeMaxBuyPrice):'BLOKOVÁNO'}</b></div><div class="metric"><span>Payout vzorky</span><b>${v.payoutSamples||0}</b></div></div>`:''}</div>`).join('')||'<div class="card" style="margin-top:12px"><b>✓ Žádná BUY blokace</b><p class="muted" style="margin-bottom:0">Aktuálně není v kandidátech VERIFY, DATA NEEDED ani BLOCK.</p></div>'}`;
 host.prepend(sec);window.__KAMIL_TICKET_BUY_BLOCKER215__=desk;
}
