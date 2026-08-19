import {store} from './state.js';
import {h,date,dayDiff,uid,qs,qsa,modal,toast} from './utils.js';

let selectedProjectId=null;
const activeProjects=s=>(s.projects||[]).filter(x=>!/hotov|archiv/i.test(x.status||''));
const riskLabel=v=>({LOW:'Nízké',MEDIUM:'Střední',HIGH:'Vysoké'}[String(v||'LOW').toUpperCase()]||v||'Nízké');
const riskTone=p=>String(p.risk||'LOW').toUpperCase()==='HIGH'?'bad':String(p.risk||'LOW').toUpperCase()==='MEDIUM'?'warn':'good';
const projectDeadlineTone=p=>{if(!p.deadline)return'';const d=dayDiff(p.deadline);return d<0?'bad':d<=14?'warn':'good'};
const linkedTasks=(s,id)=>(s.tasks||[]).filter(t=>t.projectId===id);
const openLinked=(s,id)=>linkedTasks(s,id).filter(t=>t.status!=='HOTOVO');
const projectOptions=(s,selected='')=>`<option value="">Bez projektu</option>${activeProjects(s).map(p=>`<option value="${h(p.id)}" ${p.id===selected?'selected':''}>${h(p.name)}</option>`).join('')}`;

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
const projectName=(s,id)=>id?(s.projects||[]).find(p=>p.id===id)?.name:'';
const taskMeta=(s,t)=>{
 const bits=[projectName(s,t.projectId)||t.area||'Úkol'];
 if(t.owner)bits.push(t.owner);
 bits.push(t.due?date(t.due):'bez termínu');
 if(String(t.priority||'').toUpperCase()==='HIGH')bits.push('vysoká priorita');
 return bits.join(' · ');
};
const taskRow=(s,t,tone='')=>`<div class="work-task ${tone}"><div class="work-check"></div><div class="work-task-main"><b>${h(t.title)}</b><span>${h(taskMeta(s,t))}</span></div><div class="row-actions"><button class="btn primary" data-work-done="${t.id}">Hotovo</button><button class="btn" data-work-tomorrow="${t.id}">Zítra</button><button class="btn quiet-action" data-work-edit="${t.id}">Upravit</button></div></div>`;

export function renderWork(){
 const s=store.get();
 if(selectedProjectId){const p=(s.projects||[]).find(x=>x.id===selectedProjectId);if(p){renderProjectDetail(s,p);return}selectedProjectId=null}
 renderOverview(s);
}

