import {modal,h} from './utils.js';
import {retirementRegistry969,usage975} from './oneOS977.js';

export const LEGACY_CLEANUP987_VERSION='987.0.0';
const USAGE_KEY='kamil.oneos.usage.975';
const A=v=>Array.isArray(v)?v:[];
const now=()=>Date.now();
const parse=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const DAY=86400000;

const MAP={
 'Operator Center · OS717':{key:'operator',coverage:'FULL',dependency:'LOW',files:['js/operator717.js','operator717.css']},
 'Truth & Learning · OS737':{key:'truth',coverage:'FULL',dependency:'MEDIUM',files:['js/operatorTruth737.js','truth737.css']},
 'Data Truth Audit · OS738':{key:'audit',coverage:'FULL',dependency:'LOW',files:['js/dataTruthAudit738.js']},
 'Strategy & Control · OS788':{key:'strategy',coverage:'FULL',dependency:'MEDIUM',files:['js/strategy788.js','strategy788.css']},
 'Copilot & Control · OS842':{key:'copilot',coverage:'FULL',dependency:'HIGH',files:['js/copilot840.js','js/copilotFeedback842.js','js/commandCopilot840.js']},
 'Self-Improving OS · OS892':{key:'self',coverage:'BACKEND',dependency:'CRITICAL',files:['js/selfImproving892.js','js/usage892.js']},
 'Autonomous proposals · OS943–945':{key:'autonomous',coverage:'ADVANCED',dependency:'HIGH',files:['js/autonomous943.js','js/proposalReview944.js','js/safeChangePlan945.js','js/previewPr946.js']},
 'Ticket Commander · OS660':{key:'tickets',coverage:'FULL',dependency:'MEDIUM',files:['js/ticketCommander660.js']}
};

export function legacyGatewayContract978(){
 return{gateway:'OS969',primary:'One OS',policy:'legacy-accessible-not-primary',requiresGateway:true,noDirectMoreEntries:true};
}
export function legacyWorkflowScope979(){
 return{policy:'path-scoped',personalMoreDoesNotTriggerLegacy:true,modernIntegrationGuard:'OS987',workflowDispatchFallback:true};
}
export function observationWindow980(days=30){
 const rows=A(parse(USAGE_KEY,[])).filter(x=>Number.isFinite(Date.parse(x.at))),first=rows.length?Math.min(...rows.map(x=>Date.parse(x.at))):null;
 const observed=first===null?0:Math.max(0,Math.floor((now()-first)/DAY));
 return{requiredDays:Math.max(30,Number(days)||30),observedDays:observed,ready:observed>=Math.max(30,Number(days)||30),firstSeen:first?new Date(first).toISOString():null};
}
export function legacyUsage981(days=30){
 const summary=usage975(days),out={};
 for(const meta of Object.values(MAP))out[meta.key]=Number(summary.by?.[`legacy:${meta.key}`]||0);
 return{days,total:Object.values(out).reduce((a,b)=>a+b,0),by:out};
}
export function replacementCoverage982(){
 return retirementRegistry969().map(row=>({...row,...(MAP[row.legacy]||{}),coverage:MAP[row.legacy]?.coverage||'UNKNOWN'}));
}
export function dependencyRisk983(){
 return replacementCoverage982().map(row=>({legacy:row.legacy,key:row.key||'unknown',risk:row.dependency||'UNKNOWN',reason:row.dependency==='CRITICAL'?'Používá se jako backend jiných One OS vrstev.':row.dependency==='HIGH'?'Má živé kompatibilní závislosti nebo command fallback.':row.dependency==='MEDIUM'?'Před odstraněním ověřit importy a specializované workflow.':'Nízká známá integrační vazba.'}));
}
export function retirementReadiness984(days=30){
 const window=observationWindow980(days),usage=legacyUsage981(days),risks=Object.fromEntries(dependencyRisk983().map(x=>[x.key,x])),rows=replacementCoverage982().map(row=>{
  const uses=usage.by[row.key]||0,risk=risks[row.key]?.risk||'UNKNOWN';
  let status='OBSERVE',reason='Probíhá pozorovací období.';
  if(row.coverage==='BACKEND'||risk==='CRITICAL'){status='KEEP';reason='Modul je stále backendová závislost.'}
  else if(risk==='HIGH'){status='KEEP';reason='Nejdřív je nutné odstranit aktivní kompatibilní závislosti.'}
  else if(!window.ready){status='OBSERVE';reason=`Chybí ${Math.max(0,window.requiredDays-window.observedDays)} dní pozorování.`}
  else if(uses>0){status='KEEP';reason=`Legacy gateway byl za ${days} dní použit ${uses}×.`}
  else if(row.coverage==='FULL'&&['LOW','MEDIUM'].includes(risk)){status='CANDIDATE';reason='Plná náhrada, nulové použití a splněné pozorovací období.'}
  return{...row,uses,risk,status,reason};
 });
 return{window,usage,rows,candidates:rows.filter(x=>x.status==='CANDIDATE'),keep:rows.filter(x=>x.status==='KEEP'),observe:rows.filter(x=>x.status==='OBSERVE')};
}
export function archivePlan985(days=30){
 const r=retirementReadiness984(days);
 return r.candidates.map(x=>({legacy:x.legacy,files:x.files||[],mode:'PLAN_ONLY',steps:['Znovu projít importy a service-worker reference','Spustit relevantní legacy guard samostatně','Odstranit soubory pouze v samostatném PR','Spustit OS967/977/987 browser QA','Mít rollback commit před mergem']}));
}
export function ciNoiseReduction986(){
 return{legacyWorkflowsPathScoped:true,personalMoreFanoutRemoved:true,oneOSIntegrationCentralized:true,expectedEffect:'Méně falešných legacy QA běhů při změnách hlavního One OS UI.'};
}
export function cleanupControl987(days=30){
 const readiness=retirementReadiness984(days),plans=archivePlan985(days);
 return{version:LEGACY_CLEANUP987_VERSION,readiness,plans,contracts:{gateway:legacyGatewayContract978(),workflow:legacyWorkflowScope979(),ci:ciNoiseReduction986()},policy:{noAutomaticDeletion:true,noAutomaticMigration:true,noAutomaticCodeMutation:true,requires30DayObservation:true,requiresExplicitApproval:true,requiresSeparateCleanupPR:true}};
}

