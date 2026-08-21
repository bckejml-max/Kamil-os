const loaded=new Map(),styles=new Map();
const groups={
  today:{
    css:['../styles24.css','../decision24.css','../live24.css','../personal26.css','../autopilot28.css','../os34.css','../os35.css'],
    js:['./currentTickets33.js','./externalInvestments33.js','./directorUi34.js','./followUpUi35.js','./emailWorkflowUi35.js','./deadlineRadarUi35.js','./todayBrainUi34.js','./focusActionUi35.js','./changePulseUi35.js','./os40ExecutiveUi.js']
  },
  money:{
    css:['../styles24.css','../decision24.css','../live24.css','../xtbDetail25.css','../personal26.css','../autopilot28.css','../os34.css'],
    js:['./externalInvestments33.js','./totalPortfolioUi34.js','./externalInvestmentsUi33.js','./cashflowUi25.js','./capitalAllocationUi25.js','./actionPlanUi25.js','./personalMoneyUi26.js','./netWorthUi29.js','./portfolioRebalancerUi29.js','./portfolioRiskMapUi29.js','./spendingIntelligenceUi29.js','./os40MoneyUi.js']
  },
  tickets:{
    css:['../styles24.css','../decision24.css','../live24.css','../ticketEvents25.css','../os34.css'],
    js:['./currentTickets33.js','./ticketCurrentUi33.js','./ticketBrainUi34.js','./ticketProfitUi29.js','./os40TicketsUi.js']
  },
  home:{
    css:['../capture24.css','../personal26.css','../autopilot28.css'],
    js:['./personalCopilotUi30.js','./documentScannerUi30.js','./documentFilingUi30.js','./renewalRadarUi26.js','./emergencyFileUi26.js']
  },
  more:{
    css:['../capture24.css','../personal26.css','../autopilot28.css','../os35.css'],
    js:['./autopilotNavBridge28.js','./personalPlusNav29.js','./decisionExplainUi30.js','./decisionJournalUi31.js','./profileBootstrapUi31.js','./systemHealthUi31.js','./liveBrainUi32.js','./dataEngineUi31.js','./os40KnowledgeUi.js']
  }
};

function loadModule(path){
  if(loaded.has(path))return loaded.get(path);
  const p=import(path).catch(err=>{console.error('[lazyBoot41]',path,err);loaded.delete(path);throw err});
  loaded.set(path,p);return p;
}
function loadStyle(path){
  if(styles.has(path))return styles.get(path);
  const p=new Promise(resolve=>{const l=document.createElement('link');l.rel='stylesheet';l.href=path;l.dataset.lazyStyle='1';l.onload=()=>resolve(true);l.onerror=()=>resolve(false);document.head.appendChild(l)});
  styles.set(path,p);return p;
}
function loadGroup(name){const g=groups[name]||{css:[],js:[]};return Promise.allSettled([...g.css.map(loadStyle),...g.js.map(loadModule)])}
function idle(fn,timeout=1200){if('requestIdleCallback'in window)return requestIdleCallback(fn,{timeout});return setTimeout(fn,220)}
function currentView(){return document.querySelector('.view.on')?.id?.replace('view-','')||'today'}
function boot(){
  requestAnimationFrame(()=>requestAnimationFrame(()=>idle(()=>loadGroup(currentView()),900)));
  window.addEventListener('kamil:view-change',e=>loadGroup(e.detail||'today'));
  window.addEventListener('kamil:navigate',e=>loadGroup(e.detail||'today'));
  idle(()=>Promise.allSettled([loadModule('./autopilotNavBridge28.js'),loadModule('./personalPlusNav29.js')]),2200);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
export {loadGroup};
