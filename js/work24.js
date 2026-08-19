import {store} from './state.js';
import {h,date,dayDiff,qs,qsa,modal} from './utils.js';

const groups=s=>{
 const g={overdue:[],today:[],week:[],later:[],nodate:[]},now=new Date(),today=now.toDateString();
 for(const t of s.tasks||[]){
  if(t.status==='HOTOVO')continue;
  if(!t.due){g.nodate.push(t);continue}
  const d=new Date(t.due),dd=dayDiff(t.due);
  if(d<now&&d.toDateString()!==today)g.overdue.push(t);
  else if(d.toDateString()===today)g.today.push(t);
  else if(dd<=7)g.week.push(t);else g.later.push(t);
 }
 return g;
};
const taskRow=(t,tone='')=>`<div class="work-task ${tone}"><div class="work-check"></div><div class="work-task-main"><b>${h(t.title)}</b><span>${h(t.area||'Úkol')}${t.due?' · '+date(t.due):' · bez termínu'}</span></div><div class="row-actions"><button class="btn primary" data-work-done="${t.id}">Hotovo</button><button class="btn" data-work-tomorrow="${t.id}">Zítra</button></div></div>`;

export function renderWork(){
 const s=store.get(),g=groups(s),projects=(s.projects||[]).filter(x=>!/hotov|archiv/i.test(x.status||''));
 const open=[...g.overdue,...g.today,...g.week,...g.later,...g.nodate].length;
 qs('#workView').innerHTML=`
  <div class="view-head"><div><div class="eyebrow">PRÁCE / COMMAND CENTER</div><h1>Co musí pohnout dopředu</h1><p>Úkoly, termíny a další kroky projektů na jednom místě.</p></div><div class="view-head-stat"><b>${open}</b><span>otevřených úkolů</span></div></div>
  <div class="metric-strip">
   <div class="metric"><span>Po termínu</span><b class="${g.overdue.length?'bad':'good'}">${g.overdue.length}</b></div>
   <div class="metric"><span>Dnes</span><b>${g.today.length}</b></div>
   <div class="metric"><span>Do 7 dní</span><b>${g.week.length}</b></div>
   <div class="metric"><span>Aktivní projekty</span><b>${projects.length}</b></div>
  </div>
  <div class="work-layout">
   <div class="card work-focus"><div class="card-head"><div><div class="eyebrow">AKČNÍ FRONTA</div><h2>Úkoly</h2></div><span class="status">${open} otevřených</span></div>
    ${g.overdue.length?`<div class="work-section"><div class="work-section-title bad">Po termínu · ${g.overdue.length}</div>${g.overdue.map(t=>taskRow(t,'urgent')).join('')}</div>`:''}
    ${g.today.length?`<div class="work-section"><div class="work-section-title warn">Dnes · ${g.today.length}</div>${g.today.map(t=>taskRow(t,'today')).join('')}</div>`:''}
    ${g.week.length?`<div class="work-section"><div class="work-section-title">Tento týden · ${g.week.length}</div>${g.week.map(t=>taskRow(t)).join('')}</div>`:''}
    ${g.later.length?`<div class="work-section"><div class="work-section-title">Později · ${g.later.length}</div>${g.later.slice(0,12).map(t=>taskRow(t)).join('')}${g.later.length>12?`<div class="muted" style="padding-top:8px">+ ${g.later.length-12} dalších úkolů</div>`:''}</div>`:''}
    ${g.nodate.length?`<div class="work-section"><div class="work-section-title">Bez termínu · ${g.nodate.length}</div>${g.nodate.slice(0,8).map(t=>taskRow(t)).join('')}${g.nodate.length>8?`<div class="muted" style="padding-top:8px">+ ${g.nodate.length-8} dalších bez termínu</div>`:''}</div>`:''}
    ${!open?'<div class="empty">Žádné otevřené úkoly. Můžeš řešit další krok projektu.</div>':''}
   </div>
   <div class="work-projects">
    <div class="card"><div class="card-head"><div><div class="eyebrow">PROJEKTY</div><h2>Aktivní</h2></div><span class="status">${projects.length}</span></div>
     <div class="project-stack">${projects.map(p=>`<div class="project-card"><div class="project-top"><b>${h(p.name)}</b><span class="status ${/risk|red|krit/i.test(p.status||'')?'bad':'good'}">${h(p.status||'Aktivní')}</span></div><div class="project-next"><span>Další krok</span><strong>${h(p.next||'Chybí konkrétní další krok')}</strong></div><button class="btn" data-project-next24="${p.id}">Upravit další krok</button></div>`).join('')||'<div class="empty">Žádný aktivní projekt.</div>'}</div>
    </div>
   </div>
  </div>`;
 qsa('[data-work-done]',qs('#workView')).forEach(b=>b.onclick=()=>store.mutate('Hotovo: úkol',x=>{const t=x.tasks.find(y=>y.id===b.dataset.workDone);if(t){t.status='HOTOVO';t.updatedAt=new Date().toISOString()}}));
 qsa('[data-work-tomorrow]',qs('#workView')).forEach(b=>b.onclick=()=>store.mutate('Úkol přesunut na zítra',x=>{const t=x.tasks.find(y=>y.id===b.dataset.workTomorrow);if(t){const d=new Date();d.setDate(d.getDate()+1);d.setHours(9,0,0,0);t.due=d.toISOString();t.updatedAt=new Date().toISOString()}}));
 qsa('[data-project-next24]',qs('#workView')).forEach(b=>b.onclick=()=>editNext(b.dataset.projectNext24));
}

async function editNext(id){
 const p=store.get().projects.find(x=>x.id===id);if(!p)return;
 const body=`<label class="muted">Další krok<input id="projectNext24" value="${h(p.next||'')}" style="display:block;width:100%;margin-top:6px;background:#0b1118;color:#fff;border:1px solid #304052;border-radius:10px;padding:10px"></label>`;
 const ok=await modal('Další krok projektu',body,[{label:'Zrušit',value:false},{label:'Uložit',value:true,primary:true}]);if(!ok)return;
 const value=qs('#projectNext24')?.value?.trim();
 store.mutate('Upraven další krok projektu',s=>{const x=s.projects.find(y=>y.id===id);if(x)x.next=value||'Chybí konkrétní další krok'});
}
