import {store} from './state.js';
import {modal,h} from './utils.js';
import {personalDailyAssistant650} from './personalAssistant650.js';
import {openPersonalAction641} from './personalActionExecution641.js';

const titleOf=x=>x.title||x.name||x.summary||'Osobní věc';
const kindLabel=x=>x.sourceKind==='calendar'?'Kalendář':x.sourceKind==='admin'?'Administrativa':'Úkol';
const actionOf=x=>({
 id:`${x.sourceKind}:${x.id||titleOf(x)}`,
 kind:x.sourceKind,
 title:titleOf(x),
 why:`${kindLabel(x)} · ${x.d===1?'zítra':`za ${x.d} d`}`,
 next:x.sourceKind==='calendar'?'Připravit se na událost.':'Dokončit nebo posunout termín.',
 minutes:Number(x.estimateMinutes||5),
 area:x.area||x.category||'admin'
});

async function openRows(title,rows,empty){
 if(!rows.length)return modal(title,`<div class="card"><b>${h(empty)}</b><p class="muted">Nic dalšího nemusíš plánovat.</p></div>`,[{label:'Hotovo',value:null,primary:true}]);
 const body=`<div class="card"><div class="eyebrow">${h(title.toUpperCase())}</div>${rows.map((x,i)=>`<div class="row"><div><b>${h(titleOf(x))}</b><div class="muted">${h(kindLabel(x))}${x.d>1?` · za ${x.d} d`:''}</div></div><span>${i+1}</span></div>`).join('')}</div>`;
 const buttons=rows.slice(0,6).map((x,i)=>({label:`Řešit · ${titleOf(x)}`,value:`row:${i}`,primary:i===0}));buttons.push({label:'Zavřít',value:null});
 const choice=await modal(title,body,buttons);if(String(choice||'').startsWith('row:'))return openPersonalAction641(actionOf(rows[Number(choice.split(':')[1])]));return choice;
}

export function openPersonalTomorrow653(){const d=personalDailyAssistant650(store.get());return openRows('Zítra',d.tomorrow,'Zítra nemáš žádnou osobní věc s termínem.');}
export function openPersonalNext7Days653(){const d=personalDailyAssistant650(store.get());return openRows('Do 7 dní',d.next7,'V příštích 7 dnech nemáš žádnou osobní věc s termínem.');}
