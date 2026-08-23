import {store} from './state.js';
import {h,modal} from './utils.js';
import {personalLifeSuite626,openPersonalLifeFeature626} from './personalLifeSuite626.js';
import {personalMissingDataResolver627} from './personalMissingDataResolver627.js';

export function personalLifeSuite627(s=store.get()){
 const suite=personalLifeSuite626(s),resolver=personalMissingDataResolver627(s);
 return{...suite,resolver};
}

const checklistRow=v=>`<div class="row"><div><b>${h(v.title)}</b><div class="muted">Kde: ${h(v.where)} · důkaz: ${h(v.proof)}</div></div><b>${v.current}% → ${v.target}%</b></div>`;

export async function openPersonalLifeSuite627(){
 const t=performance.now(),x=personalLifeSuite627(),r=x.resolver;
 if(typeof window!=='undefined')window.__KAMIL_MISSING_DATA_RESOLVER_627_LAST__={ms:Math.round((performance.now()-t)*10)/10,at:Date.now(),open:r.open,main:r.main?.id||null,potential:r.potential};
 const body=`<div class="metric-strip"><div class="metric"><span>K ověření</span><b>${r.open}</b></div><div class="metric"><span>Datová důvěra</span><b>${x.confidence.average}/100</b></div></div><div class="card"><div class="eyebrow">PERSONAL MISSING DATA RESOLVER 62.7</div><h2>${h(r.summary)}</h2>${r.tasks.length?r.tasks.map(checklistRow).join(''):'<div class="empty success-empty">Nic zásadního nechybí.</div>'}</div><div class="decision-note">Resolver pouze říká co dohledat a jaký důkaz potřebuje. Žádný údaj sám nepotvrzuje ani nepřepisuje.</div>`;
 const choice=await modal('Kamil OS / Missing Data Resolver 62.7',body,[{label:'Hlavní osobní priorita',value:'main',primary:true},{label:'Zavřít',value:null}]);
 if(choice==='main')return openPersonalLifeFeature626(x.commander.feature);
 return choice;
}
