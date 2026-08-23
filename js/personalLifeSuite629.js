import {store} from './state.js';
import {h,modal} from './utils.js';
import {personalLifeSuite628,openPersonalLifeFeature628} from './personalLifeSuite628.js';
import {personalProofReview629,setProofStage629,revokeConfirmedProof629} from './personalProofReview629.js';
import {evidenceLedger630} from './personalEvidenceLedger630.js';

const row=v=>`<div class="row"><div><b>${h(v.title)}</b><div class="muted">${h(v.proof)} · ${h(v.where)}${v.proofNote?` · poznámka: ${h(v.proofNote)}`:''}</div></div><b>${h(v.stageLabel)} · ${v.effectiveConfidence}%</b></div>`;
const ledgerRow=v=>`<div class="row"><div><b>${h(v.title)}</b><div class="muted">${h(v.proofType)} · ${h(v.confirmedAt)}${v.note?` · ${h(v.note)}`:''}</div></div><b>${v.before}% → ${v.after}%</b></div>`;

export function personalLifeSuite629(s=store.get()){
 const suite=personalLifeSuite628(s),review=personalProofReview629(s),ledger=evidenceLedger630();
 return{...suite,review,ledger};
}

export async function openPersonalProofReview629(){
 const x=personalProofReview629(),ledger=evidenceLedger630(),main=x.main;
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_EVIDENCE_LEDGER_630_LAST__={at:Date.now(),confirmed:x.confirmed.length,review:x.review.length,found:x.found.length,missing:x.missing.length,average:x.average,ledger:ledger.count};
 const history=ledger.items.length?`<div class="card"><div class="eyebrow">PERSONAL EVIDENCE LEDGER 63.0</div>${ledger.items.slice(0,10).map(ledgerRow).join('')}</div>`:'';
 const body=`<div class="metric-strip"><div class="metric"><span>Effective confidence</span><b>${x.average}/100</b></div><div class="metric"><span>Trvale potvrzeno</span><b>${ledger.count}</b></div><div class="metric"><span>Ke kontrole</span><b>${x.review.length+x.found.length}</b></div><div class="metric"><span>Chybí</span><b>${x.missing.length}</b></div></div><div class="card"><div class="eyebrow">PERSONAL PROOF REVIEW + LEDGER 63.0</div><h2>${h(x.summary)}</h2>${x.items.map(row).join('')}</div>${history}<div class="decision-note">63.0 ukládá do trvalého Evidence Ledgeru pouze důkaz, který uživatel explicitně potvrdí. Nalezení ani kontrola samy confidence nezvyšují. Potvrzení lze odvolat.</div>`;
 let actions=[{label:'Zavřít',value:null}];
 if(main?.stage==='MISSING')actions.unshift({label:`Nalezeno: ${main.title}`,value:`found:${main.id}`,primary:true});
 if(main?.stage==='FOUND')actions.unshift({label:`Zkontrolovat: ${main.title}`,value:`review:${main.id}`,primary:true});
 if(main?.stage==='REVIEW')actions.unshift({label:`Potvrdit důkaz: ${main.title}`,value:`confirm:${main.id}`,primary:true});
 if(!main&&x.confirmed[0])actions.unshift({label:`Odvolat potvrzení: ${x.confirmed[0].title}`,value:`revoke:${x.confirmed[0].id}`});
 const choice=await modal('Kamil OS / Personal Evidence Ledger 63.0',body,actions);
 const val=String(choice||'');
 if(val.startsWith('found:')){setProofStage629(val.slice(6),'FOUND');return openPersonalProofReview629();}
 if(val.startsWith('review:')){setProofStage629(val.slice(7),'REVIEW');return openPersonalProofReview629();}
 if(val.startsWith('confirm:')){setProofStage629(val.slice(8),'CONFIRMED','Explicitně potvrzeno uživatelem v Proof Review.');return openPersonalProofReview629();}
 if(val.startsWith('revoke:')){revokeConfirmedProof629(val.slice(7));return openPersonalProofReview629();}
 return choice;
}

export async function openPersonalLifeFeature629(key){return openPersonalLifeFeature628(key);}