export async function openLegacyCleanup987(){
 const x=cleanupControl987();
 const body=`<div class="card"><div class="eyebrow">OS978–987 · LEGACY CLEANUP</div><h2>${x.readiness.candidates.length} kandidátů k odstranění</h2><p class="muted">Fyzické mazání je zablokované, dokud není alespoň ${x.readiness.window.requiredDays} dní usage historie a konkrétní modul nemá nulové legacy použití.</p><div class="row"><span>Pozorovací období</span><b>${x.readiness.window.observedDays} / ${x.readiness.window.requiredDays} dní</b></div><div class="row"><span>Legacy použití / 30 dní</span><b>${x.readiness.usage.total}</b></div><div class="row"><span>KEEP</span><b>${x.readiness.keep.length}</b></div><div class="row"><span>OBSERVE</span><b>${x.readiness.observe.length}</b></div><div class="row"><span>CANDIDATE</span><b>${x.readiness.candidates.length}</b></div></div>${x.readiness.rows.map(r=>`<div class="row"><div><b>${h(r.legacy)}</b><div class="muted">${h(r.reason)} · usage ${r.uses}× · risk ${h(r.risk)}</div></div><span>${h(r.status)}</span></div>`).join('')}<div class="decision-note">OS987 nic nemaže. CANDIDATE znamená pouze připraveno pro samostatný cleanup PR po ručním schválení.</div>`;
 return modal('Legacy Cleanup Control · OS987',body,[{label:'Zavřít',value:null,primary:true}]);
}
function bindCommand987(){document.addEventListener('keydown',e=>{if(e.key!=='Enter'||e.target?.id!=='commandInput')return;const q=String(e.target.value||'').trim().toLowerCase();if(!/^\/(cleanup|retire|legacy-status)\b/.test(q))return;e.preventDefault();e.stopImmediatePropagation();openLegacyCleanup987()},true)}
export function installLegacyCleanup987(){if(window.__KAMIL_LEGACY_CLEANUP987__?.installed)return;bindCommand987();window.__KAMIL_LEGACY_CLEANUP987__={installed:true,version:LEGACY_CLEANUP987_VERSION,features:[978,979,980,981,982,983,984,985,986,987],open:openLegacyCleanup987,readiness:retirementReadiness984,policy:cleanupControl987().policy}}
