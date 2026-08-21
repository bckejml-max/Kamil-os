const loaded=new Map();
const groups={
  today:[
    './currentTickets33.js','./externalInvestments33.js','./directorUi34.js','./followUpUi35.js','./emailWorkflowUi35.js','./deadlineRadarUi35.js','./todayBrainUi34.js','./focusActionUi35.js','./changePulseUi35.js','./os40ExecutiveUi.js'
  ],
  money:[
    './externalInvestments33.js','./totalPortfolioUi34.js','./externalInvestmentsUi33.js','./cashflowUi25.js','./capitalAllocationUi25.js','./actionPlanUi25.js','./personalMoneyUi26.js','./netWorthUi29.js','./portfolioRebalancerUi29.js','./portfolioRiskMapUi29.js','./spendingIntelligenceUi29.js','./os40MoneyUi.js'
  ],
  tickets:[
    './currentTickets33.js','./ticketCurrentUi33.js','./ticketBrainUi34.js','./ticketProfitUi29.js','./os40TicketsUi.js'
  ],
  home:[
    './personalCopilotUi30.js','./documentScannerUi30.js','./documentFilingUi30.js','./renewalRadarUi26.js','./emergencyFileUi26.js'
  ],
  more:[
    './autopilotNavBridge28.js','./personalPlusNav29.js','./decisionExplainUi30.js','./decisionJournalUi31.js','./profileBootstrapUi31.js','./systemHealthUi31.js','./liveBrainUi32.js','./dataEngineUi31.js','./os40KnowledgeUi.js'
  ]
};

function loadModule(path){
  if(loaded.has(path))return loaded.get(path);
  const p=import(path).catch(err=>{console.error('[lazyBoot41]',path,err);loaded.delete(path);throw err});
  loaded.set(path,p);return p;
}
function loadGroup(name){return Promise.allSettled((groups[name]||[]).map(loadModule))}
function idle(fn,timeout=1200){
  if('requestIdleCallback'in window)return requestIdleCallback(fn,{timeout});
  return setTimeout(fn,220);
}
function currentView(){return document.querySelector('.view.on')?.id?.replace('view-','')||'today'}

// První obrazovku necháme vykreslit bez desítek vedlejších modulů.
// Rozšíření pro aktuální view se připojí hned po prvním paintu.
const boot=()=>{
  requestAnimationFrame(()=>requestAnimationFrame(()=>idle(()=>loadGroup(currentView()),900)));
  window.addEventListener('kamil:navigate',e=>loadGroup(e.detail||'today'));
  // Navigační utility nepotřebují blokovat první paint, ale mají být brzy připravené.
  idle(()=>Promise.allSettled([
    loadModule('./autopilotNavBridge28.js'),
    loadModule('./personalPlusNav29.js'),
    loadModule('./releaseStamp.js')
  ]),1800);
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();

export {loadGroup};
