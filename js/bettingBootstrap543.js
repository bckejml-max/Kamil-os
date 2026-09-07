let started=false;
let bootPromise=null;
let autoSettleStarted=false;
let intelligenceStarted=false;
let browserFeedStarted=false;
let feedStarted=false;
let budgetStarted=false;
let timingStarted=false;
let performanceStarted=false;
let missedStarted=false;
let controlStarted=false;
const REV='os695';

async function ensureBrowserFeed(){if(browserFeedStarted)return true;try{const m=await import(`./bettingBrowserFeed694.js?rev=${REV}`);m.installBettingBrowserFeed694?.();browserFeedStarted=true;return true}catch{return false}}
async function ensureFeed(){if(feedStarted)return true;try{const m=await import(`./bettingOddsFeed693.js?rev=${REV}`);await m.installBettingOddsFeed693?.();feedStarted=true;return true}catch{return false}}
async function ensureBudget(){if(budgetStarted)return true;try{const m=await import(`./bettingRequestBudget561.js?rev=${REV}`);m.installBettingRequestBudget561?.();budgetStarted=true;return true}catch{return false}}
async function ensureTiming(){if(timingStarted)return true;try{const m=await import(`./bettingTiming564.js?rev=${REV}`);m.installBettingTiming564?.();timingStarted=true;return true}catch{return false}}
async function ensurePerformance(){if(performanceStarted)return true;try{const m=await import(`./bettingPerformance565.js?rev=${REV}`);m.installBettingPerformance565?.();performanceStarted=true;return true}catch{return false}}
async function ensureMissed(){if(missedStarted)return true;try{const m=await import(`./bettingMissed566.js?rev=${REV}`);m.installBettingMissed566?.();missedStarted=true;return true}catch{return false}}
async function ensureControl(){if(controlStarted)return true;try{const m=await import(`./bettingControl586.js?rev=${REV}`);m.installBettingControl586?.();controlStarted=true;return true}catch{return false}}

async function boot(){
 const root=document.querySelector('#bettingView');if(!root)return false;
 await ensureBrowserFeed();
 await ensureFeed();
 await ensureBudget();
 if(started&&root.__bet543Observer&&root.__bet542Observer){
  if(!autoSettleStarted){try{const m=await import(`./bettingAutoSettle544.js?rev=${REV}`);m.runBettingAutoSettle544?.();autoSettleStarted=true}catch{}}
  if(!intelligenceStarted){try{const m=await import(`./bettingIntelligence560.js?rev=${REV}`);m.installBettingIntelligence560?.();intelligenceStarted=true}catch{}}
  await Promise.all([ensureTiming(),ensurePerformance(),ensureMissed(),ensureControl()]);return true;
 }
 started=true;
 try{
  const [commander,ledger,auto,intelligence]=await Promise.all([import(`./bettingCommander542.js?rev=${REV}`),import(`./bettingLedger543.js?rev=${REV}`),import(`./bettingAutoSettle544.js?rev=${REV}`),import(`./bettingIntelligence560.js?rev=${REV}`)]);
  if(!root.__bet542Observer)commander.installBettingCommander542?.();
  if(!root.__bet543Observer)ledger.installBettingLedger543?.();
  auto.runBettingAutoSettle544?.();autoSettleStarted=true;
  intelligence.installBettingIntelligence560?.();intelligenceStarted=true;
  await Promise.all([ensureTiming(),ensurePerformance(),ensureMissed(),ensureControl()]);
  window.__KAMIL_BETTING_BOOTSTRAP543__={healthy:true,version:'695.1.0',scoped:true,browserFeed:browserFeedStarted,feed:feedStarted,budget:budgetStarted,timing:timingStarted,performance:performanceStarted,missed:missedStarted,control:controlStarted,at:Date.now()};return true;
 }catch(error){started=false;window.__KAMIL_BETTING_BOOTSTRAP543__={healthy:false,scoped:true,error:String(error?.message||error),at:Date.now()};return false}
}

export function installBettingBootstrap543(){if(bootPromise)return bootPromise;bootPromise=boot().finally(()=>{bootPromise=null});return bootPromise}
if(document.querySelector('#bettingView'))queueMicrotask(()=>installBettingBootstrap543().catch(()=>{}));
window.addEventListener('kamil:view-change',e=>{if(e.detail==='betting')void installBettingBootstrap543().catch(()=>{})});
