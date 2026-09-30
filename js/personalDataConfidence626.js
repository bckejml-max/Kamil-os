import {store} from './state.js';
import {personalDataRecovery625} from './personalDataRecovery625.js';

const decorate=v=>({
 ...v,
 confidence:Number.isFinite(Number(v?.confidence))?Number(v.confidence):50,
 confidenceLabel:v?.confidenceLabel||'OVĚŘIT',
 confidenceBasis:v?.confidenceBasis||'Soukromý záznam bez veřejně vloženého důkazu.',
 confidenceFreshness:v?.confidenceFreshness||v?.asOf||v?.updatedAt||null,
 confidenceNext:v?.confidenceNext||v?.nextAction||'Ověřit čerstvým soukromým zdrojem.'
});

export function personalDataConfidence626(s=store.get()){
 const r=personalDataRecovery625(s),records=[...r.admin,...r.assets].map(decorate).sort((a,b)=>b.confidence-a.confidence);
 const confirmed=records.filter(x=>x.confidence>=85),probable=records.filter(x=>x.confidence>=65&&x.confidence<85),verify=records.filter(x=>x.confidence<65);
 const average=records.length?Math.round(records.reduce((a,x)=>a+x.confidence,0)/records.length):0;
 return{records,confirmed,probable,verify,average,summary:`Datová důvěra ${average}/100 · potvrzeno ${confirmed.length} · pravděpodobné ${probable.length} · ověřit ${verify.length}`};
}
