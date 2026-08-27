import {loadTicketCloud660} from './ticketCloud660.js';
import {store} from './state.js';
import {h,money} from './utils.js';
import {buildTicketCapitalAllocator203} from './ticketCapitalAllocatorModel203.js';

export async function appendTicketCapitalAllocator203(host=document.querySelector('#ticketIntelView')){
 if(!host||host.querySelector('[data-ticket-capital203]'))return;
 const cloud=await loadTicketCloud660();if(!cloud?.ok)return;
 const state=store.get()||{},ticketBook=state.ticketBook||{},watchlist=ticketBook.watchlist||[];
 const desk=buildTicketCapitalAllocator203({inventory:cloud.inventory||[],latest:cloud.latest||new Map(),watchlist,ticketBook},Date.now(),{eventCapPct:20,groupCapPct:35,dateCapPct:30,categoryCapPct:60,hardQtyCap:8,reservePct:10});
 const sec=document.createElement('section');sec.dataset.ticketCapital203='1';sec.className='card';sec.style.margin='18px 0';
 sec.innerHTML=`<div class="eyebrow">OS 203 · CAPITAL ALLOCATOR</div><h2>Kam dát ticket kapitál právě teď</h2><p class="muted">Rozděluje dostupný kapitál mezi všechny BUY kandidáty najednou. Vyšší Opportunity + upside dostanou větší váhu, ale každý event pořád respektuje OS202 risk budget a exposure limity.</p><div class="metric-strip"><div class="metric"><span>Kapitál</span><b>${desk.capital?money(desk.capital):'NEZNÁMÝ'}</b></div><div class="metric"><span>Rezerva</span><b>${desk.reserve?money(desk.reserve):'—'}</b></div><div class="metric"><span>Alokováno</span><b>${desk.allocated?money(desk.allocated):'—'}</b></div><div class="metric"><span>Zbývá</span><b>${desk.remaining?money(desk.remaining):'—'}</b></div></div>${desk.rows.slice(0,10).map((v,i)=>`<div class="card" style="margin-top:12px"><div style="display:flex;justify-content:space-between;gap:14px"><div><b>#${i+1} · ${h(v.name||'Ticket opportunity')}</b><div class="muted">Opportunity ${v.score||0}/100 · upside ${v.upsidePct==null?'—':`${v.upsidePct}%`}</div></div><b>${v.allocation.qty>0?`BUY ${v.allocation.qty} KS`:'NO ALLOCATION'}</b></div><div class="metric-strip" style="margin-top:10px"><div class="metric"><span>Max cena / ks</span><b>${v.allocation.price?money(v.allocation.price):'—'}</b></div><div class="metric"><span>Přidělit</span><b>${v.allocation.capital?money(v.allocation.capital):'—'}</b></div><div class="metric"><span>OS202 max ks</span><b>${v.allocation.maxQty||'—'}</b></div><div class="metric"><span>OS202 max budget</span><b>${v.allocation.maxBudget?money(v.allocation.maxBudget):'—'}</b></div></div></div>`).join('')||'<p class="muted">Aktuálně není žádný BUY kandidát, kterému by šel bezpečně přidělit kapitál.</p>'}`;
 host.prepend(sec);window.__KAMIL_TICKET_CAPITAL_ALLOCATOR203__=desk;
}
