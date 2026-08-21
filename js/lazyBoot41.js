const loaded=new Map(),styles=new Map();
const groups={
 today:{css:['../styles24.css','../decision24.css','../live24.css','../personal26.css','../autopilot28.css','../os34.css','../os35.css','../lifeOs42.css'],primary:['./lifeOs42Ui.js','./directorUi34.js','./followUpUi35.js','./emailWorkflowUi35.js','./focusActionUi35.js','./os40ExecutiveUi.js'],secondary:['./deadlineRadarUi35.js','./todayBrainUi34.js','./changePulseUi35.js']},
 money:{css:['../styles24.css','../decision24.css','../live24.css','../xtbDetail25.css','../personal26.css','../autopilot28.css','../os34.css'],primary:['./totalPortfolioUi34.js','./externalInvestmentsUi33.js','./os40MoneyUi.js'],secondary:['./cashflowUi25.js','./capitalAllocationUi25.js','./actionPlanUi25.js','./personalMoneyUi26.js','./netWorthUi29.js','./portfolioRebalancerUi29.js','./portfolioRiskMapUi29.js','./spendingIntelligenceUi29.js']},
 tickets:{css:['../styles24.css','../decision24.css','../live24.css','../ticketEvents25.css','../os34.css'],primary:['./ticketCurrentUi33.js','./ticketBrainUi34.js','./os40TicketsUi.js'],secondary:['./ticketProfitUi29.js']},
 home:{css:['../capture24.css','../personal26.css','../autopilot28.css'],primary:['./personalCopilotUi30.js'],secondary:['./documentScannerUi30.js','./documentFilingUi30.js','./renewalRadarUi26.js','./emergencyFileUi26.js']},
 more:{css:['../capture24.css','../personal26.css','../autopilot28.css','../os35.css'],primary:['./autopilotNavBridge28.js','./personalPlusNav29.js','./os40KnowledgeUi.js'],secondary:['./decisionExplainUi30.js','./decisionJournalUi31.js','./profileBootstrapUi31.js','./systemHealthUi31.js','./liveBrainUi32.js','./dataEngineUi31.js']}
};
function loadModule(path){if(loaded.has(path))return loaded.get(path);const p=import(path).catch(err=>{console.error('[lazyBoot41]',path,err);loaded.delete(path);throw err});loaded.set(path,p);return p}
function loadStyle(path){if(styles.has(path))return styles.get(path);const p=new Promise(resolve=>{const l=document.createElement('link');l.rel='stylesheet';l.href=path;l.dataset.lazyStyle='1';l.onload=()=>resolve(true);l.onerror=()=>resolve(false);document.head.appendChild(l)});styles.set(path,p);return p}
const idle=(fn,timeout=1800)=>'requestIdleCallback'in window?requestIdleCallback(fn,{timeout}):setTimeout(fn,700);
function loadGroup(name,{staged=true}={}){const g=groups[name]||{css:[],primary:[],secondary:[]};const first=Promise.allSettled([...g.css.map(loadStyle),...g.primary.map(loadModule)]);if(staged&&g.secondary.length)first.finally(()=>setTimeout(()=>idle(()=>Promise.allSettled(g.secondary.map(loadModule)),3000),2500));else if(g.secondary.length)g.secondary.forEach(loadModule);return first}
function currentView(){return document.querySelector('.view.on')?.id?.replace('view-','')||'today'}
function boot(){
 let booted=false;
 const lateBoot=()=>{if(booted)return;booted=true;loadGroup(currentView(),{staged:true})};
 // requestIdleCallback can fire almost immediately; enforce a real grace period first.
 setTimeout(()=>idle(lateBoot,4000),12000);
 window.addEventListener('kamil:view-change',e=>{booted=true;loadGroup(e.detail||'today',{staged:true})});
 window.addEventListener('kamil:navigate',e=>{booted=true;loadGroup(e.detail||'today',{staged:true})});
 setTimeout(()=>idle(()=>Promise.allSettled([loadModule('./autopilotNavBridge28.js'),loadModule('./personalPlusNav29.js')]),3500),15000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
export {loadGroup};