function renderOverview(s){
 const g=groups(s),projects=activeProjects(s),open=[...g.overdue,...g.today,...g.week,...g.later,...g.nodate].length;
 const risky=projects.filter(p=>riskTone(p)==='bad'||projectDeadlineTone(p)==='bad').length;
 qs('#workView').innerHTML=`
  <div class="view-head"><div><div class="eyebrow">PRÁCE / COMMAND CENTER</div><h1>Co musí pohnout dopředu</h1><p>Úkoly, termíny, rizika a odpovědnost projektů na jednom místě.</p></div><div class="view-head-stat"><b>${open}</b><span>otevřených úkolů</span></div></div>
  <div class="metric-strip">
   <div class="metric"><span>Po termínu</span><b class="${g.overdue.length?'bad':'good'}">${g.overdue.length}</b></div>
   <div class="metric"><span>Dnes</span><b>${g.today.length}</b></div>
   <div class="metric"><span>Rizikové projekty</span><b class="${risky?'bad':'good'}">${risky}</b></div>
   <div class="metric"><span>Aktivní projekty</span><b>${projects.length}</b></div>
  </div>
  <div class="work-layout">
   <div class="card work-focus"><div class="card-head"><div><div class="eyebrow">AKČNÍ FRONTA</div><h2>Úkoly</h2></div><div class="row-actions"><span class="status">${open} otevřených</span><button class="btn" data-capture-work>＋ Přidat</button></div></div>
    ${g.overdue.length?`<div class="work-section"><div class="work-section-title bad">Po termínu · ${g.overdue.length}</div>${g.overdue.map(t=>taskRow(s,t,'urgent')).join('')}</div>`:''}
    ${g.today.length?`<div class="work-section"><div class="work-section-title warn">Dnes · ${g.today.length}</div>${g.today.map(t=>taskRow(s,t,'today')).join('')}</div>`:''}
    ${g.week.length?`<div class="work-section"><div class="work-section-title">Tento týden · ${g.week.length}</div>${g.week.map(t=>taskRow(s,t)).join('')}</div>`:''}
    ${g.later.length?`<div class="work-section"><div class="work-section-title">Později · ${g.later.length}</div>${g.later.slice(0,12).map(t=>taskRow(s,t)).join('')}${g.later.length>12?`<div class="muted" style="padding-top:8px">+ ${g.later.length-12} dalších úkolů</div>`:''}</div>`:''}
    ${g.nodate.length?`<div class="work-section"><div class="work-section-title">Bez termínu · ${g.nodate.length}</div>${g.nodate.slice(0,8).map(t=>taskRow(s,t)).join('')}${g.nodate.length>8?`<div class="muted" style="padding-top:8px">+ ${g.nodate.length-8} dalších bez termínu</div>`:''}</div>`:''}
    ${!open?'<div class="empty">Žádné otevřené úkoly. Můžeš řešit další krok projektu.</div>':''}
   </div>
   <div class="work-projects">
    <div class="card"><div class="card-head"><div><div class="eyebrow">PROJEKTY</div><h2>Aktivní</h2></div><div class="row-actions"><span class="status">${projects.length}</span><button class="btn" data-capture-project>＋ Projekt</button></div></div>
     <div class="project-stack">${projects.map(p=>projectCard(s,p)).join('')||'<div class="empty">Žádný aktivní projekt.</div>'}</div>
    </div>
   </div>
  </div>`;
 bindTaskActions();
 qsa('[data-capture-work]',qs('#workView')).forEach(b=>b.onclick=()=>window.dispatchEvent(new CustomEvent('kamil:capture',{detail:'task'})));
 qsa('[data-capture-project]',qs('#workView')).forEach(b=>b.onclick=()=>window.dispatchEvent(new CustomEvent('kamil:capture',{detail:'project'})));
 qsa('[data-project-open24]',qs('#workView')).forEach(b=>b.onclick=()=>{selectedProjectId=b.dataset.projectOpen24;renderWork();window.scrollTo({top:0,behavior:'smooth'})});
 qsa('[data-project-edit24]',qs('#workView')).forEach(b=>b.onclick=()=>editProject(b.dataset.projectEdit24));
}

function projectCard(s,p){
 const open=openLinked(s,p.id),over=open.filter(t=>t.due&&dayDiff(t.due)<0).length,deadline=p.deadline?date(p.deadline):'Bez termínu';
 return `<div class="project-card project-card24"><div class="project-top"><div><b>${h(p.name)}</b><div class="project-owner">${h(p.owner||'Bez odpovědné osoby')}</div></div><span class="status ${riskTone(p)}">${h(riskLabel(p.risk))} riziko</span></div>
  <div class="project-meta24"><span><b>${open.length}</b> otevřených úkolů</span><span class="${over?'bad':''}"><b>${over}</b> po termínu</span><span class="${projectDeadlineTone(p)}">${h(deadline)}</span></div>
  <div class="project-next"><span>Další krok</span><strong>${h(p.next||'Chybí konkrétní další krok')}</strong></div>
  <div class="row-actions"><button class="btn primary" data-project-open24="${p.id}">Otevřít projekt</button><button class="btn" data-project-edit24="${p.id}">Upravit</button></div></div>`;
}

