import {loadTicketCloud660} from './ticketCloud660.js';
import {h,money} from './utils.js';
import {buildTicketDailyQueue197} from './ticketDailyQueueModel197.js';

export async function appendTicketDailyQueue197(host=document.querySelector('#ticketIntelView')){
 if(!host||host.querySelector('[data-ticket-daily197]'))return;
 const cloud=await loadTicketCloud660();if(!cloud?.ok)return;
 const desk=buildTicketDailyQueue197(cloud.inventory||[],cloud.latest||new Map(),Date.now(),5);
 const sec=document.createElement('section');sec.dataset.ticketDaily197='1';sec.className='card';sec.style.margin='18px 0';
 sec.innerHTML=`<div class="eyebrow">OS 197 · DAILY TICKET ACTION QUEUE</div><h2>Top akce na dnes</h2><p class="muted">Maximálně 5 ticket úkolů podle urgence, peněz, cenové odchylky a chybějícího market coverage.</p><div class="metric-strip"><div class="metric"><span>Aktivní</span><b>${desk.summary.active}</b></div><div class="metric"><span>Zobrazeno</span><b>${desk.summary.shown}</b></div><div class="metric"><span>Do 3 dnů</span><b>${desk.summary.urgent}</b></div><div class="metric"><span>Chybí data</span><b>${desk.summary.dataNeeded}</b></div></div>${desk.visible.map((v,i)=>`<div class="card" style="margin-top:12px"><div style="display:flex;justify-content:space-between;gap:14px"><div><b>#${i+1} · ${h(v.name)}</b><div class="muted">${h(v.section)} · ${v.qty} ks · priority ${v.dailyScore}/100</div></div><b>${h(v.headline)}</b></div><div class="metric-strip" style="margin-top:10px"><div class="metric"><span>Cíl</span><b>${v.targetAsk?money(v.targetAsk):'—'}</b></div><div class="metric"><span>Rychle</span><b>${v.fastPrice?money(v.fastPrice):'—'}</b></div><div class="metric"><span>NIKDY POD</span><b>${v.neverBelow?money(v.neverBelow):'—'}</b></div><div class="metric"><span>Market</span><b>${h(v.marketAction||'—')}</b></div></div><div class="decision-note">${h(v.dailyWhy)}</div></div>`).join('')}`;
 host.prepend(sec);
 window.__KAMIL_TICKET_DAILY197__=desk;
}
