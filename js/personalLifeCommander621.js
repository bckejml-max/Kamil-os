import {h,modal} from './utils.js';
import {personalLifeSuite621,openPersonalLifeFeature621} from './personalLifeSuite621.js';

export async function openPersonalLifeCommander621(){
 const started=performance.now(),x=personalLifeSuite621();
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_LIFE_COMMANDER_621_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),score:x.score,featureCount:Object.keys(x.features).length};
 const body=`<div class="metric-strip"><div class="metric"><span>Life score</span><b>${x.score}/100</b></div><div class="metric"><span>Po termínu</span><b>${x.overdue}</b></div><div class="metric"><span>Do 7 dnů</span><b>${x.soon}</b></div><div class="metric"><span>Čekání</span><b>${x.waiting}</b></div></div><div class="card"><div class="eyebrow">PERSONAL LIFE COMMANDER 62.1</div><h2>${h(x.commander.title)}</h2><p>${h(x.commander.reason)}</p></div><div class="card"><div class="eyebrow">20 OSOBNÍCH OBLASTÍ</div><p class="muted">Vyber oblast. Nic se samo nemění; jde o navigaci a read-only vyhodnocení nad uloženými daty.</p></div>`;
 const order=['today','familyCalendar','admin','renewals','maintenance','familyTodos','waiting','documents','expiry','finance','subscriptions','purchases','homeProjects','inbox','healthAdmin','weekend','wishlist','scoreboard','sunday'];
 const actions=[{label:`Řešit teď: ${x.commander.title}`,value:x.commander.feature,primary:true},...order.map(k=>({label:`${x.features[k].name} · ${x.features[k].count}`,value:k})),{label:'Zavřít',value:null}];
 const choice=await modal('Kamil OS / Personal Life Commander 62.1',body,actions);
 if(choice&&x.features[choice]){await openPersonalLifeFeature621(choice);return openPersonalLifeCommander621()}
 return choice;
}
