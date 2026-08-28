import {store} from './state.js';
import {buildLifeOperator298} from './lifeOperator298.js';

export function buildUniversalInbox302(s=store.get(),now=Date.now()){
 const life=buildLifeOperator298(s,now),rows=(life.inbox||[]).map(x=>({id:x.id,title:x.title,area:x.area||'Osobní',source:x.kind==='waiting'?'Čekám':x.kind==='task'?'Úkol':x.kind==='admin'?'Administrativa':'Inbox',days:x.days,score:x.score,item:x.source}));
 return{version:302,rows,urgent:rows.filter(x=>x.days!==null&&x.days<=1),triage:rows.filter(x=>x.source==='Inbox'),waiting:rows.filter(x=>x.source==='Čekám'),count:rows.length,at:now};
}
export function openUniversalInbox302(){const m=buildUniversalInbox302(),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const rows=m.rows.slice(0,20).map(x=>`<div class="uin302-row"><span><b>${esc(x.title)}</b><small>${esc(x.area)} · ${esc(x.source)}${x.days==null?'':` · ${x.days<0?`${Math.abs(x.days)} d po termínu`:x.days===0?'dnes':`za ${x.days} d`}`}</small></span><strong>${Math.round(x.score||0)}</strong></div>`).join('')||'<div class="uin302-clear">Inbox je čistý.</div>';window.dispatchEvent(new CustomEvent('kamil:detail-drawer',{detail:{title:`Universal Inbox · ${m.count}`,html:`<div class="uin302"><div class="uin302-summary"><span><b>${m.urgent.length}</b><small>urgentní</small></span><span><b>${m.triage.length}</b><small>k vytřídění</small></span><span><b>${m.waiting.length}</b><small>čekám</small></span></div>${rows}</div>`}}));return m}
window.__KAMIL_UNIVERSAL_INBOX302__={build:buildUniversalInbox302,open:openUniversalInbox302};
