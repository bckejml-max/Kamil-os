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
 sec.innerHTML=`<div class="eyebrow">OS 198 · TICKET OPPORTUNITY SCANNER</div><h2>Co má smysl koupit</h2><p class="muted">BUY / WATCH / SKIP podle rozdílu mezi oficiální a resale cenou, kvality market dat a času do akce. BUY MORE vyhodnocuje i současné pozice.</p><div class="metric-strip"><div class="metric"><span>Kandidátů</span><b>${scan.summary.candidates}</b></div><div class="metric"><span>BUY</span><b>${scan.summary.buy}</b></div><div class="metric"><span>WATCH</span><b>${scan.summary.watch}</b></div><div class="metric"><span>SKIP</span><b>${scan.summary.skip}</b></div></div>${scan.rows.slice(0,8).map(v=>`<div class="card" style="margin-top:12px"><div style="display:flex;justify-content:space-between;gap:14px"><div><b>${h(v.name||v.event_name||'Ticket')}</b><div class="muted">${h(v.kind)}${v.days==null?'':` · ${v.days} dní`}</div></div><b>${h(v.action)} · ${v.score}/100</b></div><div class="metric-strip" style="margin-top:10px"><div class="metric"><span>Oficiální / nákup</span><b>${v.officialPrice?money(v.officialPrice):'—'}</b></div><div class="metric"><span>Resale market</span><b>${v.marketPrice?money(v.marketPrice):'—'}</b></div><div class="metric"><span>Upside</span><b>${v.upsidePct==null?'—':`${v.upsidePct}%`}</b></div><div class="metric"><span>Max BUY pro +50%</span><b>${v.maxBuyPrice?money(v.maxBuyPrice):'—'}</b></div></div></div>`).join('')||'<p class="muted">Zatím nejsou kandidáti s dostatkem dat. Přidej event do ticket watchlistu nebo obnov market data.</p>'}`;
 host.prepend(sec);
 window.__KAMIL_TICKET_OPPORTUNITY198__=scan;
}
