import {store} from './state.js';
import {modal,toast,h} from './utils.js';
import {personalVaultRecord640,confirmVaultRecord640} from './personalVault640.js';

const now=()=>new Date().toISOString();
const CLOSED='DONE';
const findTask=(s,id)=>Array.isArray(s.tasks)?s.tasks.find(x=>String(x.id)===String(id)):null;
const findAdmin=(s,id)=>Array.isArray(s.personalAdmin?.items)?s.personalAdmin.items.find(x=>String(x.id)===String(id)):null;
const findWaiting=(s,id)=>Array.isArray(s.delegations)?s.delegations.find(x=>String(x.id||x.title)===String(id)):null;

export function completePersonalAction641(action){
 if(!action?.id)return false;
 const [kind,rawId]=String(action.id).split(':');
 if(kind==='vault')return !!confirmVaultRecord640(rawId);
 if(kind==='task'){
  let changed=false;store.mutate(`Dokončen osobní úkol: ${action.title||rawId}`,s=>{const x=findTask(s,rawId);if(x){x.status=CLOSED;x.completedAt=now();changed=true}},{undo:true,cloud:true,audit:true});return changed;
 }
 if(kind==='admin'){
  let changed=false;store.mutate(`Vyřízena osobní administrativa: ${action.title||rawId}`,s=>{const x=findAdmin(s,rawId);if(x){x.status='DONE';x.completedAt=now();changed=true}},{undo:true,cloud:true,audit:true});return changed;
 }
 if(kind==='waiting'){
  let changed=false;store.mutate(`Uzavřeno čekání: ${action.title||rawId}`,s=>{const x=findWaiting(s,rawId);if(x){x.status='DONE';x.completedAt=now();changed=true}},{undo:true,cloud:true,audit:true});return changed;
 }
 return false;
}

export async function openPersonalAction641(action){
 if(!action)return null;
 if(action.kind==='data'){
  const r=personalVaultRecord640(action.recordId);if(!r)return null;
  const body=`<div class="card"><h2>${h(r.title)}</h2><p>${h(r.status.detail)}</p><div class="decision-note"><b>Co dál:</b> ${h(r.nextAction)}</div></div>`;
  const choice=await modal('Osobní údaj',body,[{label:'Mám aktuální doklad / údaj — potvrdit',value:'confirm',primary:true},{label:'Jen otevřít dokumenty',value:'open'},{label:'Zavřít',value:null}]);
  if(choice==='confirm'){confirmVaultRecord640(r.id);toast('Údaj potvrzen.');return 'confirmed'}
  return choice;
 }
 const choice=await modal(action.title||'Osobní úkol',`<div class="card"><p>${h(action.why||'')}</p><div class="decision-note"><b>Další krok:</b> ${h(action.next||'')}</div></div>`,[{label:'Hotovo',value:'done',primary:true},{label:'Zavřít',value:null}]);
 if(choice==='done'){if(completePersonalAction641(action)){toast('Hotovo.');return 'done'}toast('Položku se nepodařilo najít.');}
 return choice;
}
