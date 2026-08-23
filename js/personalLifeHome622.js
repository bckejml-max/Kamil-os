import {store} from './state.js';
import {h,modal} from './utils.js';
import {openPersonalLifeSuite621,openPersonalLifeFeature621} from './personalLifeSuite621.js';
import {personalLifeActionRouter623} from './personalLifeActionRouter623.js';

export function personalLifeHome622(s=store.get()){
 const x=personalLifeActionRouter623(s),urgent=x.top.slice(0,4);
 return{score:Number(x.rows.find(v=>v.key==='scoreboard')?.items?.[0]?.amount||0),commander:x.main,urgent,summary:x.summary};
}

export async function openPersonalLifeHome622(){
 const t=performance.now(),x=personalLifeHome622();
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_LIFE_HOME_623_LAST__={ms:Math.round((performance.now()-t)*10)/10,at:Date.now(),score:x.score,commander:x.commander.title,actionable:x.urgent.length};
 const urgent=x.urgent.map((v,i)=>`<div class="row"><div><b>${i+1}. ${h(v.name)}</b><div class="muted">${h(v.subtitle)}</div></div><b>${h(String(v.count))}</b></div>`).join('');
 const body=`<div class="metric-strip"><div class="metric"><span>Life score</span><b>${x.score}/100</b></div><div class="metric"><span>Hlavní oblast</span><b>${h(x.commander.key)}</b></div></div><div class="card"><div class="eyebrow">PERSONAL LIFE ACTION ROUTER 62.3</div><h2>${h(x.commander.title)}</h2><p>${h(x.commander.reason)}</p></div><div class="card"><div class="eyebrow">NEJDŮLEŽITĚJŠÍ OSOBNÍ OBLASTI</div>${urgent}</div><div class="decision-note">62.3 dělá z top osobních oblastí přímé akční vstupy. Nic automaticky neplatí, neodesílá, nemaže ani nepřepisuje.</div>`;
 const actions=[{label:'Řešit hlavní oblast',value:`feature:${x.commander.key}`,primary:true},...x.urgent.map(v=>({label:`${v.name} (${v.count})`,value:`feature:${v.key}`})),{label:'Všech 20 modulů',value:'suite'},{label:'Zavřít',value:null}];
 const choice=await modal('Kamil OS / Personal Life Home 62.3',body,actions);
 if(String(choice||'').startsWith('feature:'))return openPersonalLifeFeature621(String(choice).slice(8));
 if(choice==='suite')return openPersonalLifeSuite621();
 return choice;
}
