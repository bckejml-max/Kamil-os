import {store} from './state.js';
import {h,modal} from './utils.js';
import {openPersonalLifeFeature626} from './personalLifeSuite626.js';
import {openPersonalLifeSuite627} from './personalLifeSuite627.js';
import {personalMissingDataResolver627} from './personalMissingDataResolver627.js';
import {personalProofInbox628} from './personalProofInbox628.js';
import {openPersonalProofInbox628} from './personalLifeSuite628.js';
import {personalProofReview629} from './personalProofReview629.js';
import {openPersonalProofReview629} from './personalLifeSuite629.js';
import {personalEvidenceFreshness631} from './personalEvidenceFreshness631.js';
import {openPersonalEvidenceFreshness631} from './personalEvidenceFreshnessView631.js';
import {personalLifeActionRouter623} from './personalLifeActionRouter623.js';
import {personalLifeExplain624} from './personalLifeExplain624.js';

export function personalLifeHome622(s=store.get()){
 const x=personalLifeActionRouter623(s),explain=personalLifeExplain624(s),resolver=personalMissingDataResolver627(s),proofInbox=personalProofInbox628(s),proofReview=personalProofReview629(s),freshness=personalEvidenceFreshness631(),urgent=x.top.slice(0,4);
 return{score:Number(x.rows.find(v=>v.key==='scoreboard')?.items?.[0]?.amount||0),commander:x.main,urgent,explain,recovery:x.recovery,confidence:x.confidence,resolver,proofInbox,proofReview,freshness,summary:x.summary};
}

export async function openPersonalLifeHome622(){
 const t=performance.now(),x=personalLifeHome622(),e=x.explain,c=x.confidence,r=x.resolver,p=x.proofInbox,rv=x.proofReview,fr=x.freshness;
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_LIFE_HOME_631_LAST__={ms:Math.round((performance.now()-t)*10)/10,at:Date.now(),score:x.score,commander:x.commander.title,confidence:c?.average||0,effectiveConfidence:rv.average,missing:rv.missing.length,review:rv.review.length+rv.found.length,confirmed:rv.confirmed.length,evidenceStale:fr.stale.length,evidenceDueSoon:fr.dueSoon.length};
 const urgent=x.urgent.map((v,i)=>{const z=e.top.find(q=>q.key===v.key);return `<div class="row"><div><b>${i+1}. ${h(v.name)}</b><div class="muted">${h(z?.why||v.subtitle)}</div></div><b>${h(String(v.count))}</b></div>`}).join('');
 const freshness=`<div class="card"><div class="eyebrow">EVIDENCE FRESHNESS 63.1</div><h2>${h(fr.summary)}</h2><div class="metric-strip"><div class="metric"><span>Čerstvé</span><b>${fr.fresh.length}</b></div><div class="metric"><span>Brzy obnovit</span><b>${fr.dueSoon.length}</b></div><div class="metric"><span>Staré</span><b>${fr.stale.length}</b></div></div>${fr.items.slice(0,3).map(v=>`<div class="row"><div><b>${h(v.title||v.id)}</b><div class="muted">${v.ageDays} dní od potvrzení · obnova po ${v.maxDays} dnech</div></div><b>${h(v.freshnessLabel)}</b></div>`).join('')}</div>`;
 const review=`<div class="card"><div class="eyebrow">PERSONAL PROOF REVIEW 63.1</div><h2>${h(rv.summary)}</h2><div class="metric-strip"><div class="metric"><span>Effective confidence</span><b>${rv.average}/100</b></div><div class="metric"><span>Potvrzeno</span><b>${rv.confirmed.length}</b></div><div class="metric"><span>Ke kontrole</span><b>${rv.review.length+rv.found.length}</b></div><div class="metric"><span>Chybí</span><b>${rv.missing.length}</b></div></div>${rv.items.slice(0,3).map(v=>`<div class="row"><div><b>${h(v.title)}</b><div class="muted">${h(v.staleNote||v.proof)}</div></div><b>${h(v.stageLabel)} · ${v.effectiveConfidence}%</b></div>`).join('')}</div>`;
 const body=`<div class="metric-strip"><div class="metric"><span>Life score</span><b>${x.score}/100</b></div><div class="metric"><span>Datová důvěra</span><b>${c?.average||0}/100</b></div><div class="metric"><span>Effective confidence</span><b>${rv.average}/100</b></div></div><div class="card"><div class="eyebrow">PERSONAL LIFE 63.1</div><h2>${h(x.commander.title)}</h2><div class="row"><div><b>Proč právě teď</b><div class="muted">${h(e.main.why)}</div></div></div></div>${freshness}${review}<div class="card"><div class="eyebrow">NEJDŮLEŽITĚJŠÍ OSOBNÍ OBLASTI</div>${urgent}</div><div class="decision-note">63.1 hlídá stáří potvrzených důkazů. Historie zůstává v Ledgeru, ale prošlý důkaz už nezvyšuje effective confidence, dokud se znovu neověří.</div>`;
 const actions=[{label:'Řešit hlavní oblast',value:`feature:${x.commander.key}`,primary:true},{label:'Evidence Freshness',value:'freshness'},{label:'Proof Review',value:'review'},{label:'Proof Inbox',value:'proof'},{label:'Resolver',value:'resolver'},...x.urgent.map(v=>({label:`${v.name} (${v.count})`,value:`feature:${v.key}`})),{label:'Zavřít',value:null}];
 const choice=await modal('Kamil OS / Personal Life Home 63.1',body,actions);
 if(String(choice||'').startsWith('feature:'))return openPersonalLifeFeature626(String(choice).slice(8));
 if(choice==='freshness')return openPersonalEvidenceFreshness631();
 if(choice==='review')return openPersonalProofReview629();
 if(choice==='proof')return openPersonalProofInbox628();
 if(choice==='resolver')return openPersonalLifeSuite627();
 return choice;
}
