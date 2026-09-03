let started=false;
let autoSettleStarted=false;
let intelligenceStarted=false;
let budgetStarted=false;
let timingStarted=false;
let performanceStarted=false;
let missedStarted=false;
let controlStarted=false;
const REV='os691';
async function ensureBudget(){
 if(budgetStarted)return true;
 try{const budget=await import(`./bettingRequestBudget561.js?rev=${REV}`);budget.installBettingRequestBudget561?.();budgetStarted=true;return true}catch{return false}
}
async function ensureTiming(){
 if(timingStarted)return true;
 try{const timing=await import(`./bettingTiming564.js?rev=${REV}`);timing.installBettingTiming564?.();timingStarted=true;return true}catch{return false}
}
async function ensurePerformance(){
 if(performanceStarted)return true;
 try{const performance=await import(`./bettingPerformance565.js?rev=${REV}`);performance.installBettingPerformance565?.();performanceStarted=true;return true}catch{return false}
}
async function ensureMissed(){
 if(missedStarted)return true;
 try{const missed=await import(`./bettingMissed566.js?rev=${REV}`);missed.installBettingMissed566?.();missedStarted=true;return true}catch{return false}
}
async function ensureControl(){
 if(controlStarted)return true;
 try{const control=await import(`./bettingControl586.js?rev=${REV}`);control.installBettingControl586?.();controlStarted=true;return true}catch{return false}
}
async function boot(){
 const root=document.querySelector('#bettingView');
 if(!root)return false;
 await ensureBudget();
 if(started&&root.__bet543Observer&&root.__bet542Observer){
  if(!autoSettleStarted){try{const auto=await import(`./bettingAutoSettle544.js?rev=${REV}`);auto.runBettingAutoSettle544?.();autoSettleStarted=true}catch{}}
  if(!intelligenceStarted){try{const intelligence=await import(`./bettingIntelligence560.js?rev=${REV}`);intelligence.installBettingIntelligence560?.();intelligenceStarted=true}catch{}}
  await ensureTiming();
  await ensurePerformance();
  await ensureMissed();
  await ensureControl();
  return true;
 }
 started=true;
 try{
  const [commander,ledger,auto,intelligence]=await Promise.all([import(`./bettingCommander542.js?rev=${REV}`),import(`./bettingLedger543.js?rev=${REV}`),import(`./bettingAutoSettle544.js?rev=${REV}`),import(`./bettingIntelligence560.js?rev=${REV}`)]);
  if(!root.__bet542Observer)commander.installBettingCommander542?.();
  if(!root.__bet543Observer)ledger.installBettingLedger543?.();
  auto.runBettingAutoSettle544?.();autoSettleStarted=true;
  intelligence.installBettingIntelligence560?.();intelligenceStarted=true;
  await ensureTiming();
  await ensurePerformance();
  await ensureMissed();
  await ensureControl();
  window.__KAMIL_BETTING_BOOTSTRAP543__={healthy:true,version:'691.0.0',budget:true,timing:true,performance:true,missed:true,control:true,at:Date.now()};
  return true;
 }catch(error){started=false;window.__KAMIL_BETTING_BOOTSTRAP543__={healthy:false,error:String(error?.message||error),at:Date.now()};return false}
}
function installBootObserver(){
 if(window.__KAMIL_BETTING_BOOT_OBSERVER691__)return;
 const observer=new MutationObserver(async()=>{if(await boot()){observer.disconnect();window.__KAMIL_BETTING_BOOT_OBSERVER691__=null}});
 observer.observe(document.documentElement,{childList:true,subtree:true});
 window.__KAMIL_BETTING_BOOT_OBSERVER691__=observer;
}
boot().then(ok=>{if(!ok)installBootObserver()}).catch(()=>installBootObserver());
document.addEventListener('click',()=>setTimeout(()=>{boot().catch(()=>{})},0),true);
