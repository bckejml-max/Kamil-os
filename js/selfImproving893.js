import {modal,h} from './utils.js';
import {buildSelfImproving892,recordOutcome851} from './selfImproving892.js';
import {recordUsage892} from './usage892.js';
export const SELF_IMPROVING893_VERSION='893.0.0';
const U=v=>String(v||'').toUpperCase();
function inferArea(x={}){return U(x.area)||'GENERAL'}
export async function openSelfImproving893(){
 recordUsage892('self-improving',{surface:'more',release:'893'});
 const m=await buildSelfImproving892(),top=m.nextBest||{},suggest=m.selfImprove?.[0];
 const body=`<div class="card"><div class="eyebrow">OS893 · LEARNING QUALITY</div><h2>${h(top.title||top.action||'Bez kritické priority')}</h2><p>${h(top.detail||top.reason||'')}</p><div class="row"><span>Usage 30 dní</span><b>${Number(m.usage?.total||0)}</b></div><div class="row"><span>Výsledků rozhodnutí</span><b>${Object.values(m.reliability||{}).reduce((a,x)=>a+Number(x.total||0),0)}</b></div><div class="row"><span>Confidence</span><b>${Math.round(Number(m.confidenceCalibrated?.overall||m.confidence?.overall||0))}%</b></div></div><div class="card"><div class="eyebrow">CO ZLEPŠIT</div><h2>${h(suggest?.title||'Bez zásadního návrhu')}</h2><p>${h(suggest?.reason||'')}</p></div>`;
 const choice=await modal('Self-Improving Kamil OS',body,[{label:'✅ Dopadlo dobře',value:'good',primary:true},{label:'➖ Neutrální',value:'neutral'},{label:'❌ Dopadlo špatně',value:'bad'},{label:'Zavřít',value:null}]);
 if(!choice)return null;
 recordOutcome851({area:inferArea(top),recommendation:top.title||top.action||'Next Best Action',outcome:choice,note:top.detail||top.reason||''});
 return modal('Výsledek uložen',`<div class="card"><div class="eyebrow">OS893 · OUTCOME</div><h2>${choice==='good'?'Dobré rozhodnutí':choice==='bad'?'Špatné rozhodnutí':'Neutrální výsledek'}</h2><p class="muted">Tento výsledek má v learning loop vyšší váhu než samotné 👍/👎.</p></div>`,[{label:'Hotovo',value:null,primary:true}]);
}
