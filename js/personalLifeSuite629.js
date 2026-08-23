import {store} from './state.js';
import {h,modal} from './utils.js';
import {personalLifeSuite628,openPersonalLifeFeature628} from './personalLifeSuite628.js';
import {personalProofReview629,setProofStage629} from './personalProofReview629.js';

const row=v=>`<div class="row"><div><b>${h(v.title)}</b><div class="muted">${h(v.proof)} · ${h(v.where)}</div></div><b>${h(v.stageLabel)} · ${v.effectiveConfidence}%</b></div>`;

export function personalLifeSuite629(s=store.get()){
 const suite=personalLifeSuite628(s),review=personalProofReview629(s);
 return{...suite,review};
}

export async function openPersonalProofReview629(){
 const x=personalProofReview629();
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_PROOF_REVIEW_629_LAST__={at:Date.now(),confirmed:x.confirmed.length,review:x.review.length,found:x.found.length,missing:x.missing.length,average:x.average};
 const body=`<div class="metric-strip"><div class="metric"><span>Effective confidence</span><b>${x.average}/100</b></div><div class="metric"><span>Potvrzeno</span><b>${x.confirmed.length}</b></div><div class="metric"><span>Ke kontrole</span><b>${x.review.length+x.found.length}</b></div><div class="metric"><span>Chybí</span><b>${x.missing.length}</b></div></div><div class="card"><div class="eyebrow">PERSONAL PROOF REVIEW 62.9</div><h2>${h(x.summary)}</h2>${x.items.map(row).join('')}</div><div class="decision-note">62.9 mění pouze review stav důkazu. Původní osobní záznamy se nepřepisují. Vyšší effective confidence se použije až po explicitním potvrzení důkazu.</div>`;
 const actions=x.main?[{label:`Nalezeno: ${x.main.title}`,value:`found:${x.main.id}`,primary:true},{label:'Zavřít',value:null}]:[{label:'Zavřít',value:null,primary:true}];
 const choice=await modal('Kamil OS / Personal Proof Review 62.9',body,actions);
 if(String(choice||'').startsWith('found:')){setProofStage629(String(choice).slice(6),'FOUND');return openPersonalProofReview629();}
 return choice;
}

export async function openPersonalLifeFeature629(key){return openPersonalLifeFeature628(key);}
