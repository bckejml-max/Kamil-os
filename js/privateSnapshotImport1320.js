import {store} from './state.js';

const OWNER='private.snapshot1320';
const b64=s=>{const pad='='.repeat((4-s.length%4)%4),raw=atob((s+pad).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(raw,c=>c.charCodeAt(0))};
const mergeById=(base=[],incoming=[])=>{const map=new Map((Array.isArray(base)?base:[]).map(x=>[String(x?.id||''),x]));for(const x of Array.isArray(incoming)?incoming:[])map.set(String(x?.id||''),{...(map.get(String(x?.id||''))||{}),...x});return [...map.values()]};

function importKey(){
 try{const h=new URLSearchParams(location.hash.replace(/^#/,''));return h.get('privateSnapshotKey')||''}catch{return''}
}
function scrubKey(){
 try{const h=new URLSearchParams(location.hash.replace(/^#/,''));h.delete('privateSnapshotKey');const next=h.toString();history.replaceState({},document.title,location.pathname+location.search+(next?'#'+next:''))}catch{}
}
export async function importPrivateSnapshot1320(){
 const keyRaw=importKey();if(!keyRaw)return {ok:false,reason:'NO_KEY'};
 const {PRIVATE_SNAPSHOT_1320:snap}=await import('./privateSnapshot1320.js');
 try{
  const key=await crypto.subtle.importKey('raw',b64(keyRaw),'AES-GCM',false,['decrypt']);
  const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64(snap.iv),additionalData:new TextEncoder().encode(snap.aad)},key,b64(snap.ciphertext));
  const data=JSON.parse(new TextDecoder().decode(plain));
  const current=structuredClone(store.get());
  if(data.bettingLedger)current.bettingLedger={...(current.bettingLedger||{}),...data.bettingLedger,bets:mergeById(current.bettingLedger?.bets,data.bettingLedger.bets)};
  if(data.financePlan)current.financePlan={...(current.financePlan||{}),...data.financePlan};
  if(data.tasks)current.tasks=mergeById(current.tasks,data.tasks);
  if(data.projects)current.projects=mergeById(current.projects,data.projects);
  if(data.propertyBook){current.propertyBook=current.propertyBook||{};current.propertyBook={...current.propertyBook,...data.propertyBook,candidates:mergeById(current.propertyBook?.candidates,data.propertyBook.candidates)}}
  current.meta=current.meta||{};current.meta.privateSnapshot1320={id:snap.id,asOf:data.asOf,importedAt:new Date().toISOString()};
  store.replace(current,'OS1320 private current-data snapshot',{cloud:true,audit:true});
  scrubKey();
  window.__KAMIL_PRIVATE_SNAPSHOT1320__={ok:true,id:snap.id,asOf:data.asOf,at:Date.now()};
  window.dispatchEvent(new CustomEvent('kamil:private-snapshot-imported',{detail:{id:snap.id,asOf:data.asOf}}));
  return {ok:true,id:snap.id,asOf:data.asOf};
 }catch(error){
  scrubKey();
  window.__KAMIL_PRIVATE_SNAPSHOT1320__={ok:false,error:String(error?.message||error),at:Date.now()};
  console.warn('[private1320] import failed',error);
  return {ok:false,error};
 }
}
