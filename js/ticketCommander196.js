import {loadTicketCloud660} from './ticketCloud660.js';
import {h,money} from './utils.js';
import {buildTicketCommander196} from './ticketCommanderModel196.js';

export async function appendTicketCommander196(host=document.querySelector('#ticketIntelView')){
 if(!host||host.querySelector('[data-ticket-commander196]'))return;
 const cloud=await loadTicketCloud660();if(!cloud?.ok)return;
 const desk=buildTicketCommander196(cloud.inventory||[],cloud.latest||new Map());
 const sec=document.createElement('section');sec.dataset.ticketCommander196='1';sec.className='card';sec.style.margin='18px 0';
 sec.innerHTML=`<div class="eyebrow">OS 196 · TICKET COMMANDER 2.0</div><h2>Co přesně dnes udělat</h2><p class="muted">Jedna akční vrstva nad market deskem, payout učením, profit floorem, repricing guardem a sell ladderem.</p><div class="metric-strip"><div class="metric"><span>Aktivní</span><b>${desk.summary.active}</b></div><div class="metric"><span>Cenové akce</span><b>${desk.summary.priceActions}</b></div><div class="metric"><span>HOLD</span><b>${desk.summary.holds}</b></div><div class="metric"><span>Market check</span><b>${desk.summary.marketChecks}</b></div></div>${desk.rows.slice(0,12).map(v=>`<div class="card" style="margin-top:12px"><div style="display:flex;justify-content:space-between;gap:14px"><div><b>${h(v.name)}</b><div class="muted">${h(v.section)} · ${v.qty} ks</div></div><b>${h(v.headline)}</b></div><div class="metric-strip" style="margin-top:10px"><div class="metric"><span>Ideální</span><b>${v.idealPrice?money(v.idealPrice):'—'}</b></div><div class="metric"><span>Rychlý prodej</span><b>${v.fastPrice?money(v.fastPrice):'—'}</b></div><div class="metric"><span>NIKDY POD</span><b>${v.neverBelow?money(v.neverBelow):'—'}</b></div><div class="metric"><span>Sell score</span><b>${v.sellScore==null?'—':`${v.sellScore}/100`}</b></div></div><div class="decision-note"><b>${h(v.marketAction)}</b> · ${h(v.marketReason)}</div></div>`).join('')}`;
 host.prepend(sec);
 window.__KAMIL_TICKET_COMMANDER196__=desk;
}
