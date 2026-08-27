import {loadTicketCloud660} from './ticketCloud660.js';
import {h,money} from './utils.js';
import {buildTicketProfitFloorDesk193} from './ticketProfitFloorModel193.js';

function floorCell(label,f){
 if(!f?.ok)return `<div class="card" style="padding:10px 12px;min-width:160px"><b>${h(label)}</b><div class="muted">NEZNÁMÉ · chybí payout historie</div></div>`;
 return `<div class="card" style="padding:10px 12px;min-width:160px"><b>${h(label)}</b><div>${money(f.askEachFloor)}/ks</div><div class="muted">net cíl ${money(f.netTarget)} · ${h(f.samples)} vzorek/vzorky · ${h(f.confidence)}</div></div>`;
}

export async function appendTicketProfitFloor193(host=document.querySelector('#ticketIntelView')){
 if(!host||host.querySelector('[data-ticket-profit-floor193]'))return;
 const cloud=await loadTicketCloud660();if(!cloud?.ok)return;
 const desk=buildTicketProfitFloorDesk193(cloud.inventory||[]);
 const sec=document.createElement('section');sec.dataset.ticketProfitFloor193='1';sec.className='card';sec.style.margin='18px 0';
 const rows=desk.rows.filter(x=>x.askEach||x.costTotal).slice(0,12);
 sec.innerHTML=`<div class="eyebrow">OS 193 · MINIMUM PROFIT FLOOR</div><h2>Pod jakou cenu nejít</h2><p class="muted">Floor se počítá z celé pořizovací ceny pozice a skutečného payout poměru z OS 192. Bez payout historie OS minimum nevymýšlí.</p><div class="metric-strip"><div class="metric"><span>Aktivní</span><b>${desk.coverage.active}</b></div><div class="metric"><span>Floor známý</span><b>${desk.coverage.knownFloors}</b></div><div class="metric"><span>Pod break-even</span><b>${desk.coverage.belowBreakEven}</b></div><div class="metric"><span>Safe +50 %</span><b>${desk.coverage.safe50}</b></div></div>${rows.map(v=>`<div class="card" style="margin-top:12px"><div style="display:flex;justify-content:space-between;gap:14px;align-items:flex-start"><div><b>${h(v.name)}</b><div class="muted">${h(v.section)} · ${v.qty} ks · náklad ${money(v.costTotal)}${v.askEach?` · ask ${money(v.askEach)}/ks`:''}</div></div><b>${h(v.verdict)}</b></div><div style="display:flex;gap:8px;overflow:auto;margin-top:10px">${floorCell('BREAK-EVEN',v.floors.breakEven)}${floorCell('+20 % ROI',v.floors.roi20)}${floorCell('+50 % ROI',v.floors.roi50)}</div><div class="decision-note" style="margin-top:10px">${h(v.reason)}</div></div>`).join('')}`;
 host.appendChild(sec);
}
