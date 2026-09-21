import {buildPropertyHub620} from './propertyHub620.js';
import {ownEvent1100} from './runtimeOwnership1100.js';

const OWNER='product.property1300';
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const money=v=>`${Math.round(Number(v||0)).toLocaleString('cs-CZ')} Kč`;
const pct=v=>`${(Number(v||0)*100).toFixed(2).replace('.',',')} %`;
const decisionTone=code=>code==='BUY'?'good':code==='NEGOTIATE'?'warn':code==='PASS'?'bad':'';

function candidateRows(rows){
 if(!rows.length)return '<div class="pr1300-empty">V Property Booku zatím není žádný kandidát.</div>';
 return rows.slice(0,12).map((x,i)=>`<div class="pr1300-row"><div class="pr1300-row-main"><b>${i+1}. ${esc(x.name)}</b><small>${esc(x.location||'Lokalita neuvedena')} · ${money(x.purchasePrice)} · ${x.area?`${String(x.area).replace('.',',')} m² · `:''}net yield ${pct(x.netYield)}</small></div><div class="pr1300-row-side ${decisionTone(x.decision.code)}">${esc(x.decision.action)} · ${x.score}/100</div></div>`).join('');
}

function render(){
 const host=document.querySelector('#propertyView');if(!host)return false;
 const m=buildPropertyHub620(),best=m.best;
 const own=best?.equity||0,cf=best?.cashAfterMortgage;
 host.innerHTML=`<div class="pr1300-shell" data-property-page1300>
  <div class="pr1300-head"><div><div class="pr1300-kicker">Reality</div><h1>Investiční byty jako samostatné rozhodnutí.</h1><p>Kandidáti, výnos, cílová cena a financování bez hledání uvnitř Peněz.</p></div><span class="pr1300-status ${best?decisionTone(best.decision.code):''}">${m.rows.length} kandidátů</span></div>
  <section class="pr1300-hero"><div><div class="pr1300-kicker">Nejlepší aktuální kandidát</div><h2>${esc(best?.name||'Zatím žádný kandidát')}</h2><p>${best?`${esc(best.location||'Lokalita neuvedena')} · ${esc(best.decision.reason)}`:'Přidej kandidáty do Property Booku a OS je tady seřadí podle stejného Deal Score modelu.'}</p></div><div class="pr1300-hero-value"><b class="${best?decisionTone(best.decision.code):''}">${best?esc(best.decision.action):'—'}</b><span>${best?`${best.score}/100 Deal Score`:'bez hodnocení'}</span></div></section>
  <div class="pr1300-kpis"><div class="pr1300-kpi"><span>Kandidáti</span><b>${m.rows.length}</b><small>${m.counts.buy} koupit · ${m.counts.negotiate} vyjednávat</small></div><div class="pr1300-kpi"><span>Nejlepší net yield</span><b>${best?pct(best.netYield):'—'}</b><small>po provozních nákladech modelu</small></div><div class="pr1300-kpi"><span>Vlastní zdroje</span><b>${best?money(own):'—'}</b><small>${m.cfg.equityPct} % equity scénář</small></div><div class="pr1300-kpi"><span>CF po hypotéce</span><b>${best&&cf!==null?`${cf>=0?'+':''}${money(cf)}`:'—'}</b><small>${m.cfg.ratePct?`${String(m.cfg.ratePct).replace('.',',')} % · ${m.cfg.years} let`:'doplň sazbu hypotéky'}</small></div></div>
  <div class="pr1300-actions"><button class="pr1300-btn primary" type="button" data-property1300-money>Otevřít finanční detail</button><button class="pr1300-btn" type="button" data-property1300-task>＋ Přidat úkol k realitě</button></div>
  <div class="pr1300-grid"><div class="pr1300-stack"><section class="pr1300-panel"><div class="pr1300-panel-head"><h2>Shortlist</h2><span>nejlepší nahoře</span></div>${candidateRows(m.rows)}</section></div><div class="pr1300-stack"><section class="pr1300-panel"><div class="pr1300-panel-head"><h3>Rozložení rozhodnutí</h3><span>stejný engine OS472</span></div><div class="pr1300-row"><div class="pr1300-row-main"><b>Koupit</b><small>splňuje aktuální podmínky modelu</small></div><div class="pr1300-row-side good">${m.counts.buy}</div></div><div class="pr1300-row"><div class="pr1300-row-main"><b>Vyjednávat</b><small>dobré, ale cena/podmínky chtějí posun</small></div><div class="pr1300-row-side warn">${m.counts.negotiate}</div></div><div class="pr1300-row"><div class="pr1300-row-main"><b>Nebrat</b><small>nevychází podle současných dat</small></div><div class="pr1300-row-side bad">${m.counts.pass}</div></div><div class="pr1300-row"><div class="pr1300-row-main"><b>Doplnit data</b><small>verdikt zatím není spolehlivý</small></div><div class="pr1300-row-side">${m.counts.incomplete}</div></div></section>${best?`<section class="pr1300-panel"><div class="pr1300-panel-head"><h3>${esc(best.name)}</h3><span>#1</span></div><div class="pr1300-row"><div class="pr1300-row-main"><b>Kupní cena</b><small>aktuální vstup do modelu</small></div><div class="pr1300-row-side">${money(best.purchasePrice)}</div></div><div class="pr1300-row"><div class="pr1300-row-main"><b>Cílová cena</b><small>hranice podle Deal Score</small></div><div class="pr1300-row-side ${best.targetGap>=0?'good':'warn'}">${best.targetPrice?money(best.targetPrice):'—'}</div></div><div class="pr1300-row"><div class="pr1300-row-main"><b>Downside yield</b><small>horší scénář</small></div><div class="pr1300-row-side">${pct(best.downsideYield)}</div></div></section>`:''}</div></div>
 </div>`;
 if(!host.dataset.property1300Bound){host.dataset.property1300Bound='1';ownEvent1100(OWNER,host,'click',e=>{if(e.target.closest('[data-property1300-money]'))window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'money'}));else if(e.target.closest('[data-property1300-task]'))window.dispatchEvent(new CustomEvent('kamil:capture',{detail:'property-task'}))})}
 window.__KAMIL_PROPERTY_PAGE1300__={healthy:true,candidates:m.rows.length,best:best?{name:best.name,score:best.score,decision:best.decision.code}:null,at:Date.now()};
 return true;
}

export function renderPropertyPage1300(){return render()}
