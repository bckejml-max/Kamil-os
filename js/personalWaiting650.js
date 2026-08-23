import {store} from './state.js';
import {h,modal} from './utils.js';
import {openPersonalAction641} from './personalActionExecution641.js';
import {personalWaitingCenter650} from './personalAssistant650.js';

const actionFor=x=>({id:`waiting:${x.id||x.title}`,kind:'waiting',title:x.title||x.name||'Čekám na odpověď',why:`Čekáš na reakci · ${x.when}`,next:'Udělej follow-up, uzavři čekání nebo posuň další kontrolu.',minutes:3,route:'today'});
const rowsHtml=w=>w.rows.map((x,i)=>`<div class="row ux64-row"><div><b>${h(x.title||x.name||'Čekám na odpověď')}</b><div class="muted">${h(x.when)}</div></div><button class="btn ${x.days!==null&&x.days<=0?'primary':''}" data-waiting-choice="${i}">${x.days!==null&&x.days<=0?'Follow-up':'Otevřít'}</button></div>`).join('');

export async function openPersonalWaiting650(){
 const w=personalWaitingCenter650(store.get());
 const body=`<div class="metric-strip"><div class="metric"><span>Celkem čekání</span><b>${w.count}</b></div><div class="metric"><span>Po follow-up</span><b>${w.overdue.length}</b></div><div class="metric"><span>Follow-up dnes</span><b>${w.today.length}</b></div><div class="metric"><span>Do 7 dní</span><b>${w.soon.length}</b></div></div><div class="card"><div class="eyebrow">KDO JE TEĎ NA TAHU</div>${rowsHtml(w)||'<div class="empty success-empty">Na nic důležitého teď nečekáš.</div>'}</div>`;
 const buttons=w.rows.slice(0,8).map((x,i)=>({label:`${x.days!==null&&x.days<=0?'Follow-up':'Otevřít'} · ${x.title||x.name||'Čekání'}`,value:`row:${i}`,primary:i===0&&x.days!==null&&x.days<=0}));buttons.push({label:'Zavřít',value:null});
 const choice=await modal('Čekám na odpověď',body,buttons);if(!String(choice||'').startsWith('row:'))return choice;
 const x=personalWaitingCenter650(store.get()).rows[Number(choice.split(':')[1])];if(!x)return null;return openPersonalAction641(actionFor(x));
}

export function personalWaitingSummary650(){const w=personalWaitingCenter650(store.get());return{count:w.count,overdue:w.overdue.length,today:w.today.length,soon:w.soon.length}}
