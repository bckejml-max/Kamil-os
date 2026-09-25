import {buildPropertyHub620,openPropertyDetail620} from './propertyHub620.js';
import {ownEvent1100} from './runtimeOwnership1100.js';

const OWNER='product.property1300';
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const money=v=>`${Math.round(Number(v||0)).toLocaleString('cs-CZ')} Kč`;
const pct=v=>`${(Number(v||0)*100).toFixed(2).replace('.',',')} %`;
const decisionTone=code=>code==='BUY'?'good':code==='NEGOTIATE'||code==='INCOMPLETE'?'warn':code==='PASS'?'bad':'';

function candidateRows(rows){
 if(!rows.length)return '<div class="pr1300-empty">V Property Booku zatím není žádný kandidát.</div>';
 return rows.map((x,i)=>`<button type="button" class="pr1300-row pr1300-clickrow" data-property-shortlist-row data-property-candidate="${x.index}"><div class="pr1300-row-main"><b>${i+1}. ${esc(x.name)}</b><small>${esc(x.location||'Lokalita neuvedena')} · ${money(x.purchasePrice)} · ${x.area?`${String(x.area).replace('.',',')} m² · `:''}net yield ${pct(x.netYield)}</small></div><div class="pr1300-row-side ${decisionTone(x.decision.code)}">${esc(x.decision.action)} · ${x.score}/100 <span class="os1500-row-arrow">→</span></div></button>`).join('');
}
function metric(label,value,tone=''){return '<span class="os1334-property-metric '+tone+'"><small>'+label+'</small><b>'+value+'</b></span>'}

function render(){
 const host=document.querySelector('#propertyView');if(!host)return false;
 const m=buildPropertyHub620(),best=m.best,own=best?.equity||0,cf=best?.cashAfterMortgage,gap=best?.targetGap;
 const populated=best?'<div class="os1334-decision-grid os1334-property-grid"><section class="pr1320-now os1334-primary"><div><div class="pr1300-kicker">#1 podle Deal Score</div><h2>'+esc(best.name)+'</h2><p>'+esc(best.location||'Lokalita neuvedena')+' · '+esc(best.decision.reason)+'</p></div><div class="pr1320-now-actions"><button class="pr1300-btn primary" type="button" data-property1300-task>＋ Úkol k realitě</button></div></section><section class="pr1300-panel os1334-context-panel os1334-property-context"><div class="pr1300-panel-head"><div><h2>'+esc(best.decision.action)+'</h2><span>čísla kandidáta #1</span></div><button class="pr1300-btn" type="button" data-property1300-money>Finanční detail</button></div><div class="os1334-property-metrics">'+metric('Deal Score',best.score+'/100',decisionTone(best.decision.code))+metric('Kupní cena',money(best.purchasePrice))+metric('Cílová cena',best.targetPrice?money(best.targetPrice):'—')+metric('Mezera k cíli',gap===null?'—':(gap>=0?'+':'')+money(gap),gap!==null?(gap>=0?'good':'warn'):'')+metric('Net yield',pct(best.netYield))+metric('Downside yield',pct(best.downsideYield))+metric('Vlastní zdroje',money(own))+metric('CF po hypotéce',cf!==null?(cf>=0?'+':'')+money(cf):'—',cf===null?'':cf>=0?'good':'bad')+'</div></section></div><section class="pr1300-panel os1334-property-shortlist"><div class="pr1300-panel-head"><h2>Shortlist</h2><span>všech '+m.rows.length+' kandidátů</span></div>'+candidateRows(m.rows)+'</section>':'<section class="pr1320-now pr1328-property-empty"><div><div class="pr1300-kicker">Shortlist</div><h2>Zatím žádný kandidát</h2><p>Přidej investiční byt do Property Booku. Jakmile jsou data uložená, OS ukáže pořadí a Deal Score.</p></div><div class="pr1320-now-actions"><button class="pr1300-btn primary" type="button" data-property1300-task>＋ Úkol k realitě</button><button class="pr1300-btn" type="button" data-property1300-money>Peníze</button></div></section>';
 host.innerHTML='<div class="pr1300-shell" data-property-page1300 data-decision-surface1334>' +
  '<div class="pr1300-head"><div><div class="pr1300-kicker">Reality</div><h1>Nejlepší kandidát a čísla pro rozhodnutí.</h1><p>Bez duplicitního detailu: nahoře kandidát #1, vedle něj klíčové metriky, pod tím celý shortlist.</p></div><span class="pr1300-status '+(best?decisionTone(best.decision.code):'')+'">'+m.rows.length+' kandidátů</span></div>' +
  populated +
 '</div>';
 if(!host.dataset.property1300Bound){host.dataset.property1300Bound='1';ownEvent1100(OWNER,window,'kamil:focus610',e=>{const f=String(e.detail?.focus||'');if(!f.startsWith('property:'))return;const i=Number(f.slice(9));if(Number.isFinite(i))openPropertyDetail620(i)});ownEvent1100(OWNER,host,'click',e=>{if(e.target.closest('[data-property1300-money]')){window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'money'}));return}if(e.target.closest('[data-property1300-task]')){window.dispatchEvent(new CustomEvent('kamil:capture',{detail:'property-task'}));return}const row=e.target.closest('[data-property-candidate]');if(row)openPropertyDetail620(Number(row.dataset.propertyCandidate))})}
 window.__KAMIL_PROPERTY_PAGE1300__={healthy:true,candidates:m.rows.length,renderedCandidates:m.rows.length,best:best?{name:best.name,score:best.score,decision:best.decision.code}:null,decisionSurface:1334,directCandidates:true,at:Date.now()};
 return true;
}
export function renderPropertyPage1300(){return render()}
