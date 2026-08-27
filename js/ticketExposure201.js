import {loadTicketCloud660} from './ticketCloud660.js';
import {store} from './state.js';
import {h,money} from './utils.js';
import {buildTicketPresaleRadar199} from './ticketPresaleRadarModel199.js';
import {buildTicketPresaleExecution200} from './ticketPresaleExecutionModel200.js';
import {buildTicketExposure201,applyTicketExposureToExecution201} from './ticketExposureModel201.js';

export async function appendTicketExposure201(host=document.querySelector('#ticketIntelView')){
 if(!host||host.querySelector('[data-ticket-exposure201]'))return;
 const cloud=await loadTicketCloud660();if(!cloud?.ok)return;
 const state=store.get()||{},ticketBook=state.ticketBook||{},watchlist=ticketBook.watchlist||[];
 const radar=buildTicketPresaleRadar199(watchlist,Date.now(),12);
 const base=buildTicketPresaleExecution200(radar,cloud.inventory||[],ticketBook,{eventCapPct:20,hardQtyCap:8});
 const exposure=buildTicketExposure201(cloud.inventory||[],base.capital.total||0);
 const rows=base.rows.map(v=>({...v,execution201:applyTicketExposureToExecution201(v,v.execution,exposure,{eventCapPct:20,groupCapPct:35,dateCapPct:30,categoryCapPct:60})}));
 const sec=document.createElement('section');sec.dataset.ticketExposure201='1';sec.className='card';sec.style.margin='18px 0';
 const top=(dim,label)=>(exposure.ranked?.[dim]||[]).slice(0,3).map(x=>`<div class="muted">${h(label)}: <b>${h(x.key)}</b> · ${money(x.value)}${x.pct!=null?` · ${x.pct}%`:''}</div>`).join('');
 sec.innerHTML=`<div class="eyebrow">OS 201 · PORTFOLIO EXPOSURE MAP</div><h2>Kde už máme moc ticket kapitálu</h2><p class="muted">Nový nákup hlídá koncentraci. Limity: event 20 %, klub/interpret 35 %, stejný den 30 %, sport/kategorie 60 %. Použije se nejnižší zbývající prostor.</p><div class="metric-strip"><div class="metric"><span>Ticket kapitál</span><b>${exposure.capital?money(exposure.capital):'NEZNÁMÝ'}</b></div><div class="metric"><span>Aktivně investováno</span><b>${money(exposure.invested||0)}</b></div><div class="metric"><span>Eventy</span><b>${exposure.ranked.event.length}</b></div><div class="metric"><span>Dny</span><b>${exposure.ranked.date.length}</b></div></div><div style="margin-top:10px">${top('group','Klub/interpret')}${top('category','Kategorie')}${top('date','Datum')}</div>${rows.filter(v=>v.execution?.verdict==='EXECUTE'||v.execution201?.verdict==='CONCENTRATED').slice(0,8).map(v=>{const e=v.execution201,g=e.exposureGuard,b=g?.binding;return `<div class="card" style="margin-top:12px"><div style="display:flex;justify-content:space-between;gap:14px"><div><b>${h(v.name||'Presale event')}</b><div class="muted">${h(v.stage)} · Opportunity ${v.opportunity?.score||0}/100</div></div><b>${h(e.verdict)}</b></div><div class="metric-strip" style="margin-top:10px"><div class="metric"><span>Max cena / ks</span><b>${e.buyPrice?money(e.buyPrice):'—'}</b></div><div class="metric"><span>Max kusů po koncentraci</span><b>${e.maxQty||'—'}</b></div><div class="metric"><span>Zbývá pro tento profil</span><b>${g?.remainingBudget!=null?money(g.remainingBudget):'—'}</b></div><div class="metric"><span>Binding limit</span><b>${b?h(b.dimension.toUpperCase()):'—'}</b></div></div>${b?`<div class="muted" style="margin-top:8px">${h(b.dimension)}: už ${money(b.current)} z limitu ${money(b.cap)} · zbývá ${money(b.remaining)}.</div>`:''}</div>`}).join('')||'<p class="muted">Aktuálně není žádný BUY TARGET omezený koncentrací.</p>'}`;
 host.prepend(sec);window.__KAMIL_TICKET_EXPOSURE201__={exposure,rows};
}
