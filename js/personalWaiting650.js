import {store} from './state.js';
import {h,modal} from './utils.js';
import {openPersonalAction641} from './personalActionExecution641.js';
import {personalWaitingCenter650} from './personalAssistant650.js';

const actionFor=x=>({id:`waiting:${x.id||x.title}`,kind:'waiting',title:x.title||x.name||'Čekám na odpověď',why:`Čekáš na reakci · ${x.when}`,next:'Udělej follow-up, uzavři čekání nebo posuň další kontrolu.',minutes:3,route:'today'});
const owner=x=>x.waitingOn||x.person||x.owner||x.contact||x.counterparty||'Druhá strana';
const since=x=>x.since||x.createdAt||x.created_at||x.at||null;
const follow=x=>x.followUpAt||x.follow_up_at||x.due||x.dueAt||null;
const fdate=v=>v?new Date(v).toLocaleDateString('cs-CZ'):'neurčeno';
const rowsHtml=w=>w.rows.map(x=>`<div class="waiting70-row"><div><b>${h(x.title||x.name||'Čekám na odpověď')}</b><div class="waiting70-meta"><span>Na tahu: <b>${h(owner(x))}</b></span><span>Od: ${h(fdate(since(x)))}</span><span>Další kontrola: ${h(fdate(follow(x)))}</span></div><div class="muted">${h(x.when)}</div></div><span class="ux64-status">${x.days!==null&&x.days<=0?'FOLLOW-UP':'ČEKÁM'}</span></div>`).join('');

export async function openPersonalWaiting650(){
 const w=personalWaitingCenter650(store.get());
 const body=`<div class="metric-strip"><div class="metric"><span>Celkem čekání</span><b>${w.count}</b></div><div class="metric"><span>Po follow-up</span><b>${w.overdue.length}</b></div><div class="metric"><span>Follow-up dnes</span><b>${w.today.length}</b></div><div class="metric"><span>Do 7 dní</span><b>${w.soon.length}</b></div></div><div class="card"><div class="eyebrow">KDO JE TEĎ NA TAHU</div><p class="muted">Každé čekání má být dohledatelné podle protistrany, stáří a další kontroly.</p>${rowsHtml(w)||'<div class="empty success-empty">Na nic důležitého teď nečekáš.</div>'}</div>`;
 const buttons=w.rows.slice(0,8).map((x,i)=>({label:`${x.days!==null&&x.days<=0?'Urgovat':'Otevřít'} · ${x.title||x.name||'Čekání'}`,value:`row:${i}`,primary:i===0&&x.days!==null&&x.days<=0}));buttons.push({label:'Zavřít',value:null});
 const choice=await modal('Čekám na',body,buttons);if(!String(choice||'').startsWith('row:'))return choice;
 const x=personalWaitingCenter650(store.get()).rows[Number(choice.split(':')[1])];if(!x)return null;return openPersonalAction641(actionFor(x));
}

export function personalWaitingSummary650(){const w=personalWaitingCenter650(store.get());return{count:w.count,overdue:w.overdue.length,today:w.today.length,soon:w.soon.length}}
