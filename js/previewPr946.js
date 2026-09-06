import {modal,h} from './utils.js';
import {safeChangePlans945} from './safeChangePlan945.js';
import {recordUsage892} from './usage892.js';

export const PREVIEW_PR946_VERSION='946.0.0';
const slug=s=>String(s||'change').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,48)||'change';

export function previewPrManifest946(plan){
 if(!plan)return null;
 const branch=`preview/os946-${slug(plan.title)}`;
 const title=`Preview: ${plan.title}`;
 const diffIntent=(plan.affectedFiles||[]).map(file=>({file,action:'MINIMAL_CHANGE_ONLY',reason:plan.summary||plan.title}));
 const body=[
  'OS946 PREVIEW ONLY',
  '',
  `Approved proposal: ${plan.title}`,
  `Area: ${plan.area}`,
  `Risk: ${plan.risk}`,
  '',
  'Planned files:',
  ...(plan.affectedFiles||[]).map(x=>`- ${x}`),
  '',
  'Required tests:',
  ...(plan.tests||[]).map(x=>`- ${x}`),
  '',
  'Rollback:',
  ...(plan.rollback||[]).map(x=>`- ${x}`),
  '',
  'Guardrails: no merge, no production deployment, no financial or betting execution.'
 ].join('\n');
 return{version:PREVIEW_PR946_VERSION,mode:'PREVIEW_PR_DRAFT_ONLY',branch,title,body,base:'main',proposalId:plan.proposalId||'',risk:plan.risk,area:plan.area,diffIntent,tests:plan.tests||[],rollback:plan.rollback||[],requiresHumanImplementation:true,requiresSeparateMergeApproval:true,autoMerge:false,autoDeploy:false,guardrails:{noAutomaticCodeMutation:true,noAutomaticMerge:true,noProductionDeployment:true,noFinancialExecution:true,noBettingExecution:true}};
}
export function previewPrDrafts946(){return safeChangePlans945().map(previewPrManifest946).filter(Boolean)}

export async function openPreviewPr946(){
 recordUsage892('preview-pr-946',{surface:'safe-plan'});
 const drafts=previewPrDrafts946(),d=drafts[0];
 const body=`<div class="card"><div class="eyebrow">OS946 · PREVIEW PR BUILDER</div><h2>${h(d?.title||'Žádný schválený plán')}</h2><p>${h(d?`Větev: ${d.branch}`:'Nejdřív schval návrh v OS944 a připrav OS945 plán.')}</p><div class="row"><span>Draftů</span><b>${drafts.length}</b></div><div class="row"><span>Base</span><b>${h(d?.base||'—')}</b></div><div class="row"><span>Riziko</span><b>${h(d?.risk||'—')}</b></div><div class="row"><span>Režim</span><b>PREVIEW PR DRAFT ONLY</b></div>${d?`<div class="row"><span>Diff intent</span><b>${h(d.diffIntent.map(x=>x.file).join(', '))}</b></div><div class="row"><span>Testy před merge</span><b>${h(d.tests.join(', '))}</b></div><p class="muted">OS946 pouze připravuje branch/PR manifest. Kód nemění, PR nemerguje a produkci nenasazuje.</p>`:'<p class="muted">Není co připravit.</p>'}</div>${d?`<div class="card"><div class="eyebrow">PR BODY PREVIEW</div><pre style="white-space:pre-wrap">${h(d.body)}</pre></div>`:''}`;
 return modal('Preview PR Builder',body,[{label:'Zavřít',value:null,primary:true}]);
}
