import {loadTicketCloud660} from './ticketCloud660.js';
import {h,money} from './utils.js';
import {buildTicketSellLadderDesk195} from './ticketSellLadderModel195.js';

const pct=v=>v==null?'—':`${Math.round(v)} %`;
const badge=s=>`<span class="pill">${h(s)}</span>`;

export async function appendTicketSellLadder195(host=document.querySelector('#ticketIntelView')){
 if(!host||host.querySelector('[data-ticket-sell-ladder195]'))return;
 const cloud=await loadTicketCloud660();if(!cloud?.ok)return;
 const desk=buildTicketSellLadderDesk195(cloud.inventory||[],cloud.latest||new Map());
 const sec=document.createElement('section');sec.dataset.ticketSellLadder195='1';sec.className='card';sec.style.margin='18px 0';
 const rows=desk.rows.filter(r=>r.ladder.length).slice(0,10);
 sec.innerHTML=`<div class="eyebrow">OS 195 · SELL PROBABILITY + PRICE LADDER</div><h2>Kolik chtít vs. jak rychle se to může prodat</h2><p class="muted">Sell probability je heuristický odhad podle poměru cena/market a času do akce. Není to garantovaná pravděpodobnost. Profit guard z OS 193/194 má vždy přednost.</p><div class="metric-strip"><div class="metric"><span>Aktivní</span><b>${desk.coverage.active}</b></div><div class="metric"><span>S marketem</span><b>${desk.coverage.withMarket}</b></div><div class="metric"><span>Ladder</span><b>${desk.coverage.withLadder}</b></div><div class="metric"><span>Safe best</span><b>${desk.coverage.withSafeBest}</b></div></div>${rows.map(r=>`<div class="card" style="margin-top:12px"><div style="display:flex;justify-content:space-between;gap:12px"><div><b>${h(r.name)}</b><div class="muted">${h(r.section)} · ${r.qty} ks · market ${money(r.marketEach)}/ks · ${r.days==null?'datum neznámý':`${r.days} dní`}</div></div>${r.best?`<div><b>${h(r.best.key)} · ${money(r.best.price)}</b><div class="muted">${h(r.best.band)} · ${pct(r.best.score)}</div></div>`:''}</div><div style="overflow:auto;margin-top:10px"><table><thead><tr><th>Scénář</th><th>Cena/ks</th><th>Sell score</th><th>Net payout</th><th>Guard</th></tr></thead><tbody>${r.ladder.map(x=>`<tr><td><b>${h(x.key)}</b></td><td>${money(x.price)}</td><td>${h(x.band)} · ${pct(x.score)}</td><td>${x.net?.ok?money(x.net.net):'NEZNÁMÝ'}</td><td>${badge(x.safety.code)}</td></tr>`).join('')}</tbody></table></div><div class="decision-note" style="margin-top:10px">${h(r.reason)}</div></div>`).join('')||'<div class="decision-note">Zatím chybí čerstvá market cena pro aktivní ticket.</div>'}`;
 host.appendChild(sec);
}
