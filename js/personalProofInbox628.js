import {store} from './state.js';
import {personalMissingDataResolver627} from './personalMissingDataResolver627.js';

const proofItem=t=>({id:t.id,title:t.title,current:t.current,target:t.target,gain:t.gain,where:t.where,proof:t.proof,status:'NEPŘILOŽENO',impact:`Po ověření může confidence vzrůst z ${t.current}% na ${t.target}%`,accepts:['potvrzení smlouvy','bankovní výpis','doklad o platbě','aktuální karta / certifikát','jiný čerstvý důkaz']});

export function personalProofInbox628(s=store.get()){
 const r=personalMissingDataResolver627(s),items=r.tasks.map(proofItem);
 return{items,main:items[0]||null,open:items.length,potentialGain:items.reduce((a,v)=>a+v.gain,0),summary:items.length?`Čeká ${items.length} důkazů k doplnění`:'Proof Inbox je čistý.'};
}

export function previewProofImpact628(id,s=store.get()){
 const inbox=personalProofInbox628(s),item=inbox.items.find(x=>x.id===id)||null;
 return item?{id:item.id,title:item.title,before:item.current,after:item.target,gain:item.gain,changes:[`confidence +${item.gain} bodů`,`stav se může posunout z nejistého na potvrzenější`,`resolver po ověření přepočítá pořadí dalších mezer`]}:null;
}
