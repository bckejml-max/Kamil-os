import {store} from './state.js';

const KEY='kamil-os-personal-evidence-ledger-630';
const parse=v=>{try{return JSON.parse(v||'[]')||[]}catch{return[]}};
const localRead=()=>typeof localStorage==='undefined'?[]:parse(localStorage.getItem(KEY));
const stateRead=()=>Array.isArray(store.get()?.personalVault?.evidence)?store.get().personalVault.evidence:[];
const merge=(a=[],b=[])=>{
 const all=[...a,...b].filter(Boolean).sort((x,y)=>String(y.confirmedAt||'').localeCompare(String(x.confirmedAt||''))),seen=new Set(),out=[];
 for(const x of all){if(!x?.id||seen.has(x.id))continue;seen.add(x.id);out.push(x)}
 return out.slice(0,100);
};
const persist=(items,reason)=>{
 const out=merge(items,[]);
 if(typeof localStorage!=='undefined')localStorage.setItem(KEY,JSON.stringify(out));
 const current=stateRead(),same=JSON.stringify(current)===JSON.stringify(out);
 if(!same)store.mutate(reason,s=>{
  s.personalVault=s.personalVault||{version:1,items:[],evidence:[]};
  s.personalVault.evidence=out;
  s.personalVault.updatedAt=new Date().toISOString();
 },{undo:false,cloud:true,audit:false});
 return out;
};

export function evidenceLedger630(){const items=merge(localRead(),stateRead());return{items,count:items.length,last:items[0]||null,key:KEY};}
export function confirmEvidence630({id,title,note='',before=0,after=0,proofType='uživatelsky potvrzený důkaz'}={}){
 if(!id)throw new Error('Missing evidence id');
 const items=evidenceLedger630().items,now=new Date().toISOString(),next={id,title:title||id,note:String(note||'').slice(0,500),proofType,confirmedAt:now,before:Number(before||0),after:Number(after||0),gain:Math.max(0,Number(after||0)-Number(before||0))};
 persist([next,...items.filter(x=>x.id!==id)],`Evidence Ledger — potvrzeno ${title||id}`);return next;
}
export function removeEvidence630(id){persist(evidenceLedger630().items.filter(x=>x.id!==id),`Evidence Ledger — odvoláno ${id}`);return true;}
export function syncEvidenceLedgerToVault640(){const items=merge(localRead(),stateRead());persist(items,'Evidence Ledger — synchronizace do Personal Data Vaultu');return items;}
export function evidenceLedgerStorageKey630(){return KEY;}
