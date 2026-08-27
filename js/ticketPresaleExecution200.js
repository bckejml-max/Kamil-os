import {loadTicketCloud660} from './ticketCloud660.js';
import {store} from './state.js';
import {h,money} from './utils.js';
import {buildTicketPayoutLearning192} from './ticketPayoutLearningModel192.js';
import {buildTicketPresaleRadar199} from './ticketPresaleRadarModel199.js';
import {buildTicketPresaleExecution200} from './ticketPresaleExecutionModel200.js';

export async function appendTicketPresaleExecution200(host=document.querySelector('#ticketIntelView')){
 if(!host||host.querySelector('[data-ticket-presale-execution200]'))return;
 const cloud=await loadTicketCloud660();if(!cloud?.ok)return;
 const state=store.get()||{},ticketBook=state.ticketBook||{},watchlist=ticketBook.watchlist||[];
 const inventory=cloud.inventory||[],learning=buildTicketPayoutLearning192(inventory);
 const radar=buildTicketPresaleRadar199(watchlist,Date.now(),12,{learning});
 const plan=buildTicketPresaleExecution200(radar,inventory,ticketBook,{eventCapPct:20,hardQtyCap:8});
 const sec=document.createElement('section');sec.dataset.ticketPresaleExecution200='1';sec.className='card';sec.style.margin='18px 0';
 sec.innerHTML=`<div class="eyebrow">OS 200 · PRESALE EXECUTION PLAN</div><h2>Kolik maximálně koupit</h2><p class="muted">BUY TARGET převádí na konkrétní limit. Net-safe max BUY používá skutečně naučený payout poměr; bez payout historie se nákup neodemkne. Výchozí risk cap je 20 % známého ticket kapitálu na jeden event a max. 8 ks.</p><div class="metric-strip"><div class="metric"><span>Ticket kapitál</span><b>${plan.capital.total?money(plan.capital.total):'NEZNÁMÝ'}</b></div><div class="metric"><span>Zdroj kapitálu</span><b>${h(plan.capital.source)}</b></div><div class="metric"><span>EXECUTE</span><b>${plan.summary.execute}</b></div><div class="metric"><span>DATA NEEDED</span><b>${plan.summary.dataNeeded||0}</b></div></div>${plan.rows.filter(v=>['BUY TARGET'].includes(String(v.action).toUpperCase())||['EXECUTE','SET CAPITAL','TOO LARGE','DATA NEEDED'].includes(v.execution.verdict)).slice(0,8).map(v=>`<div class="card" style="margin-top:12px"><div style="display:flex;justify-content:space-between;gap:14px"><div><b>${h(v.name||'Presale event')}</b><div class="muted">${h(v.stage)} · Opportunity ${v.opportunity?.score||0}/100${v.opportunity?.buyFinance?.source?` · ${h(v.opportunity.buyFinance.source)}`:''}</div></div><b>${h(v.execution.verdict)}</b></div><div class="metric-strip" style="margin-top:10px"><div class="metric"><span>Max cena / ks</span><b>${v.execution.buyPrice?money(v.execution.buyPrice):'—'}</b></div><div class="metric"><span>Net-safe strop</span><b>${v.execution.netSafeMaxBuyPrice?money(v.execution.netSafeMaxBuyPrice):'DATA NEEDED'}</b></div><div class="metric"><span>Max kusů</span><b>${v.execution.maxQty||'—'}</b></div><div class="metric"><span>Nasadit max.</span><b>${v.execution.deployCapital?money(v.execution.deployCapital):'—'}</b></div></div><div class="muted" style="margin-top:8px">Hard limit: ${v.execution.eventCapPct}% ticket kapitálu · max ${v.execution.hardQtyCap} ks · payout historie se neodhaduje z pevného poplatku.</div></div>`).join('')||'<p class="muted">Aktuálně není žádný BUY TARGET vhodný k exekuci.</p>'}`;
 host.prepend(sec);window.__KAMIL_TICKET_PRESALE_EXECUTION200__=plan;
}
