import {loadTicketCloud660} from './ticketCloud660.js';
import {h} from './utils.js';
import {buildTicketMarketQueue191} from './ticketMarketQueueModel191.js';

export async function appendTicketMarketQueue191(host=document.querySelector('#ticketIntelView')){
 if(!host||host.querySelector('[data-ticket-market-queue191]'))return;
 const cloud=await loadTicketCloud660();if(!cloud?.ok)return;
 const q=buildTicketMarketQueue191(cloud.inventory||[],cloud.sources||new Map());
 const sec=document.createElement('section');sec.dataset.ticketMarketQueue191='1';sec.className='card';sec.style.margin='18px 0';
 sec.innerHTML=`<div class="eyebrow">OS 191 · MARKET COVERAGE QUEUE</div><h2>Co dnes udělat se vstupenkami</h2><div class="metric-strip"><div class="metric"><span>Úkolů</span><b>${q.counts.total}</b></div><div class="metric"><span>Urgent</span><b>${q.counts.urgent}</b></div><div class="metric"><span>Zalistovat</span><b>${q.counts.list}</b></div><div class="metric"><span>Cross-check</span><b>${q.counts.crossCheck}</b></div></div>${q.top.length?q.top.map((a,i)=>`<div class="row ux64-row"><div><b>${i+1}. ${h(a.title)}</b><div class="muted">${h(a.market)} · priorita ${a.priority}/100</div><div class="muted">${h(a.reason)}</div></div><div><b>${h(a.code)}</b></div></div>`).join(''):'<p class="muted">Žádné aktivní market úkoly.</p>'}`;
 host.appendChild(sec);
}
