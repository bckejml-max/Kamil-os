import {modal,h} from './utils.js';
import {readProposalDecisions944} from './proposalReview944.js';
import {recordUsage892} from './usage892.js';

export const SAFE_CHANGE_PLAN945_VERSION='945.0.0';
const A=v=>Array.isArray(v)?v:[];
const U=v=>String(v||'').toUpperCase();

function classify945(p={}){
 const s=`${p.title||''} ${p.change||''} ${p.evidence||''}`.toLowerCase();
 if(/ticket|vstupenk/.test(s))return'TICKETS';
 if(/bet|sáz|saz/.test(s))return'BETTING';
 if(/realit|byt|property|nájem|najem/.test(s))return'PROPERTY';
 if(/cash|money|peněz|penez|finance|bank/.test(s))return'MONEY';
 if(/work|zakáz|zakaz|projekt|stavb/.test(s))return'WORK';
 if(/family|rodin|mia/.test(s))return'FAMILY';
 if(/navigation|menu|ui|zjednoduš|zjednodus/.test(s))return'UI';
 if(/confidence|ranking|priorit|strategy|strateg/.test(s))return'STRATEGY';
 return'GENERAL';
}
function files945(area){
 const map={
  TICKETS:['js/ticket*.js','js/operator717.js'],BETTING:['js/betting*.js','js/copilot840.js'],PROPERTY:['js/property*.js','js/strategy788.js'],MONEY:['js/cash*.js','js/strategy788.js'],WORK:['js/manager*.js','js/operator717.js'],FAMILY:['js/personal*.js'],UI:['js/personalMore640.js','js/viewRuntime41.js'],STRATEGY:['js/strategy788.js','js/selfImproving892.js','js/autonomous943.js'],GENERAL:['js/selfImproving892.js']
 };
 return map[area]||map.GENERAL;
}
function risk945(area,p={}){const text=`${p.change||''} ${p.title||''}`.toLowerCase();if(['BETTING','MONEY','TICKETS'].includes(area))return'HIGH';if(/navigation|menu|ranking|confidence/.test(text))return'MEDIUM';return'LOW'}
function tests945(area){return [`OS944 approval guard`,`OS943 proposal-only guard`,area==='TICKETS'?'ticket regression':area==='BETTING'?'betting reliability':area==='PROPERTY'?'property guard':area==='WORK'?'manager regression':'OS181 shell regression'];}
export function approvedProposals945(){const rows=readProposalDecisions944();const latest=new Map();for(const x of rows)latest.set(`${x.proposal?.title||''}|${x.proposal?.change||''}`,x);return [...latest.values()].filter(x=>x.status==='approved'&&x.executed===false)}
export function safeChangePlan945(decision){const p=decision?.proposal||{},area=classify945(p),risk=risk945(area,p),files=files945(area);return{id:`plan-${decision?.id||Date.now()}`,proposalId:decision?.id||'',title:p.title||'Schválený návrh',area,risk,mode:'PLAN_ONLY',executed:false,requiresExplicitImplementation:true,summary:p.change||'',affectedFiles:files,steps:[`Znovu ověřit důkaz: ${p.evidence||'bez důkazu'}`,`Připravit minimální změnu pouze v oblasti ${area}`,`Spustit cílené testy a compatibility guardy`,`Zkontrolovat preview deployment`,`Teprve po samostatném schválení mergnout změnu`],tests:tests945(area),rollback:[`Nevynucovat změny datového schématu bez migrace`,`Při regresi revertovat samostatný implementační commit/PR`,`Ověřit návrat původního chování v cíleném guardu`],guardrails:{noAutomaticExecution:true,noAutomaticMerge:true,noAutomaticDeployment:true,noFinancialExecution:true,noBettingExecution:true}}}
export function safeChangePlans945(){return approvedProposals945().map(safeChangePlan945)}
export async function openSafeChangePlan945(){recordUsage892('safe-change-plan-945',{surface:'more'});const plans=safeChangePlans945(),p=plans[0];const body=`<div class="card"><div class="eyebrow">OS945 · SAFE CHANGE PLAN</div><h2>${h(p?.title||'Žádný schválený návrh')}</h2><p>${h(p?.summary||'Nejdřív schval návrh v OS944.')}</p><div class="row"><span>Plánů připraveno</span><b>${plans.length}</b></div><div class="row"><span>Riziko</span><b>${h(p?.risk||'—')}</b></div><div class="row"><span>Režim</span><b>PLAN ONLY</b></div>${p?`<div class="row"><span>Dotčené soubory</span><b>${h(p.affectedFiles.join(', '))}</b></div><div class="row"><span>Testy</span><b>${h(p.tests.join(', '))}</b></div><p class="muted">Plán nic nemění, nemerguje ani nenasazuje. Implementace musí vzniknout v samostatném kroku/PR.</p>`:'<p class="muted">OS945 čeká na schválený návrh z Proposal Review & Approval.</p>'}</div>${p?`<div class="card"><div class="eyebrow">ROLLBACK</div>${p.rollback.map(x=>`<div class="row"><span>${h(x)}</span></div>`).join('')}</div>`:''}`;const choice=await modal('Safe Change Plan',body,[{label:p?'Připravit Preview PR':'Zavřít',value:p?'preview':null,primary:true},{label:'Zavřít',value:null}]);if(choice==='preview'){const m=await import('./previewPr946.js');return m.openPreviewPr946()}return choice}
