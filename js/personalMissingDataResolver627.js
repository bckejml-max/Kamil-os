import {store} from './state.js';
import {personalDataConfidence626} from './personalDataConfidence626.js';

const PLAYBOOK={
 'recovered-home-insurance-2026':{where:'PVZP klientská zóna / e-mail / bankovní výpis',proof:'Potvrzení aktivní smlouvy 8000518999 nebo zaplacené pojistné 2 600 Kč',target:95},
 'recovered-life-tereza-nn':{where:'NN klientská zóna / e-mail / bankovní výpis',proof:'Aktuální potvrzení smlouvy nebo novější platba 574 Kč',target:95},
 'recovered-auto-insurance':{where:'E-mail / zelená karta / bankovní výpis / aplikace pojišťovny',proof:'Aktuální zelená karta nebo poslední zaplacené pojistné s číslem smlouvy',target:95},
 'recovered-bank-coverage':{where:'Internetové bankovnictví',proof:'Srpen 2026 výpis + aktuální výpisy z ostatních aktivních účtů',target:97},
 'recovered-mortgage-2026-08':{where:'Hypoteční banka / internetové bankovnictví',proof:'Aktuální zůstatek jistiny po poslední splátce',target:97},
 'recovered-home-vlasatice':{where:'Odhad / realitní podklady',proof:'Aktuální tržní odhad jen pokud chceme používat hodnotu domu ve financích',target:99}
};

const task=v=>{const p=PLAYBOOK[v.id]||{where:'Aktuální poskytovatel nebo bankovní výpis',proof:v.confidenceNext,target:95};return{id:v.id,title:v.title||v.name,current:v.confidence,label:v.confidenceLabel,where:p.where,proof:p.proof,target:p.target,gain:Math.max(0,p.target-v.confidence),priority:(100-v.confidence)+Math.max(0,p.target-v.confidence)};};

export function personalMissingDataResolver627(s=store.get()){
 const c=personalDataConfidence626(s),tasks=c.records.filter(v=>v.confidence<95).map(task).sort((a,b)=>b.priority-a.priority);
 const main=tasks[0]||null;
 return{tasks,main,open:tasks.length,potential:tasks.reduce((a,v)=>a+v.gain,0),summary:main?`Nejdřív ověř: ${main.title}`:'Datová kvalita je velmi vysoká; nic zásadního nechybí.'};
}
