import {loadTicketCloud660} from './ticketCloud660.js';
import {store} from './state.js';
import {h,money} from './utils.js';
import {buildTicketLearnedNetPlanner205} from './ticketLearnedNetPlannerModel205.js';

const netHeadline=s=>{
 const x=s.learnedNet;
 if(x.displayProfitMode==='LEARNED NET')return `${money(x.fullNetProfit)} net model`;
 if(x.displayProfitMode==='MIXED')return `${money(x.netKnownProfit)} net známý`;
 return 'GROSS ONLY';
};

export async function appendTicketLearnedNetPlanner205(host=document.querySelector('#ticketIntelView')){
 if(!host||host.querySelector('[data-ticket-learned-net205]'))return;
 const cloud=await loadTicketCloud660();if(!cloud?.ok)return;
 const state=store.get()||{},ticketBook=state.ticketBook||{},watchlist=ticketBook.watchlist||[];
 const plan=buildTicketLearnedNetPlanner205({inventory:cloud.inventory||[],latest:cloud.latest||new Map(),watchlist,ticketBook},Date.now(),{eventCapPct:20,groupCapPct:35,dateCapPct:30,categoryCapPct:60,hardQtyCap:8});
 const sec=document.createElement('section');sec.dataset.ticketLearnedNet205='1';sec.className='card';sec.style.margin='18px 0';
 sec.innerHTML=`<div class="eyebrow">OS 205 · LEARNED NET PROFIT PLANNER</div><h2>Hrubý model vs. naučený čistý payout</h2><p class="muted">Čistý odhad vzniká pouze z realizovaných payoutů / fee historie OS192. Kde důkaz chybí, zůstává GROSS ONLY. Není to garantovaný budoucí výnos a žádný marketplace fee se nedoplňuje odhadem.</p><div class="metric-strip">${plan.scenarios.map(s=>`<div class="metric"><span>${h(s.mode)}</span><b>${h(netHeadline(s))}</b><small>${s.learnedNet.displayProfitMode} · coverage ${s.learnedNet.coveragePct}%</small></div>`).join('')}</div>${plan.scenarios.map(s=>`<div class="card" style="margin-top:12px"><div style="display:flex;justify-content:space-between;gap:14px"><div><b>${h(s.mode)}</b><div class="muted">Gross model ${money(s.grossProfit)} · learned coverage ${s.learnedNet.learned}/${s.learnedNet.funded}</div></div><b>${h(netHeadline(s))}</b></div><div class="metric-strip" style="margin-top:10px"><div class="metric"><span>Gross profit</span><b>${money(s.grossProfit)}</b></div><div class="metric"><span>Net známý</span><b>${s.learnedNet.learned?money(s.learnedNet.netKnownProfit):'—'}</b></div><div class="metric"><span>Full net ROI</span><b>${s.learnedNet.fullNetRoiPct==null?'—':`${s.learnedNet.fullNetRoiPct}%`}</b></div><div class="metric"><span>Coverage</span><b>${s.learnedNet.coveragePct}%</b></div></div>${s.rows.filter(r=>r.allocation.qty>0).slice(0,5).map(r=>`<div class="muted" style="margin-top:7px">${h(r.name||'Ticket event')} · ${r.allocation.qty} ks · ${r.learnedNet.status==='LEARNED NET'?`gross ${money(r.learnedNet.grossRevenue)} → net ${money(r.learnedNet.netRevenue)} · profit ${money(r.learnedNet.netProfit)} · ${h(r.learnedNet.source||'history')} (${h(r.learnedNet.confidence||'')})`:`GROSS ONLY · ${h(r.learnedNet.reason||'payout history chybí')}`}</div>`).join('')}</div>`).join('')}`;
 host.prepend(sec);window.__KAMIL_TICKET_LEARNED_NET_PLANNER205__=plan;
}
