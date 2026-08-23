import {store} from './state.js';
import {h,modal} from './utils.js';
import {personalLifeSuite627,openPersonalLifeSuite627,openPersonalLifeFeature627} from './personalLifeSuite627.js';
import {personalProofInbox628,previewProofImpact628} from './personalProofInbox628.js';

const proofRow=v=>`<div class="row"><div><b>${h(v.title)}</b><div class="muted">Hledej: ${h(v.where)} · Důkaz: ${h(v.proof)} · ${h(v.impact)}</div></div><b>${h(v.status)}</b></div>`;

export function personalLifeSuite628(s=store.get()){
 const suite=personalLifeSuite627(s),proofInbox=personalProofInbox628(s);
 return{...suite,proofInbox};
}

export async function openPersonalProofInbox628(){
 const x=personalLifeSuite628(),p=x.proofInbox;
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_PROOF_INBOX_628_LAST__={at:Date.now(),open:p.open,potentialGain:p.potentialGain,main:p.main?.id||null};
 const rows=p.items.map(proofRow).join('')||'<div class="empty success-empty">Proof Inbox je čistý.</div>';
 const body=`<div class="metric-strip"><div class="metric"><span>Čekající důkazy</span><b>${p.open}</b></div><div class="metric"><span>Potenciální zlepšení</span><b>+${p.potentialGain}</b></div></div><div class="card"><div class="eyebrow">PERSONAL PROOF INBOX 62.8</div><h2>${h(p.summary)}</h2>${rows}</div><div class="decision-note">Proof Inbox pouze říká, jaký čerstvý důkaz je potřeba a jaký by měl dopad. Samotné přiložení/ověření důkazu není automaticky schválené a tato vrstva nic nepřepisuje.</div>`;
 const actions=p.main?[{label:'Náhled dopadu hlavního důkazu',value:'preview',primary:true},{label:'Resolver',value:'resolver'},{label:'Zavřít',value:null}]:[{label:'Zavřít',value:null,primary:true}];
 const choice=await modal('Kamil OS / Personal Proof Inbox 62.8',body,actions);
 if(choice==='preview'){
  const q=previewProofImpact628(p.main.id);
  const qbody=`<div class="card"><h2>${h(q.title)}</h2><div class="row"><span>Před</span><b>${q.before}%</b></div><div class="row"><span>Po ověření</span><b>${q.after}%</b></div>${q.changes.map(v=>`<div class="row"><span>${h(v)}</span></div>`).join('')}</div>`;
  return modal('Náhled dopadu důkazu',qbody,[{label:'Zpět',value:null,primary:true}]);
 }
 if(choice==='resolver')return openPersonalLifeSuite627();
 return choice;
}

export {openPersonalLifeFeature627 as openPersonalLifeFeature628};
