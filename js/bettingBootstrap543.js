import {ownEvent1100,schedule1100} from './runtimeOwnership1100.js';

let started=false;
let enrichmentStarted=false;
let bootPromise=null;
let enrichPromise=null;
let bound=false;
const REV='os695';
const OWNER='betting.bootstrap543';
const isActive=()=>!!document.querySelector('#view-betting.on');

async function safeImport(path,fn,{awaitResult=false}={}){
 try{
  const mod=await import(`${path}?rev=${REV}`);
  const run=mod?.[fn];
  if(typeof run!=='function')return false;
  const result=run();
  if(awaitResult&&result&&typeof result.then==='function')await result;
  return true;
 }catch(error){console.warn(`[betting543] ${path}`,error);return false}
}

function publish(extra={}){
 const prev=window.__KAMIL_BETTING_BOOTSTRAP543__||{};
 window.__KAMIL_BETTING_BOOTSTRAP543__={version:'2000.1.2',architecture:'view-owned-core-first',...prev,...extra,at:Date.now()};
}

async function enrich(){
 if(enrichmentStarted)return true;
 if(!isActive())return false;
 enrichmentStarted=true;
 const results={timing:'DEFERRED_STABILITY',performance:'DEFERRED_STABILITY',missed:'DEFERRED_STABILITY',control:'DEFERRED_STABILITY'};
 const specs=[
  ['browserFeed','./bettingBrowserFeed694.js','installBettingBrowserFeed694',false],
  ['feed','./bettingOddsFeed693.js','installBettingOddsFeed693',true],
  ['budget','./bettingRequestBudget561.js','installBettingRequestBudget561',false],
  ['autoSettle','./bettingAutoSettle544.js','runBettingAutoSettle544',false],
  ['intelligence','./bettingIntelligence560.js','installBettingIntelligence560',false]
 ];
 try{
  for(const [key,path,fn,awaitResult] of specs){
   if(!isActive()){publish({healthy:true,coreReady:true,enrichmentPaused:true,enrichmentDone:false,...results});return false}
   results[key]=await safeImport(path,fn,{awaitResult});
   await new Promise(resolve=>setTimeout(resolve,0));
  }
  publish({healthy:true,coreReady:true,enrichmentPaused:false,enrichmentDone:true,...results});
  return true;
 }finally{enrichmentStarted=false}
}

function scheduleEnrichment(delay=120){
 schedule1100(OWNER,'enrich',()=>{
  if(!isActive()){publish({healthy:true,coreReady:true,enrichmentPaused:true});return}
  if(!enrichPromise)enrichPromise=enrich().finally(()=>{enrichPromise=null});
 },delay,{pauseWhenHidden:true});
}

async function boot(){
 const root=document.querySelector('#bettingView');if(!root)return false;
 if(!started){
  started=true;
  try{
   const [commander,ledger]=await Promise.all([
    import(`./bettingCommander542.js?rev=${REV}`),
    import(`./bettingLedger543.js?rev=${REV}`)
   ]);
   if(!root.__bet542Observer)commander.installBettingCommander542?.();
   if(!root.__bet543Observer)ledger.installBettingLedger543?.();
   publish({healthy:true,coreReady:true,commander:true,ledger:true,enrichmentDone:false,enrichmentPaused:!isActive(),timing:'DEFERRED_STABILITY',performance:'DEFERRED_STABILITY',missed:'DEFERRED_STABILITY',control:'DEFERRED_STABILITY'});
  }catch(error){
   started=false;
   publish({healthy:false,coreReady:false,error:String(error?.message||error)});
   return false;
  }
 }
 if(!bound){
  bound=true;
  ownEvent1100(OWNER,window,'kamil:view-change',event=>{
   if(event.detail==='betting')scheduleEnrichment(80);
   else publish({healthy:true,coreReady:true,enrichmentPaused:true});
  });
 }
 scheduleEnrichment();
 return true;
}

export function installBettingBootstrap543(){if(bootPromise)return bootPromise;bootPromise=boot().finally(()=>{bootPromise=null});return bootPromise}
