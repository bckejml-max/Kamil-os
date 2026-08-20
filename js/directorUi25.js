import {store} from './state.js';
import {directorOS} from './director25.js';
import {h,date,qs,qsa} from './utils.js';

const hostId='director25Host';
const tone=x=>x>=95?'bad':x>=85?'warn':'';
const actionTone=x=>['ESKALOVAT','FOLLOW-UP'].includes(x)?'warn':['ROZHODNOUT','URČIT KROK'].includes(x)?'bad':'';

function card(){
 const d=directorOS(store.get());
 return `<div class="card" id="${hostId}" style="margin-bottom:12px">
  <div class="card-head"><div><div class="eyebrow">DIRECTOR OS / 25.9</div><h2>Co má řešit ředitel, ne operativa</h2></div><span class="status ${d.critical?'bad':d.total?'warn':'good'}">${d.total} zásahů</span></div>
  <div class="metric-strip"><div class="metric"><span>Kritické</span><b class="${d.critical?'bad':'good'}">${d.critical}</b></div><div class="metric"><span>Rozhodnutí</span><b>${d.decisions}</b></div><div class="metric"><span>Eskalace / follow-up</span><b>${d.escalations}</b></div><div class="metric"><span>Aktivní projekty</span><b>${d.projects}</b></div></div>
  <div class="decision-note ${d.critical?'warn':''}">${h(d.summary)}</div>
  <div class="intel-list">${d.items.map((x,i)=>`<div class="intel-row"><div class="intel-main"><div><span class="status ${tone(x.priority)}">#${i+1} · ${x.priority}</span> <span class="decision-action ${actionTone(x.action)}">${h(x.action)}</span></div><b>${h(x.title)}</b><span>${h(x.reason)}</span><small>${x.owner?`Odpovědnost: ${h(x.owner)} · `:''}${x.due?`termín ${h(date(x.due))} · `:''}${h(x.source)}</small></div><div class="row-actions">${x.projectId?`<button class="btn" data-director-project="${h(x.projectId)}">Projekt</button>`:''}${x.kind==='TASK'?`<button class="btn" data-director-task="${h(x.id.replace('task:',''))}">Úkol</button>`:''}</div></div>`).join('')||'<div class="empty success-empty">Žádná ředitelská eskalace podle uložených dat.</div>'}</div>
  <div class="decision-note">${h(d.note)} Delegovaný úkol po termínu se vrací jako eskalace, ne jako pokyn, abys ho automaticky převzal zpět.</div>
 </div>`;
}

function bind(view){
 qsa('[data-director-project]',view).forEach(b=>b.onclick=()=>{const target=qs(`[data-project-open24="${CSS.escape(b.dataset.directorProject)}"]`,view);target?.click()});
 qsa('[data-director-task]',view).forEach(b=>b.onclick=()=>{const target=qs(`[data-work-edit="${CSS.escape(b.dataset.directorTask)}"]`,view);target?.click()});
}
function mount(){
 const view=qs('#workView');if(!view||qs(`#${hostId}`,view)||!view.childElementCount||qs('#projectBack24',view))return;
 const wrap=document.createElement('div');wrap.innerHTML=card();const node=wrap.firstElementChild;
 const head=view.querySelector('.view-head');if(head?.parentNode)head.parentNode.insertBefore(node,head.nextSibling);else view.prepend(node);bind(view);
}
const start=()=>{const view=qs('#workView');if(!view)return;new MutationObserver(()=>{if(!qs(`#${hostId}`,view)&&view.childElementCount&&!qs('#projectBack24',view))queueMicrotask(mount)}).observe(view,{childList:true});if(view.childElementCount)mount()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
