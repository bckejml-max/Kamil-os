import {store} from './state.js';
import {modal,toast,h,uid} from './utils.js';
import {personalVaultRecord640,confirmVaultRecord640} from './personalVault640.js';
import {openVaultEdit641} from './personalVaultEdit641.js';
import {postponePersonalAction642,postponePersonalActionToTomorrow642,markPersonalWaiting642} from './personalFollowup642.js';

const now=()=>new Date().toISOString();
const splitId=id=>{const s=String(id||''),i=s.indexOf(':');return i<0?[s,'']:[s.slice(0,i),s.slice(i+1)]};
const findTask=(s,id)=>Array.isArray(s.tasks)?s.tasks.find(x=>String(x.id)===String(id)):null;
const findAdmin=(s,id)=>Array.isArray(s.personalAdmin?.items)?s.personalAdmin.items.find(x=>String(x.id)===String(id)):null;
const findWaiting=(s,id)=>Array.isArray(s.delegations)?s.delegations.find(x=>String(x.id||x.title)===String(id)):null;
const updated224=(result,action)=>{if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('kamil:personal-action-updated',{detail:{result,actionId:action?.id||null,title:action?.title||null,at:Date.now()}}));return result};

function releaseWaitingSource641(s,waiting,at){
 if(!waiting?.sourceId||!['task','admin'].includes(String(waiting.sourceKind||'')))return false;
 const source=waiting.sourceKind==='task'?findTask(s,waiting.sourceId):findAdmin(s,waiting.sourceId);
 if(!source)return false;
 source.waitingFor=false;
 if(source.followUpAt&&String(source.followUpAt)===String(waiting.followUpAt||''))source.followUpAt=null;
 source.updatedAt=at;
 return true;
}

export function completePersonalAction641(action){
 if(!action?.id)return false;const [kind,rawId]=splitId(action.id);if(kind==='vault')return !!confirmVaultRecord640(rawId);let changed=false;
 store.mutate(`Dokončena osobní věc: ${action.title||rawId}`,s=>{
  const x=kind==='task'?findTask(s,rawId):kind==='admin'?findAdmin(s,rawId):kind==='waiting'?findWaiting(s,rawId):null;
  if(!x)return;
  const at=now();x.status='DONE';x.completedAt=at;x.updatedAt=at;
  if(kind==='waiting'){x.resolvedAt=at;releaseWaitingSource641(s,x,at)}
  changed=true;
 },{undo:true,cloud:true,audit:true});return changed;
}

function prepareCalendarAction641(action){let created=null;const sourceEventId=String(action.id||action.title||'calendar').replace(/^calendar:/,'');store.mutate(`Přidána příprava: ${action.title}`,s=>{s.tasks=Array.isArray(s.tasks)?s.tasks:[];const existing=s.tasks.find(x=>String(x.sourceEventId||'')===sourceEventId&&String(x.status||'OPEN').toUpperCase()!=='DONE');if(existing){created=existing;return}created={id:uid('family-prep'),title:`Připravit: ${action.title||'rodinná událost'}`,status:'OPEN',category:'Rodina',area:'Rodina',due:new Date().toISOString(),sourceEventId,createdAt:now()};s.tasks.push(created)},{undo:true,cloud:true,audit:true});return created}

export async function openPersonalAction641(action){
 if(!action)return null;
 if(action.kind==='calendar'){
  const choice=await modal(action.title||'Rodinný termín',`<div class="card"><p>${h(action.why||'')}</p><div class="decision-note"><b>Další krok:</b> ${h(action.next||'Připravit se na událost.')}</div></div>`,[{label:'Připravit',value:'prepare',primary:true},{label:'Zavřít',value:null}]);
  if(choice==='prepare'){prepareCalendarAction641(action);toast('Příprava je v osobních úkolech.');return updated224('prepared',action)}return choice;
 }
 if(action.kind==='data'){
  const r=personalVaultRecord640(action.recordId);if(!r)return null;const body=`<div class="card"><h2>${h(r.title)}</h2><p>${h(r.status.detail)}</p><div class="decision-note"><b>Co dál:</b> ${h(r.nextAction)}</div></div>`;
  const choice=await modal('Osobní údaj',body,[{label:'Upravit údaje',value:'edit'},{label:'Mám aktuální doklad / údaj — potvrdit',value:'confirm',primary:true},{label:'Zavřít',value:null}]);if(choice==='edit'){await openVaultEdit641(r.id);return 'edited'}if(choice==='confirm'){confirmVaultRecord640(r.id);toast('Údaj potvrzen.');return updated224('confirmed',action)}return choice;
 }
 const buttons=[{label:'Hotovo',value:'done',primary:true},{label:'Zítra',value:'tomorrow'},{label:'Za 3 dny',value:'3d'},{label:'Za týden',value:'7d'}];if(action.kind!=='waiting')buttons.push({label:'Čekám na odpověď',value:'waiting'});buttons.push({label:'Zavřít',value:null});
 const choice=await modal(action.title||'Osobní úkol',`<div class="card"><p>${h(action.why||'')}</p><div class="decision-note"><b>Další krok:</b> ${h(action.next||'')}</div></div>`,buttons);
 if(choice==='done'){if(completePersonalAction641(action)){toast('Hotovo.');return updated224('done',action)}toast('Položku se nepodařilo najít.')}
 if(choice==='tomorrow'){if(postponePersonalActionToTomorrow642(action)){toast('Přesunuto na zítra ráno.');return updated224('tomorrow',action)}}
 if(choice==='3d'||choice==='7d'){const days=choice==='3d'?3:7;if(postponePersonalAction642(action,days)){toast(`Posunuto o ${days} dní.`);return updated224('postponed',action)}}
 if(choice==='waiting'){if(markPersonalWaiting642(action,3)){toast('Přidáno do čekání. Follow-up za 3 dny.');return updated224('waiting',action)}}return choice;
}
