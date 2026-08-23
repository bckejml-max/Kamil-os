import {store} from './state.js';
import {h,modal} from './utils.js';
import {bestNextMove565} from './bestNextMove565.js';
import {applyVirtualAction566} from './actionSequence566.js';
import {ticketInventoryRisk} from './marketSuite554.js';

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(v||0);
const U=v=>String(v||'').toUpperCase();
const clone=v=>typeof structuredClone==='function'?structuredClone(v):JSON.parse(JSON.stringify(v));
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,N(v)));
const round=(v,d=1)=>{const k=10**d;return Math.round(N(v)*k)/k};
const actionable=x=>['BUY','SELL','REPRICE'].includes(U(x?.verdict));
const ticker=x=>U(x?.ticker||x?.symbol||x?.name||'');
const valueCzk=x=>N(x?.valueCZK||x?.valueCzk||x?.marketValueCZK||x?.marketValueCzk||x?.czkValue);

function xtbRisk(s){
 const total=N(s.xtbReport?.czkValue),rows=A(s.xtbReport?.positions),weights=[];
 for(const p of rows){
  const explicit=N(p.weightPct||p.weight),v=valueCzk(p),w=explicit||((total>0&&v>0)?v/total*100:0);
  if(w>0)weights.push({ticker:ticker(p),weight:round(w)});
 }
 weights.sort((a,b)=>b.weight-a.weight);
 const top=weights[0]||null,w=N(top?.weight),score=top?clamp(w>=20?100:w>=15?85:w>=12?70:w>=10?50:w*4):null;
 return{known:!!top,topTicker:top?.ticker||null,topWeight:top?.weight??null,score:score===null?null:round(score)};
}

function ticketRisk(s){
 const rows=ticketInventoryRisk(s),scores=rows.map(x=>N(x.score)),max=scores.length?Math.max(...scores):0,avg=scores.length?round(scores.reduce((a,b)=>a+b,0)/scores.length):0,capital=rows.reduce((a,x)=>a+N(x.capital),0);
 return{max:round(max),avg,capital:round(capital),active:rows.length,high:rows.filter(x=>N(x.score)>=75).length};
}

export function sequenceRiskSnapshot567(s){
 const xtb=xtbRisk(s),tickets=ticketRisk(s),parts=[];
 if(xtb.score!==null)parts.push({w:.55,v:xtb.score});
 parts.push({w:.45,v:tickets.max});
 const wsum=parts.reduce((a,x)=>a+x.w,0)||1,overall=round(parts.reduce((a,x)=>a+x.w*x.v,0)/wsum);
 return{overall,xtb,tickets};
}

export function riskGate567(base,before,after,allowance=0){
 const budget=Math.max(0,Math.min(20,N(allowance))),ceiling=N(base.overall)+budget,delta=round(N(after.overall)-N(before.overall)),fromBase=round(N(after.overall)-N(base.overall)),reasons=[];
 if(after.xtb?.known&&before.xtb?.known&&N(after.xtb.topWeight)>N(before.xtb.topWeight)+.5)reasons.push(`XTB top koncentrace roste ${before.xtb.topWeight}% → ${after.xtb.topWeight}%`);
 if(N(after.xtb?.topWeight)>=12&&N(after.xtb?.topWeight)>N(before.xtb?.topWeight))reasons.push('XTB krok zvyšuje vysokou koncentraci');
 if(N(after.tickets?.max)>N(before.tickets?.max))reasons.push(`ticket max risk roste ${before.tickets.max} → ${after.tickets.max}`);
 if(N(after.tickets?.capital)>N(before.tickets?.capital))reasons.push('roste ticket kapitál v riziku');
 if(N(after.overall)>ceiling+.01)reasons.push(`celkové risk score ${after.overall} překračuje budget ceiling ${round(ceiling)}`);
 const hard=reasons.some(x=>/vysokou koncentraci|ticket max risk|kapitál v riziku/i.test(x)),allowed=!hard&&N(after.overall)<=ceiling+.01;
 return{allowed,budget,ceiling:round(ceiling),delta,fromBase,reasons};
}

