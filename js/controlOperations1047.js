import {store} from './state.js';
import {modal,formModal,h,toast} from './utils.js';
import {
 systemHealth988,errorDeduplication990,automaticBackupSnapshot998,backupSnapshotList998,restoreCenter999,
 unifiedWatchEngine1030,personalAutomationBuilder1035,runSafeAutomations1035,syncConflictCenter1011,
 openControlPlane1037
} from './controlPlane1037.js';

export const CONTROL_OPERATIONS1047_VERSION='1047.0.0';
const SNAPSHOT_KEY='kamil.control.snapshots.998';
const WATCH_KEY='kamil.control.watches.1030';
const WATCH_STATE_KEY='kamil.control.watch-state.1031';
const AUTOMATION_KEY='kamil.control.automations.1035';
const AUTOMATION_RUN_KEY='kamil.control.automation-runs.1044';
const CONFLICT_KEY='kamil.control.conflicts.1011';
const A=v=>Array.isArray(v)?v:[];
const U=v=>String(v||'').toUpperCase();
const read=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const now=()=>new Date().toISOString();
const count=s=>({
 tasks:A(s?.tasks).length,projects:A(s?.projects).length,inbox:A(s?.inbox).length,personalInbox:A(s?.personalInbox?.items).length,
 tickets:A(s?.ticketBook?.items).length,properties:A(s?.propertyBook?.candidates||s?.propertyBook?.items).length,
 goals:A(s?.personalGoals?.items).length,assets:A(s?.assetBook?.items).length,audit:A(s?.audit).length
});

// OS1038 · concise operational summary over the OS1037 Control Plane.
export function operationsOverview1038(){
 const health=systemHealth988();
 return{version:CONTROL_OPERATIONS1047_VERSION,health:health.score,snapshots:backupSnapshotList998().length,watches:A(read(WATCH_KEY,[])).length,automations:A(read(AUTOMATION_KEY,[])).length,conflicts:A(read(CONFLICT_KEY,[])).filter(x=>x.status==='NEEDS_REVIEW').length,errors:errorDeduplication990().length,policy:{externalWrites:false,financialExecution:false,bettingExecution:false}};
}

// OS1039 · bounded domain-level snapshot diff; never mutates state.
export function snapshotDiff1039(snapshotId){
 const row=A(read(SNAPSHOT_KEY,[])).find(x=>x.id===snapshotId);if(!row)return{ok:false,reason:'SNAPSHOT_NOT_FOUND'};
 const before=count(row.state||{}),after=count(store.get()),domains=Object.keys(after).map(key=>({domain:key,before:before[key]||0,after:after[key]||0,delta:(after[key]||0)-(before[key]||0)}));
 const beforeMeta=row.state?.meta||{},afterMeta=store.get()?.meta||{};
 return{ok:true,snapshot:{id:row.id,at:row.at,reason:row.reason},domains,changed:domains.filter(x=>x.delta!==0),meta:{schemaBefore:Number(beforeMeta.schemaVersion||0),schemaAfter:Number(afterMeta.schemaVersion||0),lastMutationBefore:beforeMeta.lastMutationAt||null,lastMutationAfter:afterMeta.lastMutationAt||null},mode:'READ_ONLY_DIFF'};
}

// OS1040 · restore can only execute with an explicit typed confirmation token.
export function confirmedRestore1040(snapshotId,confirmation=''){
 const dry=restoreCenter999(snapshotId,{apply:false});if(!dry.ok)return dry;if(String(confirmation).trim()!=='RESTORE')return{ok:false,needsConfirmation:true,token:'RESTORE',dryRun:dry,applied:false};
 const result=restoreCenter999(snapshotId,{apply:true});return{...result,confirmed:true};
}

const WATCH_FIELDS={MONEY:['free','cash','netWorth','receivables'],TICKETS:['capital','expectedNet','missingMarket'],BETTING:['profit','roi','withClv'],PROPERTY:['missing'],WORK:['open']};
// OS1041 · create only supported local watch contracts. Threshold execution is intentionally not invented.
export function createWatch1041(input={}){
 const kind=U(input.kind),fields=WATCH_FIELDS[kind];if(!fields)return{ok:false,reason:'UNSUPPORTED_KIND'};const field=String(input.field||fields[0]);if(!fields.includes(field))return{ok:false,reason:'UNSUPPORTED_FIELD'};
 const subject=String(input.subject||`${kind} ${field}`).trim();const row=unifiedWatchEngine1030({kind,field,subject,condition:'CHANGED',threshold:null,enabled:input.enabled!==false,source:'OS1041'});return{ok:true,row};
}

