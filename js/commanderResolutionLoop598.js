import {store} from './state.js';
import {h,modal} from './utils.js';
import {commanderNextAction595} from './commanderNextAction595.js';
import {armFixRerun596,commanderFixRerun596} from './commanderFixRerun596.js';
import {commanderGuidedResolution597} from './commanderGuidedResolution597.js';

const stepOf=(next,rerun,guide)=>{
 if(!next.blocked)return{stage:'READY',title:'Commander není blokovaný',detail:'Můžeš pokračovat podle aktuálního ručního verdiktu.',cta:'Zavřít',target:null};
 if(rerun.status==='NO_BASELINE')return{stage:'START',title:'1. Otevři doporučenou kontrolu',detail:next.action.detail,cta:next.action.label,target:next.action.target};
 if(rerun.status==='CLEARED')return{stage:'DONE',title:'Vyřešeno',detail:'Původní blocker po novém přepočtu zmizel.',cta:'Zavřít',target:null};
 return{stage:'RESOLVE',title:`2. ${guide.guide.title}`,detail:guide.guide.next,cta:guide.guide.label,target:guide.guide.target};
};

export function commanderResolutionLoop598(s=store.get()){
 const started=performance.now(),next=commanderNextAction595(s),rerun=commanderFixRerun596(s),guide=commanderGuidedResolution597(s),step=stepOf(next,rerun,guide);
 const result={step,next,rerun,guide,summary:`${step.title}. ${step.detail}`};
 if(typeof window!=='undefined')window.__KAMIL_RESOLUTION_LOOP_598_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),stage:step.stage,target:step.target,status:rerun.status};
 return result;
}

async function openTarget(target){
 if(target==='reality'){const m=await import('./postExecutionReality593.js');return m.openPostExecutionReality593()}
 if(target==='recheck'){const m=await import('./recheckTriggers562.js');return m.openRecheckTriggers562()}
 if(target==='rerun'){const m=await import('./commanderFixRerun596.js');return m.openCommanderFixRerun596()}
 return null;
}

export async function openCommanderResolutionLoop598(){
 const x=commanderResolutionLoop598(),s=x.step;
 const body=`<div class="metric-strip"><div class="metric"><span>Fáze</span><b>${h(s.stage)}</b></div><div class="metric"><span>Fix & Re-run</span><b>${h(x.rerun.status)}</b></div><div class="metric"><span>Commander</span><b>${h(x.next.decision?.mode||'—')}</b></div></div><div class="card"><div class="eyebrow">RESOLUTION LOOP 59.8</div><h2>${h(s.title)}</h2><p>${h(s.detail)}</p></div><div class="card"><div class="eyebrow">TOK</div><div class="intel-row"><div class="intel-main"><b>1. Co mám udělat</b><span>${h(x.next.action?.title||'—')}</span></div></div><div class="intel-row"><div class="intel-main"><b>2. Přepočet</b><span>${h(x.rerun.summary)}</span></div></div><div class="intel-row"><div class="intel-main"><b>3. Dotažení</b><span>${h(x.guide.guide?.next||'—')}</span></div></div></div><div class="decision-note">59.8 pouze propojuje existující ruční kontroly do jednoho navigačního toku. Nic samo neobchoduje, neprodává, nepřecenňuje ani nemění zdrojová data.</div>`;
 const actions=s.target?[{label:s.cta,value:'go',primary:true},{label:'Znovu přepočítat',value:'rerun'},{label:'Zavřít',value:null}]:[{label:'Znovu přepočítat',value:'rerun',primary:true},{label:'Zavřít',value:null}];
 const choice=await modal('XTB + vstupenky / Resolution Loop 59.8',body,actions);
 if(choice==='go'){
  if(x.rerun.status==='NO_BASELINE')armFixRerun596();
  await openTarget(s.target);
  return openCommanderResolutionLoop598();
 }
 if(choice==='rerun')return openCommanderResolutionLoop598();
 return choice;
}
