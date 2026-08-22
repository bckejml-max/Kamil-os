import {store} from './state.js';
import {h,modal} from './utils.js';
import {xtbExecutionReadiness,ticketExecutionReadiness} from './executionReadiness555.js';

const clamp=v=>Math.max(0,Math.min(100,Math.round(Number(v||0))));
const label=s=>s>=85?'VYSOKÁ':s>=65?'STŘEDNÍ':s>=45?'NÍZKÁ':'VELMI NÍZKÁ';
const cls=s=>s>=85?'good':s>=65?'warn':'bad';

function xtbScore(x){
 let score=100;
 if(x.ageHours===null)score-=45; else if(x.ageHours>72)score-=50; else if(x.ageHours>36)score-=20; else if(x.ageHours>12)score-=7;
 score-=Math.min(60,(x.blockers?.length||0)*30);
 score-=Math.min(30,(x.warnings?.length||0)*10);
 if(['BUY','TRIM','SELL'].includes(x.action)&&!x.size)score-=20;
 if(/chybí|blokovan|ověřit/i.test(x.fx||''))score-=10;
 return clamp(score);
}

function ticketScore(x){
 let score=Math.min(100,Math.max(0,Number(x.dataQuality||0)));
 if(x.marketAgeHours===null)score-=30; else if(x.marketAgeHours>24)score-=35; else if(x.marketAgeHours>8)score-=15; else if(x.marketAgeHours<=4)score+=5;
 if(x.days===null)score-=10; else if(x.days<=3)score-=5;
 score-=Math.min(60,(x.blockers?.length||0)*25);
 score-=Math.min(30,(x.warnings?.length||0)*8);
 if(!x.market&&['SELL','REPRICE','LIST','TRIM'].includes(x.action))score-=15;
 return clamp(score);
}

export function marketConfidence556(s=store.get()){
 const started=performance.now();
 const xtb=xtbExecutionReadiness(s).map(x=>{const confidence=xtbScore(x);return{...x,confidence,confidenceLabel:label(confidence)}});
 const tickets=ticketExecutionReadiness(s).map(x=>{const confidence=ticketScore(x);return{...x,confidence,confidenceLabel:label(confidence)}});
 const all=[...xtb,...tickets].sort((a,b)=>b.confidence-a.confidence||b.priority-a.priority);
 const avg=all.length?Math.round(all.reduce((a,x)=>a+x.confidence,0)/all.length):0;
 const high=all.filter(x=>x.confidence>=85).length,low=all.filter(x=>x.confidence<65).length;
 const result={xtb,tickets,all,average:avg,high,low,total:all.length,summary:!all.length?'Chybí aktuální market rozhodnutí.':low?`${low} doporučení má nízkou datovou důvěru.`:`Datová důvěra je celkově ${label(avg).toLowerCase()}.`,generatedAt:new Date().toISOString()};
 window.__KAMIL_CONFIDENCE_556_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),average:avg,high,low};
 return result;
}

const row=x=>`<div class="intel-row"><div class="intel-main"><b>${h(x.name||x.ticker)}</b><span>${h([x.kind,x.action,x.readiness,...(x.blockers||[]),...(x.warnings||[])].filter(Boolean).join(' · '))}</span></div><div class="row-actions"><span class="decision-action ${cls(x.confidence)}">${x.confidence} %</span><span class="status">${h(x.confidenceLabel)}</span></div></div>`;

export async function openMarketConfidence556(){
 const x=marketConfidence556();
 const body=`<div class="metric-strip"><div class="metric"><span>Průměr confidence</span><b class="${cls(x.average)}">${x.average} %</b></div><div class="metric"><span>Vysoká</span><b class="good">${x.high}</b></div><div class="metric"><span>Pod 65 %</span><b class="${x.low?'bad':'good'}">${x.low}</b></div><div class="metric"><span>Celkem</span><b>${x.total}</b></div></div><div class="card"><div class="eyebrow">MARKET DATA CONFIDENCE 55.6</div><h2>${h(x.summary)}</h2><p>Confidence měří kvalitu uložených dat, ne pravděpodobnost zisku.</p></div><div class="card"><div class="eyebrow">NEJDŮVĚRYHODNĚJŠÍ DOPORUČENÍ</div>${x.all.slice(0,8).map(row).join('')||'<div class="empty">Bez market dat.</div>'}</div><div class="decision-note">55.6 je pouze datová vrstva. Vyšší confidence neznamená jistý výnos a nic automaticky neobchoduje, neprodává ani nepřecenňuje.</div>`;
 const choice=await modal('XTB + vstupenky / Confidence 55.6',body,[{label:'Konflikty 55.7',value:'conflicts',primary:true},{label:'Zavřít',value:null}]);
 if(choice==='conflicts'){const m=await import('./decisionConflict557.js');return m.openDecisionConflict557()}
 return choice;
}