// OS1042 · enable/disable and inspect watches without deleting history.
export function watchManager1042(){
 const states=read(WATCH_STATE_KEY,{});return A(read(WATCH_KEY,[])).map(x=>({...x,lastValue:states[x.id]?.value??null,lastCheckedAt:states[x.id]?.at||null}));
}
export function setWatchEnabled1042(id,enabled){const rows=A(read(WATCH_KEY,[])),x=rows.find(r=>r.id===id);if(!x)return{ok:false,reason:'WATCH_NOT_FOUND'};x.enabled=!!enabled;x.updatedAt=now();write(WATCH_KEY,rows);return{ok:true,row:x};}

const CONDITIONS=['HEALTH_BELOW','DATA_GAPS_ABOVE','TASKS_ABOVE','WATCH_CHANGED'];
const ACTIONS=['NOTIFY','CREATE_TASK','CREATE_INBOX_ITEM'];
// OS1043 · practical builder wrapper; every new rule starts disabled.
export function createAutomation1043(input={}){
 const condition=U(input.condition),action=U(input.action);if(!CONDITIONS.includes(condition)||!ACTIONS.includes(action))return{ok:false,reason:'RULE_NOT_ALLOWED'};
 const result=personalAutomationBuilder1035({name:String(input.name||'Automation'),condition:{type:condition,value:Number(input.value||0)},action:{type:action,title:String(input.title||input.name||'Automation')},enabled:false,source:'OS1043'});return result;
}
export function setAutomationEnabled1043(id,enabled){const rows=A(read(AUTOMATION_KEY,[])),x=rows.find(r=>r.id===id);if(!x)return{ok:false,reason:'AUTOMATION_NOT_FOUND'};x.enabled=!!enabled;x.updatedAt=now();write(AUTOMATION_KEY,rows);return{ok:true,row:x};}

// OS1044 · manual safe-run history. It delegates execution to OS1035 safety rules.
export function runAutomations1044(){const results=runSafeAutomations1035();const rows=A(read(AUTOMATION_RUN_KEY,[]));const entry={id:`run1044-${Date.now()}`,at:now(),results};rows.push(entry);write(AUTOMATION_RUN_KEY,rows.slice(-100));return entry;}
export function automationHistory1044(){return A(read(AUTOMATION_RUN_KEY,[])).slice().reverse();}

// OS1045 · records a conflict decision but does not silently overwrite canonical data.
export function resolveConflict1045(id,resolution){
 const allowed=['KEEP_LOCAL','KEEP_REMOTE','DISMISS'],choice=U(resolution);if(!allowed.includes(choice))return{ok:false,reason:'INVALID_RESOLUTION'};
 const rows=A(read(CONFLICT_KEY,[])),x=rows.find(r=>r.id===id);if(!x)return{ok:false,reason:'CONFLICT_NOT_FOUND'};x.status='REVIEWED';x.resolution=choice;x.reviewedAt=now();x.applied=false;x.note='Decision recorded only; canonical merge requires an explicit application path.';write(CONFLICT_KEY,rows);return{ok:true,row:x};
}
export function conflictQueue1045(){return A(read(CONFLICT_KEY,[])).filter(x=>x.status==='NEEDS_REVIEW');}

function healthLabel(){const score=Math.round(systemHealth988().score);return{score,label:window.matchMedia?.('(max-width:850px)')?.matches?String(score):`OS ${score}`};}
// OS1046 · visible health in normal flow, without another dashboard.
export function installHealthRibbon1046(){
 let btn=document.querySelector('[data-os-health-1046]');if(!btn){const host=document.querySelector('.top-actions');if(!host)return false;btn=document.createElement('button');btn.type='button';btn.className='btn';btn.dataset.osHealth1046='1';btn.onclick=()=>openOperations1047();host.insertBefore(btn,host.querySelector('#syncStatus')||host.firstChild)}
 const refresh=()=>{const x=healthLabel();btn.textContent=x.label;btn.title=`Kamil OS health ${x.score}/100 · otevřít Operations`;btn.setAttribute('aria-label',btn.title);btn.dataset.score=String(x.score)};refresh();
 if(!window.__KAMIL_HEALTH_RIBBON1046__){window.addEventListener('online',refresh);window.addEventListener('offline',refresh);window.addEventListener('resize',refresh);window.addEventListener('kamil:oneos-change',refresh);window.__KAMIL_HEALTH_RIBBON1046__=true}
 return true;
}

