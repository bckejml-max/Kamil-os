import {store} from './state.js';
import {h,money,modal} from './utils.js';
import {xtbTradePlanner} from './xtbPlanner24.js';
import {ticketDecision} from './live24.js';
import {ticketDataQuality32} from './ticketTuning32.js';

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(v||0);
const U=v=>String(v||'').toUpperCase();
const first=(...v)=>v.find(x=>x!==undefined&&x!==null&&x!=='')??null;
const ageHours=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.max(0,(Date.now()-t)/3600000):null};
const daysTo=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.ceil((t-Date.now())/86400000):null};
const active=x=>['HOLD','LISTED'].includes(U(x?.workflow||'HOLD'));
const fee=x=>{const f=N(first(x?.feeRate,.12));return f>=0&&f<1?f:.12};
const qty=x=>Math.max(1,N(first(x?.qty,x?.quantity,1))||1);
const unitBuy=x=>{const b=N(first(x?.buy,x?.cost)),q=qty(x);return b>0?b/q:0};
const market=x=>N(first(x?.marketPrice,x?.listPrice,x?.price));
const due=x=>first(x?.sellBy,x?.eventDate,x?.date,x?.due,x?.dueAt);

function status(blockers=[],warnings=[]){if(blockers.length)return 'NEJDŘÍV OVĚŘIT';if(warnings.length)return 'POČKAT / OVĚŘIT';return 'READY'}

export function xtbExecutionReadiness(s=store.get()){
 const planner=xtbTradePlanner(s),asOf=first(s.xtbReport?.asOf,s.xtbHub?.asOf),age=ageHours(asOf),positions=A(s.xtbReport?.positions),byTicker=new Map(positions.map(p=>[U(first(p.ticker,p.symbol,p.name)),p]));
 return planner.plans.map(p=>{const raw=byTicker.get(U(p.ticker))||{},blockers=[],warnings=[];if(age===null)blockers.push('chybí datum XTB importu');else if(age>72)blockers.push(`XTB data jsou ${Math.round(age)} h stará`);else if(age>36)warnings.push(`XTB data jsou ${Math.round(age)} h stará`);if(!p.qty&&!p.amount&&['BUY','TRIM','SELL'].includes(U(p.action)))blockers.push('chybí spolehlivá velikost kroku');if(/chybí|blokovan|ověřit/i.test(p.fx||''))warnings.push(p.fx);const w=N(first(raw.weightPct,raw.weight));if(U(p.action)==='BUY'&&w>=12)blockers.push(`pozice už má ${w}% portfolia`);else if(U(p.action)==='BUY'&&w>=10)warnings.push(`pozice má ${w}% portfolia`);const e=daysTo(first(raw.earningsDate,s.xtbStrategy?.earnings?.[p.ticker]?.date));if(U(p.action)==='BUY'&&e!==null&&e>=0&&e<=3)blockers.push(`výsledky za ${e} d`);else if(U(p.action)==='BUY'&&e!==null&&e<=7&&e>=0)warnings.push(`výsledky za ${e} d`);const readiness=status(blockers,warnings);return{kind:'XTB',ticker:p.ticker,name:p.name||p.ticker,action:U(p.action),readiness,blockers,warnings,ageHours:age,size:p.qty?`${p.qty} ks`:p.amount?`cca ${money(p.amount)}`:'',priority:N(p.priority),reason:p.reason||'',fx:p.fx||''}}).sort((a,b)=>({READY:0,'POČKAT / OVĚŘIT':1,'NEJDŘÍV OVĚŘIT':2}[b.readiness]-({READY:0,'POČKAT / OVĚŘIT':1,'NEJDŘÍV OVĚŘIT':2}[a.readiness]))||b.priority-a.priority);
}

