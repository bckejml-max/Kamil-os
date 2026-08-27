import {loadTicketCloud660} from './ticketCloud660.js';
import {store} from './state.js';
import {h,money} from './utils.js';
import {buildTicketPortfolioPlanner204} from './ticketPortfolioPlannerModel204.js';

export async function appendTicketPortfolioPlanner204(host=document.querySelector('#ticketIntelView')){
 if(!host||host.querySelector('[data-ticket-planner204]'))return;
 const cloud=await loadTicketCloud660();if(!cloud?.ok)return;
 const state=store.get()||{},ticketBook=state.ticketBook||{},watchlist=ticketBook.watchlist||[];
 const plan=buildTicketPortfolioPlanner204({inventory:cloud.inventory||[],latest:cloud.latest||new Map(),watchlist,ticketBook},Date.now(),{eventCapPct:20,groupCapPct:35,dateCapPct:30,categoryCapPct:60,hardQtyCap:8});
 const sec=document.createElement('section');sec.dataset.ticketPlanner204='1';sec.className='card';sec.style.margin='18px 0';
 sec.innerHTML=`<div class="eyebrow">OS 204 · EXPECTED PROFIT PORTFOLIO PLANNER</div><h2>Kolik můžeme vydělat podle stylu rizika</h2><p class="muted">Modelovaný hrubý zisk před marketplace fees. Conservative počítá jen s 80 % market ceny a 30% cash rezervou, Balanced 90 % / 10 %, Aggressive 100 % / 5 %. Vše stále respektuje OS202 exposure a maxQty limity.</p><div class="metric-strip">${plan.scenarios.map(s=>`<div class="metric"><span>${h(s.mode)}</span><b>${money(s.grossProfit)}</b><small>${s.mode==='BALANCED'?'DOPORUČENO · ':''}${s.modeledRoiPct==null?'ROI —':`ROI ${s.modeledRoiPct}%`}</small></div>`).join('')}</div>${plan.scenarios.map(s=>`<div class="card" style="margin-top:12px"><div style="display:flex;justify-content:space-between;gap:14px"><div><b>${h(s.mode)}</b><div class="muted">Market realization ${Math.round(s.marketRealization*100)} % · cash reserve ${s.reservePct} %</div></div><b>${money(s.grossProfit)} model profit</b></div><div class="metric-strip" style="margin-top:10px"><div class="metric"><span>Nasadit</span><b>${money(s.deployed)}</b></div><div class="metric"><span>Zbývá</span><b>${money(s.remaining)}</b></div><div class="metric"><span>Model ROI</span><b>${s.modeledRoiPct==null?'—':`${s.modeledRoiPct}%`}</b></div><div class="metric"><span>Coverage</span><b>${s.coverage.modeled}/${s.coverage.funded}</b></div></div>${s.rows.filter(r=>r.allocation.qty>0).slice(0,5).map(r=>`<div class="muted" style="margin-top:7px">${h(r.name||'Ticket event')} · ${r.allocation.qty} ks · cost ${money(r.allocation.capital)} · ${r.profitModel.ok?`model sell ${money(r.profitModel.modelSellPrice)} / ks · profit ${money(r.profitModel.grossProfit)}`:'profit model chybí data'}</div>`).join('')}</div>`).join('')}`;
 host.prepend(sec);window.__KAMIL_TICKET_PORTFOLIO_PLANNER204__=plan;
}
