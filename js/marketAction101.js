import {store} from './state.js';
import {h,money} from './utils.js';
import {exactTodayPlan561} from './exactTodayPlan561.js';
import {xtbIntelligence100,ticketIntelligence100,capitalDecision100} from './marketIntelligence100.js';

const N=v=>Number(v||0),U=v=>String(v||'').toUpperCase(),A=v=>Array.isArray(v)?v:[];
const tone=v=>v==='ACT'?'good':v==='VERIFY'?'bad':'warn';
const verdict=x=>{const v=U(x?.verdict);if(['BUY','SELL','TRIM','REPRICE','LIST'].includes(v))return'ACT';if(v==='WAIT'||v==='HOLD')return'WAIT';return'VERIFY'};
const confidence=x=>Math.max(0,Math.min(100,Math.round(N(x?.confidence)||N(x?.priority)||50)));

export async function marketAction101(s=store.get()){
 const exact=exactTodayPlan561(s),xtb=xtbIntelligence100(s);let tickets=null;try{tickets=await ticketIntelligence100()}catch{}
 const amount=N(s.financePlan?.plannedInvestment)||25000,capital=capitalDecision100(s,amount,tickets?.ok?tickets:null),actions=[];
 for(const x of exact.now)actions.push({domain:x.domain||'MARKET',title:x.instruction||x.name||x.ticker||'Market krok',detail:x.capitalEffect||x.detail||'',mode:'ACT',confidence:confidence(x),amount:x.capitalAmount||null,currency:x.capitalCurrency||null,source:'Exact Today Plan'});
 for(const x of exact.verify)actions.push({domain:x.domain||'MARKET',title:x.instruction||x.name||x.ticker||'Ověřit market krok',detail:x.capitalEffect||x.detail||x.nextStep||'',mode:'VERIFY',confidence:confidence(x),amount:null,currency:null,source:'Exact Today Plan'});
 const topXtb=A(xtb.positions).slice().sort((a,b)=>N(b.opportunity)-N(a.opportunity))[0];if(topXtb&&!actions.some(x=>x.domain==='XTB'))actions.push({domain:'XTB',title:`${topXtb.ticker} · ${topXtb.action}`,detail:`${topXtb.reason} · opportunity ${topXtb.opportunity}/100 · ${topXtb.profitProtect}`,mode:verdict({verdict:topXtb.action}),confidence:topXtb.confidence,source:'XTB 100'});
 const locked=tickets?.ok?A(tickets.rows).slice().sort((a,b)=>N(b.lockScore)-N(a.lockScore))[0]:null;if(locked&&!actions.some(x=>x.domain==='TICKETS'))actions.push({domain:'TICKETS',title:`${locked.name} · ${locked.recommendation}`,detail:`Demand ${locked.demand}/100 · sell probability ${locked.sellProbability}% · capital lock ${locked.lockScore}/100${locked.floor?` · floor ${money(locked.floor)}`:''}`,mode:locked.lockScore>=70?'VERIFY':'WAIT',confidence:locked.confidence||50,source:'Tickets 100'});
 actions.sort((a,b)=>({ACT:3,VERIFY:2,WAIT:1}[b.mode]-{ACT:3,VERIFY:2,WAIT:1}[a.mode])||b.confidence-a.confidence);
 const blockers=actions.filter(x=>x.mode==='VERIFY').length,acts=actions.filter(x=>x.mode==='ACT').length,waits=actions.filter(x=>x.mode==='WAIT').length;
 return{actions:actions.slice(0,8),acts,blockers,waits,exact,xtb,tickets,capital,generatedAt:new Date().toISOString(),headline:acts?`${acts} market ${acts===1?'krok':'kroky'} připravené dnes`:blockers?`Nejdřív ověř ${blockers} market ${blockers===1?'blokaci':'blokace'}`:'Dnes nic na trhu nemusíš dělat'};
}

const row=x=>`<div class="row ux64-row"><div><b>${h(x.domain)} · ${h(x.title)}</b><div class="muted">${h(x.detail||'Bez dalšího zásahu.')}</div><div class="muted">${h(x.source)} · confidence ${x.confidence}/100</div></div><span class="decision-action ${tone(x.mode)}">${x.mode==='ACT'?'UDĚLAT':x.mode==='VERIFY'?'OVĚŘIT':'ČEKAT'}</span></div>`;
export async function appendMarketAction101(host=document.querySelector('#todayView')){
 if(!host||host.querySelector('[data-market101]'))return;const x=await marketAction101(),sec=document.createElement('section');sec.dataset.market101='1';sec.className='card';sec.innerHTML=`<div class="eyebrow">MARKET ACTION CENTER 101</div><h2>${h(x.headline)}</h2><p class="muted">Jedna dnešní fronta pro XTB + vstupenky. Nic automaticky neobchoduje; ukazuje jen kroky, které dávají smysl z aktuálně uložených dat.</p><div class="metric-strip"><div class="metric"><span>Udělat</span><b>${x.acts}</b></div><div class="metric"><span>Ověřit</span><b>${x.blockers}</b></div><div class="metric"><span>Čekat</span><b>${x.waits}</b></div><div class="metric"><span>Top kapitál</span><b>${h(x.capital?.top?.key||'HOTOVOST')}</b></div></div>${x.actions.map(row).join('')||'<div class="empty success-empty">Žádná market akce dnes není nutná.</div>'}<div class="decision-note"><b>Další nový kapitál:</b> ${h(x.capital?.top?.key||'HOTOVOST')} · score ${N(x.capital?.top?.score)}/100 · ${h(x.capital?.top?.reason||'čekat na lepší příležitost')}</div>`;
 const anchor=host.querySelector('.ux65-context')||host.querySelector('.ux65-quick')||host.firstElementChild;if(anchor)anchor.before(sec);else host.prepend(sec);window.__KAMIL_MARKET101__=x;
}