export function ticketExecutionReadiness(s=store.get()){
 return A(s.ticketBook?.items).filter(active).map(x=>{const d=ticketDecision(x,s),blockers=[],warnings=[],quality=ticketDataQuality32(x),m=market(x),checked=ageHours(first(x.marketCheckedAt,x.marketUpdatedAt,x.priceCheckedAt)),days=daysTo(due(x)),floor=unitBuy(x)>0?Math.ceil(unitBuy(x)/(1-fee(x))):0,action=U(d.action||'HOLD');if(['SELL','REPRICE','LIST','TRIM'].includes(action)||days!==null&&days<=14){if(!m)blockers.push('chybí aktuální market cena');if(checked===null)blockers.push('chybí čas kontroly market ceny');else if(checked>24)blockers.push(`market cena je ${Math.round(checked)} h stará`);else if(checked>8)warnings.push(`market cena je ${Math.round(checked)} h stará`)}if(quality.score<50)blockers.push(`kvalita ticket dat jen ${quality.score}/100`);else if(quality.score<70)warnings.push(`kvalita ticket dat ${quality.score}/100`);if(m&&floor&&m<floor)warnings.push(`trh ${money(m)} je pod floor ${money(floor)}`);if(days===null)warnings.push('chybí prodejní deadline / datum akce');const readiness=status(blockers,warnings);return{kind:'Vstupenky',id:x.id,name:x.name||'Vstupenka',action,readiness,blockers,warnings,market:m||null,floor,days,marketAgeHours:checked,dataQuality:quality.score,reason:d.reason||''}}).sort((a,b)=>({READY:0,'POČKAT / OVĚŘIT':1,'NEJDŘÍV OVĚŘIT':2}[b.readiness]-({READY:0,'POČKAT / OVĚŘIT':1,'NEJDŘÍV OVĚŘIT':2}[a.readiness]))||(a.days??999)-(b.days??999));
}

export function executionReadiness555(s=store.get()){
 const started=performance.now(),xtb=xtbExecutionReadiness(s),tickets=ticketExecutionReadiness(s),all=[...xtb,...tickets],ready=all.filter(x=>x.readiness==='READY').length,blocked=all.filter(x=>x.readiness==='NEJDŘÍV OVĚŘIT').length,wait=all.length-ready-blocked;const result={xtb,tickets,ready,blocked,wait,total:all.length,summary:blocked?`${blocked} kroků je blokovaných chybějícími nebo starými daty.`:wait?`${wait} kroků chce ještě ověřit.`:'Navržené kroky mají dostatečná data k ručnímu provedení.',generatedAt:new Date().toISOString()};window.__KAMIL_READINESS_555_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),ready,blocked,wait};return result;
}

const row=x=>`<div class="intel-row"><div class="intel-main"><b>${h(x.name)}</b><span>${h([x.action,...x.blockers,...x.warnings].filter(Boolean).join(' · '))}</span></div><div class="row-actions"><span class="decision-action ${x.readiness==='READY'?'good':x.readiness==='NEJDŘÍV OVĚŘIT'?'bad':'warn'}">${h(x.readiness)}</span>${x.size?`<span class="status">${h(x.size)}</span>`:''}</div></div>`;

export async function openExecutionReadiness555(){
 const x=executionReadiness555(),body=`<div class="metric-strip"><div class="metric"><span>READY</span><b class="good">${x.ready}</b></div><div class="metric"><span>Ověřit</span><b class="warn">${x.wait}</b></div><div class="metric"><span>Blokované</span><b class="${x.blocked?'bad':'good'}">${x.blocked}</b></div><div class="metric"><span>Celkem</span><b>${x.total}</b></div></div><div class="card"><div class="eyebrow">EXECUTION READINESS 55.5</div><h2>${h(x.summary)}</h2></div><div class="card"><div class="eyebrow">XTB</div>${x.xtb.map(row).join('')||'<div class="empty">Žádný aktuální XTB krok.</div>'}</div><div class="card"><div class="eyebrow">VSTUPENKY</div>${x.tickets.map(row).join('')||'<div class="empty">Žádné aktivní vstupenky.</div>'}</div><div class="decision-note">55.5 nic neobchoduje ani nepřecenňuje. READY znamená pouze to, že uložená data neobsahují známý blocker; finální akci vždy provádíš ty.</div>`;
 const choice=await modal('XTB + vstupenky / Execution Readiness 55.5',body,[{label:'Confidence 55.6',value:'confidence',primary:true},{label:'Zavřít',value:null}]);
 if(choice==='confidence'){const m=await import('./marketConfidence556.js');return m.openMarketConfidence556()}
}
