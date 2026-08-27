import {loadTicketCloud660} from './ticketCloud660.js';
import {store} from './state.js';
import {h,money} from './utils.js';
import {buildTicketRiskAdjustedRanking207} from './ticketRiskAdjustedRankingModel207.js';

export async function appendTicketRiskAdjustedRanking207(host=document.querySelector('#ticketIntelView')){
 if(!host||host.querySelector('[data-ticket-risk-ranking207]'))return;
 const cloud=await loadTicketCloud660();if(!cloud?.ok)return;
 const state=store.get()||{},ticketBook=state.ticketBook||{},watchlist=ticketBook.watchlist||[];
 const plan=buildTicketRiskAdjustedRanking207({inventory:cloud.inventory||[],latest:cloud.latest||new Map(),watchlist,ticketBook},Date.now(),{eventCapPct:20,groupCapPct:35,dateCapPct:30,categoryCapPct:60,hardQtyCap:8});
 const s=plan.balanced;
 const sec=document.createElement('section');sec.dataset.ticketRiskRanking207='1';sec.className='card';sec.style.margin='18px 0';
 const ranked=s?.riskAdjustedRanking?.ranked||[];
 sec.innerHTML=`<div class="eyebrow">OS 207 · RISK-ADJUSTED PROFIT RANKING</div><h2>Nejlepší ticket obchody po riziku</h2><p class="muted">Řadí learned-net příležitosti podle risk-adjusted zisku v Kč: čistý model × confidence × liquidity proxy × exposure safety. Liquidity je heuristika, ne pravděpodobnost prodeje.</p><div class="metric-strip"><div class="metric"><span>Ranked</span><b>${ranked.length}</b></div><div class="metric"><span>Risk-adjusted total</span><b>${money(s?.riskAdjustedRanking?.totalRiskAdjustedProfit||0)}</b></div><div class="metric"><span>Top trade</span><b>${h(ranked[0]?.name||'—')}</b></div></div>${ranked.slice(0,7).map(r=>`<div class="card" style="margin-top:10px"><div style="display:flex;justify-content:space-between;gap:14px"><div><b>#${r.riskAdjusted.rank} · ${h(r.name||'Ticket event')}</b><div class="muted">${r.allocation?.qty||0} ks · net model ${money(r.riskAdjusted.netProfit)} · ROI ${r.riskAdjusted.netRoiPct==null?'—':`${r.riskAdjusted.netRoiPct}%`}</div></div><b>${money(r.riskAdjusted.riskAdjustedProfit)}</b></div><div class="metric-strip" style="margin-top:8px"><div class="metric"><span>Rank score</span><b>${r.riskAdjusted.rankScore}/100</b></div><div class="metric"><span>Confidence</span><b>${r.riskAdjusted.confidence}/100</b></div><div class="metric"><span>Liquidity</span><b>${r.riskAdjusted.liquidity}/100</b></div><div class="metric"><span>Exposure safety</span><b>${r.riskAdjusted.exposureSafety}/100</b></div></div></div>`).join('')||'<p class="muted">Zatím není dost learned-net historie pro bezpečné pořadí.</p>'}`;
 host.prepend(sec);window.__KAMIL_TICKET_RISK_RANKING207__=plan;
}
