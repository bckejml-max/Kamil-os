import {store} from './state.js';
import {h,modal} from './utils.js';
import {openPersonalLifeFeature626} from './personalLifeSuite626.js';
import {openPersonalLifeSuite627} from './personalLifeSuite627.js';
import {personalMissingDataResolver627} from './personalMissingDataResolver627.js';
import {personalLifeActionRouter623} from './personalLifeActionRouter623.js';
import {personalLifeExplain624} from './personalLifeExplain624.js';

export function personalLifeHome622(s=store.get()){
 const x=personalLifeActionRouter623(s),explain=personalLifeExplain624(s),resolver=personalMissingDataResolver627(s),urgent=x.top.slice(0,4);
 return{score:Number(x.rows.find(v=>v.key==='scoreboard')?.items?.[0]?.amount||0),commander:x.main,urgent,explain,recovery:x.recovery,confidence:x.confidence,resolver,summary:x.summary};
}

export async function openPersonalLifeHome622(){
 const t=performance.now(),x=personalLifeHome622(),e=x.explain,c=x.confidence,r=x.resolver;
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_LIFE_HOME_627_LAST__={ms:Math.round((performance.now()-t)*10)/10,at:Date.now(),score:x.score,commander:x.commander.title,confidence:c?.average||0,missing:r.open,mainMissing:r.main?.id||null};
 const urgent=x.urgent.map((v,i)=>{const z=e.top.find(q=>q.key===v.key);return `<div class="row"><div><b>${i+1}. ${h(v.name)}</b><div class="muted">${h(z?.why||v.subtitle)}</div></div><b>${h(String(v.count))}</b></div>`}).join('');
 const resolver=`<div class="card"><div class="eyebrow">PERSONAL MISSING DATA RESOLVER 62.7</div><h2>${h(r.summary)}</h2>${r.tasks.slice(0,3).map(v=>`<div class="row"><div><b>${h(v.title)}</b><div class="muted">${h(v.where)} · ${h(v.proof)}</div></div><b>${v.current}% → ${v.target}%</b></div>`).join('')}</div>`;
 const body=`<div class="metric-strip"><div class="metric"><span>Life score</span><b>${x.score}/100</b></div><div class="metric"><span>Datová důvěra</span><b>${c?.average||0}/100</b></div><div class="metric"><span>K ověření</span><b>${r.open}</b></div></div><div class="card"><div class="eyebrow">PERSONAL LIFE 62.7</div><h2>${h(x.commander.title)}</h2><div class="row"><div><b>Proč právě teď</b><div class="muted">${h(e.main.why)}</div></div></div></div>${resolver}<div class="card"><div class="eyebrow">NEJDŮLEŽITĚJŠÍ OSOBNÍ OBLASTI</div>${urgent}</div><div class="decision-note">62.7 převádí nejistá data na konkrétní ověřovací checklist. Nic samo nepotvrzuje, neplatí ani nepřepisuje.</div>`;
 const actions=[{label:'Řešit hlavní oblast',value:`feature:${x.commander.key}`,primary:true},{label:'Ověřit chybějící data',value:'resolver'},...x.urgent.map(v=>({label:`${v.name} (${v.count})`,value:`feature:${v.key}`})),{label:'Zavřít',value:null}];
 const choice=await modal('Kamil OS / Personal Life Home 62.7',body,actions);
 if(String(choice||'').startsWith('feature:'))return openPersonalLifeFeature626(String(choice).slice(8));
 if(choice==='resolver')return openPersonalLifeSuite627();
 return choice;
}
