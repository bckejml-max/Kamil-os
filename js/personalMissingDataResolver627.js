import {store} from './state.js';
import {personalDataConfidence626} from './personalDataConfidence626.js';

const task=v=>{
 const target=Number.isFinite(Number(v?.verificationTarget))?Number(v.verificationTarget):95;
 const where=v?.verificationWhere||'Aktuální poskytovatel, dokument nebo bankovní výpis';
 const proof=v?.verificationProof||v?.confidenceNext||'Čerstvý soukromý doklad potvrzující aktuální stav.';
 return{id:v.id,title:v.title||v.name,current:v.confidence,label:v.confidenceLabel,where,proof,target,gain:Math.max(0,target-v.confidence),priority:(100-v.confidence)+Math.max(0,target-v.confidence)};
};

export function personalMissingDataResolver627(s=store.get()){
 const c=personalDataConfidence626(s),tasks=c.records.filter(v=>v.confidence<95).map(task).sort((a,b)=>b.priority-a.priority);
 const main=tasks[0]||null;
 return{tasks,main,open:tasks.length,potential:tasks.reduce((a,v)=>a+v.gain,0),summary:main?`Nejdřív ověř: ${main.title}`:'Datová kvalita je velmi vysoká; nic zásadního nechybí.'};
}
