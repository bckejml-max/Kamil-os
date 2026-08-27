import {store} from './state.js';
import {h,money} from './utils.js';
import {buildTicketPresaleRadar199} from './ticketPresaleRadarModel199.js';

const fmt=iso=>{const t=Date.parse(iso||'');return Number.isFinite(t)?new Intl.DateTimeFormat('cs-CZ',{dateStyle:'medium',timeStyle:'short'}).format(new Date(t)):'—'};

export async function appendTicketPresaleRadar199(host=document.querySelector('#ticketIntelView')){
 if(!host||host.querySelector('[data-ticket-presale199]'))return;
 const watchlist=store.get()?.ticketBook?.watchlist||[];
 const radar=buildTicketPresaleRadar199(watchlist,Date.now(),8);
 const sec=document.createElement('section');sec.dataset.ticketPresale199='1';sec.className='card';sec.style.margin='18px 0';
 sec.innerHTML=`<div class="eyebrow">OS 199 · PRESALE RADAR</div><h2>Na které prodeje být připravený</h2><p class="muted">Časová osa D-7 / D-3 / D-1 / TODAY. Samotný blížící se prodej nikdy nevytvoří BUY signál — BUY TARGET musí potvrdit Opportunity Scanner.</p><div class="metric-strip"><div class="metric"><span>Sledováno</span><b>${radar.summary.tracked}</b></div><div class="metric"><span>Do 7 dnů</span><b>${radar.summary.next7d}</b></div><div class="metric"><span>BUY TARGET</span><b>${radar.summary.buyTargets}</b></div><div class="metric"><span>Chybí data</span><b>${radar.summary.dataNeeded}</b></div></div>${radar.visible.map(v=>`<div class="card" style="margin-top:12px"><div style="display:flex;justify-content:space-between;gap:14px"><div><b>${h(v.name||'Presale event')}</b><div class="muted">${h(v.stage)} · ${fmt(v.saleAt)}</div></div><b>${h(v.action)} · ${v.priority}/100</b></div><div class="metric-strip" style="margin-top:10px"><div class="metric"><span>Oficiální cena</span><b>${v.opportunity.officialPrice?money(v.opportunity.officialPrice):'—'}</b></div><div class="metric"><span>Resale reference</span><b>${v.opportunity.marketPrice?money(v.opportunity.marketPrice):'—'}</b></div><div class="metric"><span>Opportunity</span><b>${v.opportunity.score}/100</b></div><div class="metric"><span>Max BUY +50%</span><b>${v.opportunity.maxBuyPrice?money(v.opportunity.maxBuyPrice):'—'}</b></div></div></div>`).join('')||'<p class="muted">Zatím není v ticket watchlistu žádný budoucí termín prodeje. Presale datum se může ukládat jako presaleAt / saleAt / onSaleAt.</p>'}`;
 host.prepend(sec);
 window.__KAMIL_TICKET_PRESALE199__=radar;
}
