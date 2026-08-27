import {loadTicketCloud660} from './ticketCloud660.js';
import {h,money} from './utils.js';
import {buildTicketNetDesk192} from './ticketPayoutLearningModel192.js';

const pct=v=>v==null?'—':`${Math.round(v*1000)/10}%`;
function estimateLine(label,e){
 if(!e?.ok)return `<div class="muted"><b>${h(label)}</b> · payout zatím NEZNÁMÝ</div>`;
 return `<div><b>${h(label)}</b> · odhad net ${money(e.net)} <span class="muted">(${pct(e.ratio)} z gross · ${h(e.samples)} vzorek/vzorky · ${h(e.confidence)})</span></div>`;
}

export async function appendTicketPayoutLearning192(host=document.querySelector('#ticketIntelView')){
 if(!host||host.querySelector('[data-ticket-payout-learning192]'))return;
 const cloud=await loadTicketCloud660();if(!cloud?.ok)return;
 const desk=buildTicketNetDesk192(cloud.inventory||[]),learn=desk.learning;
 const sec=document.createElement('section');sec.dataset.ticketPayoutLearning192='1';sec.className='card';sec.style.margin='18px 0';
 const marketRows=Object.entries(learn.byMarket||{}).filter(([,v])=>v?.count).map(([market,v])=>`<div class="row"><span><b>${h(market)}</b><div class="muted">${v.count} skutečných payout vzorků</div></span><div><b>${pct(v.ratio)} payout/gross</b><div class="muted">medián fee ${pct(v.feeRate)} · ${h(v.confidence)}</div></div></div>`).join('');
 const active=desk.rows.filter(x=>x.askEach).slice(0,10);
 sec.innerHTML=`<div class="eyebrow">OS 192 · NET PAYOUT LEARNING</div><h2>Kolik opravdu čekat na účet</h2><p class="muted">OS se učí jen ze skutečných uzavřených prodejů. Bez historie fee ani payout nevymýšlí.</p><div class="metric-strip"><div class="metric"><span>Payout vzorky</span><b>${learn.totalSamples}</b></div><div class="metric"><span>Známý market</span><b>${learn.knownMarketSamples}</b></div><div class="metric"><span>Globální payout poměr</span><b>${learn.global?.count?pct(learn.global.ratio):'NEZNÁMÝ'}</b></div></div>${marketRows||'<div class="decision-note">Zatím chybí uzavřený prodej se skutečným payoutem nebo marketplace fee. První takový záznam začne model učit.</div>'}${active.length?`<div class="eyebrow" style="margin-top:14px">AKTIVNÍ ODHADY</div>${active.map(v=>`<div class="card" style="margin-top:10px;padding:12px"><b>${h(v.name)}</b><div class="muted">${h(v.section)} · ${v.qty} ks · ask ${money(v.askEach)}/ks</div>${estimateLine('Viagogo',v.viagogo)}${estimateLine('StubHub',v.stubhub)}</div>`).join('')}`:''}`;
 host.appendChild(sec);
}