export function sequenceRiskBudget567(s=store.get(),limit=3){
 const started=performance.now(),virtual=clone(s),base=sequenceRiskSnapshot567(virtual),allowance=clamp(s.marketRiskBudget?.sequenceIncrease,0,20),done=new Set(),steps=[];let blocked=null,stopReason='';
 const max=Math.max(1,Math.min(5,Number(limit)||3));
 for(let guard=0;guard<12&&steps.length<max;guard++){
  const ranked=bestNextMove565(virtual),candidate=A(ranked.rows).find(x=>actionable(x)&&!done.has(x.key));
  if(!candidate)break;done.add(candidate.key);
  const before=sequenceRiskSnapshot567(virtual),trial=clone(virtual),applied=applyVirtualAction566(trial,candidate);
  if(!applied.ok){blocked={candidate,before,after:null,gate:null,reason:applied.note};stopReason=applied.note;break}
  const after=sequenceRiskSnapshot567(trial),gate=riskGate567(base,before,after,allowance);
  if(!gate.allowed){blocked={candidate,before,after,gate,reason:gate.reasons.join(' · ')||'Další krok překračuje risk budget.'};stopReason=blocked.reason;break}
  Object.keys(virtual).forEach(k=>delete virtual[k]);Object.assign(virtual,trial);
  steps.push({...candidate,sequence:steps.length+1,recalcNote:applied.note,riskBefore:before,riskAfter:after,riskGate:gate});
 }
 const finalRisk=sequenceRiskSnapshot567(virtual),saved=round(base.overall-finalRisk.overall),summary=steps.length?`Risk-budget sekvence má ${steps.length} bezpečné ${steps.length===1?'krok':'kroky'}; po každém se riziko znovu přepočítá.`:'Teď není krok, který by prošel risk budgetem.';
 const result={steps,blocked,stopReason,baseRisk:base,finalRisk,allowance,ceiling:round(base.overall+allowance),saved,summary,total:steps.length,generatedAt:new Date().toISOString()};
 window.__KAMIL_SEQUENCE_RISK_567_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),steps:steps.length,blocked:!!blocked,base:base.overall,final:finalRisk.overall};return result;
}

const stepRow=x=>`<div class="intel-row"><div class="intel-main"><b>${h(`${x.sequence}. ${x.instruction||x.name||x.ticker}`)}</b><span>${h(`risk ${x.riskBefore.overall} → ${x.riskAfter.overall} · Δ ${x.riskGate.delta>0?'+':''}${x.riskGate.delta} · ${x.recalcNote}`)}</span></div><div class="row-actions"><span class="decision-action good">PROJDE</span></div></div>`;

export async function openSequenceRiskBudget567(){
 const x=sequenceRiskBudget567(),body=`<div class="metric-strip"><div class="metric"><span>Risk start</span><b>${x.baseRisk.overall}</b></div><div class="metric"><span>Risk po sekvenci</span><b class="${x.finalRisk.overall<=x.baseRisk.overall?'good':'warn'}">${x.finalRisk.overall}</b></div><div class="metric"><span>Budget ceiling</span><b>${x.ceiling}</b></div><div class="metric"><span>Kroky</span><b>${x.total}</b></div></div><div class="card"><div class="eyebrow">SEQUENCE RISK BUDGET 56.7</div><h2>${h(x.summary)}</h2><p>Defaultní allowance je 0 bodů: sekvence nesmí skončit s vyšším celkovým risk score než začala. Předchozí risk-reducing krok může vytvořit prostor pro další krok, ale strop se nepřekročí.</p></div><div class="card"><div class="eyebrow">BEZPEČNÁ SEKQUENCE</div>${x.steps.map(stepRow).join('')||'<div class="empty success-empty">Žádný bezpečný krok není nutný.</div>'}</div>${x.blocked?`<div class="card"><div class="eyebrow">SEKVENCE ZKRÁCENA</div><p><b>${h(x.blocked.candidate?.instruction||x.blocked.candidate?.name||'Další krok')}</b></p><p>${h(x.blocked.reason)}</p></div>`:''}<div class="decision-note">56.7 je pouze konzervativní risk gate nad virtuální sekvencí. Nic nezapisuje, nenakupuje, neprodává ani nepřecenňuje. Risk score je interní heuristika pro pořadí a bezpečnost sekvence, ne predikce ztráty.</div>`;
 return modal('XTB + vstupenky / Sequence Risk Budget 56.7',body,[{label:'Zavřít',value:null,primary:true}]);
}
