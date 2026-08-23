import {store} from './state.js';
import {h,qs} from './utils.js';
import {openPersonalAction641} from './personalActionExecution641.js';
import {personalWaitingCenter650} from './personalAssistant650.js';

const actionFor=x=>({id:`waiting:${x.id||x.title}`,kind:'waiting',title:x.title||x.name||'Čekám na odpověď',why:`Čekáš na reakci · ${x.when}`,next:'Udělej follow-up, uzavři čekání nebo posuň další kontrolu.',minutes:3,route:'waiting'});

export function renderPersonalWaiting650(){
 const host=qs('#waitingView');if(!host)return;const w=personalWaitingCenter650(store.get());
 const rows=w.rows.map((x,i)=>`<div class="row ux64-row"><div><b>${h(x.title||x.name||'Čekám na odpověď')}</b><div class="muted">${h(x.when)}</div></div><button class="btn ${x.days!==null&&x.days<=0?'primary':''}" data-waiting="${i}">${x.days!==null&&x.days<=0?'Follow-up':'Otevřít'}</button></div>`).join('');
 host.innerHTML=`<div class="ux64-page"><div class="view-head"><div><div class="eyebrow">ČEKÁM</div><h1>Kdo je teď na tahu</h1><p>Jedno místo pro odpovědi, potvrzení a věci, které už nejsou na tobě.</p></div></div><div class="metric-strip"><div class="metric"><span>Celkem čekání</span><b>${w.count}</b></div><div class="metric"><span>Po follow-up</span><b>${w.overdue.length}</b></div><div class="metric"><span>Follow-up dnes</span><b>${w.today.length}</b></div><div class="metric"><span>Do 7 dní</span><b>${w.soon.length}</b></div></div><section class="card">${rows||'<div class="empty success-empty">Na nic důležitého teď nečekáš.</div>'}</section></div>`;
 host.querySelectorAll('[data-waiting]').forEach(b=>b.addEventListener('click',async()=>{const x=personalWaitingCenter650(store.get()).rows[Number(b.dataset.waiting)];if(!x)return;await openPersonalAction641(actionFor(x));renderPersonalWaiting650()}));
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_WAITING_650_LAST__={at:Date.now(),count:w.count,overdue:w.overdue.length,today:w.today.length};
}
