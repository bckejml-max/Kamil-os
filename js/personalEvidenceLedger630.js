const KEY='kamil-os-personal-evidence-ledger-630';
const parse=v=>{try{return JSON.parse(v||'[]')||[]}catch{return[]}};
const read=()=>typeof localStorage==='undefined'?[]:parse(localStorage.getItem(KEY));
const write=v=>{if(typeof localStorage!=='undefined')localStorage.setItem(KEY,JSON.stringify(v));return v};

export function evidenceLedger630(){const items=read().sort((a,b)=>String(b.confirmedAt||'').localeCompare(String(a.confirmedAt||'')));return{items,count:items.length,last:items[0]||null,key:KEY};}
export function confirmEvidence630({id,title,note='',before=0,after=0,proofType='uživatelsky potvrzený důkaz'}={}){
 if(!id)throw new Error('Missing evidence id');
 const items=read(),now=new Date().toISOString(),next={id,title:title||id,note:String(note||'').slice(0,500),proofType,confirmedAt:now,before:Number(before||0),after:Number(after||0),gain:Math.max(0,Number(after||0)-Number(before||0))};
 const out=[next,...items.filter(x=>x.id!==id)].slice(0,100);write(out);return next;
}
export function removeEvidence630(id){write(read().filter(x=>x.id!==id));return true;}
export function evidenceLedgerStorageKey630(){return KEY;}
