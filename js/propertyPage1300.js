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
 const m=buildPropertyHub620(),best=m.best,own=best?.equity||0,cf=best?.cashAfterMortgage;
 host.innerHTML='<div class="pr1300-shell" data-property-page1300>' +
  '<div class="pr1300-head"><div><div class="pr1300-kicker">Reality</div><h1>Investiční byty jako samostatné rozhodnutí.</h1><p>Nejdřív nejlepší kandidát a rozhodnutí. Ostatní čísla jsou až pod shortlistem.</p></div><span class="pr1300-status '+(best?decisionTone(best.decision.code):'')+'">'+m.rows.length+' kandidátů</span></div>' +
  '<section class="pr1320-now"><div><div class="pr1300-kicker">Teď</div><h2>'+esc(best?.name||'Zatím žádný kandidát')+'</h2><p>'+(best?esc(best.location||'Lokalita neuvedena')+' · '+esc(best.decision.reason):'Přidej kandidáty do Property Booku a OS je seřadí podle stejného Deal Score modelu.')+'</p></div><div class="pr1320-now-actions"><button class="pr1300-btn primary" type="button" data-property1300-task>＋ Úkol k realitě</button></div></section>' +
  '<div class="pr1320-meta"><span>Rozhodnutí: '+(best?esc(best.decision.action):'—')+'</span><span>Net yield: '+(best?pct(best.netYield):'—')+'</span><span>Vlastní zdroje: '+(best?money(own):'—')+'</span><span>CF po hypotéce: '+(best&&cf!==null?(cf>=0?'+':'')+money(cf):'—')+'</span></div>' +
  '<section class="pr1300-panel"><div class="pr1300-panel-head"><h2>Shortlist</h2><button class="pr1300-btn" type="button" data-property1300-money>Finanční detail</button></div>'+candidateRows(m.rows)+'</section>' +
  (best?'<details class="pr1300-panel"><summary class="pr1300-panel-head"><h3>Detail #1</h3><span>'+esc(best.name)+'</span></summary><div class="pr1300-row"><div class="pr1300-row-main"><b>Kupní cena</b><small>aktuální vstup</small></div><div class="pr1300-row-side">'+money(best.purchasePrice)+'</div></div><div class="pr1300-row"><div class="pr1300-row-main"><b>Cílová cena</b><small>hranice podle Deal Score</small></div><div class="pr1300-row-side">'+(best.targetPrice?money(best.targetPrice):'—')+'</div></div><div class="pr1300-row"><div class="pr1300-row-main"><b>Downside yield</b><small>horší scénář</small></div><div class="pr1300-row-side">'+pct(best.downsideYield)+'</div></div></details>':'') +
 '</div>';
 if(!host.dataset.property1300Bound){host.dataset.property1300Bound='1';ownEvent1100(OWNER,host,'click',e=>{if(e.target.closest('[data-property1300-money]'))window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'money'}));else if(e.target.closest('[data-property1300-task]'))window.dispatchEvent(new CustomEvent('kamil:capture',{detail:'property-task'}))})}

 window.__KAMIL_PROPERTY_PAGE1300__={healthy:true,candidates:m.rows.length,best:best?{name:best.name,score:best.score,decision:best.decision.code}:null,at:Date.now()};
 return true;
}

export function renderPropertyPage1300(){return render()}
