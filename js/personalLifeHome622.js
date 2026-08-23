import {store} from './state.js';
import {h,modal} from './utils.js';
import {openPersonalLifeSuite626,openPersonalLifeFeature626} from './personalLifeSuite626.js';
import {personalLifeActionRouter623} from './personalLifeActionRouter623.js';
import {personalLifeExplain624} from './personalLifeExplain624.js';

export function personalLifeHome622(s=store.get()){
 const x=personalLifeActionRouter623(s),explain=personalLifeExplain624(s),urgent=x.top.slice(0,4);
 return{score:Number(x.rows.find(v=>v.key==='scoreboard')?.items?.[0]?.amount||0),commander:x.main,urgent,explain,recovery:x.recovery,confidence:x.confidence,summary:x.summary};
}

export async function openPersonalLifeHome622(){
 const t=performance.now(),x=personalLifeHome622(),e=x.explain,r=x.recovery,c=x.confidence;
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_LIFE_HOME_626_LAST__={ms:Math.round((performance.now()-t)*10)/10,at:Date.now(),score:x.score,commander:x.commander.title,actionable:x.urgent.length,explained:true,recovered:r?.recovered||null,confidence:c?.average||0,verify:c?.verify?.length||0};
 const urgent=x.urgent.map((v,i)=>{const z=e.top.find(q=>q.key===v.key);return `<div class="row"><div><b>${i+1}. ${h(v.name)}</b><div class="muted">${h(z?.why||v.subtitle)}</div></div><b>${h(String(v.count))}</b></div>`}).join('');
 const confidence=c?`<div class="card"><div class="eyebrow">PERSONAL DATA CONFIDENCE 62.6</div><div class="metric-strip"><div class="metric"><span>Datová důvěra</span><b>${c.average}/100</b></div><div class="metric"><span>Potvrzeno</span><b>${c.confirmed.length}</b></div><div class="metric"><span>Pravděpodobné</span><b>${c.probable.length}</b></div><div class="metric"><span>Ověřit</span><b>${c.verify.length}</b></div></div>${c.records.slice(0,5).map(v=>`<div class="row"><div><b>${h(v.title||v.name)}</b><div class="muted">${h(v.confidenceBasis)}</div></div><b>${h(v.confidenceLabel)} · ${v.confidence}%</b></div>`).join('')}</div>`:'';
 const body=`<div class="metric-strip"><div class="metric"><span>Life score</span><b>${x.score}/100</b></div><div class="metric"><span>Hlavní oblast</span><b>${h(x.commander.key)}</b></div></div><div class="card"><div class="eyebrow">PERSONAL LIFE EXPLAIN + DATA CONFIDENCE 62.6</div><h2>${h(x.commander.title)}</h2><div class="row"><div><b>Proč právě teď</b><div class="muted">${h(e.main.why)}</div></div></div><div class="row"><div><b>Co hrozí při odložení</b><div class="muted">${h(e.main.risk)}</div></div></div><div class="row"><div><b>Co se zlepší po vyřešení</b><div class="muted">${h(e.main.outcome)}</div></div></div></div>${confidence}<div class="card"><div class="eyebrow">NEJDŮLEŽITĚJŠÍ OSOBNÍ OBLASTI</div>${urgent}</div><div class="decision-note">62.6 rozlišuje sílu archivních důkazů. POTVRZENO znamená silný zdroj nebo pozdější potvrzení; PRAVDĚPODOBNÉ je použitelný archivní údaj bez čerstvého potvrzení; OVĚŘIT se nesmí vydávat za jistý stav. Nic se samo neplatí, neodesílá, nemaže ani nepřepisuje.</div>`;
 const actions=[{label:'Řešit hlavní oblast',value:`feature:${x.commander.key}`,primary:true},...x.urgent.map(v=>({label:`${v.name} (${v.count})`,value:`feature:${v.key}`})),{label:'Data confidence + 20 modulů',value:'suite'},{label:'Zavřít',value:null}];
 const choice=await modal('Kamil OS / Personal Life Home 62.6',body,actions);
 if(String(choice||'').startsWith('feature:'))return openPersonalLifeFeature626(String(choice).slice(8));
 if(choice==='suite')return openPersonalLifeSuite626();
 return choice;
}
