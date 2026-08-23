import {store} from './state.js';
import {h,money,modal} from './utils.js';
import {personalLifeSuite621} from './personalLifeSuite621.js';
import {mergeRecoveredPersonalData625,personalDataRecovery625} from './personalDataRecovery625.js';

const rowHtml=v=>`<div class="row"><div><b>${h(v.title)}</b><div class="muted">${h(v.meta||'')}</div></div>${v.amount?`<b>${typeof v.amount==='number'&&Math.abs(v.amount)>1000?money(v.amount):h(String(v.amount))}</b>`:''}</div>`;

export function personalLifeSuite625(s=store.get()){
 const recovery=personalDataRecovery625(s),suite=personalLifeSuite621(mergeRecoveredPersonalData625(s));
 return{...suite,recovery};
}

export async function openPersonalLifeFeature625(key){
 const x=personalLifeSuite625(),f=x.features[key]||x.features.commander;
 const gaps=(key==='admin'||key==='documents'||key==='expiry'||key==='renewals'||key==='finance')?x.recovery.gaps.slice(0,5):[];
 const gapHtml=gaps.length?`<div class="card"><div class="eyebrow">OBNOVENÁ DATA · K OVĚŘENÍ</div>${gaps.map(v=>`<div class="row"><div><b>${h(v.title)}</b><div class="muted">${h(v.reason)}</div></div></div>`).join('')}</div>`:'';
 const body=`<div class="card"><div class="eyebrow">${h(f.name)} · RECOVERY 62.5</div><h2>${h(f.subtitle)}</h2></div><div class="card">${f.items.length?f.items.map(rowHtml).join(''):'<div class="empty success-empty">Podle živých ani obnovených dat tu teď nic není.</div>'}</div>${gapHtml}<div class="decision-note">62.5 kombinuje živý stav Kamil OS s dohledanými archivními podklady. Archivní nejisté položky jsou označené k ověření; živá data mají přednost a nic se automaticky nepřepisuje.</div>`;
 return modal(`Kamil OS / ${f.name}`,body,[{label:'Zpět',value:null,primary:true}]);
}

export async function openPersonalLifeSuite625(){
 const t=performance.now(),x=personalLifeSuite625(),f=x.features;
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_RECOVERY_625_LAST__={ms:Math.round((performance.now()-t)*10)/10,at:Date.now(),recovered:x.recovery.recovered,gaps:x.recovery.gaps.length,features:Object.keys(f).length};
 const featureRows=Object.entries(f).filter(([k])=>k!=='commander').map(([k,v])=>`<button class="btn" data-life-feature-625="${h(k)}">${h(v.name)} · ${h(String(v.count))}</button>`).join('');
 const recovered=`<div class="card"><div class="eyebrow">PERSONAL DATA RECOVERY 62.5</div><h2>${h(x.recovery.summary)}</h2>${x.recovery.gaps.map(v=>`<div class="row"><div><b>${h(v.title)}</b><div class="muted">${h(v.reason)}</div></div><b>OVĚŘIT</b></div>`).join('')}</div>`;
 const body=`<div class="metric-strip"><div class="metric"><span>Life score</span><b>${x.score}/100</b></div><div class="metric"><span>Archivní záznamy</span><b>${x.recovery.recovered.admin+x.recovery.recovered.assets}</b></div><div class="metric"><span>K ověření</span><b>${x.recovery.gaps.length}</b></div></div>${recovered}<div class="card"><div class="eyebrow">20 OSOBNÍCH MODULŮ</div><div class="row-actions">${featureRows}</div></div>`;
 const actions=[{label:'Hlavní priorita',value:`feature:${x.commander.feature}`,primary:true},{label:'Zavřít',value:null}];
 const choice=await modal('Kamil OS / Personal Data Recovery 62.5',body,actions);
 if(String(choice||'').startsWith('feature:'))return openPersonalLifeFeature625(String(choice).slice(8));
 return choice;
}