const option=(value,label)=>`<option value="${h(value)}">${h(label)}</option>`;
async function openSnapshotOps(){
 const list=backupSnapshotList998();const v=await modal('Snapshot Operations · OS1039/1040',`<div class="card"><div class="row"><span>Snapshotů</span><b>${list.length}</b></div></div>${list.slice(0,8).map(x=>`<div class="row"><div><b>${h(x.reason)}</b><div class="muted">${h(new Date(x.at).toLocaleString('cs-CZ'))}</div></div><span>${h(x.id)}</span></div>`).join('')||'<div class="empty">Žádný snapshot.</div>'}`,[{label:'Vytvořit snapshot',value:'create',primary:true},{label:list.length?'Porovnat snapshot':'Porovnat',value:list.length?'diff':null},{label:list.length?'Obnovit snapshot':'Obnovit',value:list.length?'restore':null},{label:'Zavřít',value:null}]);
 if(v==='create'){automaticBackupSnapshot998('manual-operations-1047');toast('Snapshot vytvořen');return openSnapshotOps()}
 if((v==='diff'||v==='restore')&&list.length){const f=await formModal(v==='diff'?'Vyber snapshot k porovnání':'Potvrzený restore',`<label>Snapshot<select name="id">${list.map(x=>option(x.id,`${x.reason} · ${new Date(x.at).toLocaleString('cs-CZ')}`)).join('')}</select></label>${v==='restore'?'<label>Napiš RESTORE<input name="confirm" autocomplete="off"></label>':''}`);if(!f)return null;if(v==='diff'){const d=snapshotDiff1039(f.id);return modal('Snapshot diff · OS1039',`<div class="card">${d.domains.map(x=>`<div class="row"><span>${h(x.domain)}</span><b>${x.before} → ${x.after}${x.delta?` (${x.delta>0?'+':''}${x.delta})`:''}</b></div>`).join('')}</div>`,[{label:'Zavřít',value:null,primary:true}])}const r=confirmedRestore1040(f.id,f.confirm);toast(r.ok?'Snapshot obnoven':r.needsConfirmation?'Restore vyžaduje přesný text RESTORE':'Restore se nepodařil');return r}
 return v;
}
async function openWatches(){
 const rows=watchManager1042(),v=await modal('Watch Manager · OS1041/1042',`<div class="card"><div class="row"><span>Watch pravidel</span><b>${rows.length}</b></div></div>${rows.map(x=>`<div class="row"><div><b>${h(x.subject)}</b><div class="muted">${h(x.kind)} · ${h(x.field)} · poslední ${h(x.lastValue??'—')}</div></div><b>${x.enabled?'ON':'OFF'}</b></div>`).join('')||'<div class="empty">Žádné watch pravidlo.</div>'}`,[{label:'Nové watch',value:'new',primary:true},{label:rows.length?'Zapnout / vypnout':'Správa',value:rows.length?'toggle':null},{label:'Zavřít',value:null}]);
 if(v==='new'){const f=await formModal('Nové watch pravidlo',`<label>Oblast<select name="kind">${['MONEY','TICKETS','BETTING','PROPERTY','WORK'].map(x=>option(x,x)).join('')}</select></label><label>Field<select name="field">${['free','cash','netWorth','receivables','capital','expectedNet','missingMarket','profit','roi','withClv','missing','open'].map(x=>option(x,x)).join('')}</select></label><label>Název<input name="subject" placeholder="Např. Volný cash"></label>`);if(f){const r=createWatch1041(f);toast(r.ok?'Watch vytvořen':`Watch nevytvořen: ${r.reason}`)}return openWatches()}
 if(v==='toggle'){const f=await formModal('Zapnout / vypnout watch',`<label>Watch<select name="id">${rows.map(x=>option(x.id,x.subject)).join('')}</select></label><label>Stav<select name="enabled">${option('1','Zapnuto')}${option('0','Vypnuto')}</select></label>`);if(f){setWatchEnabled1042(f.id,f.enabled==='1');toast('Watch aktualizován')}return openWatches()}
 return v;
}
async function openAutomations(){
 const rows=A(read(AUTOMATION_KEY,[])),history=automationHistory1044(),v=await modal('Automation Operations · OS1043/1044',`<div class="card"><div class="row"><span>Pravidel</span><b>${rows.length}</b></div><div class="row"><span>Run historie</span><b>${history.length}</b></div></div>${rows.map(x=>`<div class="row"><div><b>${h(x.name||x.id)}</b><div class="muted">${h(x.condition?.type)} → ${h(x.action?.type)}</div></div><b>${x.enabled?'ON':'OFF'}</b></div>`).join('')||'<div class="empty">Žádné automation pravidlo.</div>'}<div class="decision-note">Nové pravidlo je vždy vypnuté. Finance, betting a ticket execution zůstávají blokované.</div>`,[{label:'Nové pravidlo',value:'new',primary:true},{label:rows.length?'Zapnout / vypnout':'Správa',value:rows.length?'toggle':null},{label:'Spustit safe rules',value:'run'},{label:'Zavřít',value:null}]);
 if(v==='new'){const f=await formModal('Nové automation pravidlo',`<label>Název<input name="name" required></label><label>Podmínka<select name="condition">${CONDITIONS.map(x=>option(x,x)).join('')}</select></label><label>Hodnota<input name="value" type="number" value="0"></label><label>Akce<select name="action">${ACTIONS.map(x=>option(x,x)).join('')}</select></label><label>Název úkolu/notifikace<input name="title"></label>`);if(f){const r=createAutomation1043(f);toast(r.ok?'Pravidlo vytvořeno vypnuté':`Pravidlo nevytvořeno: ${r.reason}`)}return openAutomations()}
 if(v==='toggle'){const f=await formModal('Zapnout / vypnout automation',`<label>Pravidlo<select name="id">${rows.map(x=>option(x.id,x.name||x.id)).join('')}</select></label><label>Stav<select name="enabled">${option('1','Zapnuto')}${option('0','Vypnuto')}</select></label>`);if(f){setAutomationEnabled1043(f.id,f.enabled==='1');toast('Automation aktualizována')}return openAutomations()}
 if(v==='run'){const r=runAutomations1044();toast(`Safe automation run: ${r.results.length} pravidel`);return openAutomations()}return v;
}
async function openConflicts(){
 const rows=conflictQueue1045();const v=await modal('Sync Conflict Review · OS1045',rows.length?rows.map(x=>`<div class="row"><div><b>${h(x.key||x.id)}</b><div class="muted">Vyžaduje rozhodnutí; data se nepřepíšou automaticky.</div></div></div>`).join(''):'<div class="empty success-empty">Žádný nevyřešený konflikt.</div>',[{label:rows.length?'Rozhodnout konflikt':'Nic k řešení',value:rows.length?'resolve':null,primary:rows.length},{label:'Zavřít',value:null,primary:!rows.length}]);
 if(v==='resolve'){const f=await formModal('Rozhodnutí konfliktu',`<label>Konflikt<select name="id">${rows.map(x=>option(x.id,x.key||x.id)).join('')}</select></label><label>Rozhodnutí<select name="resolution">${option('KEEP_LOCAL','Preferovat lokální')}${option('KEEP_REMOTE','Preferovat vzdálené')}${option('DISMISS','Odložit / ignorovat')}</select></label><div class="decision-note">Tímto se pouze uloží rozhodnutí. Canonical data se zatím nepřepisují.</div>`);if(f){const r=resolveConflict1045(f.id,f.resolution);toast(r.ok?'Rozhodnutí uloženo':'Konflikt se nepodařilo označit')}return openConflicts()}return v;
}