function renderProjectDetail(s,p){
 const tasks=linkedTasks(s,p.id),open=tasks.filter(t=>t.status!=='HOTOVO'),over=open.filter(t=>t.due&&dayDiff(t.due)<0),done=tasks.length-open.length;
 const available=(s.tasks||[]).filter(t=>t.status!=='HOTOVO'&&!t.projectId);
 qs('#workView').innerHTML=`
  <div class="subview-bar"><button class="btn" id="projectBack24">← Projekty</button><div><span>PRÁCE / PROJEKT</span><b>${h(p.name)}</b></div></div>
  <div class="view-head project-detail-head"><div><div class="eyebrow">PROJEKTOVÝ COMMAND CENTER</div><h1>${h(p.name)}</h1><p>${h(p.notes||'Doplň kontext projektu, odpovědnost a konkrétní další krok.')}</p></div><div class="row-actions"><button class="btn" id="projectEditDetail24">Upravit projekt</button><button class="btn" id="projectLinkTask24" ${available.length?'':'disabled'}>Připojit úkol</button><button class="btn primary" id="projectAddTask24">＋ Úkol</button></div></div>
  <div class="metric-strip project-metrics">
   <div class="metric"><span>Otevřené úkoly</span><b>${open.length}</b></div>
   <div class="metric"><span>Po termínu</span><b class="${over.length?'bad':'good'}">${over.length}</b></div>
   <div class="metric"><span>Termín projektu</span><b class="${projectDeadlineTone(p)}">${p.deadline?date(p.deadline):'—'}</b></div>
   <div class="metric"><span>Riziko</span><b class="${riskTone(p)}">${h(riskLabel(p.risk))}</b></div>
  </div>
  <div class="grid two project-summary-grid">
   <div class="card project-brief"><div class="eyebrow">ŘÍZENÍ</div><div class="project-fact"><span>Odpovědnost</span><b>${h(p.owner||'Neurčeno')}</b></div><div class="project-fact"><span>Stav</span><b>${h(p.status||'Aktivní')}</b></div><div class="project-fact"><span>Hotovo</span><b>${done} úkolů</b></div><div class="project-fact"><span>Deadline</span><b class="${projectDeadlineTone(p)}">${p.deadline?date(p.deadline):'Bez termínu'}</b></div></div>
   <div class="card project-next-card"><div class="eyebrow">DALŠÍ KROK</div><div class="project-big-next">${h(p.next||'Chybí konkrétní další krok')}</div><p class="muted">Projekt by měl mít vždy jeden jasný nejbližší krok. Když chybí, Kamil OS ho bude považovat za riziko.</p><button class="btn" id="projectEditNext24">Upravit další krok</button></div>
  </div>
  <div class="card project-task-card"><div class="card-head"><div><div class="eyebrow">ÚKOLY PROJEKTU</div><h2>${open.length} otevřených · ${done} hotovo</h2></div><div class="row-actions"><button class="btn" id="projectLinkTask24b" ${available.length?'':'disabled'}>Připojit existující</button><button class="btn primary" id="projectAddTask24b">＋ Přidat úkol</button></div></div>
   ${over.length?`<div class="work-section"><div class="work-section-title bad">Po termínu · ${over.length}</div>${over.map(t=>taskRow(s,t,'urgent')).join('')}</div>`:''}
   ${open.filter(t=>!over.includes(t)).map(t=>taskRow(s,t,t.due&&dayDiff(t.due)===0?'today':'')).join('')||(!over.length?'<div class="empty">Projekt zatím nemá otevřené úkoly.</div>':'')}
  </div>
  <div class="project-detail-footer"><button class="btn" id="projectArchive24">Označit projekt jako hotový</button></div>`;
 qs('#projectBack24').onclick=()=>{selectedProjectId=null;renderWork()};
 qs('#projectEditDetail24').onclick=()=>editProject(p.id);
 qs('#projectEditNext24').onclick=()=>editNext(p.id);
 qs('#projectAddTask24').onclick=()=>addProjectTask(p.id);qs('#projectAddTask24b').onclick=()=>addProjectTask(p.id);
 qs('#projectLinkTask24').onclick=()=>linkExistingTask(p.id);qs('#projectLinkTask24b').onclick=()=>linkExistingTask(p.id);
 qs('#projectArchive24').onclick=()=>finishProject(p.id);
 bindTaskActions();
}

function bindTaskActions(){
 qsa('[data-work-done]',qs('#workView')).forEach(b=>b.onclick=()=>store.mutate('Hotovo: úkol',x=>{const t=x.tasks.find(y=>y.id===b.dataset.workDone);if(t){t.status='HOTOVO';t.updatedAt=new Date().toISOString()}}));
 qsa('[data-work-tomorrow]',qs('#workView')).forEach(b=>b.onclick=()=>store.mutate('Úkol přesunut na zítra',x=>{const t=x.tasks.find(y=>y.id===b.dataset.workTomorrow);if(t){const d=new Date();d.setDate(d.getDate()+1);d.setHours(9,0,0,0);t.due=d.toISOString();t.updatedAt=new Date().toISOString()}}));
 qsa('[data-work-edit]',qs('#workView')).forEach(b=>b.onclick=()=>editTask(b.dataset.workEdit));
}

