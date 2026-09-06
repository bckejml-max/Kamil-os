import {modal,h} from './utils.js';
import {buildAutonomous943} from './autonomous943.js';
import {recordUsage892} from './usage892.js';

export const PROPOSAL_REVIEW944_VERSION='944.0.0';
const KEY='kamil.improvement.review.944';
const A=v=>Array.isArray(v)?v:[];
const json=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};

export function readProposalDecisions944(){return A(json(KEY,[]))}
export function decideProposal944(proposal,status='pending',reason=''){
 const allowed=['approved','rejected','deferred','pending'];
 const rows=readProposalDecisions944();
 const row={id:`p944-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,at:new Date().toISOString(),proposal:{title:String(proposal?.title||''),change:String(proposal?.change||''),evidence:String(proposal?.evidence||''),expectedBenefit:String(proposal?.expectedBenefit||''),priority:Number(proposal?.priority||0)},status:allowed.includes(status)?status:'pending',reason:String(reason||''),executed:false};
 rows.push(row);save(KEY,rows.slice(-500));return row;
}
export function proposalAudit944(){const rows=readProposalDecisions944(),counts={approved:0,rejected:0,deferred:0,pending:0};for(const x of rows)counts[x.status]=(counts[x.status]||0)+1;return{total:rows.length,counts,recent:rows.slice(-20).reverse(),guardrails:{proposalDecisionDoesNotExecute:true,noFinancialExecution:true,noBettingExecution:true,noAutomaticUiMutation:true}}}
export function proposalQueue944(model){const decided=readProposalDecisions944();return A(model?.proposal?.proposals).map((p,i)=>{const last=[...decided].reverse().find(x=>x.proposal?.title===p.title&&x.proposal?.change===p.change);return{...p,id:`proposal-${i}`,status:last?.status||'pending',lastDecisionAt:last?.at||null,lastReason:last?.reason||''}})}

async function reviewOne944(p){
 const body=`<div class="card"><div class="eyebrow">OS944 · PROPOSAL REVIEW</div><h2>${h(p.title)}</h2><p>${h(p.change||'')}</p><div class="row"><span>Důkaz</span><b>${h(p.evidence||'—')}</b></div><div class="row"><span>Očekávaný přínos</span><b>${h(p.expectedBenefit||'—')}</b></div><div class="row"><span>Priorita</span><b>${h(String(p.priority||0))}</b></div><p class="muted">Schválení pouze zaznamená rozhodnutí. Nic se automaticky neprovede.</p></div>`;
 const choice=await modal('Review návrhu',body,[{label:'Schválit',value:'approved',primary:true},{label:'Odložit',value:'deferred'},{label:'Odmítnout',value:'rejected'},{label:'Zavřít',value:null}]);
 if(!choice)return null;
 let reason='';
 if(choice!=='approved')reason=window.prompt('Důvod (volitelné):','')||'';
 return decideProposal944(p,choice,reason);
}

export async function openProposalReview944(){
 recordUsage892('proposal-review-944',{surface:'more'});
 const model=await buildAutonomous943(),queue=proposalQueue944(model),audit=proposalAudit944(),pending=queue.filter(x=>x.status==='pending'||x.status==='deferred');
 const top=pending[0];
 const body=`<div class="card"><div class="eyebrow">OS944 · PROPOSAL REVIEW</div><h2>${h(top?.title||'Žádný návrh k rozhodnutí')}</h2><p>${h(top?.change||'')}</p><div class="row"><span>Čeká na rozhodnutí</span><b>${pending.length}</b></div><div class="row"><span>Schváleno</span><b>${audit.counts.approved}</b></div><div class="row"><span>Odmítnuto</span><b>${audit.counts.rejected}</b></div><div class="row"><span>Odloženo</span><b>${audit.counts.deferred}</b></div><p class="muted">OS944 je approval/audit vrstva. Schválení není execution.</p></div><div class="card"><div class="eyebrow">AUDIT TRAIL</div>${audit.recent.slice(0,8).map(x=>`<div class="row"><span>${h(x.proposal?.title||'Návrh')}</span><b>${h(String(x.status||'pending').toUpperCase())}</b></div>`).join('')||'<div class="empty">Zatím bez rozhodnutí.</div>'}</div>`;
 const choice=await modal('Proposal Review & Approval',body,[{label:top?'Rozhodnout hlavní návrh':'Zavřít',value:top?'review':null,primary:true},{label:'Zavřít',value:null}]);
 if(choice==='review'&&top)return reviewOne944(top);
 return choice;
}
