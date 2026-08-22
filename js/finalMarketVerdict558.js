import {store} from './state.js';
import {h,modal} from './utils.js';
import {decisionConflict557} from './decisionConflict557.js';

const U=v=>String(v||'').toUpperCase();
const ACTIONABLE=new Set(['BUY','SELL','TRIM','REPRICE','LIST']);
const MAP={BUY:'BUY',HOLD:'HOLD',SELL:'SELL',TRIM:'SELL',REPRICE:'REPRICE',LIST:'REPRICE',REVIEW:'WAIT',WAIT:'WAIT'};
const rank={BUY:5,SELL:5,REPRICE:4,HOLD:2,WAIT:1,'DO NOT ACT YET':6};

function gate(x){
 const original=U(x.action),reasons=[];
 if(x.severity&&x.severity!=='OK')reasons.push(`${x.severity}: ${(x.conflicts||[]).join(' · ')||'konflikt mezi vrstvami'}`);
 if(x.readiness==='NEJDŘÍV OVĚŘIT')reasons.push('readiness blokuje akci');
 else if(x.readiness==='POČKAT / OVĚŘIT'&&ACTIONABLE.has(original))reasons.push('readiness vyžaduje ověření');
 if(ACTIONABLE.has(original)&&Number(x.confidence||0)<65)reasons.push(`confidence jen ${Number(x.confidence||0)} %`);
 const blocked=ACTIONABLE.has(original)&&reasons.length>0;
 const verdict=blocked?'DO NOT ACT YET':(MAP[original]||'WAIT');
 return{...x,originalAction:original,verdict,blocked,reasons,nextStep:blocked?'Obnov / ověř data a spusť verdikt znovu.':verdict==='WAIT'?'Počkej na nový signál.':verdict==='HOLD'?'Bez akce; dál drž a sleduj.':'Manuálně prověř a případnou akci proveď až po vlastní kontrole.'};
}

export function finalMarketVerdict558(s=store.get()){
 const started=performance.now(),conflict=decisionConflict557(s),rows=conflict.rows.map(gate).sort((a,b)=>rank[b.verdict]-rank[a.verdict]||b.confidence-a.confidence);
 const blocked=rows.filter(x=>x.blocked),actionable=rows.filter(x=>['BUY','SELL','REPRICE'].includes(x.verdict)),wait=rows.filter(x=>['WAIT','HOLD'].includes(x.verdict));
 const counts=rows.reduce((m,x)=>(m[x.verdict]=(m[x.verdict]||0)+1,m),{});
 const summary=blocked.length?`${blocked.length} kroků je zastavených finálním gate.`:actionable.length?`${actionable.length} kroků prošlo všemi rozhodovacími vrstvami.`:'Teď není žádná dostatečně podložená akce.';
 const result={rows,blocked,actionable,wait,counts,total:rows.length,summary,generatedAt:new Date().toISOString()};
 window.__KAMIL_FINAL_VERDICT_558_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),blocked:blocked.length,actionable:actionable.length};
 return result;
}

const cls=v=>v==='DO NOT ACT YET'?'bad':['BUY','SELL','REPRICE'].includes(v)?'good':'warn';
const row=x=>`<div class="intel-row"><div class="intel-main"><b>${h(x.name||x.ticker)}</b><span>${h([x.domain,`původně ${x.originalAction}`,x.reasons.length?x.reasons.join(' · '):x.nextStep].filter(Boolean).join(' · '))}</span></div><div class="row-actions"><span class="decision-action ${cls(x.verdict)}">${h(x.verdict)}</span><span class="status">${x.confidence}%</span></div></div>`;

export async function openFinalMarketVerdict558(){
 const x=finalMarketVerdict558(),body=`<div class="metric-strip"><div class="metric"><span>Akční</span><b class="good">${x.actionable.length}</b></div><div class="metric"><span>DO NOT ACT</span><b class="${x.blocked.length?'bad':'good'}">${x.blocked.length}</b></div><div class="metric"><span>Hold / wait</span><b>${x.wait.length}</b></div><div class="metric"><span>Celkem</span><b>${x.total}</b></div></div><div class="card"><div class="eyebrow">FINAL MARKET VERDICT 55.8</div><h2>${h(x.summary)}</h2><p>Akční verdikt projde jen při READY, confidence ≥ 65 % a bez konfliktu.</p></div><div class="card"><div class="eyebrow">FINÁLNÍ POŘADÍ</div>${x.rows.map(row).join('')||'<div class="empty">Bez market rozhodnutí.</div>'}</div><div class="decision-note">55.8 je finální rozhodovací filtr, ne exekuce. Nic automaticky nenakupuje, neprodává, nepřevádí ani nepřecenňuje.</div>`;
 return modal('XTB + vstupenky / Final Verdict 55.8',body,[{label:'Zavřít',value:null,primary:true}]);
}
