import {installRuntimeOwnership1100,ownEvent1100,schedule1100} from './runtimeOwnership1100.js';

const RECOVERY_KEY='kamil-os-recovery-1130';
const OWNER='data.integrity1130';
const SETTLED=new Set(['WON','LOST','VOID','CASHED_OUT','SETTLED','PAID','PAYOUT RECEIVED']);
const criticalBetFields=['status','result','outcome','payout','payoutCzk','profit','profitCzk','settledAt','settled_at'];
let started=false,stop=()=>{},checking=false,settledBaseline=new Map();
installRuntimeOwnership1100();
const clone=x=>{try{return structuredClone(x)}catch{return JSON.parse(JSON.stringify(x))}};
const signature=bet=>JSON.stringify(Object.fromEntries(criticalBetFields.map(k=>[k,bet?.[k]??null])));
function captureSettled(state){for(const bet of state?.bettingLedger?.bets||[]){const status=String(bet?.status||bet?.result||'').toUpperCase();if(bet?.id&&SETTLED.has(status)&&!settledBaseline.has(bet.id))settledBaseline.set(bet.id,signature(bet))}}
function saveRecovery(state,reason,report){try{localStorage.setItem(RECOVERY_KEY,JSON.stringify({at:new Date().toISOString(),reason,report,state:clone({...state,undo:[]})}))}catch{}}
async function start(){
 if(started)return;started=true;
 const mod=await import('./state.js');const {store,validateState}=mod;
 captureSettled(store.get());
 stop=store.subscribe((state,reason)=>{
  if(checking)return;checking=true;
  try{
   const report=validateState(state);
   if(!report.ok||report.fatal.length){saveRecovery(state,reason||'state-invalid',report);globalThis.__KAMIL_HEALTH1159__?.warnings?.push?.({type:'state-invalid',reason,report,at:Date.now()})}
   const changed=[];
   for(const bet of state?.bettingLedger?.bets||[]){if(!bet?.id||!settledBaseline.has(bet.id))continue;const before=settledBaseline.get(bet.id),after=signature(bet);if(before!==after)changed.push(bet.id)}
   if(changed.length){saveRecovery(state,`settled-bet-changed:${changed.join(',')}`,{changed});globalThis.__KAMIL_HEALTH1159__?.warnings?.push?.({type:'settled-bet-mutated',ids:changed,at:Date.now()})}
   captureSettled(state);
  }finally{checking=false}
 });
 globalThis.__KAMIL_DATA_INTEGRITY1130__={version:'1130.1.0',recoveryKey:RECOVERY_KEY,validate:()=>validateState(store.get()),snapshot:()=>({settledTracked:settledBaseline.size,recovery:!!localStorage.getItem(RECOVERY_KEY)}),stop:()=>{stop();stop=()=>{};started=false}};
}
ownEvent1100(OWNER,window,'kamil:boot-budget343',()=>void start(),{once:true});
schedule1100(OWNER,'fallback-start',()=>void start(),3500,{pauseWhenHidden:true});
