import {store} from './state.js';
import {h,modal} from './utils.js';
import {openPersonalLifeSuite621,openPersonalLifeFeature621} from './personalLifeSuite621.js';
import {personalLifeActionRouter623} from './personalLifeActionRouter623.js';
import {personalLifeExplain624} from './personalLifeExplain624.js';

export function personalLifeHome622(s=store.get()){
 const x=personalLifeActionRouter623(s),explain=personalLifeExplain624(s),urgent=x.top.slice(0,4);
 return{score:Number(x.rows.find(v=>v.key==='scoreboard')?.items?.[0]?.amount||0),commander:x.main,urgent,explain,summary:x.summary};
}

export async function openPersonalLifeHome622(){
 const t=performance.now(),x=personalLifeHome622(),e=x.explain;
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_LIFE_HOME_624_LAST__={ms:Math.round((performance.now()-t)*10)/10,at:Date.now(),score:x.score,commander:x.commander.title,actionable:x.urgent.length,explained:true};
 const urgent=x.urgent.map((v,i)=>{const z=e.top.find(q=>q.key===v.key);return `<div class="row"><div><b>${i+1}. ${h(v.name)}</b><div class="muted">${h(z?.why||v.subtitle)}</div></div><b>${h(String(v.count))}</b></div>`}).join('');
 const body=`<div class="metric-strip"><div class="metric"><span>Life score</span><b>${x.score}/100</b></div><div class="metric"><span>Hlavní oblast</span><b>${h(x.commander.key)}</b></div></div><div class="card"><div class="eyebrow">PERSONAL LIFE EXPLAIN 62.4</div><h2>${h(x.commander.title)}</h2><div class="row"><div><b>Proč právě teď</b><div class="muted">${h(e.main.why)}</div></div></div><div class="row"><div><b>Co hrozí při odložení</b><div class="muted">${h(e.main.risk)}</div></div></div><div class="row"><div><b>Co se zlepší po vyřešení</b><div class="muted">${h(e.main.outcome)}</div></div></div></div><div class="card"><div class="eyebrow">NEJDŮLEŽITĚJŠÍ OSOBNÍ OBLASTI</div>${urgent}</div><div class="decision-note">62.4 vysvětluje důvod, riziko odkladu a očekávaný přínos. Pořád nic automaticky neplatí, neodesílá, nemaže ani nepřepisuje.</div>`;
 const actions=[{label:'Řešit hlavní oblast',value:`feature:${x.commander.key}`,primary:true},...x.urgent.map(v=>({label:`${v.name} (${v.count})`,value:`feature:${v.key}`})),{label:'Všech 20 modulů',value:'suite'},{label:'Zavřít',value:null}];
 const choice=await modal('Kamil OS / Personal Life Home 62.4',body,actions);
 if(String(choice||'').startsWith('feature:'))return openPersonalLifeFeature621(String(choice).slice(8));
 if(choice==='suite')return openPersonalLifeSuite621();
 return choice;
}
