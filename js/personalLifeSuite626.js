import {store} from './state.js';
import {h,money,modal} from './utils.js';
import {personalLifeSuite625} from './personalLifeSuite625.js';
import {personalDataConfidence626} from './personalDataConfidence626.js';

const rowHtml=v=>`<div class="row"><div><b>${h(v.title)}</b><div class="muted">${h(v.meta||'')}</div></div>${v.amount?`<b>${typeof v.amount==='number'&&Math.abs(v.amount)>1000?money(v.amount):h(String(v.amount))}</b>`:''}</div>`;
const confidenceRow=v=>`<div class="row"><div><b>${h(v.title||v.name)}</b><div class="muted">${h(v.confidenceBasis)} · další krok: ${h(v.confidenceNext)}</div></div><b>${h(v.confidenceLabel)} · ${v.confidence}%</b></div>`;

export function personalLifeSuite626(s=store.get()){
 const suite=personalLifeSuite625(s),confidence=personalDataConfidence626(s);
 return{...suite,confidence};
}

export async function openPersonalLifeFeature626(key){
 const x=personalLifeSuite626(),f=x.features[key]||x.features.commander;
 const showConfidence=['admin','documents','expiry','renewals','finance'].includes(key);
 const confidence=showConfidence?x.confidence.records.slice(0,8):[];
 const confidenceHtml=confidence.length?`<div class="card"><div class="eyebrow">DATA CONFIDENCE 62.6</div>${confidence.map(confidenceRow).join('')}</div>`:'';
 const body=`<div class="card"><div class="eyebrow">${h(f.name)} · CONFIDENCE 62.6</div><h2>${h(f.subtitle)}</h2></div><div class="card">${f.items.length?f.items.map(rowHtml).join(''):'<div class="empty success-empty">Podle živých ani obnovených dat tu teď nic není.</div>'}</div>${confidenceHtml}<div class="decision-note">62.6 rozlišuje potvrzená, pravděpodobná a neověřená archivní data. Živá data mají přednost a tato vrstva nic sama nepřepisuje.</div>`;
 return modal(`Kamil OS / ${f.name}`,body,[{label:'Zpět',value:null,primary:true}]);
}

export async function openPersonalLifeSuite626(){
 const t=performance.now(),x=personalLifeSuite626(),f=x.features,c=x.confidence;
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_CONFIDENCE_626_LAST__={ms:Math.round((performance.now()-t)*10)/10,at:Date.now(),average:c.average,confirmed:c.confirmed.length,probable:c.probable.length,verify:c.verify.length};
 const featureRows=Object.entries(f).filter(([k])=>k!=='commander').map(([k,v])=>`<button class="btn" data-life-feature-626="${h(k)}">${h(v.name)} · ${h(String(v.count))}</button>`).join('');
 const evidence=c.records.map(confidenceRow).join('');
 const body=`<div class="metric-strip"><div class="metric"><span>Datová důvěra</span><b>${c.average}/100</b></div><div class="metric"><span>Potvrzeno</span><b>${c.confirmed.length}</b></div><div class="metric"><span>Pravděpodobné</span><b>${c.probable.length}</b></div><div class="metric"><span>Ověřit</span><b>${c.verify.length}</b></div></div><div class="card"><div class="eyebrow">PERSONAL DATA CONFIDENCE 62.6</div><h2>${h(c.summary)}</h2>${evidence}</div><div class="card"><div class="eyebrow">20 OSOBNÍCH MODULŮ</div><div class="row-actions">${featureRows}</div></div>`;
 const actions=[{label:'Hlavní priorita',value:`feature:${x.commander.feature}`,primary:true},{label:'Zavřít',value:null}];
 const choice=await modal('Kamil OS / Personal Data Confidence 62.6',body,actions);
 if(String(choice||'').startsWith('feature:'))return openPersonalLifeFeature626(String(choice).slice(8));
 return choice;
}
