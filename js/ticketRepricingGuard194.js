import {loadTicketCloud660} from './ticketCloud660.js';
import {h,money} from './utils.js';
import {buildTicketRepricingGuardDesk194} from './ticketRepricingGuardModel194.js';

const dayLabel=d=>d==null?'datum neznámý':d<0?'po eventu':`${d} dní do eventu`;

export async function appendTicketRepricingGuard194(host=document.querySelector('#ticketIntelView')){
 if(!host||host.querySelector('[data-ticket-repricing-guard194]'))return;
 const cloud=await loadTicketCloud660();if(!cloud?.ok)return;
 const desk=buildTicketRepricingGuardDesk194(cloud.inventory||[],cloud.latest||new Map());
 const sec=document.createElement('section');sec.dataset.ticketRepricingGuard194='1';sec.className='card';sec.style.margin='18px 0';
 const rows=desk.rows.slice().sort((a,b)=>(['DROP TO','RAISE TO','LIST AT'].includes(b.action)?1:0)-(['DROP TO','RAISE TO','LIST AT'].includes(a.action)?1:0)).slice(0,12);
 sec.innerHTML=`<div class="eyebrow">OS 194 · DYNAMIC REPRICING GUARD</div><h2>Co přesně udělat s cenou</h2><p class="muted">Dynamický cíl používá aktuální market cenu a čas do akce. Normální režim nikdy nedoporučí jít pod +50 % ROI floor z OS 193.</p><div class="metric-strip"><div class="metric"><span>Aktivní</span><b>${desk.coverage.active}</b></div><div class="metric"><span>Akce dnes</span><b>${desk.coverage.actionable}</b></div><div class="metric"><span>HOLD</span><b>${desk.coverage.holds}</b></div><div class="metric"><span>Guard aktivní</span><b>${desk.coverage.guarded}</b></div></div>${rows.map(v=>`<div class="card" style="margin-top:12px"><div style="display:flex;justify-content:space-between;gap:14px;align-items:flex-start"><div><b>${h(v.name)}</b><div class="muted">${h(v.section)} · ${v.qty} ks · ${h(dayLabel(v.days))}${v.marketEach?` · market ${money(v.marketEach)}/ks`:''}${v.askEach?` · ask ${money(v.askEach)}/ks`:''}</div></div><div style="text-align:right"><b>${h(v.action)}</b><div>${v.recommendedAsk?money(v.recommendedAsk)+'/ks':'—'}</div></div></div><div class="metric-strip" style="margin-top:10px"><div class="metric"><span>NIKDY POD</span><b>${v.neverBelow?money(v.neverBelow):'NEZNÁMÉ'}</b></div><div class="metric"><span>Emergency break-even</span><b>${v.emergencyFloor?money(v.emergencyFloor):'NEZNÁMÉ'}</b></div><div class="metric"><span>Časový faktor</span><b>${v.marketFactor==null?'—':Math.round(v.marketFactor*100)+' %'}</b></div></div><div class="decision-note" style="margin-top:10px">${h(v.reason)}</div></div>`).join('')}`;
 host.appendChild(sec);
}