async function editTask(id){
 const s=store.get(),t=s.tasks.find(x=>x.id===id);if(!t)return;
 const body=`<div class="form-grid capture-form"><label class="wide-field">Úkol<input id="taskTitle24" autofocus value="${h(t.title||'')}"></label><label>Termín<input id="taskDue24" type="date" value="${t.due?String(t.due).slice(0,10):''}"></label><label>Projekt<select id="taskProject24">${projectOptions(s,t.projectId||'')}</select></label><label>Odpovědnost<input id="taskOwner24" value="${h(t.owner||'')}"></label><label>Oblast<input id="taskArea24" value="${h(t.area||'Práce')}"></label><label>Priorita<select id="taskPriority24"><option value="NORMAL" ${String(t.priority||'NORMAL').toUpperCase()==='NORMAL'?'selected':''}>Normální</option><option value="HIGH" ${String(t.priority||'').toUpperCase()==='HIGH'?'selected':''}>Vysoká</option></select></label></div>`;
 const ok=await modal('Upravit úkol',body,[{label:'Zrušit',value:false},{label:'Uložit úkol',value:true,primary:true}]);if(!ok)return;
 const title=qs('#taskTitle24')?.value?.trim();if(!title)return toast('Úkol musí mít název');
 store.mutate(`Upraven úkol: ${title}`,x=>{const q=x.tasks.find(y=>y.id===id);if(!q)return;const projectId=qs('#taskProject24')?.value||null,project=(x.projects||[]).find(p=>p.id===projectId);q.title=title;q.due=qs('#taskDue24')?.value?new Date(qs('#taskDue24').value+'T09:00:00').toISOString():null;q.projectId=projectId;q.owner=qs('#taskOwner24')?.value?.trim()||'';q.area=project?.name||qs('#taskArea24')?.value?.trim()||'Práce';q.priority=qs('#taskPriority24')?.value||'NORMAL';q.updatedAt=new Date().toISOString()});
}

async function editProject(id){
 const p=store.get().projects.find(x=>x.id===id);if(!p)return;
 const body=`<div class="form-grid capture-form"><label class="wide-field">Název<input id="projectName24" autofocus value="${h(p.name||'')}"></label><label>Odpovědná osoba<input id="projectOwner24" value="${h(p.owner||'')}"></label><label>Deadline<input id="projectDeadline24" type="date" value="${p.deadline?String(p.deadline).slice(0,10):''}"></label><label>Riziko<select id="projectRisk24"><option value="LOW" ${String(p.risk||'LOW').toUpperCase()==='LOW'?'selected':''}>Nízké</option><option value="MEDIUM" ${String(p.risk||'').toUpperCase()==='MEDIUM'?'selected':''}>Střední</option><option value="HIGH" ${String(p.risk||'').toUpperCase()==='HIGH'?'selected':''}>Vysoké</option></select></label><label>Stav<input id="projectStatus24" value="${h(p.status||'Aktivní')}"></label><label class="wide-field">Další krok<input id="projectNext24" value="${h(p.next||'')}"></label><label class="wide-field">Poznámka<textarea id="projectNotes24" rows="3">${h(p.notes||'')}</textarea></label></div>`;
 const ok=await modal('Upravit projekt',body,[{label:'Zrušit',value:false},{label:'Uložit projekt',value:true,primary:true}]);if(!ok)return;
 const name=qs('#projectName24')?.value?.trim();if(!name)return toast('Projekt musí mít název');
 store.mutate(`Upraven projekt: ${name}`,s=>{const x=s.projects.find(y=>y.id===id);if(!x)return;x.name=name;x.owner=qs('#projectOwner24')?.value?.trim()||'';x.deadline=qs('#projectDeadline24')?.value||null;x.risk=qs('#projectRisk24')?.value||'LOW';x.status=qs('#projectStatus24')?.value?.trim()||'Aktivní';x.next=qs('#projectNext24')?.value?.trim()||'Chybí konkrétní další krok';x.notes=qs('#projectNotes24')?.value?.trim()||'';x.updatedAt=new Date().toISOString();for(const t of s.tasks||[])if(t.projectId===id&&!t.area)t.area=name});
}

