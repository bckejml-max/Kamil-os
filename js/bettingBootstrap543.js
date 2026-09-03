let started=false;
async function boot(){
 const root=document.querySelector('#bettingView');
 if(!root)return false;
 if(started&&root.__bet543Observer&&root.__bet542Observer)return true;
 started=true;
 try{
  const [commander,ledger]=await Promise.all([import('./bettingCommander542.js?rev=os542b'),import('./bettingLedger543.js?rev=os543')]);
  if(!root.__bet542Observer)commander.installBettingCommander542?.();
  if(!root.__bet543Observer)ledger.installBettingLedger543?.();
  window.__KAMIL_BETTING_BOOTSTRAP543__={healthy:true,at:Date.now()};
  return true;
 }catch(error){window.__KAMIL_BETTING_BOOTSTRAP543__={healthy:false,error:String(error?.message||error),at:Date.now()};return false}
}
if(!boot()){
 const observer=new MutationObserver(async()=>{if(await boot())observer.disconnect()});
 observer.observe(document.documentElement,{childList:true,subtree:true});
}
document.addEventListener('click',()=>setTimeout(boot,0),true);