// OS1047 · practical operations center.
export async function openOperations1047(){
 const x=operationsOverview1038(),v=await modal('Control Plane Operations · OS1047',`<div class="card"><div class="eyebrow">OPERATIONS</div><h2>${Math.round(x.health)} / 100</h2><div class="row"><span>Snapshoty</span><b>${x.snapshots}</b></div><div class="row"><span>Watch pravidla</span><b>${x.watches}</b></div><div class="row"><span>Automations</span><b>${x.automations}</b></div><div class="row"><span>Sync konflikty</span><b>${x.conflicts}</b></div><div class="row"><span>Error groups</span><b>${x.errors}</b></div></div><div class="decision-note">Operations dává OS1037 skutečné ovládání. Externí writes, finance, betting a ticket execution zůstávají mimo tento modul.</div>`,[{label:'Watch pravidla',value:'watches',primary:true},{label:'Automations',value:'automations'},{label:'Snapshot / Restore',value:'snapshots'},{label:'Sync konflikty',value:'conflicts'},{label:'Control Plane',value:'control'},{label:'Zavřít',value:null}]);
 if(v==='watches')return openWatches();if(v==='automations')return openAutomations();if(v==='snapshots')return openSnapshotOps();if(v==='conflicts')return openConflicts();if(v==='control')return openControlPlane1037();return v;
}

function bindCommands(){document.addEventListener('keydown',e=>{if(e.key!=='Enter'||e.target?.id!=='commandInput')return;const q=String(e.target.value||'').trim().toLowerCase();if(!/^\/(ops|operations|watches|watch|conflicts)\b/.test(q))return;e.preventDefault();e.stopImmediatePropagation();if(/^\/(watch|watches)\b/.test(q))openWatches();else if(/^\/conflicts\b/.test(q))openConflicts();else openOperations1047()},true)}
export function installControlOperations1047(){if(window.__KAMIL_CONTROL_OPERATIONS1047__?.installed)return true;installHealthRibbon1046();bindCommands();window.__KAMIL_CONTROL_OPERATIONS1047__={installed:true,version:CONTROL_OPERATIONS1047_VERSION,features:[1038,1039,1040,1041,1042,1043,1044,1045,1046,1047],open:openOperations1047,overview:operationsOverview1038,policy:{noExternalWrites:true,noFinancialExecution:true,noBettingExecution:true,noTicketExecution:true,restoreRequiresTypedConfirmation:true}};return true;}
