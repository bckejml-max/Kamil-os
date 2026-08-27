import {loadTicketCloud660} from './ticketCloud660.js';
import {store} from './state.js';
import {h,money} from './utils.js';
import {buildTicketOpportunityScanner198} from './ticketOpportunityModel198.js';

export async function appendTicketOpportunity198(host=document.querySelector('#ticketIntelView')){
 if(!host||host.querySelector('[data-ticket-opportunity198]'))return;
 const cloud=await loadTicketCloud660();if(!cloud?.ok)return;
 const watchlist=store.get()?.ticketBook?.watchlist||[];
 const scan=buildTicketOpportunityScanner198({inventory:cloud.inventory||[],latest:cloud.latest||new Map(),watchlist});
 const sec=document.createElement('section');sec.dataset.ticketOpportunity198='1';sec.className='card';sec.style.margin='18px 0';
 sec.innerHTML=`<div class="eyebrow">OS 198 · TICKET OPPORTUNITY SCANNER</div><h2>Co má smysl koupit</h2><p class="muted">BUY vyžaduje ověřený resale/transfer stav i skutečnou payout historii. Bez payout dat zůstane kandidát DATA NEEDED; hrubý strop před poplatky je pouze orientační.</p><div class="metric-strip"><div class="metric"><span>Kandidátů</span><b>${scan.summary.candidates}</b></div><div class="metric"><span>BUY</span><b>${scan.summary.buy}</b></div><div class="metric"><span>DATA NEEDED</span><b>${scan.summary.dataNeeded||0}</b></div><div class="metric"><span>VERIFY</span><b>${scan.summary.verify||0}</b></div></div>${scan.rows.slice(0,8).map(v=>`<div class="card" style="margin-top:12px"><div style="display:flex;justify-content:space-between;gap:14px"><div><b>${h(v.name||v.event_name||'Ticket')}</b><div class="muted">${h(v.kind)}${v.days==null?'':` · ${v.days} dní`}${v.buyFinance?.source?` · ${h(v.buyFinance.source)}`:''}</div></div><b>${h(v.action)} · ${v.score}/100</b></div><div class="metric-strip" style="margin-top:10px"><div class="metric"><span>Oficiální / nákup</span><b>${v.officialPrice?money(v.officialPrice):'—'}</b></div><div class="metric"><span>Resale market</span><b>${v.marketPrice?money(v.marketPrice):'—'}</b></div><div class="metric"><span>Hrubý strop před poplatky</span><b>${v.grossSpreadCeiling?money(v.grossSpreadCeiling):'—'}</b></div><div class="metric"><span>Net-safe max BUY +50%</span><b>${v.netSafeMaxBuyPrice?money(v.netSafeMaxBuyPrice):'DATA NEEDED'}</b></div></div></div>`).join('')||'<p class="muted">Zatím nejsou kandidáti s dostatkem dat. Přidej event do ticket watchlistu nebo obnov market data.</p>'}`;
 host.prepend(sec);
 window.__KAMIL_TICKET_OPPORTUNITY198__=scan;
}