async function editNext(id){
 const p=store.get().projects.find(x=>x.id===id);if(!p)return;
 const body=`<label class="muted">Další krok<input id="projectNext24" autofocus value="${h(p.next||'')}" style="display:block;width:100%;margin-top:6px;background:#0b1118;color:#fff;border:1px solid #304052;border-radius:10px;padding:10px"></label>`;
 const ok=await modal('Další krok projektu',body,[{label:'Zrušit',value:false},{label:'Uložit',value:true,primary:true}]);if(!ok)return;
 const value=qs('#projectNext24')?.value?.trim();
 store.mutate('Upraven další krok projektu',s=>{const x=s.projects.find(y=>y.id===id);if(x){x.next=value||'Chybí konkrétní další krok';x.updatedAt=new Date().toISOString()}});
}

async function addProjectTask(id){
 const p=store.get().projects.find(x=>x.id===id);if(!p)return;
 const body=`<div class="form-grid capture-form"><label class="wide-field">Úkol<input id="projectTaskTitle24" autofocus placeholder="Co se musí udělat?"></label><label>Termín<input id="projectTaskDue24" type="date"></label><label>Odpovědnost<input id="projectTaskOwner24" value="${h(p.owner||'')}"></label><label>Priorita<select id="projectTaskPriority24"><option value="NORMAL">Normální</option><option value="HIGH">Vysoká</option></select></label></div>`;
 const ok=await modal(`Nový úkol · ${p.name}`,body,[{label:'Zrušit',value:false},{label:'Přidat úkol',value:true,primary:true}]);if(!ok)return;
 const title=qs('#projectTaskTitle24')?.value?.trim();if(!title)return toast('Napiš název úkolu');
 const due=qs('#projectTaskDue24')?.value||null,priority=qs('#projectTaskPriority24')?.value||'NORMAL',owner=qs('#projectTaskOwner24')?.value?.trim()||'';
 store.mutate(`Přidán projektový úkol: ${title}`,s=>s.tasks.unshift({id:uid('task'),title,status:'UDĚLAT',priority,owner,area:p.name,projectId:id,due:due?new Date(due+'T09:00:00').toISOString():null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}));
}

async function linkExistingTask(id){
 const s=store.get(),p=s.projects.find(x=>x.id===id);if(!p)return;
 const available=(s.tasks||[]).filter(t=>t.status!=='HOTOVO'&&!t.projectId);
 if(!available.length){toast('Žádný volný otevřený úkol k připojení');return}
 const body=`<label>Existující úkol<select id="projectExistingTask24" autofocus>${available.map(t=>`<option value="${h(t.id)}">${h(t.title)}${t.due?' · '+h(date(t.due)):''}</option>`).join('')}</select></label>`;
 const ok=await modal(`Připojit úkol · ${p.name}`,body,[{label:'Zrušit',value:false},{label:'Připojit',value:true,primary:true}]);if(!ok)return;
 const taskId=qs('#projectExistingTask24')?.value;if(!taskId)return;
 store.mutate(`Úkol připojen k projektu: ${p.name}`,x=>{const t=x.tasks.find(y=>y.id===taskId);if(t){t.projectId=id;t.area=p.name;if(!t.owner&&p.owner)t.owner=p.owner;t.updatedAt=new Date().toISOString()}});
}

async function finishProject(id){
 const p=store.get().projects.find(x=>x.id===id);if(!p)return;
 const ok=await modal('Označit projekt jako hotový?',`<p class="muted">Projekt <b>${h(p.name)}</b> zmizí z aktivních projektů. Jeho úkoly nemažu.</p>`,[{label:'Zrušit',value:false},{label:'Dokončit projekt',value:true,primary:true}]);if(!ok)return;
 selectedProjectId=null;
 store.mutate(`Dokončen projekt: ${p.name}`,s=>{const x=s.projects.find(y=>y.id===id);if(x){x.status='Hotovo';x.completedAt=new Date().toISOString();x.updatedAt=new Date().toISOString()}});
}

window.addEventListener('kamil:project',e=>{
 selectedProjectId=e.detail||null;
 window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'work'}));
});
