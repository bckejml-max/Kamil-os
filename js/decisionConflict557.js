import {store} from './state.js';
import {h,modal} from './utils.js';
import {marketConfidence556} from './marketConfidence556.js';
import {xtbConcentrationGuard,xtbEarningsRisk,ticketInventoryRisk} from './marketSuite554.js';

const U=v=>String(v||'').toUpperCase();
const actionable=a=>['BUY','SELL','TRIM','REPRICE','LIST'].includes(U(a));
const severityRank={KRITICKÝ:3,KONFLIKT:2,VAROVÁNÍ:1,OK:0};

export function decisionConflict557(s=store.get()){
 const started=performance.now(),c=marketConfidence556(s),guard=new Map(xtbConcentrationGuard(s).map(x=>[U(x.ticker),x])),earn=new Map(xtbEarningsRisk(s).map(x=>[U(x.ticker),x])),ticketRisk=new Map(ticketInventoryRisk(s).map(x=>[x.id,x]));
 const rows=[];
 for(const x of c.xtb){
  const conflicts=[],g=guard.get(U(x.ticker)),e=earn.get(U(x.ticker));
  if(actionable(x.action)&&x.readiness==='NEJDŘÍV OVĚŘIT')conflicts.push('akční verdikt je blokovaný readiness vrstvou');
  if(U(x.action)==='BUY'&&g?.status==='STOP PŘIKUPOVÁNÍ')conflicts.push(`BUY vs. koncentrace ${g.weight}%`);
  if(U(x.action)==='BUY'&&e?.risk==='VYSOKÉ')conflicts.push(`BUY vs. výsledky za ${e.days} d`);
  if(actionable(x.action)&&x.confidence<65)conflicts.push(`${x.action} vs. confidence jen ${x.confidence}%`);
  const severity=conflicts.length>=2?'KRITICKÝ':conflicts.length===1?'KONFLIKT':'OK';
  rows.push({...x,domain:'XTB',conflicts,severity,resolution:conflicts.length?'Neprovádět krok jako jednoznačný. Nejdřív vyřešit konflikt / obnovit data.':'Bez známého konfliktu mezi vrstvami.'});
 }
 for(const x of c.tickets){
  const conflicts=[],r=ticketRisk.get(x.id);
  if(actionable(x.action)&&x.readiness==='NEJDŘÍV OVĚŘIT')conflicts.push('prodejní verdikt je blokovaný readiness vrstvou');
  if(actionable(x.action)&&x.confidence<65)conflicts.push(`${x.action} vs. confidence jen ${x.confidence}%`);
  if(U(x.action)==='SELL'&&r?.score>=75&&x.readiness!=='READY')conflicts.push(`SELL vs. vysoké inventory risk ${r.score}/100 a neověřená data`);
  if(U(x.action)==='REPRICE'&&x.marketAgeHours>8)conflicts.push(`repricing vs. market cena stará ${Math.round(x.marketAgeHours)} h`);
  const severity=conflicts.length>=2?'KRITICKÝ':conflicts.length===1?'KONFLIKT':'OK';
  rows.push({...x,domain:'Vstupenky',conflicts,severity,resolution:conflicts.length?'Nejdřív ověřit cenu/data; repricing nebo prodej nebrat jako finální verdikt.':'Bez známého konfliktu mezi vrstvami.'});
 }
 rows.sort((a,b)=>severityRank[b.severity]-severityRank[a.severity]||a.confidence-b.confidence);
 const conflicts=rows.filter(x=>x.severity!=='OK'),critical=rows.filter(x=>x.severity==='KRITICKÝ').length;
 const result={rows,conflicts,critical,total:rows.length,clear:rows.length-conflicts.length,summary:critical?`${critical} kritické konflikty blokují jednoznačný verdikt.`:conflicts.length?`${conflicts.length} doporučení má konflikt mezi rozhodovacími vrstvami.`:'Rozhodovací vrstvy si aktuálně zásadně neodporují.',generatedAt:new Date().toISOString()};
 window.__KAMIL_CONFLICT_557_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),critical,conflicts:conflicts.length};
 return result;
}

const row=x=>`<div class="intel-row"><div class="intel-main"><b>${h(x.name||x.ticker)}</b><span>${h(x.conflicts.length?x.conflicts.join(' · '):x.resolution)}</span></div><div class="row-actions"><span class="decision-action ${x.severity==='OK'?'good':x.severity==='KRITICKÝ'?'bad':'warn'}">${h(x.severity)}</span><span class="status">${x.confidence}%</span></div></div>`;

export async function openDecisionConflict557(){
 const x=decisionConflict557(),body=`<div class="metric-strip"><div class="metric"><span>Kritické</span><b class="${x.critical?'bad':'good'}">${x.critical}</b></div><div class="metric"><span>Konflikty</span><b class="${x.conflicts.length?'warn':'good'}">${x.conflicts.length}</b></div><div class="metric"><span>Bez konfliktu</span><b class="good">${x.clear}</b></div><div class="metric"><span>Celkem</span><b>${x.total}</b></div></div><div class="card"><div class="eyebrow">DECISION CONFLICT DETECTOR 55.7</div><h2>${h(x.summary)}</h2><p>Konflikt znamená, že dvě rozhodovací vrstvy dávají neslučitelné signály. V takovém případě se akce nemá brát jako jednoznačná.</p></div><div class="card"><div class="eyebrow">KONFLIKTY</div>${x.conflicts.map(row).join('')||'<div class="empty success-empty">Žádný známý konflikt.</div>'}</div><div class="card"><div class="eyebrow">VŠECHNY VERDIKTY</div>${x.rows.map(row).join('')||'<div class="empty">Bez market rozhodnutí.</div>'}</div><div class="decision-note">55.7 nic automaticky neobchoduje, neprodává ani nepřecenňuje. Konflikt pouze snižuje jistotu verdiktu a říká, co nejdřív ověřit.</div>`;
 return modal('XTB + vstupenky / Konflikty 55.7',body,[{label:'Zavřít',value:null,primary:true}]);
}
