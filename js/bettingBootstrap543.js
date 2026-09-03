let started=false;
let autoSettleStarted=false;
let intelligenceStarted=false;
let budgetStarted=false;
async function ensureBudget(){
 if(budgetStarted)return true;
 try{const budget=await import('./bettingRequestBudget561.js?rev=os561');budget.installBettingRequestBudget561?.();budgetStarted=true;return true}catch{return false}
}
async function boot(){
 const root=document.querySelector('#bettingView');
 if(!root)return false;
 await ensureBudget();
 if(started&&root.__bet543Observer&&root.__bet542Observer){
  if(!autoSettleStarted){try{const auto=await import('./bettingAutoSettle544.js?rev=os544');auto.runBettingAutoSettle544?.();autoSettleStarted=true}catch{}}
  if(!intelligenceStarted){try{const intelligence=await import('./bettingIntelligence560.js?rev=os560');intelligence.installBettingIntelligence560?.();intelligenceStarted=true}catch{}}
  return true;
 }
 started=true;
 try{
  const [commander,ledger,auto,intelligence]=await Promise.all([import('./bettingCommander542.js?rev=os542b'),import('./bettingLedger543.js?rev=os543'),import('./bettingAutoSettle544.js?rev=os544'),import('./bettingIntelligence560.js?rev=os560')]);
  if(!root.__bet542Observer)commander.installBettingCommander542?.();
  if(!root.__bet543Observer)ledger.installBettingLedger543?.();
  auto.runBettingAutoSettle544?.();autoSettleStarted=true;
  intelligence.installBettingIntelligence560?.();intelligenceStarted=true;
  window.__KAMIL_BETTING_BOOTSTRAP543__={healthy:true,version:'561.0.0',budget:true,at:Date.now()};
  return true;
 }catch(error){window.__KAMIL_BETTING_BOOTSTRAP543__={healthy:false,error:String(error?.message||error),at:Date.now()};return false}
}
if(!boot()){
 const observer=new MutationObserver(async()=>{if(await boot())observer.disconnect()});
 observer.observe(document.documentElement,{childList:true,subtree:true});
}
document.addEventListener('click',()=>setTimeout(boot,0),true);
