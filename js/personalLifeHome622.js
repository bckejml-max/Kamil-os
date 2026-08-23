import {store} from './state.js';
import {h,modal} from './utils.js';
import {personalLifeSuite621,openPersonalLifeSuite621,openPersonalLifeFeature621} from './personalLifeSuite621.js';

export function personalLifeHome622(s=store.get()){
 const x=personalLifeSuite621(s),f=x.features,urgent=[f.today,f.waiting,f.expiry,f.renewals,f.maintenance].sort((a,b)=>Number(b.count||0)-Number(a.count||0));
 return{score:x.score,commander:x.commander,urgent,summary:`Life score ${x.score}/100 · po termínu ${x.overdue} · do 7 dnů ${x.soon} · čekání ${x.waiting}`};
}

export async function openPersonalLifeHome622(){
 const t=performance.now(),x=personalLifeHome622();
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_LIFE_HOME_622_LAST__={ms:Math.round((performance.now()-t)*10)/10,at:Date.now(),score:x.score,commander:x.commander.title};
 const urgent=x.urgent.slice(0,4).map((v,i)=>`<div class="row"><div><b>${i+1}. ${h(v.name)}</b><div class="muted">${h(v.subtitle)}</div></div><b>${h(String(v.count))}</b></div>`).join('');
 const body=`<div class="metric-strip"><div class="metric"><span>Life score</span><b>${x.score}/100</b></div><div class="metric"><span>Hlavní oblast</span><b>${h(x.commander.feature)}</b></div></div><div class="card"><div class="eyebrow">PERSONAL LIFE HOME 62.2</div><h2>${h(x.commander.title)}</h2><p>${h(x.commander.reason)}</p></div><div class="card"><div class="eyebrow">NEJDŮLEŽITĚJŠÍ OSOBNÍ OBLASTI</div>${urgent}</div><div class="decision-note">62.2 je pouze navigační a analytická vrstva. Nic automaticky neplatí, neodesílá ani nemaže.</div>`;
 const choice=await modal('Kamil OS / Personal Life Home 62.2',body,[{label:'Řešit hlavní oblast',value:'main',primary:true},{label:'Všech 20 modulů',value:'suite'},{label:'Zavřít',value:null}]);
 if(choice==='main')return openPersonalLifeFeature621(x.commander.feature);
 if(choice==='suite')return openPersonalLifeSuite621();
 return choice;
}
