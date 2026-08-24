import {h,money} from './utils.js';
import {capitalCommander671,fulfillmentCommander671,officialSpread671,oneDailyDecision671,profitReality671,ticketRisk671} from './ticketDecisionEngine671.js';

const n=x=>Number(x||0);
const pct=x=>Number.isFinite(Number(x))?`${Math.round(Number(x)*100)} %`:'—';
const latest=(cloud,id)=>cloud.latest?.get(id)||null;
const riskTone=score=>score>=75?'critical':score>=50?'warning':'success';

export function ticketDecisionSummaryHtml671(cloud){
 const daily=oneDailyDecision671(cloud),capital=capitalCommander671(cloud,30000),flow=fulfillmentCommander671(cloud),active=cloud.inventory.filter(x=>['LISTED','NOT_LISTED'].includes(x.market_status));
 const risks=active.map(row=>({row,risk:ticketRisk671(cloud,row)})).sort((a,b)=>b.risk.score-a.risk.score),high=risks.filter(x=>x.risk.score>=75).length,mid=risks.filter(x=>x.risk.score>=50&&x.risk.score<75).length;
 const release=capital.picks.slice(0,4).map(x=>`<div class="row"><span>${h(x.row.event_name)}</span><b>${money(x.liquidity)} · riziko ${x.risk.score}/100</b></div>`).join('');
 return `<div class="card"><div class="eyebrow">DECISION ENGINE 67.1</div><h2>Jedno rozhodnutí pro dnešek</h2>${daily?`<div class="row"><div><b>${h(daily.event)}</b><div class="muted">${h(daily.reason)}</div></div><span class="tmw-rec ${riskTone(daily.risk)}">${h(daily.label)}</span></div>`:'<p class="muted">Nemáš aktivní ticketovou pozici, která potřebuje rozhodnutí.</p>'}<div class="metric-strip ti66-metrics"><div class="metric"><span>Vysoké riziko</span><b>${high}</b></div><div class="metric"><span>Střední riziko</span><b>${mid}</b></div><div class="metric"><span>Doručit</span><b>${flow.deliverQty} ks</b></div><div class="metric"><span>Čeká payout</span><b>${money(flow.payoutCzk)}</b></div></div></div><div class="card"><div class="eyebrow">CAPITAL COMMANDER</div><h3>Jak uvolnit cca 30 000 Kč</h3><div class="row"><span>Odhad uvolnitelné hodnoty vybraných pozic</span><b>${money(capital.freed)}</b></div><div class="row"><span>Kapitál v aktivních pozicích</span><b>${money(capital.locked)}</b></div>${release||'<p class="muted">Není co navrhovat.</p>'}<p class="muted">Je to pořadí kandidátů k rozhodnutí, ne automatický pokyn k prodeji.</p></div>`;
}

export function ticketDecisionRowHtml671(cloud,row,snap=latest(cloud,row.id)){
 if(!['LISTED','NOT_LISTED'].includes(row.market_status))return'';
 const risk=ticketRisk671(cloud,row),spread=officialSpread671(snap),reality=profitReality671(row,snap),vel=risk.velocity;
 return `<div class="ti67-decision"><div class="row"><span>Risk Score</span><b>${risk.score}/100 · ${h(risk.label)}</b></div><div class="row"><span>Sell-through</span><b>${vel.score}/100 · ${h(vel.label)}</b></div>${spread?`<div class="row"><span>Secondary vs. oficiál</span><b>${spread.czk>=0?'+':''}${money(spread.czk)} · ${pct(spread.pct)}</b></div>`:''}${reality?`<div class="row"><span>Modelový profit před zadanými fee</span><b>${money(reality.net)} · ROI ${pct(reality.roi)}</b></div>`:''}</div>`;
}
